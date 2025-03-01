import Phaser from "phaser";

export class ScoreManager {
  private scene: Phaser.Scene;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private scoreTimer!: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    // Setup score display
    this.scoreText = this.scene.add.text(16, 16, "Score: 0", {
      fontSize: "24px",
      color: "#fff",
      stroke: "#000",
      strokeThickness: 4,
    });

    // Start the score incrementing
    this.scoreTimer = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.incrementScore(1);
      },
      loop: true,
    });
  }

  // Used to pause the score timer when game is paused
  getScoreTimer(): Phaser.Time.TimerEvent {
    return this.scoreTimer;
  }

  incrementScore(amount: number = 1): void {
    this.score += amount;
    this.updateScoreDisplay();
  }

  private updateScoreDisplay(): void {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  getScore(): number {
    return this.score;
  }

  reset(): void {
    this.score = 0;
    this.updateScoreDisplay();
  }
}