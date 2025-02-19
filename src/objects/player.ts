import { Physics } from 'phaser';
import { Math as pMath } from 'phaser';
import { SoundMan } from '../soundman';

const { asin, PI } = Math;

export class Player extends Physics.Arcade.Sprite {
    // body is reserved by Sprite
    private drag : number = 0.999;
    private terminalVelocity : number = 500;
    private glideSpeed = 30;
    private initX;

    // Duration in seconds for how long the player will ignore mouse input.
    private mouseLockTimer : number = 0;

    constructor(scene : Phaser.Scene, x : number, y : number, texture : string) {
        super(scene, x, y, texture, 0);
        this.initX = x;
        this.setScale(0.125);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCircle(96);
        this.setOffset(128, 128);
        this.setMass(1);
        this.setMaxVelocity(this.terminalVelocity);
        this.setVelocityX(100);
        this.setDrag(0.9);
        this.setGravity(0, 10);
    }

    /** 
    * @time The current time.
    * @delta The delta time in seconds since last frame. This is smoothed and capped based on FPS.
    * @ref https://docs.phaser.io/api-documentation/event/scenes-events#update
    */
    update(time : number, delta : number) : void {
        this.mouseLockTimer -= delta;

        var pos : pMath.Vector2 = new pMath.Vector2(this.scene.input.activePointer.worldX, this.scene.input.activePointer.worldY).subtract(this.body.position);
        pos.normalize();
        // make pos 20% of the difference between velocity and new mouse pos.
        let velNorm = this.body.velocity.clone().normalize();
        pos.lerp(velNorm, 0.8);
        pos.x = Math.abs(pos.x);

        // Clamp rotation [-π/2 ... π/2]
        let pitch : number = pMath.Clamp(asin(pos.y), -PI * 0.5, PI * 0.5);
        this.rotation = pitch;
        //console.log(pitch);

        // Ignore mouse input if mouse is locked.
        if (this.mouseLockTimer < 0) {
            this.glide(delta, pitch, pos);
        }
        // Lock player's horizontal movement (but maintains velocity)
        this.x = this.initX;
    }

    private glide(delta : number, pitch : number, dir : pMath.Vector2) : void {
        let vel : pMath.Vector2 = this.body.velocity;
        // you need to counteract gravity sin(pitch) needs to be added to your y compontent in the vel vector this
        // should be greater than gravity to move you up if pi/2 > pitch > 0 and move you down.
        // looking down all the way would be all of gravity taking you down and based on the angle you
        // slowly add to gravity untileit's positive

        /*
         * NOTE: remember that Phaser inverts Y axis
         * Which means pitch is inverted too!
         */
        let speed     = vel.length();
        let dot       = vel.dot(dir) / speed;
        let horiRatio = vel.x / speed;

        // NOTE: We'd normally negate this, but Phaser makes
        // Y-up positive. So it's already correct.
        let clampedPitch = (2 * pitch)/PI;
        let speedUp = 0 < pitch ? 2 * clampedPitch : clampedPitch * 0.1;
        // I want actual speedup while looking down, and no speedup while looking up,
        // so gravity & drag can take over.

        // TODO: consider adding actual drag based on
        // equation from glide2 (really v5)

        let deltaVel = dir.scale(speed + (speedUp * this.drag));
        deltaVel.subtract(this.body.velocity);
        //console.log(clampedPitch, speedUp, vel, targetVel, deltaVel);
        this.body.velocity.x += deltaVel.x;
        this.body.velocity.y += deltaVel.y + (this.body.gravity.y * delta);

        if (speed <= 50) {
            let gFactor = -Math.pow(horiRatio * 0.25, 2) + (10/(speed - 2));
            console.log(horiRatio, gFactor, this.body.gravity.y);
            this.body.velocity.y += (this.body.gravity.y * gFactor) * delta;
            if (this.body.velocity.y <  10) {
                this.body.velocity.y += 30 * delta;
            }
        }
    }

    // this is more accurate but harder to work with.
    // Unfortunately, I don't have the time to finish this and make it good. But I enjoyed working on it :)
    private glide2(delta : number, pitch : number, dir : pMath.Vector2) : void {
        // relative angle between glyder and dir of motion
        // split into component that's orth to glyder, and parallel (shadow).
        // parallel to glyder orthProjV, we recieve least drag. Orth to glyder, most drag.
        //
        // two drag coefficients, headwind & something akin to lift
        // per star: k is fuck around and find out
        //
        // our coefficient would be 0.09 (streamlined half-body)
        
        let force : pMath.Vector2 = new pMath.Vector2(0,0);
        let k = 0.19;
        force.add(dir.clone().scale(this.glideSpeed));
        // force += dir * C;
        force.y += this.scene.physics.world.gravity.y;
        // force += <0, gravity>
        let orthNormDir : pMath.Vector2  = dir.clone().normalize().rotate(pMath.DegToRad(90));
        // orthDir = dir.orth;
        let velProjONDir : pMath.Vector2 = orthNormDir.clone().project(this.body.velocity);
        // velProjOrthDir = orthDir.normal * (orthDir.normal * this.body.velocity)
        force.add(orthNormDir.clone().scale(-k * velProjONDir.lengthSq()));
        // force += -k * orthDir.normal * |velProjOrthDir| ^ 2;
        // Fd = -(vNorm)k|v|^2, --- k varies based on pitch

        this.body.velocity.x += force.x * delta / 1000;
        this.body.velocity.y += force.y * delta / 1000;
        
        // from here creative liberty
    }

    setMouseLock(seconds : number) {
        this.mouseLockTimer = seconds;
    }

    hitBalloon() : void {
        SoundMan.play('pop');
        this.body.velocity.y += -400;
        this.setMouseLock(0.5);
    }
}
