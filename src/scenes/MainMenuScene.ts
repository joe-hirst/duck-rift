import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  preload() {
    // Load duck image in the main menu too for consistency
    this.load.image("duck", "/assets/duck.png");
  }

  create() {
    // Add title text
    const titleText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 3,
      "DUCK RIFT",
      {
        fontSize: "64px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      },
    );
    titleText.setOrigin(0.5);

    // Add start game button
    const startButton = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 50,
      "START GAME",
      {
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        backgroundColor: "#4488aa",
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10,
        },
      },
    );
    startButton.setOrigin(0.5);
    startButton.setInteractive();

    // Add hover effect
    startButton.on("pointerover", () => {
      startButton.setBackgroundColor("#66aacc");
    });
    startButton.on("pointerout", () => {
      startButton.setBackgroundColor("#4488aa");
    });

    // Add click effect
    startButton.on("pointerdown", () => {
      startButton.setBackgroundColor("#336688");
    });

    // Add start game functionality
    startButton.on("pointerup", () => {
      this.scene.start("GameScene");
    });

    // Add instructions text
    const instructionsText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 150,
      "Use LEFT and RIGHT arrows to steer the duck\nAvoid obstacles in the river!",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      },
    );
    instructionsText.setOrigin(0.5);

    // Add themed background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x4488cc, 0x4488cc, 0x336699, 0x336699, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(-1);

    // Add a simple animation to the title
    this.tweens.add({
      targets: titleText,
      y: titleText.y - 10,
      duration: 1500,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }
}
