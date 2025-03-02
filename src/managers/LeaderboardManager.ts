import Phaser from "phaser";

// Interface for score entry
interface LeaderboardEntry {
  score: number;
  date: string;
}

export class LeaderboardManager {
  private scene: Phaser.Scene;
  private leaderboardEntries: LeaderboardEntry[] = [];
  private readonly LOCAL_STORAGE_KEY = "duck-rift-leaderboard";
  private readonly MAX_ENTRIES = 5;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadLeaderboard();
  }

  private loadLeaderboard(): void {
    try {
      const savedData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (savedData) {
        this.leaderboardEntries = JSON.parse(savedData);
      }
    } catch (error) {
      console.error("Error loading leaderboard data:", error);
      this.leaderboardEntries = [];
    }
  }

  private saveLeaderboard(): void {
    try {
      localStorage.setItem(
        this.LOCAL_STORAGE_KEY,
        JSON.stringify(this.leaderboardEntries),
      );
    } catch (error) {
      console.error("Error saving leaderboard data:", error);
    }
  }

  addScore(score: number): boolean {
    // Create new entry with current date
    const newEntry: LeaderboardEntry = {
      score,
      date: new Date().toLocaleDateString(),
    };

    // Add the new score
    this.leaderboardEntries.push(newEntry);

    // Sort by score (highest first)
    this.leaderboardEntries.sort((a, b) => b.score - a.score);

    // Limit to maximum number of entries
    if (this.leaderboardEntries.length > this.MAX_ENTRIES) {
      this.leaderboardEntries = this.leaderboardEntries.slice(
        0,
        this.MAX_ENTRIES,
      );
    }

    // Save updated leaderboard
    this.saveLeaderboard();

    // Return true if the score made it to the leaderboard
    return this.leaderboardEntries.some((entry) => entry.score === score);
  }

  displayLeaderboard(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Create title text
    const titleText = this.scene.add.text(0, 0, "LEADERBOARD", {
      fontSize: "28px",
      color: "#FFD700",
      stroke: "#000",
      strokeThickness: 4,
    });
    titleText.setOrigin(0.5, 0);
    container.add(titleText);

    // Display each score entry
    let yOffset = 40;

    if (this.leaderboardEntries.length === 0) {
      const noScoresText = this.scene.add.text(0, yOffset, "No scores yet!", {
        fontSize: "20px",
        color: "#FFFFFF",
        stroke: "#000",
        strokeThickness: 3,
      });
      noScoresText.setOrigin(0.5, 0);
      container.add(noScoresText);
    } else {
      this.leaderboardEntries.forEach((entry, index) => {
        const scoreText = this.scene.add.text(
          0,
          yOffset,
          `${index + 1}. ${entry.score} jams - ${entry.date}`,
          {
            fontSize: "20px",
            color: index === 0 ? "#FFD700" : "#FFFFFF",
            stroke: "#000",
            strokeThickness: 3,
          },
        );
        scoreText.setOrigin(0.5, 0);
        container.add(scoreText);
        yOffset += 30;
      });
    }

    return container;
  }

  getLeaderboardEntries(): LeaderboardEntry[] {
    return [...this.leaderboardEntries];
  }

  getHighScore(): number {
    if (this.leaderboardEntries.length === 0) return 0;
    return this.leaderboardEntries[0].score;
  }
}
