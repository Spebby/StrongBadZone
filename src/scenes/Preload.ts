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
        this.load.obj('shield', 'models/shield.obj');
        this.load.image('blank', 'models/SBZ.png');

        SoundMan.init(this);
        SoundMan.add('uiBlip', 'sfx/uiBlip.wav');
        SoundMan.add('select', 'sfx/select.wav');

        SoundMan.add('typing', 'sfx/click.wav');
        SoundMan.add('newLine', 'sfx/typingDing.wav');

        SoundMan.add('explosion', 'sfx/explosion.ogg');
        SoundMan.add('strongTaunt', 'sfx/strongTaunt.mp3');

        SoundMan.add('block', 'sfx/reflect.ogg');
        SoundMan.add('shoot', 'sfx/shoot.mp3');
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
