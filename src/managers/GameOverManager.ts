import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";
import { LeaderboardManager } from "./LeaderboardManager";

export class GameOverManager {
  private scene: Phaser.Scene;
  private gameOverText!: Phaser.GameObjects.Text;
  private jamsCollectedText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private retryText!: Phaser.GameObjects.Text;
  private menuText!: Phaser.GameObjects.Text;
  private leaderboardText!: Phaser.GameObjects.Text;
  private leaderboardManager: LeaderboardManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.leaderboardManager = new LeaderboardManager(scene);
  }

  showGameOver(
    score: number,
    jams: number,
    onRetry: () => void,
    onMainMenu: () => void,
  ): void {
    // Add score to leaderboard
    const isHighScore = this.leaderboardManager.addScore(jams);
    const highScore = this.leaderboardManager.getHighScore();

    // Show game over text
    this.gameOverText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 150,
      "GAME OVER",
      {
        fontSize: "64px",
        color: "#ff0000",
        stroke: "#000",
        strokeThickness: 6,
      },
    );
    this.gameOverText.setOrigin(0.5);

    // Show jams collected
    this.jamsCollectedText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 80,
      `Jams Collected: ${jams}`,
      {
        fontSize: "32px",
        color: "#FFD700",
        stroke: "#000",
        strokeThickness: 4,
      },
    );
    this.jamsCollectedText.setOrigin(0.5);

    // Show high score text if this is a new high score
    if (isHighScore && jams === highScore) {
      this.highScoreText = this.scene.add.text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 30,
        "NEW HIGH SCORE!",
        {
          fontSize: "28px",
          color: "#FF00FF",
          stroke: "#000",
          strokeThickness: 4,
        },
      );
      this.highScoreText.setOrigin(0.5);
    }

    // Show retry text
    this.retryText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 40,
      "Press SPACE to retry",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4,
      },
    );
    this.retryText.setOrigin(0.5);

    // Show main menu text
    this.menuText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 80,
      "Press M for main menu",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4,
      },
    );
    this.menuText.setOrigin(0.5);

    // Show leaderboard option
    this.leaderboardText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 120,
      "Press L to view leaderboard",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4,
      },
    );
    this.leaderboardText.setOrigin(0.5);

    // Add input handlers
    if (this.scene.input && this.scene.input.keyboard) {
      // Space key for retry
      this.scene.input.keyboard.once("keydown-SPACE", onRetry);

      // M key for main menu
      this.scene.input.keyboard.once("keydown-M", onMainMenu);

      // L key for leaderboard
      this.scene.input.keyboard.once("keydown-L", () => {
        this.scene.scene.start("LeaderboardScene");
      });
    }
  }

  cleanup(): void {
    // Destroy all game over UI elements
    if (this.gameOverText) this.gameOverText.destroy();
    if (this.jamsCollectedText) this.jamsCollectedText.destroy();
    if (this.highScoreText) this.highScoreText.destroy();
    if (this.retryText) this.retryText.destroy();
    if (this.menuText) this.menuText.destroy();
    if (this.leaderboardText) this.leaderboardText.destroy();

    // Clear references to destroyed objects
    this.gameOverText = undefined as unknown as Phaser.GameObjects.Text;
    this.jamsCollectedText = undefined as unknown as Phaser.GameObjects.Text;
    this.highScoreText = undefined as unknown as Phaser.GameObjects.Text;
    this.retryText = undefined as unknown as Phaser.GameObjects.Text;
    this.menuText = undefined as unknown as Phaser.GameObjects.Text;
    this.leaderboardText = undefined as unknown as Phaser.GameObjects.Text;
  }
}
