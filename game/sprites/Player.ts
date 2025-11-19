import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 160;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    this.setCollideWorldBounds(true);

    // Make the player slightly larger for better visibility
    this.setScale(1);
  }

  update(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    wasd?: {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    }
  ) {
    // Reset velocity
    this.setVelocity(0);

    // Horizontal movement
    if (cursors.left?.isDown || wasd?.A.isDown) {
      this.setVelocityX(-this.speed);
    } else if (cursors.right?.isDown || wasd?.D.isDown) {
      this.setVelocityX(this.speed);
    }

    // Vertical movement
    if (cursors.up?.isDown || wasd?.W.isDown) {
      this.setVelocityY(-this.speed);
    } else if (cursors.down?.isDown || wasd?.S.isDown) {
      this.setVelocityY(this.speed);
    }

    // Normalize diagonal movement
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.velocity.normalize().scale(this.speed);
    }
  }

  // Method to change player appearance
  public setPlayerColor(color: number) {
    this.setTint(color);
  }
}
