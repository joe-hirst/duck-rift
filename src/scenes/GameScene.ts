import Phaser from "phaser";
import { Duck } from "../objects/Duck";
import { Obstacle } from "../objects/Obstacle";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";
import { RiverManager } from "../managers/RiverManager";
import { ObstacleManager } from "../managers/ObstacleManager";
import { PauseManager } from "../managers/PauseManager";
import { ScoreManager } from "../managers/ScoreManager";
import { GameOverManager } from "../managers/GameOverManager";
import { JamManager } from "../managers/JamManager";

export class GameScene extends Phaser.Scene {
  private duck!: Duck;
  private riverManager!: RiverManager;
  private obstacleManager!: ObstacleManager;
  private jamManager!: JamManager;
  private pauseManager!: PauseManager;
  private scoreManager!: ScoreManager;
  private gameOverManager!: GameOverManager;
  private bgMusic!: Phaser.Sound.BaseSound;
  private gameOver: boolean = false;

  constructor() {
    super("GameScene");
  }

  preload() {
    // Load background music
    this.load.audio("bgMusic", "/assets/Retro Beat.ogg");
    // Load quack sound effect
    this.load.audio("quack", "/assets/quack.wav");

    // Initialize managers
    this.riverManager = new RiverManager(this);
    this.riverManager.preload();

    this.obstacleManager = new ObstacleManager(
      this,
      this.handleCollision.bind(this),
    );
    this.obstacleManager.preload();

    this.jamManager = new JamManager(this, this.collectJam.bind(this));
    this.jamManager.preload();

    // Load duck image
    this.load.image("duck", "/assets/duck.png");
    // Load jam word image
    this.load.image("jam-word", "/assets/jam-word.png");
  }

  create() {
    // Play background music
    this.bgMusic = this.sound.add("bgMusic", {
      volume: 0.5,
      loop: true,
    });
    this.bgMusic.play();

    // Initialize all managers
    this.pauseManager = new PauseManager(this);
    this.pauseManager.init(this.bgMusic);

    this.scoreManager = new ScoreManager(this);
    this.scoreManager.create();

    this.gameOverManager = new GameOverManager(this);

    // Create river and banks
    this.riverManager.create();

    // Create duck/raft
    this.duck = new Duck(this, GAME_WIDTH / 2, GAME_HEIGHT - 65);
    this.duck.create();

    // Set the duck's river bounds
    this.duck.setRiverBounds(
      this.riverManager.getRiverBounds().left,
      this.riverManager.getRiverBounds().right,
    );

    // Create obstacles and setup collision
    this.obstacleManager.create(
      this.duck,
      this.riverManager.getLeftEdge(),
      this.riverManager.getRiverbedWidth(),
    );

    // Create jams and setup collection
    this.jamManager.create(
      this.duck,
      this.riverManager.getLeftEdge(),
      this.riverManager.getRiverbedWidth(),
    );

    // Add timers to pause manager
    this.pauseManager.addTimer(this.obstacleManager.getObstacleTimer());
    this.pauseManager.addTimer(this.obstacleManager.getDifficultyTimer());
    this.pauseManager.addTimer(this.jamManager.getJamTimer());
    
    // Enable physics debug mode to show hitboxes
    this.physics.world.createDebugGraphic();
  }

  update() {
    if (this.gameOver) return;

    // Update pause manager
    this.pauseManager.update(this.goToMainMenu.bind(this));

    // If paused, don't update game elements
    if (this.pauseManager.isPauseActive()) {
      return;
    }

    // Update the duck
    this.duck.update();

    // Update river background
    this.riverManager.update(this.pauseManager.isPauseActive());

    // Update obstacles
    this.obstacleManager.update(this.pauseManager.isPauseActive());

    // Update jams
    this.jamManager.update(this.pauseManager.isPauseActive());
  }

  private collectJam(value: number): void {
    this.scoreManager.incrementJams(value);
    this.sound.play("quack", { volume: 0.1 });
  }

  private handleCollision(duck: Duck, _obstacle: Obstacle): void {
    if (this.gameOver) return;

    this.gameOver = true;

    // Stop jams and obstacles
    this.jamManager.setGameOver(true);

    // Stop the music
    this.bgMusic.stop();

    // Stop the duck
    duck.setVelocity(0, 0);

    // Show game over screen
    this.gameOverManager.showGameOver(
      0,
      this.scoreManager.getJams(),
      this.restartGame.bind(this),
      this.goToMainMenu.bind(this),
    );
  }

  private restartGame(): void {
    // Stop any existing music that might be playing
    this.sound.stopAll();

    // Reset game state
    this.gameOver = false;

    // Reset jam manager
    this.jamManager.reset();

    // Restart the scene
    this.scene.restart();
  }

  private goToMainMenu(): void {
    // Stop all sounds
    this.sound.stopAll();

    // Go to main menu
    this.scene.start("MainMenuScene");
  }
}
