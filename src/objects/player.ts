import { GameObjects } from 'phaser';
import { Math as pMath } from 'phaser';
import { IEntity } from './entity';
import { SoundMan } from '../soundman';
import { KeyMap } from '../keymap';
import { PlayScene } from '../scenes/Play'
import { UIConfig } from '../config';
import { gConst } from '../global';

export function mapRange(x : number, a : number, b : number, offset : number) : number {
    const start = a + offset;
    const end = b - offset;
    return start + ((x - a) * (end - start) / (b - a));
}

const shieldOffsets : Record<string, pMath.Vector2> = {
    'D': new pMath.Vector2(0, 128),
    'L': new pMath.Vector2(-128 * 10, -128),
    'C': new pMath.Vector2(0, -128), 
    'R': new pMath.Vector2(128 * 10, -128)
};
// why on god's green earth do these do NOTHING?

let debug = false;

export class Player extends GameObjects.GameObject implements IEntity {
    private baseSpeed  : number;
    private blockTime  : number;
    private blockDelay : number;

    private shieldTime  : number;
    private shieldDelay : number;

    private position : pMath.Vector2;
    private velocity : pMath.Vector2;
    private reflectDir : pMath.Vector2;

    private currShieldOffset : pMath.Vector2;

    radius : number = UIConfig.hWidth / 5;
    health : number = 1;
    mesh : GameObjects.Mesh;
    shield : GameObjects.Mesh;
    debugGraphics : GameObjects.Graphics;

    constructor(scene : PlayScene, x : number, y : number, mesh : GameObjects.Mesh, shieldmesh : GameObjects.Mesh, baseSpeed : number, blockDuration : number, blockDelay : number) {
        super(scene, 'playerGameObject');
        debug = false;

        this.baseSpeed = baseSpeed;
        this.blockTime = blockDuration;
        this.blockDelay = blockDelay;
        this.mesh   = mesh;
        this.shield = shieldmesh;

        this.position = new pMath.Vector2(x, y);
        this.velocity = new pMath.Vector2(0, 0);
        this.reflectDir = new pMath.Vector2(0,0);

        this.debugGraphics = (scene as PlayScene).edgeRender;

        KeyMap.keyLEFT.onDown = () => {
            this.velocity.x = -this.baseSpeed;
            (scene as PlayScene).startGame();
        }
        KeyMap.keyRIGHT.onDown = () => {
            this.velocity.x = this.baseSpeed;
            (scene as PlayScene).startGame();
        }

        Object.entries(KeyMap.keyShield).forEach(([side, key]) => {
            key.on('down', () => {
                this.block(side);
            });
        });
        
        this.currShieldOffset = shieldOffsets['D'];
        this.mesh.x = x;
        this.mesh.y = y;
        this.shield.x = x + this.currShieldOffset.x;
        this.shield.y = y + this.currShieldOffset.y;
        scene.add.existing(this);
    }

    /** 
    * @time The current time.
    * @delta The delta time in seconds since last frame. This is smoothed and capped based on FPS.
    * @ref https://docs.phaser.io/api-documentation/event/scenes-events#update
    */
    update(time : number, delta : number) : void {
        debug = (this.scene as PlayScene).isDebugOn();
        if ( 0 < this.shieldTime ) {
            if (!KeyMap.isShielding()) {
                this.unblock();
                return;
            }

            // decrement & unshield if shielded full time
            this.shieldTime -= delta;
            if (this.shieldTime < 0) {
                this.unblock();
            }

            return;
        } 

        this.shieldDelay -= delta;
        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;

        const lEdge = this.radius;
        const rEdge = (UIConfig.hWidth * 2) - this.radius;
        this.position.x = pMath.Clamp(this.position.x, lEdge, rEdge);

        this.mesh.x = this.position.x;
        this.mesh.y = this.position.y;
        this.shield.x = this.position.x + this.currShieldOffset.x;
        this.shield.y = this.position.y + this.currShieldOffset.y;

        // boing
        if (this.position.x == lEdge || this.position.x == rEdge) {
            this.velocity.x *= -1;
        }

        if (debug) {
            this.debugGraphics.strokePoints([
                {x: this.position.x, y: this.position.y}, 
                {x: this.position.x + this.reflectDir.x * 150, y: this.position.y - this.reflectDir.y * -150}
            ], false);
            this.debugGraphics.strokeCircle(this.position.x, this.position.y, this.radius);
        }
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
                this.currShieldOffset = shieldOffsets['L'];
                break;
            case 'C':
                this.currShieldOffset = shieldOffsets['C'];
                reflect.x = 0;
                break;
            case 'R':
                reflect.x = -reflect.y;
                this.currShieldOffset = shieldOffsets['R'];
                break;
        }

        reflect.x = mapRange((reflect.x + this.position.x), 0, UIConfig.hWidth * 2, UIConfig.hWidth / 2) - this.position.x;
        reflect.normalize();
        this.reflectDir = reflect;
        this.shieldTime = this.blockTime;
    }

    unblock() : void {
        this.shieldDelay = (0.9 * ((this.blockTime - this.shieldTime) / this.blockTime) + 0.1) * this.blockDelay;
        this.shieldTime = 0;
        // applys a proportional shield delay based on shield used; has min b/c without, spam would be meta
        this.reflectDir.set(0, 0);
        this.currShieldOffset = shieldOffsets['D'];
    }

    /**
    * @abstract Kills the player.
    */
    damage() : void {
        (this.scene as PlayScene).endGame(false);
        
        SoundMan.play('explosion');
        let emitter = this.scene.add.particles(this.position.x, this.position.y, '__WHITE', {
            scaleX: 1,
            scaleY: 20,
            speed: { min: 10, max: 30 },

            lifespan: gConst.deathTime,
            color:  [gConst.red],
            alpha:  {start: 1, end:0 },
            angle:  { min: 45, max: 45},
            rotate: {min: -90, max: 90},

            gravityY: 0,
        });
        emitter.explode(50 * Math.max(0.25, Math.random()));

        this.mesh.destroy();
        this.shield.destroy();
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
