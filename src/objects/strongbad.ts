import { GameObjects } from 'phaser';
import { Math as pMath } from 'phaser';
import { IEntity } from './entity';
import { Player } from './player';
import { PlayScene } from '../scenes/Play';
import { UIConfig } from '../config';
import { SoundMan } from '../soundman';
import { gConst } from '../global';

import { KeyMap } from '../keymap';

let debug = false;
let hWidth : number;
export class Strongbad extends GameObjects.GameObject implements IEntity {
    private baseSpeed   : number;
    private travelDist  : number;
    private bulletSpeed : number;
    private fireDelay   : number;
    private fireTimer   : number;

    private position : pMath.Vector2;
    private velocity : pMath.Vector2;
    private paused : boolean = false;

    radius : number;
    health : number = 7;

    mesh : GameObjects.Mesh;
    debugGraphics : GameObjects.Graphics;
    private playerRef : Player;

    constructor(scene : Phaser.Scene, x : number, y : number, mesh : GameObjects.Mesh, baseSpeed : number, travelDist : number, fireDelay : number, bulletSpeed : number) {
        super(scene, 'strongbadGameObject');
        this.mesh = mesh;
        this.mesh.x = x;
        this.mesh.y = y;
        this.position = new pMath.Vector2(x, y);
        this.velocity = new pMath.Vector2(0, 0);

        debug  = false;
        hWidth = x;

        this.baseSpeed   = baseSpeed;
        this.travelDist  = travelDist;
        this.bulletSpeed = bulletSpeed;
        this.fireDelay   = fireDelay * 1.33;
        this.fireTimer   = fireDelay * 0.25;

        Projectile.strongbad = this;

        scene.add.existing(this);

        this.playerRef = (scene as PlayScene).player;
        this.debugGraphics = (scene as PlayScene).edgeRender;
        this.velocity.x = this.baseSpeed;
        this.radius = UIConfig.hWidth / 5;

        KeyMap.keySELECT.onDown = () => {
            if (!debug) {
                return;
            }
            this.damage();
        }
    }

    update(time : number, delta : number) : void {
        debug = (this.scene as PlayScene).isDebugOn();
        Projectile.updateAll(time, delta);

        if (this.paused) return;

        this.fireTimer -= delta;
        this.firePerplexingAttack();
        //console.log(this);
        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;
        this.mesh.x = this.position.x;
        this.mesh.y = this.position.y;
        
        if (debug) {
            this.debugGraphics.strokeCircle(this.position.x, this.position.y, this.radius);
        }
        if (this.position.x < (UIConfig.hWidth - this.travelDist) || (this.travelDist + UIConfig.hWidth) < this.position.x) {
            this.velocity.x *= -1;
            this.position.x += this.baseSpeed * (this.position.x < UIConfig.hWidth ? delta : -delta);
        } 
    }

    firePerplexingAttack() : void {
        if (0 < this.fireTimer) {
            return;
        }

        this.fireTimer = this.fireDelay;
        new Projectile(this.scene, this.position.x, this.position.y + targetVertOffset, this.mesh.z, this.playerRef.getPosition(), this.bulletSpeed);
        SoundMan.play('shoot');
    }

    // TODO: implement
    /*
    * I think it makes most sense for strongbad to speedup and fire faster when damaged. He can also do a little
    * spin animation, but that's for later. If you can hit hit 5 times he explodes and you win.
    */
    damage() : void {
        if (this.health == 0) {
            this.kill();
            return;
        }

        this.paused = true;
        var s = this.mesh.x;
        let proxy = { x: s, z : this.mesh.modelRotation.z };
        this.scene.tweens.chain({
            targets: proxy,
            ease: 'Quad.easeInOut',
            loop: 0,
            paused: false,
            persist: false,
            tweens: [
                {
                    x: s - 32,
                    z: Phaser.Math.DegToRad(pMath.Between(45, 55)),
                    duration: 175,
                    onUpdate: () => {
                        this.mesh.x = proxy.x;
                        this.mesh.modelRotation.z = proxy.z;
                    }
                },
                {
                    x: s + 32,
                    z: Phaser.Math.DegToRad(-pMath.Between(45, 55)),
                    duration: 500,
                    onUpdate: () => {
                        this.mesh.x = proxy.x;
                        this.mesh.modelRotation.z = proxy.z;
                    }
                },
                {
                    x: s,
                    z: Phaser.Math.DegToRad(0),
                    duration: 175,
                    onUpdate: () => {
                        this.mesh.x = proxy.x
                        this.mesh.modelRotation.z = proxy.z;
                    }
                }
            ],
            onComplete: () => {
                this.paused = false;
            }
        });
        SoundMan.play('strongHurt');
        this.baseSpeed *= 1.18;
        this.bulletSpeed *= 1.15;
        this.velocity.x *= 1.11;
        this.fireDelay *= 0.75;
        this.fireTimer = 0.5;
        this.health--;
        return;
    }

    /**
    * Explode or something. Needs to communicate with scene manager.
    * Use particle effects here, nothing fancy.
    */
    kill() : void {
        Projectile.projectiles.forEach((p) => p.destroy());

        (this.scene as PlayScene).endGame(true);
        
        SoundMan.play('explosion');
        let emitter = this.scene.add.particles(this.position.x, this.position.y, '__WHITE', {
            scaleX: 1,
            scaleY: 20,
            speed: { min: 10, max: 30 },

            lifespan: gConst.deathTime,
            color:  [gConst.red],
            alpha:  {start: 1, end:0 },
            angle:  { min: 45, max: 45},
            rotate: {min: -180, max: 180},

            gravityY: 0,
        });
        emitter.explode(100 * Math.max(0.25, Math.random()));

        this.mesh.destroy();
    }

    getPosition() : pMath.Vector2 {
        return this.position.clone();
    }

    playTaunt() : Phaser.Time.TimerEvent {
        this.paused = true;
        Projectile.projectiles.forEach((p) => p.destroy());

        let dist = Math.abs(this.position.x - hWidth);
        let t = Math.abs((dist / this.velocity.x) * 1000) * 0.5;
        this.scene.tweens.add({
            delay: gConst.deathTime,
            targets: this.mesh,
            ease: 'linear',
            duration: t,
            
            x: hWidth,
            
            onComplete: () => {
                SoundMan.play('strongTaunt');
            }
        });

        return this.scene.time.addEvent({
            delay: 3500 + t + gConst.deathTime
        });
    }
}


/*
 * =============================================
 */


function calculateSize(t : number, low : number, high : number, start : number, end : number) : number {
    return (t * ((high - low) / (start - end))) + low;
}

var targetVertOffset = 100;
export class Projectile extends GameObjects.Container {
    // these should be private but IDGAF!!!
    static projectiles : Projectile[] = [];
    static strongbad : Strongbad;
    mesh : GameObjects.Mesh;
    //private position : pMath.Vector2;
    private initY  : number;
    private wall   : number;
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
        this.target.y -= targetVertOffset;
        this.initY = y;
        this.wall  = y - targetVertOffset;
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
            if (!debug || !pointer.isDown) return;
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

    impact() : void {
        this.destroy();
        //SoundMan.play('impact');
    }

    update(time : number, delta : number) {
        this.mesh.renderDebug(this.mesh, this.mesh.faces);
        this.x += this.velocity.x * this.speed * delta;
        this.y += this.velocity.y * this.speed * delta;
        this.mesh.modelRotation.x += delta * 12;
        this.z += delta;
        this.mesh.z += delta / 2;
        this.mesh.panZ(-delta / 2);
        this.mesh.scale = calculateSize(this.y, 8, 35, this.initY, this.target.y);

        // todo: rewrite this to scale to max once y = target y.

        // eventually rewrite this such that
        // we account for hitting strongbad
        if (this.y >= this.target.y) {
            // collision check
            const player = (this.scene as PlayScene).player;
            if (!this.isHitting(player)) {
                if ((UIConfig.hHeight * 2) + 100 < this.y) {
                    this.destroy();
                }
                return;
            }

            const blocking : boolean = player.isBlocking();
            if (!blocking) {
                this.destroy();
                player.damage();
                return;
            }
            // maybe force player to unblock?

            var r : pMath.Vector2 = player.getReflectDir();

            // todo: revise this b/c it doesn't always behave as expected
            // new V = <sign(r.x) V/|V| * r, r.y>
            this.velocity = new pMath.Vector2(Math.sign(r.x) * (this.velocity.scale(1 / this.velocity.length()).dot(r)), r.y).normalize();
            SoundMan.play('block');
            return;
        } else if (this.y <= this.wall) { // bc phaser is stupid
            // hit strongbad
            if (this.isHitting(Projectile.strongbad)) {
                Projectile.strongbad.damage();
                this.destroy();
                return;
            }

            this.impact();
            return;
        }

        const a = 440;
        const b = 750
        const wall = ((b - a)/(380)) * this.x;
        if ((this.x < 380 && this.y < -wall + b) || (1065 < this.x && this.y < wall - a)) {
            var offset = this.speed * 0.05;
            this.velocity.x *= -1;
            var side = Math.sign(this.velocity.x);
            this.y += offset;
            this.x += offset * side;
            SoundMan.play('ricochet');
        }

    }

    private isHitting(entity : IEntity) : boolean {
        var pPos = entity.getPosition();
        var pos  = new pMath.Vector2(this.x, this.y);
        var sdf  = pPos.distance(pos) - entity.radius;
        return sdf < this.radius;
    }

    static updateAll(time : number, delta : number) {
        Projectile.projectiles.forEach((p) => p.update(time, delta));
        //Projectile.projectiles = Projectile.projectiles.filter(p => !p.scene);
    }
}
