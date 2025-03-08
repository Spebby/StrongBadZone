import { GameObjects } from 'phaser';
import { Math as pMath } from 'phaser';
import { IEntity } from './entity';
import { SoundMan } from '../soundman';
import { KeyMap } from '../keymap';
import { PlayScene } from '../scenes/Play'
import { UIConfig } from '../config';

const { asin, PI } = Math;

export function mapRange(x : number, a : number, b : number, offset : number) : number {
    const start = a + offset;
    const end = b - offset;
    return start + ((x - a) * (end - start) / (b - a));
}

export class Player extends GameObjects.GameObject implements IEntity {
    private baseSpeed : number;
    private drag : number = 0.75;
    private blockTime  : number;
    private blockDelay : number;

    private shieldTime  : number;
    private shieldDelay : number;

    private position : pMath.Vector2;
    private velocity : pMath.Vector2;
    private reflectDir : pMath.Vector2;

    radius : number = UIConfig.hWidth / 5;
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
        this.reflectDir = new pMath.Vector2(0,0);

        this.debugGraphics = (scene as PlayScene).edgeRender;

        KeyMap.keyLEFT.onDown = () => {
            this.velocity.x = -this.baseSpeed;
        }
        KeyMap.keyRIGHT.onDown = () => {
            this.velocity.x = this.baseSpeed;
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
            this.velocity.set(0, 0);
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
        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;
        //this.velocity.scale(this.drag);

        this.position.x = pMath.Clamp(this.position.x, this.radius, (UIConfig.hWidth * 2) - this.radius);

        this.mesh.x = this.position.x;
        this.mesh.y = this.position.y;

        this.debugGraphics.strokeCircle(this.position.x, this.position.y, this.radius);
        this.debugGraphics.strokePoints([
            {x: this.position.x, y: this.position.y}, 
            {x: this.position.x + this.reflectDir.x * 150, y: this.position.y - this.reflectDir.y * -150}], false);
    }

    // TODO: revise the clamping logic for the sideways angles
    // so that they are less affected by the clamp when closer
    // to their respective edge (the behaviour of pointing to the corner)
    // is unhelpful and can't be easily telegraphed in the final verison.
    block(side : string) : void {
        if (0 < this.shieldTime || 0 < this.shieldDelay) {
            return;
        }

        var reflect = new pMath.Vector2(0, -UIConfig.hHeight);
        switch (side) {
            case 'L':
                reflect.x = reflect.y;
                break;
            case 'C':
                reflect.x = 0;
                break;
            case 'R':
                reflect.x = -reflect.y;
                break;
        }

        reflect.x = mapRange((reflect.x + this.position.x), 0, UIConfig.hWidth * 2, UIConfig.hWidth / 2) - this.position.x;
        reflect.normalize();
        this.reflectDir = reflect;
        this.shieldTime = this.blockTime;
    }

    unblock() : void {
        this.shieldTime = 0;
        this.shieldDelay = this.blockDelay;
        this.reflectDir.set(0, 0);
    }

    /**
    * @abstract Kills the player.
    */
    damage() : void {
        return;
    }

    getPosition() : pMath.Vector2 {
        return this.position.clone();
    }

    isBlocking() : boolean {
        return (0 < this.shieldTime);
    }

    getReflectDir() : pMath.Vector2 {
        return this.reflectDir.clone();
    }
}
