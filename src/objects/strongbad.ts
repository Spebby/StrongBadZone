import { GameObjects, Physics } from 'phaser';
import { Math as pMath } from 'phaser';
import { Player } from './player';
import { PlayScene } from '../scenes/Play';

var hWidth : number;
export class Strongbad extends GameObjects.GameObject {
    private baseSpeed  : number;
    private travelDist : number;
    private fireDelay : number;
    private fireTimer : number;
    private onHitEvent : () => void;

    private position : pMath.Vector2;
    private velocity : pMath.Vector2;
    private projectiles : Projectile[];


    mesh : GameObjects.Mesh;

    debugGraphics : GameObjects.Graphics;

    private playerRef : Player;

    constructor(scene : Phaser.Scene, x : number, y : number, mesh : GameObjects.Mesh, baseSpeed : number, travelDist : number, fireDelay : number, onHitEvent : () => void) {
        hWidth = x;
        super(scene, 'strongbadGameObject');
        this.mesh = mesh;
        this.position = new pMath.Vector2(x, y);
        this.velocity = new pMath.Vector2(0, 0);

        this.baseSpeed  = baseSpeed;
        this.travelDist = travelDist;
        this.fireDelay  = fireDelay;
        this.fireTimer  = fireDelay * 1.5;
        this.onHitEvent = onHitEvent;

        scene.add.existing(this);

        this.playerRef = (scene as PlayScene).player;
        this.debugGraphics = (scene as PlayScene).edgeRender;
        this.velocity.x = this.baseSpeed;


    }

    update(time : number, delta : number) : void {
        //console.log(this);
        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;
        this.mesh.x = this.position.x;
        this.mesh.y = this.position.y;
        this.debugGraphics.strokeCircle(this.position.x, this.position.y, hWidth/4);
        if (this.position.x < (hWidth - this.travelDist) || (this.travelDist + hWidth) < this.position.x) {
            this.position.x += this.position.x < hWidth ? delta * 2 : -delta * 2;
            this.velocity.x *= -1;
        }

        this.fireTimer -= delta;
        this.firePerplexingAttack();
    }

    firePerplexingAttack() {
        if (0 < this.fireTimer) {
            return;
        }

        this.fireTimer = this.fireDelay;
        this.projectiles.push(new Projectile(this.scene, this.position.x, this.position.y, this.mesh.z, this.playerRef.getPosition()));
    }
}

export class Projectile extends GameObjects.GameObject {
    mesh : GameObjects.Mesh;
    private position : pMath.Vector2;
    private velocity : pMath.Vector2;
    private target : pMath.Vector2;
    private wall : number;

    constructor(scene : Phaser.Scene, x : number, y : number, z : number, target : pMath.Vector2 ) {
        super(scene, 'strongbadProjectile');

        this.position = new pMath.Vector2(x, y);
        this.velocity = new pMath.Vector2(0, 0);
        this.target = target;
        this.wall = z + 1;

        this.mesh = this.scene.add.plane(x, y, 'blank');
        this.mesh.z = z;
        this.mesh.setDebug((this.scene as PlayScene).edgeRender);
        // perspective not otrho
        
        this.scene.add.existing(this);
    }

    update(time : number, delta : number) {
        this.position.lerp(this.target, delta);
        this.mesh.z -= delta;

        if (0 <= this.mesh.z) {
            // do a collision check
            // if player is gaurding, reverse direction
            //
            // if hit strongbad, idk yet!
        }
    }
}
