import Phaser from 'phaser';
import { GAME_WIDTH } from '../config';

export class Duck extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private raftWidth: number = 80;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // For now, create a simple yellow rectangle as a placeholder for the duck/raft
    super(scene, x, y, 'raft');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.setCollideWorldBounds(true);
    if (this.body) {
      this.body.setSize(this.raftWidth, 20);
    }
    
    // Set up input
    if (scene.input && scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
    } else {
      // Create a default cursor object if keyboard isn't available
      this.cursors = {
        up: { isDown: false } as Phaser.Input.Keyboard.Key,
        down: { isDown: false } as Phaser.Input.Keyboard.Key,
        left: { isDown: false } as Phaser.Input.Keyboard.Key,
        right: { isDown: false } as Phaser.Input.Keyboard.Key,
        space: { isDown: false } as Phaser.Input.Keyboard.Key,
        shift: { isDown: false } as Phaser.Input.Keyboard.Key
      };
    }
  }

  preload() {
    // We'll add real assets later, for now create a placeholder
    this.scene.load.image('raft', '');
  }

  create() {
    // Create a placeholder graphic for the raft
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xFFFF00, 1); // Yellow color
    graphics.fillRect(0, 0, this.raftWidth, 20);
    graphics.generateTexture('raft', this.raftWidth, 20);
    graphics.clear();
    
    this.setTexture('raft');
  }

  update() {
    // Handle left/right movement
    if (this.cursors.left.isDown) {
      this.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(200);
    } else {
      this.setVelocityX(0);
    }
    
    // Ensure the raft stays within the river bounds
    const halfWidth = this.raftWidth / 2;
    if (this.x < halfWidth) {
      this.x = halfWidth;
    } else if (this.x > GAME_WIDTH - halfWidth) {
      this.x = GAME_WIDTH - halfWidth;
    }
  }
}