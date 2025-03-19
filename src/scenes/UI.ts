import { GameObjects } from "phaser";
import { GameConfig, UIConfig } from "../config";
import { gVar, gConst } from "../global";
import { SoundMan } from "../soundman";
import { PlayScene } from "./Play";
import { TypingText } from "../TypingText";

export class UIScene extends Phaser.Scene {
    private pausedText  : TypingText;
    private pauseBg     : GameObjects.Rectangle;

    private overlay     : GameObjects.Container;

    private gameOverText : TypingText;
    private isGameOver : boolean = false;

    private startText : TypingText;

    // I imagine there's a far better way than doing this
    // (probably event based) but don't have time for that rn
    private PlayScene : PlayScene;

    constructor() {
        super({ key: 'UIScene' });
    }

    create() : void {
        this.PlayScene = this.scene.manager.getScene('PlayScene') as PlayScene;

        let hHeight : number = parseInt(GameConfig.scale.height as string) / 2;
        let hWidth  : number = parseInt(GameConfig.scale.width  as string) / 2;

        this.pauseBg = this.add.rectangle(hWidth, hHeight, 2 * hWidth, 2 * hHeight, 0, 1)
            .setOrigin(0.5)
            .setScale(1);
        this.pauseBg.alpha = 0;
        this.pausedText = new TypingText(this, hWidth, hHeight, '', gConst.uiPopup)
            .setOrigin(0.5, 0.5)
            .setFontSize('32px');

        this.gameOverText = new TypingText(this, hWidth, hHeight, '', gConst.uiPopup)
            .setOrigin(0.5)
            .setFontSize('96px');

        this.startText = new TypingText(this, hWidth, 64, '', gConst.uiPopup)
            .setOrigin(0.5)
            .setFontSize('64px');
        this.startText.startTyping("MOVE TO START", () => {});
    }

    setGameStart() : void {
        this.add.tween({
            targets: this.startText,
            duration: 500,
            alpha: 0
        });
    }

    setGameOver(win : boolean) : void {
        this.isGameOver = true;

        let prompt = new TypingText(this, UIConfig.hWidth, UIConfig.hHeight + this.gameOverText.height + UIConfig.borderPadding - 32, '', gConst.titleConfig)
            .setAlign('center')
            .setOrigin(0.5);

        // I'm not sure *why* typing text isn't working properly here, and I am at a point where I don't care.
        this.gameOverText.startTyping(win ? "YOU WIN" : "GAME OVER", () => {
            //scoreText.startTyping("Score tbd", () => {}, 20);
            prompt.startTyping("PRESS R TO RESTART\nPRESS ESCAPE TO RETURN TO MENU", () => {}, 5);
        }, 100);
    }

    private paused : boolean = false;
    togglePause() : void {
        SoundMan.play('select');
        if (this.paused) {
            this.pausedText.text = '';
        } else {
            this.pausedText.text = '-Paused-';
        }
        this.paused = !this.paused;

        let maxAlpha = 0.1;
        this.tweens.add({
            targets: this.pauseBg,
            alpha:   this.pauseBg.alpha === 0 ? maxAlpha : 0,
            ease:    this.pauseBg.alpha === maxAlpha ? 'Quad.easeIn' : 'Quad.easeOut',
            duration: 200,
            onComplete: () => {
                if (this.pauseBg.alpha === maxAlpha) {
                    this.pauseBg.disableInteractive();
                } else {
                    this.pauseBg.setInteractive();
                }
            }
        });
    }
}
