import { GameConfig, UIConfig } from "../config";
import { KeyMap } from "../keymap";
import { gVar, gConst, saveCookie } from "../global";
import { SoundMan } from "../soundman";

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

        var room = this.add.mesh(hWidth, hHeight, 'blank');
        //const strongbad = this.add.mesh(hWidth, hHeight);

        room.addVerticesFromObj('room', 1);
        //strongbad.addVerticesFromObj('strongbad', 0.1);

        room.modelPosition.z = 5;

        this.debug = this.add.graphics();
        room.setDebug(this.debug);
        //strongbad.setDebug(this.debug);

        room.modelRotation.x = 180;
        room.panZ(-10);

        this.input.on('pointermove', (pointer : Phaser.Input.Pointer) => {
            if (!pointer.isDown) return;
            room.modelRotation.x += pointer.velocity.x / 800;
            room.modelRotation.y += pointer.velocity.y / 800;
        });
    }

    update() : void {
        this.debug.clear();
        this.debug.lineStyle(2, 0xFACADE);
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
