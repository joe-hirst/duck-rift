import Phaser from "phaser";
import { GAME_HEIGHT, GAME_SPEED } from "../config";

export class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, 0, "coin");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setPosition(x, -50);
  }

  static preloadAssets(scene: Phaser.Scene) {
    // Create coin placeholder
    const coinGraphics = scene.add.graphics();
    coinGraphics.fillStyle(0xffd700, 1); // Gold color
    coinGraphics.fillCircle(15, 15, 15);
    // Add detail to coin
    coinGraphics.lineStyle(1, 0xffa500, 1);
    coinGraphics.strokeCircle(15, 15, 10);
    coinGraphics.generateTexture("coin", 30, 30);
    coinGraphics.clear();
  }

  create() {
    this.setTexture("coin");
    if (this.body) {
      // Use a significantly larger hitbox for much more reliable collision detection
      this.body.setSize(40, 40);
      // Center the larger hitbox
      this.body.setOffset(-5, -5);
      // Ensure the body is enabled
      this.body.enable = true;
    }

    // Initialize as not collected
    this.setData("collected", false);
    this.setActive(true);
    this.setVisible(true);
  }

  update() {
    // Destroy when offscreen
    if (this.y > GAME_HEIGHT + this.height) {
      this.destroy();
      return;
    }

    // Spin animation
    this.angle += 2;

    // Ensure coin keeps moving
    if (this.body && this.body.velocity.y === 0) {
      this.body.velocity.y = GAME_SPEED;
    }
  }
}
