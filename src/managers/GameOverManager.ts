import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";

export class GameOverManager {
  private scene: Phaser.Scene;
  private gameOverText!: Phaser.GameObjects.Text;
  private finalScoreText!: Phaser.GameObjects.Text;
  private jamsCollectedText!: Phaser.GameObjects.Text;
  private retryText!: Phaser.GameObjects.Text;
  private menuText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showGameOver(
    score: number,
    coins: number,
    onRetry: () => void,
    onMainMenu: () => void,
  ): void {
    // Show game over text
    this.gameOverText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 30,
      "GAME OVER",
      {
        fontSize: "64px",
        color: "#ff0000",
        stroke: "#000",
        strokeThickness: 6,
      },
    );
    this.gameOverText.setOrigin(0.5);

    // Show score
    this.finalScoreText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 30,
      `Final Score: ${score}`,
      {
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4,
      },
    );
    this.finalScoreText.setOrigin(0.5);

    // Show jams collected
    this.jamsCollectedText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 70,
      `Jams Collected: ${coins}`,
      {
        fontSize: "28px",
        color: "#FFD700",
        stroke: "#000",
        strokeThickness: 4,
      },
    );
    this.jamsCollectedText.setOrigin(0.5);

    // Show retry text
    this.retryText = this.scene.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 120,
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
      GAME_HEIGHT / 2 + 160,
      "Press M for main menu",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4,
      },
    );
    this.menuText.setOrigin(0.5);

    // Add input handlers
    if (this.scene.input && this.scene.input.keyboard) {
      // Space key for retry
      this.scene.input.keyboard.once("keydown-SPACE", onRetry);

      // M key for main menu
      this.scene.input.keyboard.once("keydown-M", onMainMenu);
    }
  }

  cleanup(): void {
    if (this.gameOverText) this.gameOverText.destroy();
    if (this.finalScoreText) this.finalScoreText.destroy();
    if (this.jamsCollectedText) this.jamsCollectedText.destroy();
    if (this.retryText) this.retryText.destroy();
    if (this.menuText) this.menuText.destroy();
  }
}
