import { GameConfig, UIConfig } from "../config";
import { KeyMap } from "../keymap";
import { gVar, gConst, saveCookie } from "../global";
import { SoundMan } from "../soundman";
import { Math as pMath } from 'phaser';

export class MenuScene extends Phaser.Scene {
    private hsText  : Phaser.GameObjects.Text;
    private overlay : Phaser.GameObjects.Container;

    private debug : Phaser.GameObjects.Graphics;

    constructor() {
        super({ key: 'MenuScene' });
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
        const room      = this.add.mesh(hWidth, hHeight, 'blank');
        const strongbad = this.add.mesh(hWidth, hHeight, 'blank');

        room.addVerticesFromObj('room', 1, 0, 0, 0, 0, pMath.DegToRad(-90), 0);
        strongbad.addVerticesFromObj('strongbad', 1, 0, 0, 1, 0, pMath.DegToRad(-90), 0);

        this.debug = this.add.graphics();
        room.setDebug(this.debug);
        strongbad.setDebug(this.debug);

        room.panZ(-10);
        strongbad.panZ(-10);
        room.setOrtho(6.2, 4.6);
        strongbad.setOrtho(6.2, 4.6);

        this.input.on('pointermove', (pointer : Phaser.Input.Pointer) => {
            if (!pointer.isDown) return;
            room.modelRotation.y += pointer.velocity.x / 800;
            room.modelRotation.x += pointer.velocity.y / 800;
            strongbad.modelRotation.y += pointer.velocity.x / 800;
            strongbad.modelRotation.x += pointer.velocity.y / 800;
        });
    }

    update() : void {
        this.debug.clear();
        this.debug.lineStyle(2, 0x70161E);
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
}
