import { GameObjects } from "phaser";
import { Math as pMath } from "phaser";
import { GameConfig, UIConfig } from "../config";
import { KeyMap } from "../keymap";
import { SoundMan } from "../soundman";
import { gVar, saveCookie } from "../global";

import { Player  } from "../objects/player";
import { Entity  } from "../objects/entity";
import { UIScene } from "./UI";

let hHeight : number;
let hWidth  : number;

export class PlayScene extends Phaser.Scene {
    private player : Player;

    private score   : number  = 0;
    private paused  : boolean = false;
    private endGame : boolean = false;

    // To make the ship smoothly come to a stop at top of the world, and not
    // intrude upon UI.
    private mouseCap     : number = 4960;
    private initGravity  : number;
    private minGravityMultiplier : number = 0.5;
    private atmosphereHeight : number;
    private worldHeight  : number = 5000;

    private bonusFloor   : number = 1500;
    private maxBonusMultiplier : number = 3;

    private hasPlayed : boolean;
    private UIScene   : UIScene;

    private entityGroup : Phaser.Physics.Arcade.Group;

    // background elements
    private mountains : GameObjects.TileSprite;
    private treesF    : GameObjects.TileSprite;
    private treesM    : GameObjects.TileSprite;
    private treesB    : GameObjects.TileSprite;

    constructor() {
        super({ key: 'PlayScene' });
    }

    create() : void {
        KeyMap.initialize(this);

        hHeight = parseInt(GameConfig.scale.height as string) / 2;
        hWidth  = parseInt(GameConfig.scale.width  as string) / 2;
        
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');
        this.UIScene = this.scene.manager.getScene('UIScene') as UIScene;

        // tileSprite for tiling potentially, need to edit some of my shit first tho

        this.initGravity = this.physics.world.gravity.y;
        this.atmosphereHeight = this.worldHeight * 0.67;

        this.hasPlayed = (gVar.highScore != 0);

        this.add.image(0,     0, 'bgBottom').setOrigin(0, 1);
        this.add.image(0, -2500, 'bgTop').setOrigin(0, 1);

        this.mountains = this.add.tileSprite(0, 20, 0, 0, 'mountain').setOrigin(0, 1);
        this.treesB    = this.add.tileSprite(0, 20, 0, 0, 'treesB').setOrigin(0, 1);
        this.treesM    = this.add.tileSprite(0, 20, 0, 0, 'treesM').setOrigin(0, 1);
        this.treesF    = this.add.tileSprite(0, 20, 0, 0, 'treesF').setOrigin(0, 1);

        // phaser being Y up is really awful to work with, so I'm swapping it.
        this.physics.world.setBounds(0, -this.worldHeight, hWidth, this.worldHeight);

        this.player = new Player(this, 32 + UIConfig.borderPadding, -500, 'player');
        this.player.setImmovable(true);
        this.player.anims.play('p-idle');
        this.treesF.setDepth(this.player.depth + 1);

        this.cameras.main.setBounds(0, -this.worldHeight, hWidth, this.worldHeight);
        this.cameras.main.setZoom(2);
        this.cameras.main.startFollow(this.player, false, 0.1, 0.1, 32 - hWidth, 0);

        let t = this.physics.world.bounds;
        console.log(`World Bounds: (${t.left}, ${t.right}, ${t.top}, ${t.bottom})`);

        // debug key
        KeyMap.keyDEBUG.onDown = () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }
        this.physics.world.drawDebug = false;

        this.entityGroup = this.physics.add.group();

        this.physics.add.collider(this.player, this.entityGroup, (player, entity) => {
            (entity as Entity).onCollide(player as Player);
        });

        KeyMap.keyEXIT.on('down', () => {
            if (!this.hasPlayed) {
                this.toggleOverlay();
            } else {
                this.togglePause();
            }
        });

        KeyMap.keyRESET.on('down', (event : KeyboardEvent) => {
            if (this.paused) {
                this.reset();
            }
        });

        if (!this.hasPlayed) {
            this.physics.world.pause();
        }

        this.enemyTimer = 5;
    }

    private enemyTimer : number = 0;
    update(time : number, delta : number) : void {
        // Delta measured in ms not seconds is useless.
        delta /= 1000;
        if (!this.hasPlayed || this.paused) {
            return;
        }

        this.enemyTimer -= delta;
        if (this.enemyTimer < 0) {
            // spawn wave
            // TODO: make the cap of enemies ramp up over time.
            let enemyNumber = pMath.Between(2, 5);
            let yTarg = this.player.y;
            let pickedPos : number[] = [];
            for (let i = 0; i < enemyNumber; i++) {
                let pos : number;
                while (true) {
                    let redo = false;
                    pos = pMath.Between((hHeight/2) + yTarg, yTarg - (hHeight/2));
                    pickedPos.some(num => {
                        if (Math.abs(pos - num) < 48) {
                            redo = true;
                            return true;
                        }
                        return false;
                    });

                    if (!redo) {
                        pickedPos.push(pos);
                        break;
                    }
                }

                let entity : Entity;
                let type  : number = Math.random();
                if (type < 0.1) {
                    entity = new Entity(this, hWidth * 2 + pMath.Between(0, 100), pos, 'balloon', 10, this.player.hitBalloon.bind(this.player), pMath.Between(0, 4));
                    entity.play('balloon');
                } else if (type < 0.2) { // coin
                    entity = new Entity(this, hWidth * 2 + pMath.Between(0,  50), pos, 'coin', 0, this.pickupCoin.bind(this), pMath.Between(0, 6));
                    entity.play('coin');
                } else {
                    entity = new Entity(this, hWidth * 2 + pMath.Between(0, 300), pos, 'bird', pMath.Between(75, 150), this.gameOver.bind(this), pMath.Between(0, 5));
                    entity.setCircle(96);
                    entity.play('b-idle');
                }

                this.entityGroup.add(entity);
                console.log(`Spawned at ${pos}, ${type}`);
            }

            // TODO: pick good values for these.
            // extremely arbitrary but should be acceptable for the moment.
            this.enemyTimer = pMath.Between(1, 3) * 50/(5 + (this.score * 0.1)) * 0.5;
            //this.enemyTimer = 1;
        }

        // activePointer doesn't updateWorldPoint unless
        // DOM detect movements. This is manually overwriting that.
        this.input.activePointer.updateWorldPoint(this.cameras.main);
        this.input.activePointer.worldY = pMath.Clamp(this.input.activePointer.worldY, -this.mouseCap, 0);
        this.physics.world.gravity.y = this.calculateGravity(-this.player.y);


        this.player.update(time, delta);
        if (this.player.y > -20) {
            this.gameOver();
            return;
        }
        this.entityGroup.getChildren().forEach(entity => {
            (entity as Entity).update(delta, time, this.player.body.velocity.x);
        });

        // Manage Tiled Sprite Movement
        this.scrollBackground(this.player.body.velocity.x * delta);

        // Calculate Score
        this.calculateScore(delta);
    }

    scrollBackground(deltaX : number) : void {
        this.mountains.tilePositionX += 0.1  * deltaX;
        this.treesB.tilePositionX    += 0.25 * deltaX;
        this.treesM.tilePositionX    += 0.6  * deltaX;
        this.treesF.tilePositionX    += 1    * deltaX;
    }

    calculateScore(delta : number) : void {
        let altitude = this.getAltitude();
        let bonusMultipler = 1;
        if (altitude > this.bonusFloor) {
            let k = -2/Math.pow((this.worldHeight - this.bonusFloor), 2);
            bonusMultipler = k * Math.pow((this.worldHeight - altitude), 2) + this.maxBonusMultiplier;
        }
        this.score += ((this.getSpeed()/100) * bonusMultipler) * delta;
    }

    // these numbers are UBER out of wack. but should be fine for our purposes.
    calculateDifficultyFactor(time : number) : number {
        let a = 0;
        let b = 400;
        let c = 1.25;
        
        let k = c / Math.pow(b - a, 2);
        return k * Math.pow(time - a, 2) + 1;
    }

    calculateGravity(height : number) : number {
        if (height < this.atmosphereHeight) {
            return this.initGravity;
        } else {
            // extreme levels of swag
            let k = ((1/(2 * Math.pow((this.worldHeight - this.atmosphereHeight), 2))));
            return this.initGravity * k * Math.pow((this.worldHeight - height), 2) + this.minGravityMultiplier;
            // this equation evaluates 1 when height = this.atmosphereHeight.
            // When height = 5000, multiplier is ~0.5.
        }
    }

    pickupCoin() : void {
        this.score += pMath.Between(10, 20);
        SoundMan.play('coin');
    }

    getAltitude() : number {
        return Math.floor(-this.player.y - 13);
    }

    getSpeed() : number {
        return this.player.body.velocity.length();
    }

    getScore() : number {
        return this.score;
    }

    toggleOverlay() : void {
        this.UIScene.toggleOverlay();
        this.physics.world.resume();
        this.hasPlayed = true;
    }

    togglePause() : void {
        // don't allow unpause on gameover.
        if (this.endGame) {
            return;
        }
        SoundMan.play('select');
        if (this.paused) {
            this.physics.world.resume();
        } else {
            this.physics.world.pause();
        }
        this.UIScene.togglePause();
        this.paused = !this.paused;
    }

    gameOver() : void {
        if (this.score > gVar.highScore) {
            gVar.highScore = Math.floor(this.score);
            saveCookie('highScore', Math.floor(this.score));
        }
        this.endGame = true;
        this.paused  = true;
        this.UIScene.setGameOver();
        this.physics.pause();
    }

    reset() : void {
        this.endGame = false;
        this.paused  = false;
        if (this.score > gVar.highScore) {
            gVar.highScore = Math.floor(this.score);
            saveCookie('highScore', Math.floor(this.score));
        }
        this.score  = 0;
        this.entityGroup.getChildren().forEach(entity => {
            (entity as Entity).destroy();
        });
        this.scene.stop('UIScene');
        this.scene.start('PlayScene');
    }
}

