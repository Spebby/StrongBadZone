import { GameConfig, UIConfig } from "../config";
import { KeyMap } from "../keymap";
import { gVar, gConst, saveCookie } from "../global";
import { SoundMan } from "../soundman";
import { Math as pMath } from 'phaser';

import { Strongbad } from '../objects/strongbad';
import { Player } from '../objects/player';

export class PlayScene extends Phaser.Scene {
    private hsText  : Phaser.GameObjects.Text;
    private overlay : Phaser.GameObjects.Container;

    edgeRender : Phaser.GameObjects.Graphics;
    strongbad : Strongbad;
    player : Player;

    constructor() {
        super({ key: 'PlayScene' });
    }

    preload() : void {

    }

    create() : void {
        KeyMap.initialize(this);
        // setup UI.
        let hHeight = parseInt(GameConfig.scale.height as string) / 2;
        let hWidth  = parseInt(GameConfig.scale.width  as string) / 2;

        //this.add.image(hWidth, hHeight, 'titleBg');
        //let title = this.add.image(hWidth, hHeight / 2, 'title');
        //title.setScale(0.75);

        // this.add.image(hWidth, hHeight, 'ref').setScale(1.065);
        // Making meshes here b/c for whatever reason they don't
        // behave if I make them in their respective classes
        const room       = this.add.mesh(hWidth, hHeight, 'blank');
        const playermesh = this.add.mesh(hWidth, hHeight, 'blank');
        const strongmesh = this.add.mesh(hWidth, hHeight, 'blank');

        room.addVerticesFromObj('room', 1, 0, 0, 0, 0, pMath.DegToRad(-90), 0);
        playermesh.addVerticesFromObj('player', 1, 0, 0, 0, 0, pMath.DegToRad(-90), 0);
        strongmesh.addVerticesFromObj('strongbad', 1, 0, 0, 0, 0, pMath.DegToRad(-90), 0);

        this.edgeRender = this.add.graphics();
        room.setDebug(this.edgeRender);
        playermesh.setDebug(this.edgeRender);
        strongmesh.setDebug(this.edgeRender);

        room.panZ(-10);
        room.setOrtho(6.2, 4.6);
        strongmesh.panZ(-10);
        strongmesh.setOrtho(6.2, 4.6);
        playermesh.panZ(-5);
        playermesh.setOrtho(6.2, 4.6);

        this.player = new Player(this, hWidth, hHeight * 2 - 100, playermesh, 200, 2, 1);
        this.strongbad = new Strongbad(this, hWidth, hHeight - 175, strongmesh, 50, 200, 4, null);
        this.input.on('pointermove', (pointer : Phaser.Input.Pointer) => {
            if (!pointer.isDown) return;
            room.modelRotation.y += pointer.velocity.x / 800;
            room.modelRotation.x += pointer.velocity.y / 800;
            this.player.mesh.modelRotation.y += pointer.velocity.x / 800;
            this.player.mesh.modelRotation.x += pointer.velocity.y / 800;
            this.strongbad.mesh.modelRotation.y += pointer.velocity.x / 800;
            this.strongbad.mesh.modelRotation.x += pointer.velocity.y / 800;
        });

        this.physics.world.drawDebug = true;
    }

    update(time : number, delta : number) : void {
        delta /= 1000;
        this.edgeRender.clear();
        this.edgeRender.lineStyle(3, 0x70161E);

        this.strongbad.update(time, delta);
    }

    changeScene() : void {
        SoundMan.play('select');
        this.scene.start('PlayScene');
    }

    resetHighscore() : void {
        SoundMan.playUnweight('explosions');
        document.cookie = `highScore=0; expires=Fri, 1, Jan 1, 23:59:59 GMT; path=/`;
        gVar.highScore  = 0;
        this.hsText.text = ``;
    }

    toggleOverlay() : void {
        return;
    }
}
