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

    private paused : boolean = false;
    private gameOver : boolean = false;
    private gameStart : boolean = false;
    private UIScene : UIScene;

    lineColour : number = gConst.red;
    
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
            this.togglePause();
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

    endGame() : void {
        this.paused = true;

        var timer : Phaser.Time.TimerEvent = this.strongbad.playTaunt();
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

        const T = 5000; // in ms
        const d = 10;
        const t = T / d;
        let step = 0;
        // Darkens the line colour to black over T ms
        let fadeOutLines = this.time.addEvent({
            delay:  d,
            repeat: t,
            callback: () => {
                const factor = 1 - (++step / t);
                const R = Math.floor(factor * ((this.lineColour >> 16) & 0xFF));
                const G = Math.floor(factor * ((this.lineColour >>  8) & 0xFF));
                const B = Math.floor(factor * (this.lineColour & 0xFF));
                this.lineColour = (R << 16) | (G << 8) | B;
            },
            callbackScope: this,
            paused: true
        });

        let onComplete = this.time.addEvent({
            delay: T + (T / 5),
            callback: () => {
                this.UIScene.setGameOver();
                this.gameOver = true;
            },
            callbackScope: this,
            paused: true
        });
    }

    reset() : void {
        this.gameOver = false;
        this.paused   = false;
        
        // if i do scoring put it here
        
        this.scene.stop('UIScene');
        this.scene.start('PlayScene');
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
}
