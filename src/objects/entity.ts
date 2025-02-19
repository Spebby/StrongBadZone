import { GameObjects, Physics } from 'phaser';
import { Math as pMath } from 'phaser';

export class Entity extends Physics.Arcade.Sprite {
    private baseSpeed  : number;
    private onHitEvent : () => void;
    // so there's some more variety, some enemies will have a higher lift.
    liftFactor : number;

    constructor(scene : Phaser.Scene, x : number, y : number, texture : string, baseSpeed : number, onHitEvent : () => void, frame? : number) {
        super(scene, x, y, texture, frame ??= 0);

        this.baseSpeed  = baseSpeed;
        this.onHitEvent = onHitEvent;

        this.setScale(0.125);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCircle(128);
        this.setSize(256, 256);       
        this.setMass(1);
        this.setCollideWorldBounds(false);
        this.setGravity(0, 0);
        
        this.liftFactor = pMath.Between(-5, 15);
    }

    update(delta : number, time : number, newXVelocity : number) : void {
        if (this.x < -this.width) {
            this.destroy();
            // object pooling would be better but deadline is soon :)
            return;
        }

        this.setVelocityX(-(newXVelocity + this.baseSpeed));
        //this.body.velocity.x += (diff + -this.baseSpeed * delta) * delta;
        this.body.velocity.y += -this.liftFactor * delta;
    }

    onCollide(player : Physics.Arcade.Sprite) {
        console.log('hitme');
        this.onHitEvent();
        this.destroy();
    }
}
