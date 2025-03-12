/**
 * @file preload.ts
 * @abstract Preloading all 
 */

import { SoundMan } from "../soundman";
import { gVar, gConst } from "../global";

export class Preload extends Phaser.Scene {
    constructor() {
        super({ key: 'preload' });
    }

    preload() : void {
        this.load.path = gConst.assetPath;

        // load meshes
        this.load.obj('room', 'models/wall.obj');
        this.load.obj('strongbad', 'models/strongbad.obj');
        this.load.obj('player', 'models/player.obj');
        this.load.image('blank', 'models/SBZ.png');
        this.load.image('ref', 'models/ref.png');
        this.load.image('goblin', 'goblin.png');

        SoundMan.init(this);
        SoundMan.add('uiBlip', 'sfx/uiBlip.wav');
        SoundMan.add('select', 'sfx/select.wav');
        SoundMan.add('shot', 'sfx/shot.wav');
        SoundMan.add('coin', 'sfx/coin.wav');
        SoundMan.add('pop',  'sfx/pop.wav');
        SoundMan.add('fall', 'sfx/fall.wav');
        SoundMan.add('gameOver', 'sfx/gameOver.wav');
        SoundMan.add('typing', 'sfx/typingDing.wav');
        SoundMan.importJSON('soundData.json');
    }

    create() : void {
        // Read Cookies
        for (const cookie of document.cookie.split("; ")) {
            const [key, value] = cookie.split("=");
            if (key === "highScore") {
                gVar.highScore = parseInt(decodeURIComponent(value));
            }
            if (key === "musicOn") {
                gVar.musicOn = (value === "true");
            }
        }

        this.scene.start('MenuScene');
    }
}
