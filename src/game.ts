/**
 * @author Thom Mott
 * @title StrongBadZone
 *
 * This was quite a lot of work! I picked SBZ specifically because it was probably one of
 * the most fleshed out Homestar Runner games in terms of described gameplay in the cartoon.
 * From the get-go I knew that there would be some technical complexity w/ the reflections and
 * the orthographic view. I also enjoyed the game style, and wanted to try to "historically"
 * replicate it.
 *
 * NOTE: Games for the Virtual Boy/SNES did use full 3D models, but due to hardware constraints
 * most games could not render full solids, and had to settle for edges only.
 *
 * Anyhow, Phaser actually supports meshes, though it's intended for use in complicated sprites
 * or effects, my use was definitely not intended. You can check the blender file if you'd like,
 * and find out that I'm using the WireFrame modifier to emulate the visual style of the cartoon
 * while still having it be meshes. This would have been way more simple if I had simply read the
 * mesh data and drawn points based on edge data, or better yet, just drawn them. But I thought
 * it would be funny, and it really is.
 *
 * I've included all my debug stuff in the final build. If you want to enable it, press "F2".
 * You can spin the "camera" around (really just the mesh's rotation matrixes) by dragging with
 * the mouse in this mode. I originally used this while figuring out mesh orientation, but left
 * it in because it's fun to play with.
 *
 * Additionally, if StrongBad proves too tough for you, pressing the "Enter" key while in debug
 * mode will damage him. Speaking of damaging, the particle effects. I wanted to try to experiment
 * with this system, but wasn't able to get the results I wanted in time (I only had ~10 minutes)
 * so I left it aside for "later". I don't think it would be that hard to get it to look better,
 * but more pressing things were calling. You can also press 'Space' during most text sequences
 * to skip the animation.
 *
 * I wanted to implement StrongBad's flying text when he speaks, but again, time limitation and it
 * ultimately was not as important as the other bits of the project.
 *
 * The menu sequence is a left over of my original vision of having the game be set in an interactive
 * terminal. I abandoned this premise pretty quick because I was having enough problems with getting
 * the text to type nicely (turns out timers are way simpler than a jank update loop). If I had a few
 * more days, I'd probably make you turn "on" the PC, and it would boot into the menu from there.
 */


import 'phaser';
import { GameConfig } from './config';

export class Game extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
}

window.addEventListener('load', () => {
    const game = new Game(GameConfig);
});
