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
    type: ObstacleType = ObstacleType.ROCK,
  ) {
    // We'll start with a placeholder texture and update it in create()
    super(scene, x, 0, "obstacle");

    this.obstacleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set the initial position off-screen at the top
    this.setPosition(x, -50);

    // Velocity will be set in the GameScene
  }

  static preloadAssets(scene: Phaser.Scene) {
    // We'll add real assets later, for now create placeholders

    // Create rock placeholder
    const rockGraphics = scene.add.graphics();
    rockGraphics.fillStyle(0x888888, 1); // Gray color for rocks
    rockGraphics.fillRect(0, 0, 60, 50);
    // Add some texture to the rock
    rockGraphics.lineStyle(1, 0x666666, 1);
    rockGraphics.strokeCircle(15, 15, 10);
    rockGraphics.strokeCircle(40, 30, 12);
    rockGraphics.generateTexture("rock", 60, 50);
    rockGraphics.clear();

    // Create log placeholder
    const logGraphics = scene.add.graphics();
    logGraphics.fillStyle(0x8b4513, 1); // Brown color for logs
    logGraphics.fillRect(0, 0, 100, 30);
    // Add some wood grain texture
    logGraphics.lineStyle(1, 0x5c3317, 0.8);
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
      if (this.body) {
        this.body.setSize(50, 40);
      }
      // Add some random rotation to the rock
      this.setRotation(Phaser.Math.FloatBetween(0, Math.PI));
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
