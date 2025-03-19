import { Preload } from './scenes/Preload';
import { MenuScene } from './scenes/Menu';
import { PlayScene } from './scenes/Play';
import { UIScene }   from './scenes/UI';
import { TutorialScene } from './scenes/Tutorial';

export const GameConfig : Phaser.Types.Core.GameConfig = {
    title: 'StrongBadZone',
    url: 'https://github.com/Spebby/StrongBadZone',
    version: '0.0.1',
    backgroundColor: 0x000000,
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        parent: 'game',
        width:  1440,
        height: 1080
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: true
        }
    },
    scene: [Preload, MenuScene, TutorialScene, PlayScene, UIScene],
    input: {
        keyboard: true
    },
    render: { pixelArt: true }
};

export const UIConfig : { borderUISize: number, borderPadding: number, hWidth : number, hHeight : number } = {
    borderUISize:   (parseInt(GameConfig.scale.height as string) || window.innerHeight) / 15,
    borderPadding: ((parseInt(GameConfig.scale.height as string) || window.innerHeight) / 15) / 3,
    hWidth: parseInt(GameConfig.scale.width as string) / 2,
    hHeight: parseInt(GameConfig.scale.height as string) / 2
};
