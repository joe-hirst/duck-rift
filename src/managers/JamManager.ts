import Phaser from "phaser";
import { Duck } from "../objects/Duck";
import { Jam } from "../objects/Jam";
import { GAME_SPEED } from "../config";

export class JamManager {
  private scene: Phaser.Scene;
  private jams!: Phaser.Physics.Arcade.Group;
  private jamTimer!: Phaser.Time.TimerEvent;
  private onCollect: (value: number) => void;
  private gameOver: boolean = false;

  constructor(scene: Phaser.Scene, onCollect: (value: number) => void) {
    this.scene = scene;
    this.onCollect = onCollect;
  }

  preload(): void {
    Jam.preloadAssets(this.scene);
  }

  create(duck: Duck, leftEdge: number, riverbedWidth: number): void {
    this.jams = this.scene.physics.add.group({
      classType: Jam,
    });

    // Setup jam spawning timer (less frequent than obstacles)
    this.jamTimer = this.scene.time.addEvent({
      delay: 2000,
      callback: () => this.spawnJam(leftEdge, riverbedWidth),
      callbackScope: this,
      loop: true,
    });

    // Setup collision detection with higher priority for reliable detection
    this.scene.physics.add.overlap(
      duck,
      this.jams,
      this.handleCollection,
      undefined,
      this,
    );
  }

  update(isPaused: boolean): void {
    if (this.gameOver || isPaused) return;

    this.jams.getChildren().forEach((child) => {
      const jam = child as Jam;

      if (jam.body && jam.body.velocity.y === 0) {
        jam.body.velocity.y = GAME_SPEED;
      }

      // Manually check for overlaps with the duck to ensure jams are collected
      this.scene.children.getAll().forEach((sceneChild) => {
        if (sceneChild instanceof Duck && jam.active) {
          const duck = sceneChild as Duck;
          if (
            Phaser.Geom.Intersects.RectangleToRectangle(
              duck.getBounds(),
              jam.getBounds(),
            )
          ) {
            this.handleCollection(duck, jam);
          }
        }
      });

      jam.update();
    });
  }

  private spawnJam(leftEdge: number, riverbedWidth: number): void {
    if (this.gameOver) return;

    const x = Phaser.Math.Between(leftEdge + 30, leftEdge + riverbedWidth - 30);
    const jam = new Jam(this.scene, x);

    this.jams.add(jam);
    jam.create();

    if (jam.body) {
      jam.body.reset(x, -50);
      jam.body.velocity.y = GAME_SPEED;
      jam.body.enable = true;
    }
  }

  private handleCollection = (duck: unknown, jamObj: unknown): void => {
    const jam = jamObj as Jam;
    if (jam && !jam.getData("collected")) {
      // Mark as collected to prevent multiple collision calls
      jam.setData("collected", true);
      // Ensure collection happens
      this.onCollect(1);
      jam.destroy();
    }
  };

  getJamTimer(): Phaser.Time.TimerEvent {
    return this.jamTimer;
  }

  setGameOver(isGameOver: boolean): void {
    this.gameOver = isGameOver;
  }

  stopJams(): void {
    this.jamTimer.remove();
    this.jams.setVelocityY(0);
  }

  reset(): void {
    this.gameOver = false;
    this.jams.clear(true, true);
  }
}