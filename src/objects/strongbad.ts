import { GameObjects, Physics } from 'phaser';
import { Math as pMath } from 'phaser';
import { Player } from './player';
import { PlayScene } from '../scenes/Play';
import { UIConfig } from '../config';

export class Strongbad extends GameObjects.GameObject {
    private baseSpeed  : number;
    private travelDist : number;
    private fireDelay : number;
    private fireTimer : number;
    private onHitEvent : () => void;

    private position : pMath.Vector2;
    private velocity : pMath.Vector2;

    mesh : GameObjects.Mesh;
    debugGraphics : GameObjects.Graphics;
    private playerRef : Player;

    constructor(scene : Phaser.Scene, x : number, y : number, mesh : GameObjects.Mesh, baseSpeed : number, travelDist : number, fireDelay : number, onHitEvent : () => void) {
        super(scene, 'strongbadGameObject');
        this.mesh = mesh;
        this.position = new pMath.Vector2(x, y);
        this.velocity = new pMath.Vector2(0, 0);

        this.baseSpeed  = baseSpeed;
        this.travelDist = travelDist;
        this.fireDelay  = fireDelay * 1.33;
        this.fireTimer  = fireDelay * 0.1;
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
        this.debugGraphics.strokeCircle(this.position.x, this.position.y, UIConfig.hWidth / 5);
        if (this.position.x < (UIConfig.hWidth - this.travelDist) || (this.travelDist + UIConfig.hWidth) < this.position.x) {
            this.position.x += this.position.x < UIConfig.hWidth ? delta * 2 : -delta * 2;
            this.velocity.x *= -1;
        }

        this.fireTimer -= delta;
        this.firePerplexingAttack();
        Projectile.updateAll(time, delta);
    }

    firePerplexingAttack() : void {
        if (0 < this.fireTimer) {
            return;
        }

        this.fireTimer = this.fireDelay;
        const proj = new Projectile(this.scene, this.position.x, this.position.y + targetVertOffset, this.mesh.z, this.playerRef.getPosition(), 200);
    }
}

var targetVertOffset = 100;
export class Projectile extends GameObjects.Container {
    private static projectiles : Projectile[] = [];
    mesh : GameObjects.Mesh;
    //private position : pMath.Vector2;
    private target : pMath.Vector2;
    private velocity : pMath.Vector2;
    private speed : number;
    private get radius() : number {
        return this.mesh.scale / 2;
    }

    constructor(scene : Phaser.Scene, x : number, y : number, z : number, target : pMath.Vector2, speed : number) {
        super(scene, x, y);
        this.z = z;

        this.target = target.clone();
        this.target.y -= 100;
        this.velocity = target.subtract(new pMath.Vector2(x, y)).normalize();
        this.speed = speed;

        this.mesh = new GameObjects.Plane(scene, 0, 0, 'blank', '', 1, 1);
        this.mesh.z = this.z;
        this.mesh.setScale(10);
        this.mesh.debugGraphic = (scene as PlayScene).edgeRender;
        //this.scene.add.plane(x, y, 'goblin','', 1, 1);
        //this.mesh.setDebug((this.scene as PlayScene).edgeRender);
        //this.mesh.setPerspective(1, 1);
        
        this.add(this.mesh);
        this.scene.add.existing(this);

        this.scene.input.on('pointermove', (pointer : Phaser.Input.Pointer) => {
            if (!pointer.isDown) return;
            this.mesh.modelRotation.y += pointer.velocity.x / 800;
            this.mesh.modelRotation.x += pointer.velocity.y / 800;
        });
        Projectile.projectiles.push(this);
    }

    destroy() : void {
        this.mesh.destroy();
        const index = Projectile.projectiles.indexOf(this);
        if (index !== -1) {
            Projectile.projectiles.splice(index, 1);
        }
        super.destroy();
    }

    offscreen() : void {
        this.destroy();
    }

    update(time : number, delta : number) {
        this.mesh.renderDebug(this.mesh, this.mesh.faces);
        this.x += this.velocity.x * this.speed * delta;
        this.y += this.velocity.y * this.speed * delta;
        this.mesh.modelRotation.x += delta * 12;
        this.z += delta;
        this.mesh.z += delta / 2;
        this.mesh.panZ(-delta / 2);
        this.mesh.scale += delta * this.speed / 20;

        // todo: rewrite this to scale to max once y = target y.

        // eventually rewrite this such that
        // we account for hitting strongbad
        if (this.y >= this.target.y) {
            // collision check
            const player = (this.scene as PlayScene).player;
            if (!this.isHitting(player)) {
                if ((UIConfig.hHeight * 2) + 100 < this.y) {
                    this.offscreen();
                }
                return;
            }

            const blocking : boolean = player.isBlocking();
            if (!blocking) {
                //player.kill();
                this.destroy();
                return;
            }
            // maybe force player to unblock?

            var r : pMath.Vector2 = player.getReflectDir();
            this.target.set(0, 0);

            // new V = <sign(r.x) V/|V| * r, r.y>
            this.velocity = new pMath.Vector2(Math.sign(r.x) * (this.velocity.scale(1 / this.velocity.length()).dot(r)), r.y).normalize();
        }
    }

    private isHitting(obj : Player) : boolean {
        /*
        if (obj !== Player || obj !== Strongbad) {
            console.error(`${obj} is not an acceptable collision target!`);
        }
        */
        var pPos = obj.getPosition();
        var pos = new pMath.Vector2(this.x, this.y);
        var sdf = pPos.distance(pos) - obj.radius;
        return sdf < this.radius;
    }

    static updateAll(time : number, delta : number) {
        Projectile.projectiles.forEach((p) => p.update(time, delta));
        //Projectile.projectiles = Projectile.projectiles.filter(p => !p.scene);
    }
}
