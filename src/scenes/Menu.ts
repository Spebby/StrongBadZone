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
    private creditsOverlay : Phaser.GameObjects.Container;
   
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
        });

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
            this.creditsOverlay.setVisible(!this.creditsOverlay.visible);
        }, list);

        menu.add(list);
        this.menu = menu;
        this.menu.setVisible(false);

        KeyMap.keyEXIT.onDown = () => {
            if (this.creditsOverlay.visible) {
                this.creditsOverlay.setVisible(false);
            }
        }

        KeyMap.keySPACE.onDown = () => {
            text.cancel();
        }

        // Credits Overlay
        this.creditsOverlay = this.add.container(hWidth, hHeight);
        var rect = this.add.rectangle(0, 0, hWidth * 2, hHeight * 2, 0, 1).setOrigin(0.5);

        // If I have time, make the game type this.
        var credits = this.add.text(0, 0, "Programming & Art by Thom 'Spebby' Mott\n\nOriginal Source Homestar Runner\nPhaser 3 TypeScript template by digitsensitive", gConst.settingsConfig).setOrigin(0.5);
        var creditsPrompt = this.add.text(0, credits.displayHeight - 64, "PRESS ESCAPE TO RETURN", gConst.settingsConfig).setOrigin(0.5).setScale(0.5);

        this.creditsOverlay.add([rect, credits, creditsPrompt]);
        this.creditsOverlay.setVisible(false);
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
