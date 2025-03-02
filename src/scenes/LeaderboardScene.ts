import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../config";
import { LeaderboardManager } from "../managers/LeaderboardManager";

export class LeaderboardScene extends Phaser.Scene {
  private leaderboardManager!: LeaderboardManager;

  constructor() {
    super("LeaderboardScene");
  }

  create() {
    // Initialize leaderboard manager
    this.leaderboardManager = new LeaderboardManager(this);

    // Add themed background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x5fbedf, 0x5fbedf, 0x4488cc, 0x4488cc, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(-1);

    // Add title
    const titleText = this.add.text(GAME_WIDTH / 2, 80, "LEADERBOARD", {
      fontSize: "48px",
      color: "#FFD700",
      stroke: "#000000",
      strokeThickness: 6,
    });
    titleText.setOrigin(0.5);

    // Display leaderboard
    const entries = this.leaderboardManager.getLeaderboardEntries();

    if (entries.length === 0) {
      // Show no scores message
      const noScoresText = this.add.text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        "No scores yet!\nPlay a game to set a score.",
        {
          fontSize: "32px",
          color: "#FFFFFF",
          stroke: "#000",
          strokeThickness: 4,
          align: "center",
        },
      );
      noScoresText.setOrigin(0.5);
    } else {
      // Display scores with more detailed styling
      entries.forEach((entry, index) => {
        const yPos = 180 + index * 60;
        const color = index === 0 ? "#FFD700" : "#FFFFFF";

        // Rank
        const rankText = this.add.text(
          GAME_WIDTH / 2 - 200,
          yPos,
          `#${index + 1}`,
          {
            fontSize: "36px",
            color,
            stroke: "#000",
            strokeThickness: 4,
          },
        );
        rankText.setOrigin(0.5);

        // Score
        const scoreText = this.add.text(
          GAME_WIDTH / 2,
          yPos,
          `${entry.score} jams`,
          {
            fontSize: "36px",
            color,
            stroke: "#000",
            strokeThickness: 4,
          },
        );
        scoreText.setOrigin(0.5);

        // Date
        const dateText = this.add.text(GAME_WIDTH / 2 + 200, yPos, entry.date, {
          fontSize: "24px",
          color,
          stroke: "#000",
          strokeThickness: 3,
        });
        dateText.setOrigin(0.5);
      });
    }

    // Add back button
    const backButton = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 100,
      "BACK TO MENU",
      {
        fontSize: "32px",
        color: "#FFFFFF",
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
    backButton.setOrigin(0.5);
    backButton.setInteractive();

    // Add hover effect
    backButton.on("pointerover", () => {
      backButton.setBackgroundColor("#66aacc");
    });
    backButton.on("pointerout", () => {
      backButton.setBackgroundColor("#4488aa");
    });

    // Add click effect
    backButton.on("pointerdown", () => {
      backButton.setBackgroundColor("#336688");
    });

    // Add back button functionality
    backButton.on("pointerup", () => {
      this.scene.start("MainMenuScene");
    });

    // Add ESC key to go back to main menu
    this.input.keyboard?.on("keydown-ESC", () => {
      this.scene.start("MainMenuScene");
    });
  }
}
