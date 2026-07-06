import { MainMenuScene } from './scenes/MainMenuScene.js';
import { InstructionsScene } from './scenes/InstructionsScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#111111',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [MainMenuScene, InstructionsScene, GameScene]
};

const game = new Phaser.Game(config);