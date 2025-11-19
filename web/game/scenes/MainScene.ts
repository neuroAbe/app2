import Phaser from 'phaser';
import Player from '../sprites/Player';

export default class MainScene extends Phaser.Scene {
  private player?: Player;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // For now, we'll create simple placeholder graphics
    // Later we'll replace these with actual sprite sheets
    this.createPlaceholderAssets();
  }

  create() {
    // Set world bounds
    this.physics.world.setBounds(0, 0, 1600, 1200);

    // Create a simple town background
    this.createTownBackground();

    // Create player at center
    this.player = new Player(this, 400, 300);

    // Set up camera to follow player
    this.cameras.main.setBounds(0, 0, 1600, 1200);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // Set up input
    this.cursors = this.input.keyboard?.createCursorKeys();

    if (this.input.keyboard) {
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Add welcome text
    const text = this.add.text(400, 100, 'Welcome to PixelMatch!', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
    text.setScrollFactor(0);
    text.setOrigin(0.5);
  }

  update() {
    if (this.player && this.cursors) {
      this.player.update(this.cursors, this.wasd);
    }
  }

  private createPlaceholderAssets() {
    // Create a simple colored square for the player
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  private createTownBackground() {
    // Create a simple grid-based town
    const tileSize = 64;
    const cols = 25;
    const rows = 19;

    // Create grass background
    const graphics = this.add.graphics();
    graphics.fillStyle(0x90EE90, 1);
    graphics.fillRect(0, 0, cols * tileSize, rows * tileSize);

    // Create some paths
    graphics.fillStyle(0xD2B48C, 1);

    // Horizontal path
    graphics.fillRect(0, 280, cols * tileSize, tileSize * 2);

    // Vertical path
    graphics.fillRect(380, 0, tileSize * 2, rows * tileSize);

    // Add some buildings (simple rectangles for now)
    this.createBuilding(200, 100, 150, 120, 0x8B4513);
    this.createBuilding(600, 100, 180, 140, 0xA0522D);
    this.createBuilding(200, 450, 140, 100, 0x654321);
    this.createBuilding(650, 500, 160, 120, 0x8B4513);

    // Add collision for buildings
    this.createBuildingCollision(200, 100, 150, 120);
    this.createBuildingCollision(600, 100, 180, 140);
    this.createBuildingCollision(200, 450, 140, 100);
    this.createBuildingCollision(650, 500, 160, 120);
  }

  private createBuilding(x: number, y: number, width: number, height: number, color: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(x, y, width, height);

    // Add roof
    graphics.fillStyle(0x8B0000, 1);
    graphics.fillTriangle(
      x - 10, y,
      x + width / 2, y - 30,
      x + width + 10, y
    );

    // Add door
    graphics.fillStyle(0x4B2F0D, 1);
    graphics.fillRect(x + width / 2 - 15, y + height - 35, 30, 35);

    // Add window
    graphics.fillStyle(0x87CEEB, 1);
    graphics.fillRect(x + 20, y + 30, 25, 25);
    graphics.fillRect(x + width - 45, y + 30, 25, 25);
  }

  private createBuildingCollision(x: number, y: number, width: number, height: number) {
    const building = this.add.rectangle(x + width / 2, y + height / 2, width, height);
    this.physics.add.existing(building, true); // true = static body

    if (this.player) {
      this.physics.add.collider(this.player, building);
    }
  }
}
