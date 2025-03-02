import Phaser from "phaser";
import { GAME_HEIGHT, GAME_SPEED } from "../config";

export class Jam extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, 0, "jam");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale down the jam image to a reasonable size
    this.setScale(0.105);
    this.setPosition(x, -50);
  }

  static preloadAssets(scene: Phaser.Scene) {
    scene.load.image("jam", "/assets/jam.webp");
  }

  create() {
    this.setTexture("jam");
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

    // Ensure jam keeps moving
    if (this.body && this.body.velocity.y === 0) {
      this.body.velocity.y = GAME_SPEED;
    }
  }
}
