import { MenuScene } from './scenes/Menu';
import { PlayScene } from './scenes/Play';
import { UIScene }   from './scenes/UI';

export const GameConfig : Phaser.Types.Core.GameConfig = {
    title: 'Fly-By',
    url: 'https://github.com/Spebby/Endless-Runner',
    version: '0.0.1',
    backgroundColor: 0x3a404d,
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        parent: 'game',
        width:  1000,
        height: 700
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 10 },
            debug: true
        }
    },
    scene: [MenuScene, PlayScene, UIScene],
    input: {
        keyboard: true
    },
    render: { pixelArt: true }
};

export const UIConfig : { borderUISize: number, borderPadding: number } = {
    borderUISize:   (parseInt(GameConfig.scale.height as string) || window.innerHeight) / 15,
    borderPadding: ((parseInt(GameConfig.scale.height as string) || window.innerHeight) / 15) / 3
};
