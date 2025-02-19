import { GameObjects } from "phaser";
import { GameConfig, UIConfig } from "../config";
import { gVar, gConst } from "../global";
import { SoundMan } from "../soundman";
import { PlayScene } from "./Play";

export class UIScene extends Phaser.Scene {
    private scoreText   : GameObjects.Text;
    private altitude    : GameObjects.Text;
    private speedometer : GameObjects.Text;
    private pausedText  : GameObjects.Text;

    private pauseBg     : GameObjects.Rectangle;

    private overlay     : GameObjects.Container;
    private gameOver    : GameObjects.Container;

    private gameOverText : GameObjects.Text;
    private isGameOver : boolean = false;

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

        this.scoreText   = this.add.text(UIConfig.borderPadding, UIConfig.borderPadding + 8, '', gConst.uiConfig)
            .setOrigin(0, 0.5)
            .setFontSize('32px');
        this.altitude    = this.add.text(UIConfig.borderPadding, this.scoreText.y + 32, '', gConst.uiConfig)
            .setOrigin(0, 0.5)
            .setFontSize('32px');
        this.speedometer = this.add.text(UIConfig.borderPadding, this.altitude.y + 32,  '', gConst.uiConfig)
            .setOrigin(0, 0.5)
            .setFontSize('32px');

        this.pauseBg = this.add.rectangle(hWidth, hHeight, 2 * hWidth, 2 * hHeight, 0, 1)
            .setOrigin(0.5)
            .setScale(1);
        this.pauseBg.alpha = 0;
        this.pausedText = this.add.text(hWidth, UIConfig.borderPadding + 8, '', gConst.uiConfig)
            .setOrigin(0.5, 0.5)
            .setFontSize('32px');

        let hasPlayed = (gVar.highScore > 0);
        if (!hasPlayed) {
            let overlayBg = this.add.rectangle(0, 0, 2 * hWidth, 2 * hHeight, 0x282c34, 0.5)
                .setOrigin(0.5);
            this.overlay  = this.add.container(hWidth, hHeight)
                .setScale(1);
            let text = this.add.text(0, 0, '', gConst.uiPopup)
                .setOrigin(0.5);

            text.text = 'Welcome to Fly-By!\n'
                      + 'Control your glider\'s pitch with your mouse position\n'
                      + 'Fly high, avoid hitting the bottom of the world, or any enemies.\n'
                      + 'The farther (and higher) you fly, the better your score.\n'
                      + 'Collect coins for extra score, and balloons for a boost in height.\n\n'
                      + 'Press the Escape key to pause and unpause the game,\n'
                      + 'as well as exiting this popup.\n'
                      + 'Press R while paused to reset the game! Your score will be saved.';

            let cancel = this.add.sprite(0, 0, 'cancel')
                .setInteractive().on('pointerdown', () => {
                    this.PlayScene.toggleOverlay();
                    // need to re-trigger some logic in playscene
                });
            cancel.play('close');
            cancel.setSize(96, 96)
            cancel.setDisplaySize(96, 96);
            cancel.x = cancel.width - (2 * UIConfig.borderPadding) - hWidth;
            cancel.y = hHeight + (2 * UIConfig.borderPadding) - cancel.height;
            let initScale = cancel.scaleX;

            cancel.on('pointerover', () => {
                this.tweens.add({
                    targets: cancel,
                    scale: initScale * 1.1,  // Tilt 15 degrees
                    duration: 200,
                    ease: 'Power2'
                });
            });

            cancel.on('pointerout', () => {
                this.tweens.add({
                    targets: cancel,
                    scale: initScale,  // Reset to default
                    duration: 200,
                    ease: 'Power2'
                });
            });

            this.overlay.add([overlayBg, text, cancel]);
            this.overlay.setInteractive();
        }
            
        let gameOverBg = this.add.rectangle(0, 0, 2 * hWidth, 2 * hHeight, 0xce4c4c, 0.5)
            .setOrigin(0.5);
        this.gameOverText = this.add.text(0, 0, 'Game Over!', gConst.uiPopup)
            .setOrigin(0.5)
            .setFontSize('96px');
        let prompt = this.add.text(0, hHeight - UIConfig.borderPadding - 32, 'Press R to Restart', gConst.uiPopup)
            .setOrigin(0.5);
        this.gameOver = this.add.container(hWidth, hHeight)
            .setScale(0);
        this.gameOver.add([gameOverBg, this.gameOverText, prompt]);
    }

    update(delta : number, time : number) {
        if (!this.gameOver) {
            return;
        }

        this.altitude.text    = `Altitude: ${this.PlayScene.getAltitude()}m`;
        this.speedometer.text = `Speed: ${Math.floor(this.PlayScene.getSpeed())}m`;
        this.scoreText.text   = `Score: ${Math.floor(this.PlayScene.getScore())}`;
    }

    setGameOver() : void {
        this.isGameOver = !this.isGameOver;
        this.altitude.text = '';
        this.speedometer.text = '';
        this.scoreText.text = '';
        
        let scoreText = this.add.text(0, this.gameOverText.y + 64, '', gConst.uiPopup)
            .setOrigin(0.5);
        if (gVar.highScore <= this.PlayScene.getScore()) {
            scoreText.text = `New Highscore: ${Math.floor(gVar.highScore)}!`;
        } else {
            scoreText.text = `Final Score: ${Math.floor(this.PlayScene.getScore())}`;
        }

        this.gameOver.add(scoreText);

        SoundMan.play('gameOver');
        this.tweens.add({
            targets: this.gameOver,
            scaleX: this.gameOver.scaleX === 0 ? 1 : 0,
            scaleY: this.gameOver.scaleY === 0 ? 1 : 0,
            duration: 500,
            ease: this.gameOver.scaleX === 1 ? 'Quad.easeIn' : 'Quad.easeOut',
            onComplete: () => {
                if (this.gameOver.scaleX === 0) {
                    this.gameOver.disableInteractive();
                } else {
                    this.gameOver.setInteractive();
                }
            }
        });
    }

    toggleOverlay() : void {
        SoundMan.play('uiBlip');
        this.tweens.add({
            targets: this.overlay,
            scaleX:  this.overlay.scaleX === 0 ? 1 : 0,
            scaleY:  this.overlay.scaleY === 0 ? 1 : 0,
            duration: 500,
            ease:    this.overlay.scaleX === 1 ? 'Quad.easeIn' : 'Quad.easeOut',
            onComplete: () => {
                if (this.overlay.scaleX === 0) {
                    this.overlay.disableInteractive();
                } else {
                    this.overlay.setInteractive();
                }
            }
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
            duration: 200,
            ease:    this.pauseBg.alpha === maxAlpha ? 'Quad.easeIn' : 'Quad.easeOut',
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
