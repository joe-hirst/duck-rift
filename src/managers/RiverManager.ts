import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";

export class RiverManager {
  private scene: Phaser.Scene;
  private riverBackground!: Phaser.GameObjects.TileSprite;
  private riverSpeed: number = 2;
  private riverBanks!: {
    left: Phaser.GameObjects.Rectangle;
    right: Phaser.GameObjects.Rectangle;
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preload(): void {
    // Create temporary graphics for the repeating river texture
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x5fbedf, 1); // Blue color for water
    graphics.fillRect(0, 0, 64, 64);

    // Add some wavy lines for water texture
    graphics.lineStyle(2, 0x4488cc, 0.5);
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
  }

  create(): void {
    // Create the scrolling river background
    this.riverBackground = this.scene.add.tileSprite(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      "river"
    );

    // Create river banks
    const bankWidth = 40;
    const bankColor = 0x5a9a68; // Green color for banks

    // Left bank
    const leftBank = this.scene.add.rectangle(
      bankWidth / 2,
      GAME_HEIGHT / 2,
      bankWidth,
      GAME_HEIGHT,
      bankColor
    );

    // Right bank
    const rightBank = this.scene.add.rectangle(
      GAME_WIDTH - bankWidth / 2,
      GAME_HEIGHT / 2,
      bankWidth,
      GAME_HEIGHT,
      bankColor
    );

    this.riverBanks = { left: leftBank, right: rightBank };

    // Add some details to the banks
    const bankDetail = this.scene.add.graphics();
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
  }

  update(isPaused: boolean): void {
    if (!isPaused) {
      // Scroll the river background
      this.riverBackground.tilePositionY -= this.riverSpeed;
    }
  }

  getRiverBounds(): { left: number; right: number } {
    return {
      left: this.riverBanks.left.width,
      right: GAME_WIDTH - this.riverBanks.right.width,
    };
  }

  increaseRiverSpeed(amount: number): void {
    this.riverSpeed += amount;
  }

  getLeftEdge(): number {
    return this.riverBanks.left.width;
  }

  getRiverbedWidth(): number {
    return (
      GAME_WIDTH - (this.riverBanks.left.width + this.riverBanks.right.width)
    );
  }

  reset(): void {
    this.riverSpeed = 2;
  }
}
