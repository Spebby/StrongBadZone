import { GameConfig, UIConfig } from "../config";
import { KeyMap } from "../keymap";
import { gVar, gConst, saveCookie } from "../global";
import { SoundMan } from "../soundman";
import { Math as pMath } from 'phaser';

import { UIScene } from './UI';
import { Strongbad } from '../objects/strongbad';
import { Player } from '../objects/player';

export class PlayScene extends Phaser.Scene {
    private hsText  : Phaser.GameObjects.Text;
    private overlay : Phaser.GameObjects.Container;
    private debug   : boolean;

    private paused : boolean;
    private gameOver : boolean;
    private gameStart : boolean;
    private UIScene : UIScene;

    lineColour : number;
    
    edgeRender : Phaser.GameObjects.Graphics;
    strongbad  : Strongbad;
    player     : Player;

    constructor() {
        super({ key: 'PlayScene' });
    }

    create() : void {
        KeyMap.initialize(this);
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');
        this.UIScene = this.scene.manager.getScene('UIScene') as UIScene;

        this.paused = false;
        this.gameOver = false;
        this.gameStart = false;
        this.lineColour = gConst.red;

        // setup UI.
        let hHeight = parseInt(GameConfig.scale.height as string) / 2;
        let hWidth  = parseInt(GameConfig.scale.width  as string) / 2;
        this.debug = false;
        this.paused = true;

        let g = this.add.graphics({
            x: 0,
            y: 0
        });
        g.fillStyle(gConst.red, 1);
        g.fillRect(0, 0, 1, 1);
        g.generateTexture('red', 1, 1);
        g.fillStyle(0, 1);
        g.fillRect(0, 0, 1, 1);
        g.generateTexture('black', 1, 1);
        g.destroy();

        // Making meshes here b/c for whatever reason they don't behave if I make them in their respective classes
        // NOTE: from future me, this is because the meshes become
        // attached to the parent gameobject and it replaces them in
        // the display list. Which causes nothing to be rendered b/c
        // the gameobject class has no defined rendering routine.
        const room       = this.add.mesh(hWidth, hHeight, 'blank');
        const playermesh = this.add.mesh(hWidth, hHeight, 'black');
        const strongmesh = this.add.mesh(hWidth, hHeight, 'blank');
        const shieldmesh = this.add.mesh(hWidth, hHeight, 'red');

        room.addVerticesFromObj('room', 1, 0, 0, 0, 0, pMath.DegToRad(-90), 0);
        playermesh.addVerticesFromObj('player', 0.8, 0, 0.2, 0, 0, pMath.DegToRad(-90), 0);
        strongmesh.addVerticesFromObj('strongbad', 1, 0, 0, 0, 0, pMath.DegToRad(-90), 0);
        shieldmesh.addVerticesFromObj('shield', 0.8, 0, 0.2, 0, 0, pMath.DegToRad(-90), 0);

        this.edgeRender = this.add.graphics();
        room.setDebug(this.edgeRender);
        playermesh.setDebug(this.edgeRender);
        strongmesh.setDebug(this.edgeRender);

        room.panZ(-10);
        room.setOrtho(6.2, 4.6);
        strongmesh.panZ(10);
        strongmesh.z -= 10;
        strongmesh.setOrtho(6.2, 4.6);
        playermesh.setOrtho(6.2, 4.6);
        shieldmesh.setOrtho(6.2, 4.6);
        shieldmesh.setDepth(-1);

        this.player = new Player(this, hWidth, hHeight * 2 - 100, playermesh, shieldmesh, 200, 2, 1);
        this.strongbad = new Strongbad(this, hWidth, hHeight - 175, strongmesh, 125, 200, 4, 200);

        this.input.on('pointerdown', (pointer : Phaser.Input.Pointer) => {
            console.log(pointer.x, pointer.y);
        });
        this.input.on('pointermove', (pointer : Phaser.Input.Pointer) => {
            if (!this.debug || !pointer.isDown) return;
            room.modelRotation.y += pointer.velocity.x / 800;
            room.modelRotation.x += pointer.velocity.y / 800;
            this.player.mesh.modelRotation.y += pointer.velocity.x / 800;
            this.player.mesh.modelRotation.x += pointer.velocity.y / 800;
            this.strongbad.mesh.modelRotation.y += pointer.velocity.x / 800;
            this.strongbad.mesh.modelRotation.x += pointer.velocity.y / 800;
        });

        this.physics.world.drawDebug = true;
        console.log(this);

        KeyMap.keyDEBUG.onDown = () => {
            this.debug = !this.debug;
        }

        KeyMap.keyEXIT.onDown = () => {
            if (this.gameOver) {
                this.changeScene('MenuScene');
                return;
            }
            this.togglePause();
        }

        KeyMap.keyRESET.onDown = () => {
            if (this.gameOver) {
                this.reset();
            }
        }
    }

    update(time : number, delta : number) : void {
        this.edgeRender.clear();
        this.edgeRender.lineStyle(2, this.lineColour);

        if (this.paused) return;

        delta /= 1000;
        this.strongbad.update(time, delta);
        this.player.update(time, delta);
    }

    endGame(win : boolean) : void {
        this.gameOver = true;
        this.paused = true;

        var T;
        var timer : Phaser.Time.TimerEvent;
        // this is an absurdly gross way of doing this but im so tired
        if (win) {
            timer = this.time.addEvent({
               delay: gConst.deathTime + 1000,
            });
            T = 5000;
        } else {
            timer = this.strongbad.playTaunt();
            T = 3000;
        }
        timer.callback = () => {
            this.time.addEvent({
                delay: 500,
                callback: () => {
                    // If i was stupid I could write args for fadeOutLines
                    // to make it "dynamic" but who cares.
                    fadeOutLines.paused = false;
                    onComplete.paused   = false;
                },
                callbackScope: this
            });
        };

        const d = 10;
        const t = T / d;
        let step = 0;

        const sR = this.lineColour >> 16 & 0xFF;
        const sG = this.lineColour >> 8  & 0xFF;
        const sB = this.lineColour & 0xFF;
        // Darkens the line colour to black over T ms
        let fadeOutLines = this.time.addEvent({
            delay:  d,
            repeat: t,
            callback: () => {
                const factor = Math.max(0, 1 - (++step / t));
                const R = Math.floor(factor * sR);
                const G = Math.floor(factor * sG);
                const B = Math.floor(factor * sB);
                this.lineColour = (R << 16) | (G << 8) | B;
                // we do this mask b/c JS sometimes interprets 0x000000 as -1 due
                // to 32-bit signed float weirdness.
                
                if (win) {
                    this.player.shield.setAlpha(factor);
                }
            },
            callbackScope: this,
            paused: true
        });

        let onComplete = this.time.addEvent({
            delay: T + (T / 5),
            callback: () => {
                this.UIScene.setGameOver(true);
                this.lineColour = 0;
            },
            callbackScope: this,
            paused: true
        });
    }

    togglePause() : void {
        if (this.gameOver) {
            return;
        }

        SoundMan.play('select');

        this.UIScene.togglePause();
        this.paused = !this.paused;
    }

    isPaused() : boolean {
        return this.paused;
    }

    startGame() : void {
        if (this.gameStart) {
            return;
        }

        this.gameStart = true;
        this.paused    = false;
        this.UIScene.setGameStart();
    }

    changeScene(key : string) : void {
        SoundMan.play('select');
        this.scene.stop('UIScene');
        this.scene.start(key);
    }

    reset() : void {
        this.gameOver = false;
        this.paused   = false;
        
        // if i do scoring put it here
        
        this.scene.stop('UIScene');
        this.scene.start('PlayScene');
    }

    isDebugOn() : boolean {
        return this.debug;
    }
}
