import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#3a3a3a', // Cinza inicial (poluição)
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);