import { Game as MainGame } from './scenes/Game';
import { AUTO, Scale,Game } from 'phaser';

const config = {
    type: AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#66464',
    scale: {
        mode: Scale.WIDTH_CONTROLS_HEIGHT,
        autoCenter: Scale.WIDTH_CONTROLS_HEIGHT
    },
    scene: [
        MainGame
    ]
};

export default new Game(config);