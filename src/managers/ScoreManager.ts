import Phaser from "phaser";

export class ScoreManager {
  private scene: Phaser.Scene;
  private jams: number = 0;
  private jamImage!: Phaser.GameObjects.Image;
  private jamText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    // Setup jam display
    this.jamImage = this.scene.add.image(16, 32, "jam-word");
    this.jamImage.setOrigin(-0.58, 0);
    this.jamImage.setScale(0.033);
    this.jamImage.setDepth(100);

    // Add counter for jams
    this.jamText = this.scene.add.text(
      this.jamImage.displayWidth + 56,
      32,
      ": 0",
      {
        fontSize: "32px",
        color: "#FFDC77",
        stroke: "#000",
        strokeThickness: 4,
      }
    );
    this.jamText.setDepth(100); // Set high depth to ensure visibility
  }

  incrementJams(amount: number = 1): void {
    this.jams += amount;
    this.updateJamDisplay();
  }

  private updateJamDisplay(): void {
    this.jamText.setText(`: ${this.jams}`);
  }

  getJams(): number {
    return this.jams;
  }

  reset(): void {
    this.jams = 0;
    this.updateJamDisplay();

    // Re-apply depth to ensure visibility
    if (this.jamImage) this.jamImage.setDepth(100);
    if (this.jamText) this.jamText.setDepth(100);
  }
}
