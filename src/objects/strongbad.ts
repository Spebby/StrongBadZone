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
    private projectile : strongbadProjectile;


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
        this.debugGraphics.clear();
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
        this.projectile = new strongbadProjectile(this.position.x, this.position.y, this.playerRef.getPosition());
    }
}
