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

        KeyMap.keySELECT.onDown = () => {
            if (!this.doneTyping) {
                return;
            }

            this.changeScene('PlayScene');
        }

        this.doneTyping = false;
        var expl = new TypingText(this, hWidth, hHeight, '', gConst.settingsConfig)
            .setOrigin(0.5);
        var cont = new TypingText(this, 0, hHeight * 2 - 64, '', gConst.settingsConfig)
            .setAlign('left')
            .setOrigin(0.5)
            .setScale(0.5);
        cont.x += (128 + UIConfig.borderUISize);
        var rett = new TypingText(this, (hWidth * 2), hHeight * 2 - 64, '', gConst.settingsConfig)
            .setAlign('right')
            .setOrigin(0.5)
            .setScale(0.5);
        rett.x -= (128 + UIConfig.borderUISize);

        // Using this as a callback for the OnComplete timers of the other printing funcs
        // So that it stats printing "after" the others.
        const printPrompts = () => {
            cont.startTyping("HIT ENTER TO CONTINUE", () => {}, 10);
            rett.startTyping("HIT ESCAPE TO RETURN", () => {},  10);
            this.doneTyping = true;
        }

        expl.startTyping(`HOW TO PLAY STRONGBADZONE\n\nMOVE AROUND WITH LEFT AND RIGHT ARROW KEY\nBLOCK ATTACK WITH Q W E KEYS\nDONT DIE\nHIT STRONGBAD 6 TIMES TO WIN`, printPrompts, 10);

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
