import Phaser from 'phaser';
import { Duck } from '../objects/Duck';
import { Obstacle, ObstacleType } from '../objects/Obstacle';
import { GAME_WIDTH, GAME_HEIGHT, GAME_SPEED } from '../config';

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
  private difficultyLevel: number = 1;
  private riverBanks!: {left: Phaser.GameObjects.Rectangle, right: Phaser.GameObjects.Rectangle};
  
  constructor() {
    super('GameScene');
  }

  preload() {
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
    
    // Preload obstacle assets
    Obstacle.preloadAssets(this);
    
    // Duck will handle its own preloading
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
    
    // Create river banks
    const bankWidth = 40;
    const bankColor = 0x228833; // Green color for banks
    
    // Left bank
    const leftBank = this.add.rectangle(
      bankWidth / 2,
      GAME_HEIGHT / 2,
      bankWidth,
      GAME_HEIGHT,
      bankColor
    );
    
    // Right bank
    const rightBank = this.add.rectangle(
      GAME_WIDTH - bankWidth / 2,
      GAME_HEIGHT / 2,
      bankWidth,
      GAME_HEIGHT,
      bankColor
    );
    
    this.riverBanks = { left: leftBank, right: rightBank };
    
    // Add some details to the banks
    const bankDetail = this.add.graphics();
    bankDetail.fillStyle(0x115522, 0.5); // Darker green for grass/plants
    
    // Add random grass/plants to the banks
    for (let i = 0; i < 20; i++) {
      const x1 = Phaser.Math.Between(5, bankWidth - 5);
      const y1 = Phaser.Math.Between(5, GAME_HEIGHT - 5);
      bankDetail.fillCircle(x1, y1, 5);
      
      const x2 = GAME_WIDTH - Phaser.Math.Between(5, bankWidth - 5);
      const y2 = Phaser.Math.Between(5, GAME_HEIGHT - 5);
      bankDetail.fillCircle(x2, y2, 5);
    }
    
    // Create duck/raft
    this.duck = new Duck(this, GAME_WIDTH / 2, GAME_HEIGHT - 50);
    this.duck.create();
    
    // Set the duck's river bounds based on the bank width
    this.duck.setRiverBounds(this.riverBanks.left.width, GAME_WIDTH - this.riverBanks.right.width);
    
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
      (duck, obstacle) => {
        this.handleCollision(duck as Duck, obstacle as Obstacle);
      },
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
          this.difficultyLevel++;
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
          
          // Show level up text
          const levelText = this.add.text(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            `LEVEL ${this.difficultyLevel}`,
            {
              fontSize: '48px',
              color: '#ffff00',
              stroke: '#000',
              strokeThickness: 5
            }
          );
          levelText.setOrigin(0.5);
          levelText.setAlpha(0.8);
          
          // Add a fade out animation
          this.tweens.add({
            targets: levelText,
            alpha: 0,
            y: GAME_HEIGHT / 2 - 50,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
              levelText.destroy();
            }
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
    
    // Determine the riverbed width (area between banks)
    const riverBedWidth = GAME_WIDTH - (this.riverBanks.left.width + this.riverBanks.right.width);
    const leftEdge = this.riverBanks.left.width;
    
    // Create a new obstacle at a random x position within the riverbed
    const x = Phaser.Math.Between(leftEdge + 30, leftEdge + riverBedWidth - 30);
    
    // Determine obstacle type (rock or log)
    // Higher chance of logs at higher difficulty levels
    const logChance = Math.min(0.4, 0.1 + (this.difficultyLevel * 0.05));
    const type = Math.random() < logChance ? ObstacleType.LOG : ObstacleType.ROCK;
    
    // Create the obstacle
    const obstacle = new Obstacle(this, x, type);
    obstacle.create();
    
    // Adjust velocity based on type and difficulty
    if (type === ObstacleType.LOG) {
      // Logs move faster
      obstacle.setVelocityY(GAME_SPEED + 50);
      
      // Add some lateral movement to logs to make them more challenging
      if (this.difficultyLevel >= 3) {
        const sideMovement = Phaser.Math.Between(-50, 50);
        obstacle.setVelocityX(sideMovement);
      }
    } else {
      // Rocks move at normal speed
      obstacle.setVelocityY(GAME_SPEED);
    }
    
    this.obstacles.add(obstacle);
    
    // At higher difficulty levels, spawn obstacles in groups sometimes
    if (this.difficultyLevel >= 2 && Math.random() < 0.3) {
      const obstacleCount = Phaser.Math.Between(1, this.difficultyLevel - 1);
      for (let i = 0; i < obstacleCount; i++) {
        // Add a small delay between spawns
        this.time.delayedCall(Phaser.Math.Between(100, 300), () => {
          if (this.gameOver) return;
          
          const offsetX = Phaser.Math.Between(leftEdge + 30, leftEdge + riverBedWidth - 30);
          const offsetType = Math.random() < 0.3 ? ObstacleType.LOG : ObstacleType.ROCK;
          
          const additionalObstacle = new Obstacle(this, offsetX, offsetType);
          additionalObstacle.create();
          
          // Set velocity based on obstacle type
          if (offsetType === ObstacleType.LOG) {
            additionalObstacle.setVelocityY(GAME_SPEED + 50);
            if (this.difficultyLevel >= 3) {
              additionalObstacle.setVelocityX(Phaser.Math.Between(-50, 50));
            }
          } else {
            additionalObstacle.setVelocityY(GAME_SPEED);
          }
          
          this.obstacles.add(additionalObstacle);
        });
      }
    }
  }

  private handleCollision(duck: Duck, obstacle: Obstacle) {
    if (this.gameOver) return;
    
    this.gameOver = true;
    
    // Stop obstacle spawning and movement
    this.obstacleTimer.remove();
    this.difficultyTimer.remove();
    this.obstacles.setVelocityY(0);
    this.obstacles.setVelocityX(0);
    
    // Stop the duck
    duck.setVelocity(0, 0);
    
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
    
    // Show score
    const finalScoreText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 50,
      `Final Score: ${this.score}`,
      {
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000',
        strokeThickness: 4
      }
    );
    finalScoreText.setOrigin(0.5);
    
    // Show retry text
    const retryText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 100,
      'Press SPACE to retry',
      {
        fontSize: '24px',
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