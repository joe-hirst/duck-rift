import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";

export class PauseManager {
  private scene: Phaser.Scene;
  private pauseMenuContainer!: Phaser.GameObjects.Container;
  private pauseScoreText!: Phaser.GameObjects.Text;
  private pauseGroup!: Phaser.GameObjects.Group;
  private escKey!: Phaser.Input.Keyboard.Key;
  private mKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private isPaused: boolean = false;
  
  private timers: Phaser.Time.TimerEvent[] = [];
  private bgMusic?: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(bgMusic: Phaser.Sound.BaseSound): void {
    this.bgMusic = bgMusic;
    
    // Setup keys for pause menu and main menu
    if (this.scene.input && this.scene.input.keyboard) {
      this.escKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      this.mKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
      this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    this.createPauseMenu();
  }

  addTimer(timer: Phaser.Time.TimerEvent): void {
    this.timers.push(timer);
  }

  update(onMainMenu: () => void): void {
    // Check for ESC key press to toggle pause
    if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.togglePause();
    }
    
    // Check for SPACE key press to unpause the game when paused
    if (this.isPaused && this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.togglePause();
    }
    
    // Check for M key press to go to main menu when paused
    if (this.isPaused && this.mKey && Phaser.Input.Keyboard.JustDown(this.mKey)) {
      onMainMenu();
    }
  }

  private createPauseMenu(): void {
    // Create a container for pause menu elements
    this.pauseMenuContainer = this.scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.pauseMenuContainer.setDepth(1000);
    
    // Create semi-transparent overlay
    const overlay = this.scene.add.rectangle(
      0, 0,  // Center of the container
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.7
    );
    
    // Create pause text - with yellow color
    const pauseText = this.scene.add.text(
      0, -100,  // Relative to container center
      "GAME PAUSED",
      {
        fontSize: "64px",
        color: "#ffff00",
        stroke: "#000",
        strokeThickness: 6
      }
    );
    pauseText.setOrigin(0.5);
    
    // Create current score text with initial value - match final score text style
    this.pauseScoreText = this.scene.add.text(
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
    const resumeText = this.scene.add.text(
      0, 50,  // Relative to container center
      "Press SPACE or ESC to continue",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4
      }
    );
    resumeText.setOrigin(0.5);
    
    // Create main menu instruction text
    const menuText = this.scene.add.text(
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
    this.pauseGroup = this.scene.add.group();
    this.pauseGroup.add(this.pauseMenuContainer);
    
    // Hide the pause menu initially
    this.pauseMenuContainer.setVisible(false);
  }
  
  togglePause(): void {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.showPauseMenu();
    } else {
      this.hidePauseMenu();
    }
  }
  
  private showPauseMenu(): void {
    // Show pause menu
    this.pauseMenuContainer.setVisible(true);
    
    // Pause game systems
    this.scene.physics.pause();
    
    // Pause background music
    if (this.bgMusic?.isPlaying) {
      this.bgMusic.pause();
    }
    
    // Pause all timers
    this.timers.forEach(timer => {
      timer.paused = true;
    });
  }
  
  private hidePauseMenu(): void {
    // Hide pause menu
    this.pauseMenuContainer.setVisible(false);
    
    // Resume game systems
    this.scene.physics.resume();
    
    // Resume background music
    if (this.bgMusic && !this.bgMusic.isPlaying) {
      this.bgMusic.resume();
    }
    
    // Resume all timers
    this.timers.forEach(timer => {
      timer.paused = false;
    });
  }

  updateScore(score: number): void {
    this.pauseScoreText.setText(`Score: ${score}`);
  }

  isPauseActive(): boolean {
    return this.isPaused;
  }

  reset(): void {
    this.isPaused = false;
    this.hidePauseMenu();
  }
}