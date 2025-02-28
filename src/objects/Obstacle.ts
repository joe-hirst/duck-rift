import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_SPEED } from '../config';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number) {
    // For now, create a simple gray rectangle as a placeholder for the rocks
    super(scene, x, 0, 'obstacle');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set the initial position off-screen at the top
    this.setPosition(x, -50);
    
    // Set velocity to move downwards
    this.setVelocityY(GAME_SPEED);
    
    // We'll handle the destruction manually in update
  }

  preload() {
    // We'll add real assets later, for now create a placeholder
    this.scene.load.image('obstacle', '');
  }

  create() {
    // Create a placeholder graphic for the obstacle
    const width = Phaser.Math.Between(40, 80);
    const height = Phaser.Math.Between(40, 80);
    
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x888888, 1); // Gray color
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture('obstacle', width, height);
    graphics.clear();
    
    this.setTexture('obstacle');
    if (this.body) {
      this.body.setSize(width, height);
    }
  }

  update() {
    // Check if the obstacle is off the bottom of the screen
    if (this.y > GAME_HEIGHT + this.height) {
      this.destroy();
    }
  }
}