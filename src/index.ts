import Phaser from 'phaser';
import { GameConfig } from './config';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';

window.addEventListener('load', () => {
  // Create game instance
  const game = new Phaser.Game({
    ...GameConfig,
    scene: [MainMenuScene, GameScene]
  });
});