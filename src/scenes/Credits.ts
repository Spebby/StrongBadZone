import { GameConfig, UIConfig } from "../config";
import { KeyMap } from "../keymap";
import { gVar, gConst, saveCookie } from "../global";
import { SoundMan } from "../soundman";
import { TypingText } from '../TypingText';

var hWidth;
var hHeight;

export class CreditScene extends Phaser.Scene {
    private doneTyping : boolean;

    constructor() {
        super({ key: 'CreditScene' });
    }
    
    create() : void {
        KeyMap.initialize(this);
        hHeight = UIConfig.hHeight;
        hWidth  = UIConfig.hWidth;

        // menu container
        KeyMap.keyEXIT.onDown = () => {
            if (!this.doneTyping) {
                return;
            }

            this.changeScene('MenuScene');
        }

        this.doneTyping = false;
        var expl = new TypingText(this, hWidth, hHeight, '', gConst.settingsConfig)
            .setOrigin(0.5);
        var rett = new TypingText(this, hWidth, hHeight + expl.displayHeight + 64, '', gConst.settingsConfig)
            .setOrigin(0.5)
            .setScale(0.5);

        // Using this as a callback for the OnComplete timers of the other printing funcs
        // So that it stats printing "after" the others.
        const printPrompts = () => {
            rett.startTyping("HIT ESCAPE TO RETURN", () => {},  10);
            this.doneTyping = true;
        }

        expl.startTyping(`PROGRAMMING & ART BY THOM 'SPEBBY' MOTT\n\nORIGINAL SOURCE - HOMESTAR RUNNER\nPHASER 3 TYPESCRIPT TEMPLATE BY DIGITALSENSITIVE`, printPrompts, 10);

        KeyMap.keySPACE.onDown = () => {
            if (this.doneTyping) {
                return;
            }
            expl.cancel();
        }
    }

    changeScene(key : string) : void {
        SoundMan.play('select');
        this.scene.start(key);
    }
}
