import { GameConfig, UIConfig } from "../config";
import { KeyMap } from "../keymap";
import { gVar, gConst, saveCookie } from "../global";
import { SoundMan } from "../soundman";
import { Math as pMath } from 'phaser';

var hWidth;
var hHeight;
var typeTime = 0.2;
export class PlayScene extends Phaser.Scene {
    private hsText  : Phaser.GameObjects.Text;
    private text    : Phaser.GameObjects.Text;
    private overlay : Phaser.GameObjects.Container;

    private typeDelay : number;
    private typingSFX : Phaser.Sound.BaseSound;

    constructor() {
        super({ key: 'MenuScene' });
    }

    create() : void {
        KeyMap.initialize(this);
        // setup UI.

        hHeight = UIConfig.hHeight;
        hWidth  = UIConfig.hWidth;

        // todo: find a safer way of doing this.
        this.typingSFX = this.sound.add(SoundMan.getSound('typing').getID());
        if (this.typingSFX instanceof Phaser.Sound.WebAudioSound) {
            this.typingSFX.detune = 1200;
        }
    }


    update(time : number, delta : number) : void {
        delta /= 1000;
        // non-typing logic

        // render dat text
        this.typeDelay -= delta;
        if (this.charWritten >= this.passageLen || 0 < this.typeDelay) return;
        
        const char = this.buffer[this.charWritten];
        this.text.appendText(char);
        this.typingSFX.play();
        
        this.typeDelay = char == '\n' ? typeTime * 2 : typeTime;
    }

    changeScene(key : string) : void {
        SoundMan.play('select');
        this.scene.start(key);
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
