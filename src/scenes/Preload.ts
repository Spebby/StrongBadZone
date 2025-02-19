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

        // Menu Assets
        this.load.image('title', 'title/title.png');
        this.load.image('titleBg', 'title/titleBg.png');
        this.load.spritesheet('startText', 'title/start.png', {
            frameWidth:  512,
            frameHeight: 128,
        });
        this.load.image('cog',   'title/cog.png');
        this.load.spritesheet('close', 'title/x.png', {
            frameWidth:  256,
            frameHeight: 256,
        });

        // Game Assets
        this.load.image('bgTop',    'backgrounds/bgTop.png');
        this.load.image('bgBottom', 'backgrounds/bgBottom.png');
        this.load.image('mountain', 'backgrounds/mountain.png');

        this.load.image('treesF', 'backgrounds/treesF.png');
        this.load.image('treesM', 'backgrounds/treesM.png');
        this.load.image('treesB', 'backgrounds/treesB.png');
        this.load.spritesheet('player', 'player.png', {
            frameWidth:  512,
            frameHeight: 512,
        });
        this.load.spritesheet('bird', 'bird.png', {
            frameWidth:  512,
            frameHeight: 512,
        });
        this.load.spritesheet('balloon', 'balloon.png', {
            frameWidth:  512,
            frameHeight: 512,
        });
        this.load.spritesheet('coin', 'coin.png', {
            frameWidth:  512,
            frameHeight: 512,
        });
        this.load.spritesheet('clouds', 'clouds.png', {
            frameWidth:  512,
            frameHeight: 512,
        });

        // load meshes
        this.load.obj('room', 'models/wall.obj');
        this.load.obj('strongbad', 'models/strongbad.obj');
        this.load.image('blank', 'models/SBZ.png');
        this.load.image('ref', 'models/ref.png');

        SoundMan.init(this);
        SoundMan.add('uiBlip', 'sfx/uiBlip.wav');
        SoundMan.add('select', 'sfx/select.wav');
        SoundMan.add('shot', 'sfx/shot.wav');
        SoundMan.add('coin', 'sfx/coin.wav');
        SoundMan.add('pop',  'sfx/pop.wav');
        SoundMan.add('fall', 'sfx/fall.wav');
        SoundMan.add('gameOver', 'sfx/gameOver.wav');
        SoundMan.importJSON('soundData.json');
    }

    create() : void {
        // Title Anims
        this.anims.create({
            key: 'startText',
            frameRate: 4,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers('startText', { start: 0, end: 3 }),
        });
        this.anims.create({
            key: 'close',
            frameRate: 4,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNames('close', { start: 0, end: 2 })
        })

        // Object Anims
        this.anims.create({
            key: 'p-idle',
            frameRate: 4,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 4 }),
        });
        this.anims.create({
            key: 'b-idle',
            frameRate: 8,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 5 }),
        });
        this.anims.create({
            key: 'coin',
            frameRate: 8,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 6 }),
        });
        this.anims.create({
            key: 'balloon',
            frameRate: 4,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers('balloon', { start: 0, end: 4 }),
        });

        // Background Anims
        this.anims.create({
            key: 'cloud0',
            frameRate: 4,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers('clouds', { start: 0, end: 2 }),
        });
        this.anims.create({
            key: 'cloud1',
            frameRate: 4,
            repeat: -1,
            yoyo: true,
            frames: this.anims.generateFrameNumbers('clouds', { start: 3, end: 5 }),
        });


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
