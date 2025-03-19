import { GameConfig, UIConfig } from "../config";
import { KeyMap } from "../keymap";
import { gVar, gConst, saveCookie } from "../global";
import { SoundMan } from "../soundman";
import { GameObjects, Math as pMath } from 'phaser';
import { TypingText } from '../TypingText';

var hWidth;
var hHeight;

const typeDelay = 2;
export class TutorialScene extends Phaser.Scene {
    private doneTyping : boolean;

    constructor() {
        super({ key: 'TutorialScene' });
    }
    
    create() : void {
        hHeight = UIConfig.hHeight;
        hWidth  = UIConfig.hWidth;

        // menu container
        KeyMap.keySPACE.onDown = () => {
            // I'm not doing this just yet,
            // but I'll have to make a decision
            // on if I want to skip all text anims
            // or just the current ones. Either
            // way I'll need to do a list
            // to keep track of any number of
            // possible animations
            // and have the text objects
            // subscribe themselves to the list.
        }

        KeyMap.keyEXIT.onDown = () => {
            if (!this.doneTyping) {
                return;
            }

            this.changeScene('MenuScene');
        }

        this.doneTyping = false;
        var cont = new TypingText(this, 0, 64, '', gConst.settingsConfig).setOrigin(0.5).setScale(0.5);
        var rett = new TypingText(this, 0, (hWidth * 2) - 64, '', gConst.settingsConfig).setOrigin(0.5).setScale(0.5);
        
        // Using this as a callback for the OnComplete timers of the other printing funcs
        // So that it stats printing "after" the others.
        const printPrompts = () => {
            cont.startTyping("PRESS ENTER TO CONTINUE", () => {});
            rett.startTyping("PRESS ESCAPE TO RETURN", () => {});
        }
    }

    changeScene(key : string) : void {
        SoundMan.play('select');
        this.scene.start(key);
    }
}
