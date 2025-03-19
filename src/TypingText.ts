import {SoundMan} from './soundman';

export class TypingText extends Phaser.GameObjects.Text {
    private typingTimer : Phaser.Time.TimerEvent;
    private onCompleteTimer : Phaser.Time.TimerEvent;
    private typing : boolean;

    playTypeSound : boolean;

    constructor(scene : Phaser.Scene, x : number, y : number, text : string = '', style? : Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y, text, style);

        this.playTypeSound = true;
        scene.add.existing(this);
    }

    startTyping(str : string, onEnd : () => void, typeDelay : number = 2, offset? : number, typeSFX? : string) : void {
        typeSFX ??= "typing";

        this.typing = true;
        this.text = '';
        let curChar = 0;
        offset = offset ?? Math.max(1, Math.round(str.length * 0.001));

        this.typingTimer = this.scene.time.addEvent({
            delay: typeDelay,
            repeat: (str.length - 1) / Math.max(1, offset),
            callback: () => {
                var sub = str.substring(curChar, curChar + offset);
                this.text += sub;
                curChar += offset;
                if (this.playTypeSound) {
                    SoundMan.play(typeSFX);
                }
            },
            callbackScope: this
        });

        // OnComplete
        this.onCompleteTimer = this.scene.time.addEvent({
            delay: (typeDelay * str.length) / Math.max(1, offset),
            callback: () => {
                this.typingTimer.destroy();
                this.text = str;
                onEnd();
                this.typing = false;
            },
            callbackScope: this
        });
    }

    cancel() : void {
        if (!this.typing) {
            return;
        }
        
        this.typingTimer.paused = true;
        var wasPlayingSound = this.playTypeSound;
        this.playTypeSound = false;
        this.onCompleteTimer.remove(true);
        this.playTypeSound = wasPlayingSound;
    }

    isTyping() : boolean {
        return this.typing;
    }
}
