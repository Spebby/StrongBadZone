import { GameObjects, Physics } from 'phaser';
import { Math as pMath } from 'phaser';
import { Player } from './player';
import { PlayScene } from '../scenes/Play';

var hWidth : number;
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
