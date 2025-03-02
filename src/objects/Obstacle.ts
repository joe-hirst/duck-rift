import Phaser from "phaser";
import { GAME_HEIGHT, GAME_SPEED } from "../config";

export enum ObstacleType {
  ROCK = "rock",
  LOG = "log",
}

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  private obstacleType: ObstacleType;

  constructor(
    scene: Phaser.Scene,
    x: number,
    type: ObstacleType = ObstacleType.ROCK
  ) {
    // We'll start with a placeholder texture and update it in create()
    super(scene, x, 0, "obstacle");

    this.obstacleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set the initial position off-screen at the top
    this.setPosition(x, -50);
    //this.setScale(2);

    // Velocity will be set in the GameScene
  }

  static preloadAssets(scene: Phaser.Scene) {
    // Load rock image from assets
    scene.load.image("rock", "/assets/rock.svg");

    // Create log placeholder with Minecraft oak wood colors
    const logGraphics = scene.add.graphics();
    logGraphics.fillStyle(0x9a7653, 1); // Lighter Minecraft oak wood base color
    logGraphics.fillRect(0, 0, 100, 30);
    // Add wood grain texture with darker Minecraft-like grain color
    logGraphics.lineStyle(1, 0x7d5f3e, 0.8);
    for (let i = 0; i < 100; i += 10) {
      logGraphics.beginPath();
      logGraphics.moveTo(i, 0);
      logGraphics.lineTo(i, 30);
      logGraphics.stroke();
    }
    logGraphics.generateTexture("log", 100, 30);
    logGraphics.clear();
  }

  create() {
    // Set texture and size based on obstacle type
    if (this.obstacleType === ObstacleType.ROCK) {
      this.setTexture("rock");
      // Set appropriate size for rock.svg
      this.setDisplaySize(110, 85);
      // Add some random rotation to the rock
      const rotation = Phaser.Math.FloatBetween(0, Math.PI / 2);
      this.setRotation(rotation);
      // Apply rotated hitbox for rocks
      if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
        // Arcade Physics doesn't directly support rotated hitboxes, so use a workaround

        // First set the hitbox to a square that covers both orientations
        const maxDimension = Math.max(80, 60);
        this.body.setSize(maxDimension, maxDimension, true);

        // Then offset it to match the rotation visually
        // For portrait orientation (rotation near 0 or PI)
        if (Math.sin(rotation) < 0.5) {
          this.body.setSize(80, 80, true);
        }
        // For landscape orientation (rotation near PI/2)
        else {
          this.body.setSize(80, 60, true);
        }
      }
    } else if (this.obstacleType === ObstacleType.LOG) {
      this.setTexture("log");
      if (this.body) {
        this.body.setSize(90, 20);
      }
      // Logs might be slightly rotated in the water
      this.setRotation(Phaser.Math.FloatBetween(-0.2, 0.2));
    }

    // Set obstacle to active to ensure physics are applied
    this.setActive(true);
    this.setVisible(true);

    // Add a little physics drag to make movement more natural
    if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setDrag(50, 0);
    }
  }

  update() {
    // Check if the obstacle is off the bottom of the screen
    if (this.y > GAME_HEIGHT + this.height) {
      this.destroy();
      return;
    }

    // Make logs sway slightly in the water
    if (this.obstacleType === ObstacleType.LOG) {
      this.rotation += Math.sin(this.y * 0.01) * 0.001;
    }

    // Double-check velocity if somehow the obstacle stopped moving
    if (this.body && this.body.velocity.y === 0) {
      const defaultSpeed =
        this.obstacleType === ObstacleType.LOG ? GAME_SPEED + 50 : GAME_SPEED;
      this.body.velocity.y = defaultSpeed;
    }
  }

  getType(): ObstacleType {
    return this.obstacleType;
  }
}
