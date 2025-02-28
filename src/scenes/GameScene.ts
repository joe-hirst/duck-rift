import Phaser from 'phaser';
import { Duck } from '../objects/Duck';
import { Obstacle } from '../objects/Obstacle';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class GameScene extends Phaser.Scene {
  private duck!: Duck;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private obstacleTimer!: Phaser.Time.TimerEvent;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private gameOver: boolean = false;
  private riverSpeed: number = 2;
  private riverBackground!: Phaser.GameObjects.TileSprite;
  private difficultyTimer!: Phaser.Time.TimerEvent;
  
  constructor() {
    super('GameScene');
  }

  preload() {
    // The duck and obstacle classes will handle their own preloading
    // We'll need to add actual assets later
    
    // Create temporary graphics for the repeating river texture
    const graphics = this.add.graphics();
    graphics.fillStyle(0x4488cc, 1); // Blue color for water
    graphics.fillRect(0, 0, 64, 64);
    
    // Add some wavy lines for water texture
    graphics.lineStyle(2, 0x66aaff, 0.5);
    for (let y = 8; y < 64; y += 16) {
      graphics.beginPath();
      graphics.moveTo(0, y);
      graphics.lineTo(16, y + 4);
      graphics.lineTo(32, y);
      graphics.lineTo(48, y + 4);
      graphics.lineTo(64, y);
      graphics.stroke();
    }
    
    graphics.generateTexture('river', 64, 64);
    graphics.clear();
  }

  create() {
    // Create the scrolling river background
    this.riverBackground = this.add.tileSprite(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      'river'
    );
    
    // Create duck/raft
    this.duck = new Duck(this, GAME_WIDTH / 2, GAME_HEIGHT - 50);
    this.duck.create();
    
    // Create obstacle group
    this.obstacles = this.physics.add.group({
      classType: Obstacle,
      runChildUpdate: true
    });
    
    // Setup obstacle spawning timer
    this.obstacleTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    });
    
    // Setup collision detection
    this.physics.add.collider(
      this.duck,
      this.obstacles,
      this.handleCollision,
      undefined,
      this
    );
    
    // Setup score display
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 4
    });
    
    // Start the score incrementing
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver) {
          this.score += 1;
          this.scoreText.setText(`Score: ${this.score}`);
        }
      },
      loop: true
    });
    
    // Setup difficulty increase timer
    this.difficultyTimer = this.time.addEvent({
      delay: 10000, // Increase difficulty every 10 seconds
      callback: () => {
        if (!this.gameOver) {
          this.riverSpeed += 0.2;
          // Create a new timer with updated delay
          const currentDelay = this.obstacleTimer.delay;
          const newDelay = Math.max(300, currentDelay - 50);
          
          this.obstacleTimer.remove();
          this.obstacleTimer = this.time.addEvent({
            delay: newDelay,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
          });
        }
      },
      loop: true
    });
  }

  update() {
    if (this.gameOver) return;
    
    // Update the duck/raft
    this.duck.update();
    
    // Scroll the river background
    this.riverBackground.tilePositionY -= this.riverSpeed;
  }

  private spawnObstacle() {
    if (this.gameOver) return;
    
    // Create a new obstacle at a random x position
    const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
    const obstacle = new Obstacle(this, x);
    obstacle.create();
    
    this.obstacles.add(obstacle);
  }

  private handleCollision() {
    if (this.gameOver) return;
    
    this.gameOver = true;
    
    // Stop obstacle spawning and movement
    this.obstacleTimer.remove();
    this.difficultyTimer.remove();
    this.obstacles.setVelocityY(0);
    
    // Stop the duck
    this.duck.setVelocity(0, 0);
    
    // Show game over text
    const gameOverText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      'GAME OVER',
      {
        fontSize: '64px',
        color: '#ff0000',
        stroke: '#000',
        strokeThickness: 6
      }
    );
    gameOverText.setOrigin(0.5);
    
    // Show retry text
    const retryText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 80,
      'Press SPACE to retry',
      {
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000',
        strokeThickness: 4
      }
    );
    retryText.setOrigin(0.5);
    
    // Add retry input
    if (this.input && this.input.keyboard) {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart();
      });
    }
  }
}