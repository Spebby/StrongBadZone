import { GameConfig, UIConfig } from "../config";
import { KeyMap } from "../keymap";
import { gVar, gConst, saveCookie } from "../global";
import { SoundMan } from "../soundman";
import { Math as pMath } from 'phaser';

var hWidth;
var hHeight;
var typeTime = 0.5;

export class MenuScene extends Phaser.Scene {
    private hsText  : Phaser.GameObjects.Text;
    private text    : Phaser.GameObjects.Text;
    private menu    : Phaser.GameObjects.Container;
    private overlay : Phaser.GameObjects.Container;
    private creditsOverlay : Phaser.GameObjects.Container;
    
    private typeDelay : number;

    // typing shiiii
    private passage : string;
    private charWritten : number;

    constructor() {
        super({ key: 'MenuScene' });
    }

    create() : void {
        KeyMap.initialize(this);
        // setup UI.

        hHeight = UIConfig.hHeight;
        hWidth  = UIConfig.hWidth;

        this.text = this.add.text(UIConfig.borderPadding, UIConfig.borderPadding, '', gConst.uiConfig);
        var menu = this.add.container(UIConfig.hWidth, UIConfig.hHeight - (UIConfig.hHeight / 16));

        // menu container
        let playText = this.add.text(0, 0, "PLAY", gConst.settingsConfig).setOrigin(0.5);
        let pScale = playText.scale;
        playText.on('pointerover', () => {
            this.tweens.add({
                targets: playText,
                scale: pScale * 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        playText.on('pointerout', () => {
            this.tweens.add({
                targets: playText,
                scale: pScale,
                duration: 200,
                ease: 'Power2'
            });
        });

        playText.setInteractive().on('pointerdown', () => {
            this.changeScene('PlayScene');
        });

        let tutorialText = this.add.text(0, 128, "HOW TO PLAY", gConst.settingsConfig).setOrigin(0.5);
        let ttScale = tutorialText.scale;
        tutorialText.on('pointerover', () => {
            this.tweens.add({
                targets: tutorialText,
                scale: ttScale * 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        tutorialText.on('pointerout', () => {
            this.tweens.add({
                targets: tutorialText,
                scale: ttScale,
                duration: 200,
                ease: 'Power2'
            });
        });

        tutorialText.setInteractive().on('pointerdown', () => {
            this.changeScene('PlayScene');
        });

        let creditText = this.add.text(0, 256, "CREDITS", gConst.settingsConfig).setOrigin(0.5);
        let cScale = creditText.scale;
        creditText.on('pointerover', () => {
            this.tweens.add({
                targets: creditText,
                scale: cScale * 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        creditText.on('pointerout', () => {
            this.tweens.add({
                targets: creditText,
                scale: cScale,
                duration: 200,
                ease: 'Power2'
            });
        });

        creditText.setInteractive().on('pointerdown', () => {
            this.creditsOverlay.setVisible(!this.creditsOverlay.visible);
        });

        KeyMap.keyEXIT.onDown = () => {
            if (this.creditsOverlay.visible) {
                this.creditsOverlay.setVisible(false);
            }
        }

        menu.add([playText, tutorialText, creditText]);

        this.menu = menu;
        this.menu.setVisible(false);
        this.typeText(gConst.menuText);


        // Credits Overlay
        this.creditsOverlay = this.add.container(hWidth, hHeight);

        var rect = this.add.rectangle(0, 0, hWidth * 2, hHeight * 2, 0, 1).setOrigin(0.5);

        // If I have time, make the game type this.
        var credits = this.add.text(0, 0, "Programming & Art by Thom 'Spebby' Mott\n\nOriginal Source Homestar Runner\nPhaser 3 TypeScript template by digitsensitive", gConst.settingsConfig).setOrigin(0.5);
        var creditsPrompt = this.add.text(0, credits.displayHeight - 64, "PRESS ESCAPE TO RETURN", gConst.settingsConfig).setOrigin(0.5).setScale(0.5);

        this.creditsOverlay.add([rect, credits, creditsPrompt]);
        this.creditsOverlay.setVisible(false);
    }


    update(time : number, delta : number) : void {
        delta /= 1000;


        // Render Text
        this.typeDelay -= delta;
        if (this.charWritten >= this.passage.length || 0 < this.typeDelay) return;

        let start = this.charWritten;
        let end = start;
        let chunk = "";

        // Step 1: Find chunk up to 8 characters or stopping at space/newline
        while (end < this.passage.length && end - start < 8) {
            let currentChar = this.passage[end];

            if (currentChar == ' ' && start == this.charWritten) {
                // If we start on spaces, extend until we hit a non-space
                while (end < this.passage.length && this.passage[end] === ' ') {
                    chunk += this.passage[end];
                    end++;
                }
                break;
            }

            chunk += currentChar;
            end++;
        }

        // Step 2: Append the chunk and advance pointer
        this.text.text += chunk;
        this.charWritten = end;

        // Step 3: Determine typeDelay
        if (chunk.includes('\n')) {
            this.typeDelay = typeTime;
        } else if (chunk.includes(' ')) {
            this.typeDelay = delta;
        }

        // Step 4: Handle sound playing condition
        // TODO: make newline ding.
        if (chunk.includes('\n')) {
            SoundMan.play('typing');
        } // TODO: Downshift and reverb typing sound for now.
        else if (!chunk.includes('\r') && !chunk.includes('\0')) {
            SoundMan.play('typing');
        }

        if (this.charWritten == this.passage.length) {
            this.TriggerMenu();
        }
    }

    typeText(passage : string) : void {
        this.passage = passage;
        this.charWritten = 0;
        this.typeDelay = 0;
    }

    changeScene(key : string) : void {
        SoundMan.play('select');
        this.scene.start(key);
    }

    TriggerMenu() : void {
        this.menu.setVisible(true);
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
