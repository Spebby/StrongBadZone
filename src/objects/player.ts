import { GameObjects, Physics } from 'phaser';
import { Math as pMath } from 'phaser';
import { SoundMan } from '../soundman';
import { KeyMap } from '../keymap';
import { PlayScene } from '../scenes/Play'

const { asin, PI } = Math;

var hWidth : number;
export class Player extends GameObjects.GameObject {
    private baseSpeed : number;
    private drag : number = 0.95;
    private blockTime  : number;
    private blockDelay : number;

    private shieldTime  : number;
    private shieldDelay : number;

    private position : pMath.Vector2;
    private velocity : pMath.Vector2;
    private acceleration : pMath.Vector2;

    mesh : GameObjects.Mesh;
    debugGraphics : GameObjects.Graphics;

    constructor(scene : Phaser.Scene, x : number, y : number, mesh : GameObjects.Mesh, baseSpeed : number, blockDuration : number, blockDelay : number) {
        super(scene, 'playerGameObject');

        this.baseSpeed = baseSpeed;
        this.blockTime = blockDuration;
        this.blockDelay = blockDelay;
        this.mesh = mesh;

        this.position = new pMath.Vector2(x, y);
        this.velocity = new pMath.Vector2(0, 0);
        this.acceleration = new pMath.Vector2(0, 0);

        this.debugGraphics = (scene as PlayScene).edgeRender;

        KeyMap.keyLEFT.onDown = () => {
            this.acceleration.x = -baseSpeed;
        }
        KeyMap.keyRIGHT.onDown = () => {
            this.acceleration.x = baseSpeed;
        }

        Object.entries(KeyMap.keyShield).forEach(([side, key]) => {
            key.on('down', () => {
                this.block(side);
            });
        });
        

        scene.add.existing(this);
    }

    /** 
    * @time The current time.
    * @delta The delta time in seconds since last frame. This is smoothed and capped based on FPS.
    * @ref https://docs.phaser.io/api-documentation/event/scenes-events#update
    */
    update(time : number, delta : number) : void {
        if ( 0 < this.shieldTime ) {
            this.acceleration.x = 0; this.acceleration.y = 0;
            this.velocity.x = 0; this.velocity.y = 0;
            if (!KeyMap.isShielding()) {
                this.unblock();
                return;
            }

            // decrement & unshield if shielded full time
            this.shieldTime -= delta;
            if (this.shieldTime < 0) {
                this.unblock();
            }
        }

        this.shieldDelay -= delta;
        this.acceleration.scale(this.drag);
        this.velocity.x += this.acceleration.x * delta;
        this.velocity.y += this.acceleration.y * delta;
        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;
        this.mesh.x = this.position.x;
        this.mesh.y = this.position.y;
    }

    block(side : string) {
        if (0 < this.shieldTime) {
            return;
        }

        switch (side) {
            case 'L':

                break;
            case 'C':

                break;
            case 'R':

                break;
        }

        this.shieldTime = this.blockTime;
    }

    unblock() {
        this.shieldTime = 0;
        this.shieldDelay = this.blockDelay;
    }

    getPosition() {
        return this.position.clone();
    }
}
