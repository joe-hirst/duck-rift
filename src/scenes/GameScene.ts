import Phaser from "phaser";
import { Duck } from "../objects/Duck";
import { Obstacle, ObstacleType } from "../objects/Obstacle";
import { GAME_WIDTH, GAME_HEIGHT, GAME_SPEED } from "../config";

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
  private riverBanks!: {
    left: Phaser.GameObjects.Rectangle;
    right: Phaser.GameObjects.Rectangle;
  };
  private bgMusic!: Phaser.Sound.BaseSound;
  private isPaused: boolean = false;
  private pauseGroup!: Phaser.GameObjects.Group;
  private pauseMenuContainer!: Phaser.GameObjects.Container;
  private pauseScoreText!: Phaser.GameObjects.Text;
  private escKey!: Phaser.Input.Keyboard.Key;
  private mKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super("GameScene");
  }

  preload() {
    // Load background music
    this.load.audio('bgMusic', '/assets/Retro Beat.ogg');
    
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

    graphics.generateTexture("river", 64, 64);
    graphics.clear();

    // Preload obstacle assets
    Obstacle.preloadAssets(this);

    // Load duck image
    this.load.image("duck", "/assets/duck.png");
  }

  create() {
    // Play background music
    this.bgMusic = this.sound.add('bgMusic', { 
      volume: 0.5,
      loop: true 
    });
    this.bgMusic.play();
    
    // Setup keys for pause menu and main menu
    if (this.input.keyboard) {
      this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    }
    
    // Create pause menu (this initializes this.pauseGroup)
    this.createPauseMenu();

    // Create the scrolling river background
    this.riverBackground = this.add.tileSprite(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      "river"
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
    this.duck = new Duck(this, GAME_WIDTH / 2, GAME_HEIGHT - 65);
    this.duck.create();

    // Set the duck's river bounds based on the bank width
    this.duck.setRiverBounds(
      this.riverBanks.left.width,
      GAME_WIDTH - this.riverBanks.right.width
    );

    // Create obstacle group - don't use runChildUpdate since we do it manually
    this.obstacles = this.physics.add.group({
      classType: Obstacle,
    });

    // Setup obstacle spawning timer
    this.obstacleTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
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
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "24px",
      color: "#fff",
      stroke: "#000",
      strokeThickness: 4,
    });

    // Start the score incrementing
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver && !this.isPaused) {
          this.score += 1;
          this.scoreText.setText(`Score: ${this.score}`);
        }
      },
      loop: true,
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
            loop: true,
          });

          // Show level up text
          const levelText = this.add.text(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            `LEVEL ${this.difficultyLevel}`,
            {
              fontSize: "48px",
              color: "#ffff00",
              stroke: "#000",
              strokeThickness: 5,
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
            ease: "Cubic.easeOut",
            onComplete: () => {
              levelText.destroy();
            },
          });
        }
      },
      loop: true,
    });
  }

  update() {
    if (this.gameOver) return;
    
    // Check for ESC key press to toggle pause
    if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.togglePause();
    }
    
    // Check for M key press to go to main menu when paused
    if (this.isPaused && this.mKey && Phaser.Input.Keyboard.JustDown(this.mKey)) {
      this.goToMainMenu();
    }
    
    if (this.isPaused) return;

    // Update the duck/raft
    this.duck.update();

    // Scroll the river background
    this.riverBackground.tilePositionY -= this.riverSpeed;

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

  private spawnObstacle() {
    if (this.gameOver || this.isPaused) return;

    // Determine the riverbed width (area between banks)
    const riverBedWidth =
      GAME_WIDTH - (this.riverBanks.left.width + this.riverBanks.right.width);
    const leftEdge = this.riverBanks.left.width;

    // Create a new obstacle at a random x position within the riverbed
    const x = Phaser.Math.Between(leftEdge + 30, leftEdge + riverBedWidth - 30);

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
        this.time.delayedCall(Phaser.Math.Between(100, 300), () => {
          if (this.gameOver) return;

          const offsetX = Phaser.Math.Between(
            leftEdge + 30,
            leftEdge + riverBedWidth - 30
          );
          const offsetType =
            Math.random() < 0.3 ? ObstacleType.LOG : ObstacleType.ROCK;

          this.createSingleObstacle(offsetX, offsetType);
        });
      }
    }
  }

  private createSingleObstacle(x: number, type: ObstacleType) {
    if (this.gameOver || this.isPaused) return;

    // Create the obstacle
    const obstacle = new Obstacle(this, x, type);

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

  private handleCollision(duck: Duck, obstacle: Obstacle) {
    if (this.gameOver || this.isPaused) return;

    this.gameOver = true;

    // Stop the music
    this.bgMusic.stop();

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
      "GAME OVER",
      {
        fontSize: "64px",
        color: "#ff0000",
        stroke: "#000",
        strokeThickness: 6,
      }
    );
    gameOverText.setOrigin(0.5);

    // Show score
    const finalScoreText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 50,
      `Final Score: ${this.score}`,
      {
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4,
      }
    );
    finalScoreText.setOrigin(0.5);

    // Show retry text
    const retryText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 100,
      "Press SPACE to retry",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4,
      }
    );
    retryText.setOrigin(0.5);
    
    // Show main menu text
    const menuText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 150,
      "Press M for main menu",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4,
      }
    );
    menuText.setOrigin(0.5);

    // Add input handlers
    if (this.input && this.input.keyboard) {
      // Space key for retry
      this.input.keyboard.once("keydown-SPACE", () => {
        // Stop any existing music that might be playing
        this.sound.stopAll();
        // Reset game state and restart the scene
        this.gameOver = false;
        this.score = 0;
        this.riverSpeed = 2;
        this.difficultyLevel = 1;
        this.scene.restart();
      });
      
      // M key for main menu
      this.input.keyboard.once("keydown-M", () => {
        this.goToMainMenu();
      });
    }
  }

  private createPauseMenu() {
    // Create a container for pause menu elements
    this.pauseMenuContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.pauseMenuContainer.setDepth(1000);
    
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(
      0, 0,  // Center of the container
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.7
    );
    
    // Create pause text - similar to game over text
    const pauseText = this.add.text(
      0, -100,  // Relative to container center
      "GAME PAUSED",
      {
        fontSize: "64px",
        color: "#ff0000",
        stroke: "#000",
        strokeThickness: 6
      }
    );
    pauseText.setOrigin(0.5);
    
    // Create current score text with initial value - match final score text style
    this.pauseScoreText = this.add.text(
      0, -20,  // Relative to container center
      `Score: 0`,
      {
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4
      }
    );
    this.pauseScoreText.setOrigin(0.5);
    
    // Create resume instruction text - match retry text style
    const resumeText = this.add.text(
      0, 50,  // Relative to container center
      "Press ESC to continue",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4
      }
    );
    resumeText.setOrigin(0.5);
    
    // Create main menu instruction text
    const menuText = this.add.text(
      0, 100,  // Relative to container center
      "Press M for main menu",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4
      }
    );
    menuText.setOrigin(0.5);

    // Add all elements to the container
    this.pauseMenuContainer.add([overlay, pauseText, this.pauseScoreText, resumeText, menuText]);
    
    // Set the pause group to this container
    this.pauseGroup = this.add.group();
    this.pauseGroup.add(this.pauseMenuContainer);
    
    // Hide the pause menu initially
    this.pauseMenuContainer.setVisible(false);
  }
  
  private togglePause() {
    this.isPaused = !this.isPaused;
    console.log(`Game paused: ${this.isPaused}`);
    
    if (this.isPaused) {
      this.showPauseMenu();
    } else {
      this.hidePauseMenu();
    }
  }
  
  private showPauseMenu() {
    // Update score display
    console.log(`Updating score: ${this.score}`);
    this.pauseScoreText.setText(`Score: ${this.score}`);
    
    // Show pause menu
    console.log(`Showing pause menu`);
    this.pauseMenuContainer.setVisible(true);
    console.log(`Showing pause container`);
    
    // Pause game systems
    this.physics.pause();
    
    // Pause background music
    if (this.bgMusic.isPlaying) {
      this.bgMusic.pause();
    }
    
    // Pause all timers
    this.obstacleTimer.paused = true;
    this.difficultyTimer.paused = true;
  }
  
  private hidePauseMenu() {
    // Hide pause menu
    console.log(`Hiding pause menu`);
    this.pauseMenuContainer.setVisible(false);
    
    // Resume game systems
    this.physics.resume();
    
    // Resume background music
    if (!this.bgMusic.isPlaying) {
      this.bgMusic.resume();
    }
    
    // Resume all timers
    this.obstacleTimer.paused = false;
    this.difficultyTimer.paused = false;
  }
  
  private goToMainMenu() {
    // Stop all sounds
    this.sound.stopAll();
    
    // Reset game state
    this.isPaused = false;
    this.gameOver = false;
    this.score = 0;
    this.riverSpeed = 2;
    this.difficultyLevel = 1;
    
    // Go to main menu
    this.scene.start("MainMenuScene");
  }
}
