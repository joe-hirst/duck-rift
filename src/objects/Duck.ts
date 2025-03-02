import Phaser from "phaser";
import { GAME_WIDTH } from "../config";

export class Duck extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private duckSize: number = 63;
  private movementSpeed: number = 250;
  private riverBounds: { left: number; right: number } = {
    left: 60,
    right: GAME_WIDTH - 60,
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Use the duck texture directly
    super(scene, x, y, "duck");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.setCollideWorldBounds(true);
    if (this.body) {
      // Make hitbox a bit smaller than visual size for better gameplay feel
      this.body.setSize(this.duckSize * 6.25, this.duckSize * 4);
      this.body.setOffset(this.duckSize * 0, this.duckSize * 1);
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
        shift: { isDown: false } as Phaser.Input.Keyboard.Key,
      };
    }
  }

  create() {
    // Use the duck image directly
    this.setTexture("duck");

    // Set an appropriate size for the duck
    this.setDisplaySize(this.duckSize, this.duckSize);

    // Center the origin
    this.setOrigin(0.5, 0.5);
  }

  update() {
    // Handle left/right movement
    if (this.cursors.left.isDown) {
      this.setVelocityX(-this.movementSpeed);
      this.setFlipX(true); // Flip duck to face left
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(this.movementSpeed);
      this.setFlipX(false); // Duck faces right
    } else {
      this.setVelocityX(0);
    }

    // Add a subtle bobbing motion to simulate floating on water
    // Using setY instead of direct y manipulation ensures physics body updates properly
    const bobAmount = Math.sin(this.scene.time.now * 0.003) * 0.5;
    this.setY(this.y + bobAmount);

    // Ensure the duck stays within the river bounds
    if (this.x < this.riverBounds.left) {
      this.setX(this.riverBounds.left);
    } else if (this.x > this.riverBounds.right) {
      this.setX(this.riverBounds.right);
    }
  }

  // Method to set custom river bounds (called from GameScene after river banks are created)
  setRiverBounds(left: number, right: number) {
    this.riverBounds.left = left + this.duckSize / 2;
    this.riverBounds.right = right - this.duckSize / 2;
  }
}
