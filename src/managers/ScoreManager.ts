import Phaser from "phaser";

export class ScoreManager {
  private scene: Phaser.Scene;
  private score: number = 0;
  private coins: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
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

    // Setup coin display
    this.coinText = this.scene.add.text(16, 48, "Coins: 0", {
      fontSize: "24px",
      color: "#FFD700",
      stroke: "#000",
      strokeThickness: 4,
    });
    this.coinText.setDepth(100); // Set high depth to ensure visibility

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
    this.coins += amount;
    this.updateCoinDisplay();
    
    // Add bonus score for collecting coins
    this.incrementScore(amount * 10);
  }

  private updateCoinDisplay(): void {
    this.coinText.setText(`Coins: ${this.coins}`);
  }

  getScore(): number {
    return this.score;
  }

  getCoins(): number {
    return this.coins;
  }

  reset(): void {
    this.score = 0;
    this.coins = 0;
    this.updateScoreDisplay();
    this.updateCoinDisplay();
    
    // Re-apply depth to ensure visibility
    if (this.scoreText) this.scoreText.setDepth(100);
    if (this.coinText) this.coinText.setDepth(100);
    
    // Unpause the score timer
    if (this.scoreTimer) {
      this.scoreTimer.paused = false;
    }
  }
}