import Phaser from "phaser";
import { Duck } from "../objects/Duck";
import { Obstacle, ObstacleType } from "../objects/Obstacle";
import { GAME_SPEED } from "../config";

export class ObstacleManager {
  private scene: Phaser.Scene;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private obstacleTimer!: Phaser.Time.TimerEvent;
  private difficultyTimer!: Phaser.Time.TimerEvent;
  private difficultyLevel: number = 1;
  private gameOver: boolean = false;
  private onCollision: (duck: Duck, obstacle: Obstacle) => void;

  constructor(
    scene: Phaser.Scene,
    onCollision: (duck: Duck, obstacle: Obstacle) => void,
  ) {
    this.scene = scene;
    this.onCollision = onCollision;
  }

  preload(): void {
    Obstacle.preloadAssets(this.scene);
  }

  create(duck: Duck, leftEdge: number, riverbedWidth: number): void {
    // Create obstacle group - don't use runChildUpdate since we do it manually
    this.obstacles = this.scene.physics.add.group({
      classType: Obstacle,
    });

    // Setup obstacle spawning timer
    this.obstacleTimer = this.scene.time.addEvent({
      delay: 1000,
      callback: () => this.spawnObstacle(leftEdge, riverbedWidth),
      callbackScope: this,
      loop: true,
    });

    // Setup collision detection
    this.scene.physics.add.collider(
      duck,
      this.obstacles,
      (duck, obstacle) => {
        this.handleCollision(duck as Duck, obstacle as Obstacle);
      },
      undefined,
      this,
    );

    // Setup difficulty increase timer
    this.difficultyTimer = this.scene.time.addEvent({
      delay: 10000, // Increase difficulty every 10 seconds
      callback: () => {
        this.increaseDifficulty(leftEdge, riverbedWidth);
      },
      loop: true,
    });
  }

  update(isPaused: boolean): void {
    if (this.gameOver || isPaused) return;

    // Make sure all obstacles are moving
    this.obstacles.getChildren().forEach((child) => {
      const obstacle = child as Obstacle;

      // Ensure obstacles keep moving down
      if (obstacle.body && obstacle.body.velocity.y === 0) {
        const speed =
          obstacle.getType() === ObstacleType.LOG
            ? GAME_SPEED + 50
            : GAME_SPEED;
        obstacle.body.velocity.y = speed;
      }

      // Update each obstacle manually
      obstacle.update();
    });
  }

  private spawnObstacle(leftEdge: number, riverbedWidth: number): void {
    if (this.gameOver) return;

    // Create a new obstacle at a random x position within the riverbed
    const x = Phaser.Math.Between(leftEdge + 30, leftEdge + riverbedWidth - 30);

    // Determine obstacle type (rock or log)
    // Higher chance of logs at higher difficulty levels
    const logChance = Math.min(0.4, 0.1 + this.difficultyLevel * 0.05);
    const type =
      Math.random() < logChance ? ObstacleType.LOG : ObstacleType.ROCK;

    this.createSingleObstacle(x, type);

    // At higher difficulty levels, spawn obstacles in groups sometimes
    if (this.difficultyLevel >= 2 && Math.random() < 0.3) {
      const obstacleCount = Phaser.Math.Between(1, this.difficultyLevel - 1);
      for (let i = 0; i < obstacleCount; i++) {
        // Add a small delay between spawns
        this.scene.time.delayedCall(Phaser.Math.Between(100, 300), () => {
          if (this.gameOver) return;

          const offsetX = Phaser.Math.Between(
            leftEdge + 30,
            leftEdge + riverbedWidth - 30,
          );
          const offsetType =
            Math.random() < 0.3 ? ObstacleType.LOG : ObstacleType.ROCK;

          this.createSingleObstacle(offsetX, offsetType);
        });
      }
    }
  }

  private createSingleObstacle(x: number, type: ObstacleType): void {
    if (this.gameOver) return;

    // Create the obstacle
    const obstacle = new Obstacle(this.scene, x, type);

    // First add it to the group so it gets proper physics
    this.obstacles.add(obstacle);

    // Then initialize it
    obstacle.create();

    // Force refresh the physics body to ensure it's properly initialized
    if (obstacle.body) {
      obstacle.body.reset(x, -50);
    }

    // Set velocity based on type and difficulty
    const speed = type === ObstacleType.LOG ? GAME_SPEED + 50 : GAME_SPEED;

    if (obstacle.body) {
      obstacle.body.velocity.y = speed; // Direct body access to ensure it works

      // Add some lateral movement to logs at higher difficulty
      if (type === ObstacleType.LOG && this.difficultyLevel >= 3) {
        const sideMovement = Phaser.Math.Between(-50, 50);
        obstacle.body.velocity.x = sideMovement;
      }

      // Enable the body explicitly
      obstacle.body.enable = true;
    }
  }

  private handleCollision(duck: Duck, obstacle: Obstacle): void {
    if (this.gameOver) return;

    this.gameOver = true;
    this.stopObstacles();
    this.onCollision(duck, obstacle);
  }

  private increaseDifficulty(leftEdge: number, riverbedWidth: number): void {
    if (this.gameOver) return;

    this.difficultyLevel++;

    // Create a new timer with updated delay
    const currentDelay = this.obstacleTimer.delay;
    const newDelay = Math.max(300, currentDelay - 50);

    this.obstacleTimer.remove();
    this.obstacleTimer = this.scene.time.addEvent({
      delay: newDelay,
      callback: () => this.spawnObstacle(leftEdge, riverbedWidth),
      callbackScope: this,
      loop: true,
    });

    // Show level up text
    const levelText = this.scene.add.text(
      this.scene.game.canvas.width / 2,
      this.scene.game.canvas.height / 2,
      `LEVEL ${this.difficultyLevel}`,
      {
        fontSize: "48px",
        color: "#ffff00",
        stroke: "#000",
        strokeThickness: 5,
      },
    );
    levelText.setOrigin(0.5);
    levelText.setAlpha(0.8);

    // Add a fade out animation
    this.scene.tweens.add({
      targets: levelText,
      alpha: 0,
      y: this.scene.game.canvas.height / 2 - 50,
      duration: 1500,
      ease: "Cubic.easeOut",
      onComplete: () => {
        levelText.destroy();
      },
    });
  }

  stopObstacles(): void {
    // Stop obstacle spawning and movement
    this.obstacleTimer.remove();
    this.difficultyTimer.remove();
    this.obstacles.setVelocityY(0);
    this.obstacles.setVelocityX(0);
  }

  getObstacleTimer(): Phaser.Time.TimerEvent {
    return this.obstacleTimer;
  }

  getDifficultyTimer(): Phaser.Time.TimerEvent {
    return this.difficultyTimer;
  }

  getDifficultyLevel(): number {
    return this.difficultyLevel;
  }

  setGameOver(isGameOver: boolean): void {
    this.gameOver = isGameOver;
  }

  reset(): void {
    this.gameOver = false;
    this.difficultyLevel = 1;

    // Destroy all existing obstacles
    this.obstacles.clear(true, true);
  }
}
