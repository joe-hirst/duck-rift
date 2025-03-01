import Phaser from "phaser";

export class ScoreManager {
  private scene: Phaser.Scene;
  private score: number = 0;
  private jams: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private jamImage!: Phaser.GameObjects.Image;
  private jamText!: Phaser.GameObjects.Text;
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
    this.scoreText.setDepth(100); // Set high depth to ensure visibility

    // Setup jam display
    this.jamImage = this.scene.add.image(16, 64, "jam-word");
    this.jamImage.setOrigin(0, 0.5);
    this.jamImage.setScale(0.03); // Make it 50% of original size
    this.jamImage.setDepth(100);

    // Add counter for jams
    this.jamText = this.scene.add.text(
      this.jamImage.displayWidth + 15,
      48,
      ": 0",
      {
        fontSize: "32px",
        color: "#FFD700",
        stroke: "#000",
        strokeThickness: 4,
      }
    );
    this.jamText.setDepth(100); // Set high depth to ensure visibility

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

  // Stop score timer on game over
  stopScoreTimer(): void {
    if (this.scoreTimer) {
      this.scoreTimer.paused = true;
    }
  }

  incrementScore(amount: number = 1): void {
    this.score += amount;
    this.updateScoreDisplay();
  }

  private updateScoreDisplay(): void {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  incrementCoins(amount: number = 1): void {
    this.jams += amount;
    this.updateJamDisplay();

    // Add bonus score for collecting jams
    this.incrementScore(amount * 10);
  }

  private updateJamDisplay(): void {
    this.jamText.setText(`: ${this.jams}`);
  }

  getScore(): number {
    return this.score;
  }

  getCoins(): number {
    return this.jams;
  }

  reset(): void {
    this.score = 0;
    this.jams = 0;
    this.updateScoreDisplay();
    this.updateJamDisplay();

    // Re-apply depth to ensure visibility
    if (this.scoreText) this.scoreText.setDepth(100);
    if (this.jamImage) this.jamImage.setDepth(100);
    if (this.jamText) this.jamText.setDepth(100);

    // Unpause the score timer
    if (this.scoreTimer) {
      this.scoreTimer.paused = false;
    }
  }
}
