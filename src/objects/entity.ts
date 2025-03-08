import { Math as pMath } from 'phaser';

export interface IEntity {
    radius : number;
    damage() : void;

    getPosition() : pMath.Vector2;
}
