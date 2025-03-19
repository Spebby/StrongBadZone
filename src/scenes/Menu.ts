import { GameConfig, UIConfig } from "../config";
import { KeyMap } from "../keymap";
import { gVar, gConst, saveCookie } from "../global";
import { SoundMan } from "../soundman";
import { GameObjects, Math as pMath } from 'phaser';
import { TypingText } from '../TypingText';

var hWidth;
var hHeight;

const typeDelay = 2;
export class MenuScene extends Phaser.Scene {
    private hsText  : Phaser.GameObjects.Text;
    private menu    : Phaser.GameObjects.Container;
    private doneTyping : boolean;

    constructor() {
        super({ key: 'MenuScene' });
    }

    create() : void {
        KeyMap.initialize(this);
        // setup UI.
        hHeight = UIConfig.hHeight;
        hWidth  = UIConfig.hWidth;

        var text = new TypingText(this, UIConfig.borderPadding, UIConfig.borderPadding, '', gConst.uiConfig);
        text.startTyping(gConst.menuText, () => {
            this.triggerMenu();
            this.doneTyping = true;
        });

        this.doneTyping = false;
        var menu  = this.add.container(UIConfig.hWidth, UIConfig.hHeight - (UIConfig.hHeight / 16));

        // menu container
        var list : GameObjects.GameObject[] = [];
        const createTextButton = (x : number, y : number, text : string, config : any, onClick : () => void, list : GameObjects.GameObject[]) => {
            let txt = this.add.text(x, y, text, config).setOrigin();
            let oSc = txt.scale;
            txt.on('pointerover', () => {
                this.tweens.add({
                    targets: txt,
                    scale: oSc * 1.1,
                    duration: 200,
                    ease: 'Power2'
                });
            });
            txt.on('pointerout', () => {
                this.tweens.add({
                    targets: txt,
                    scale: oSc,
                    duration: 200,
                    ease: 'Power2'
                });
            });
            txt.setInteractive().on('pointerdown', onClick);
            list.push(txt);
        }

        createTextButton(0, 0,   "PLAY", gConst.settingsConfig, () => {
            this.changeScene('PlayScene')
        }, list);
        createTextButton(0, 128, "HOW TO PLAY", gConst.settingsConfig, () => {
            this.changeScene('TutorialScene');
        }, list);
        createTextButton(0, 256, "CREDITS", gConst.settingsConfig, () => {
            this.changeScene('CreditScene');
        }, list);

        menu.add(list);
        this.menu = menu;
        this.menu.setVisible(false);

        KeyMap.keySPACE.onDown = () => {
            if (this.doneTyping) {
                return;
            }
            text.cancel();
        }
    }

    changeScene(key : string) : void {
        SoundMan.play('select');
        this.scene.start(key);
    }

    triggerMenu() : void {
        this.menu.setVisible(true);
    }

    resetHighscore() : void {
        SoundMan.play('explosion');
        document.cookie = `highScore=0; expires=Fri, 1, Jan 1, 23:59:59 GMT; path=/`;
        gVar.highScore  = 0;
        this.hsText.text = ``;
    }

    toggleOverlay() : void {
        return;
    }
}
