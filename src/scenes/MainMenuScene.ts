import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";
import { LeaderboardManager } from "../managers/LeaderboardManager";

export class MainMenuScene extends Phaser.Scene {
  private leaderboardManager!: LeaderboardManager;

  constructor() {
    super("MainMenuScene");
  }

  preload() {
    // Load duck image in the main menu too for consistency
    this.load.image("duck", "/assets/duck.png");
  }

  create() {
    // Initialize the leaderboard manager
    this.leaderboardManager = new LeaderboardManager(this);

    // Add themed background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x5fbedf, 0x5fbedf, 0x4488cc, 0x4488cc, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(-1);

    // Add title text
    const titleText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 4,
      "DUCK WATER RIFTING",
      {
        fontSize: "48px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      },
    );
    titleText.setOrigin(0.5);

    // Add start game button
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2, "START GAME", () => {
      this.scene.start("GameScene");
    });

    // Add leaderboard button
    this.createButton(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 80,
      "LEADERBOARD",
      () => {
        this.scene.start("LeaderboardScene");
      },
    );

    // Add instructions text
    const instructionsText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 100,
      "Use LEFT and RIGHT arrows to steer the duck\nAvoid obstacles and collect jam!",
      {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      },
    );
    instructionsText.setOrigin(0.5);

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

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void,
  ): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, text, {
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
    });

    button.setOrigin(0.5);
    button.setInteractive();

    // Add hover effect
    button.on("pointerover", () => {
      button.setBackgroundColor("#66aacc");
    });
    button.on("pointerout", () => {
      button.setBackgroundColor("#4488aa");
    });

    // Add click effect
    button.on("pointerdown", () => {
      button.setBackgroundColor("#336688");
    });

    // Add click functionality
    button.on("pointerup", callback);

    return button;
  }
}
