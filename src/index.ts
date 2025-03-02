import Phaser from "phaser";
import { GameConfig } from "./config";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { GameScene } from "./scenes/GameScene";
import { LeaderboardScene } from "./scenes/LeaderboardScene";

window.addEventListener("load", () => {
  // Create game instance
  new Phaser.Game({
    ...GameConfig,
    scene: [MainMenuScene, GameScene, LeaderboardScene],
  });
});
