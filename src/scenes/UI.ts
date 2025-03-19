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
    private gameOver    : GameObjects.Container;

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

        let gameOverBg = this.add.rectangle(0, 0, 2 * hWidth, 2 * hHeight, 0xce4c4c, 0.5)
            .setOrigin(0.5);
        this.gameOverText = new TypingText(this, 0, 0, 'Game Over!', gConst.uiPopup)
            .setOrigin(0.5)
            .setFontSize('96px');
        let prompt = this.add.text(0, hHeight - UIConfig.borderPadding - 32, 'Press R to Restart', gConst.uiPopup)
            .setOrigin(0.5);
        this.gameOver = this.add.container(hWidth, hHeight)
            .setScale(0);
        this.gameOver.add([gameOverBg, this.gameOverText, prompt]);

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

    setGameOver() : void {
        this.isGameOver = !this.isGameOver;
        
        let scoreText = new TypingText(this, 0, this.gameOverText.y + 64, '', gConst.uiPopup)
            .setOrigin(0.5)
            .setFontSize('16px');
        this.gameOver.add(scoreText);

        this.gameOver.disableInteractive();
        this.gameOverText.startTyping("GAME OVER", () => {
            this.gameOver.setInteractive();
            scoreText.startTyping("Score tbd", () => {});
        });
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
