import Phaser from "phaser";
import { Duck } from "../objects/Duck";
import { Coin } from "../objects/Coin";
import { GAME_SPEED } from "../config";

export class CoinManager {
  private scene: Phaser.Scene;
  private coins!: Phaser.Physics.Arcade.Group;
  private coinTimer!: Phaser.Time.TimerEvent;
  private onCollect: (value: number) => void;
  private gameOver: boolean = false;

  constructor(scene: Phaser.Scene, onCollect: (value: number) => void) {
    this.scene = scene;
    this.onCollect = onCollect;
  }

  preload(): void {
    Coin.preloadAssets(this.scene);
  }

  create(duck: Duck, leftEdge: number, riverbedWidth: number): void {
    this.coins = this.scene.physics.add.group({
      classType: Coin,
    });

    // Setup coin spawning timer (less frequent than obstacles)
    this.coinTimer = this.scene.time.addEvent({
      delay: 2000,
      callback: () => this.spawnCoin(leftEdge, riverbedWidth),
      callbackScope: this,
      loop: true,
    });

    // Setup collision detection
    this.scene.physics.add.overlap(
      duck,
      this.coins,
      this.handleCollection,
      undefined,
      this
    );
  }

  update(isPaused: boolean): void {
    if (this.gameOver || isPaused) return;

    this.coins.getChildren().forEach((child) => {
      const coin = child as Coin;
      
      if (coin.body && coin.body.velocity.y === 0) {
        coin.body.velocity.y = GAME_SPEED;
      }
      
      coin.update();
    });
  }

  private spawnCoin(leftEdge: number, riverbedWidth: number): void {
    if (this.gameOver) return;

    const x = Phaser.Math.Between(leftEdge + 30, leftEdge + riverbedWidth - 30);
    const coin = new Coin(this.scene, x);
    
    this.coins.add(coin);
    coin.create();
    
    if (coin.body) {
      coin.body.reset(x, -50);
      coin.body.velocity.y = GAME_SPEED;
      coin.body.enable = true;
    }
  }

  private handleCollection = (duck: unknown, coinObj: unknown): void => {
    const coin = coinObj as Coin;
    if (coin) {
      coin.destroy();
      this.onCollect(1);
    }
  }

  getCoinTimer(): Phaser.Time.TimerEvent {
    return this.coinTimer;
  }

  setGameOver(isGameOver: boolean): void {
    this.gameOver = isGameOver;
  }

  stopCoins(): void {
    this.coinTimer.remove();
    this.coins.setVelocityY(0);
  }

  reset(): void {
    this.gameOver = false;
    this.coins.clear(true, true);
  }
}