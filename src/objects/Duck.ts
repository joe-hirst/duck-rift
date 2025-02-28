import Phaser from 'phaser';
import { GAME_WIDTH } from '../config';

export class Duck extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private raftWidth: number = 80;
  private raftHeight: number = 25;
  private duckSize: number = 30;
  private isMovingRaft: boolean = false;
  private raftGraphics!: Phaser.GameObjects.Graphics;
  private duckGraphics!: Phaser.GameObjects.Graphics;
  private movementSpeed: number = 250;
  private raftBounds: { left: number; right: number } = { left: 60, right: GAME_WIDTH - 60 };
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // We'll start with a placeholder texture and update it in create()
    super(scene, x, y, 'raft_with_duck');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.setCollideWorldBounds(true);
    if (this.body) {
      this.body.setSize(this.raftWidth, this.raftHeight);
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
    // We'll add real assets later, for now create placeholders for raft and duck
    this.scene.load.image('raft_with_duck', '');
  }

  create() {
    // Create a placeholder graphic for the raft
    this.raftGraphics = this.scene.add.graphics();
    this.raftGraphics.fillStyle(0xA0522D, 1); // Brown color for raft
    this.raftGraphics.fillRect(0, 0, this.raftWidth, this.raftHeight);
    
    // Add some wood details to the raft
    this.raftGraphics.lineStyle(1, 0x8B4513, 1);
    for (let i = 10; i < this.raftWidth; i += 15) {
      this.raftGraphics.moveTo(i, 0);
      this.raftGraphics.lineTo(i, this.raftHeight);
      this.raftGraphics.stroke();
    }
    
    // Create a placeholder graphic for the duck
    this.duckGraphics = this.scene.add.graphics();
    // Duck body (yellow)
    this.duckGraphics.fillStyle(0xFFFF00, 1);
    this.duckGraphics.fillCircle(this.raftWidth / 2, -this.duckSize / 2, this.duckSize / 2);
    // Duck head
    this.duckGraphics.fillCircle(this.raftWidth / 2 + 10, -this.duckSize / 2 - 8, this.duckSize / 3);
    // Duck bill
    this.duckGraphics.fillStyle(0xFF9900, 1); // Orange
    this.duckGraphics.fillTriangle(
      this.raftWidth / 2 + 15, -this.duckSize / 2 - 8,
      this.raftWidth / 2 + 30, -this.duckSize / 2 - 5,
      this.raftWidth / 2 + 15, -this.duckSize / 2 - 3
    );
    // Duck eye
    this.duckGraphics.fillStyle(0x000000, 1); // Black
    this.duckGraphics.fillCircle(this.raftWidth / 2 + 13, -this.duckSize / 2 - 10, 2);
    
    // Generate texture with both raft and duck
    const renderTexture = this.scene.add.renderTexture(0, 0, this.raftWidth, this.raftHeight + this.duckSize);
    renderTexture.draw([this.raftGraphics, this.duckGraphics]);
    renderTexture.saveTexture('raft_with_duck');
    
    // Clean up the graphics
    this.raftGraphics.clear();
    this.duckGraphics.clear();
    
    // Apply the texture to the sprite
    this.setTexture('raft_with_duck');
    // Offset origin to account for duck sitting on raft
    this.setOrigin(0.5, 0.7);
  }

  update() {
    // Handle left/right movement
    if (this.cursors.left.isDown) {
      this.setVelocityX(-this.movementSpeed);
      this.isMovingRaft = true;
      this.setFlipX(true); // Flip duck to face left
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(this.movementSpeed);
      this.isMovingRaft = true;
      this.setFlipX(false); // Duck faces right
    } else {
      this.setVelocityX(0);
      this.isMovingRaft = false;
    }
    
    // Add a subtle bobbing motion to simulate floating on water
    const bobAmount = Math.sin(this.scene.time.now * 0.003) * 0.5;
    this.y += bobAmount;
    
    // Add a slight tilt when moving
    if (this.isMovingRaft) {
      const tiltDirection = this.cursors.left.isDown ? 1 : -1;
      this.setRotation(tiltDirection * 0.05);
    } else {
      this.setRotation(0);
    }
    
    // Ensure the raft stays within the river bounds
    if (this.x < this.raftBounds.left) {
      this.x = this.raftBounds.left;
    } else if (this.x > this.raftBounds.right) {
      this.x = this.raftBounds.right;
    }
  }
  
  // Method to set custom river bounds (called from GameScene after river banks are created)
  setRiverBounds(left: number, right: number) {
    this.raftBounds.left = left + this.raftWidth / 2;
    this.raftBounds.right = right - this.raftWidth / 2;
  }
}