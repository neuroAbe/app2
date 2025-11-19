import Phaser from 'phaser';
import Player from '../sprites/Player';

interface UserData {
  id: string;
  display_name: string;
  position_x: number;
  position_y: number;
  avatar_color: string;
}

export default class MainScene extends Phaser.Scene {
  private player?: Player;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private userData?: UserData;
  private lastPositionSave: number = 0;
  private positionSaveInterval: number = 3000; // Save every 3 seconds
  private nearbyPlayers: Map<string, Phaser.GameObjects.Container> = new Map();
  private encounterCheckTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'MainScene' });
  }

  async init(data: { userData?: UserData }) {
    this.userData = data.userData;
  }

  preload() {
    // For now, we'll create simple placeholder graphics
    // Later we'll replace these with actual sprite sheets
    this.createPlaceholderAssets();
  }

  async create() {
    // Set world bounds
    this.physics.world.setBounds(0, 0, 1600, 1200);

    // Create a simple town background
    this.createTownBackground();

    // Load user data if not passed in init
    if (!this.userData) {
      await this.loadUserData();
    }

    // Create player at saved position or default
    const startX = this.userData?.position_x || 400;
    const startY = this.userData?.position_y || 300;
    this.player = new Player(this, startX, startY);

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

    // Add welcome text with user's name
    const welcomeText = this.userData?.display_name
      ? `Welcome, ${this.userData.display_name}!`
      : 'Welcome to PixelMatch!';

    const text = this.add.text(400, 100, welcomeText, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
    text.setScrollFactor(0);
    text.setOrigin(0.5);

    // Start encounter check timer (every 2 seconds)
    this.encounterCheckTimer = this.time.addEvent({
      delay: 2000,
      callback: this.checkForNearbyPlayers,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    if (this.player && this.cursors) {
      const previousX = this.player.x;
      const previousY = this.player.y;

      this.player.update(this.cursors, this.wasd);

      // Check if player moved and save position periodically
      if (
        (previousX !== this.player.x || previousY !== this.player.y) &&
        this.time.now - this.lastPositionSave > this.positionSaveInterval
      ) {
        this.savePlayerPosition();
        this.lastPositionSave = this.time.now;
      }
    }
  }

  private async loadUserData() {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        this.userData = {
          id: data.profile.id,
          display_name: data.profile.display_name,
          position_x: data.profile.position_x,
          position_y: data.profile.position_y,
          avatar_color: data.profile.avatar_color,
        };
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  private async savePlayerPosition() {
    if (!this.player || !this.userData) return;

    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_x: Math.round(this.player.x),
          position_y: Math.round(this.player.y),
        }),
      });
    } catch (error) {
      console.error('Failed to save position:', error);
    }
  }

  private async checkForNearbyPlayers() {
    try {
      const response = await fetch('/api/encounters/nearby');
      if (response.ok) {
        const data = await response.json();
        this.updateNearbyPlayers(data.nearbyUsers || []);

        // Trigger encounter if user is very close (within 50px)
        const veryCloseUsers = data.nearbyUsers?.filter(
          (u: any) => u.distance < 50
        );
        if (veryCloseUsers && veryCloseUsers.length > 0) {
          this.triggerEncounter(veryCloseUsers[0]);
        }
      }
    } catch (error) {
      console.error('Failed to check for nearby players:', error);
    }
  }

  private updateNearbyPlayers(nearbyUsers: any[]) {
    // Remove players that are no longer nearby
    const currentUserIds = new Set(nearbyUsers.map((u) => u.id));
    for (const [userId, playerContainer] of this.nearbyPlayers.entries()) {
      if (!currentUserIds.has(userId)) {
        playerContainer.destroy();
        this.nearbyPlayers.delete(userId);
      }
    }

    // Add or update nearby players
    for (const user of nearbyUsers) {
      if (this.nearbyPlayers.has(user.id)) {
        // Update existing player position
        const playerContainer = this.nearbyPlayers.get(user.id)!;
        playerContainer.setPosition(user.position_x, user.position_y);
      } else {
        // Create new player sprite
        const container = this.add.container(user.position_x, user.position_y);

        // Create colored circle for avatar
        const avatar = this.add.circle(
          0,
          0,
          16,
          parseInt(user.avatar_color.replace('#', ''), 16)
        );

        // Add name label
        const nameLabel = this.add.text(0, 25, user.display_name, {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 4, y: 2 },
        });
        nameLabel.setOrigin(0.5);

        container.add([avatar, nameLabel]);
        this.nearbyPlayers.set(user.id, container);
      }
    }
  }

  private triggerEncounter(user: any) {
    // Pause encounter checks temporarily
    this.encounterCheckTimer?.paused = true;

    // Dispatch custom event to show encounter modal
    window.dispatchEvent(
      new CustomEvent('encounter-triggered', {
        detail: { user },
      })
    );

    // Resume checks after 10 seconds
    this.time.delayedCall(10000, () => {
      if (this.encounterCheckTimer) {
        this.encounterCheckTimer.paused = false;
      }
    });
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
    graphics.fillStyle(0x90ee90, 1);
    graphics.fillRect(0, 0, cols * tileSize, rows * tileSize);

    // Create some paths
    graphics.fillStyle(0xd2b48c, 1);

    // Horizontal path
    graphics.fillRect(0, 280, cols * tileSize, tileSize * 2);

    // Vertical path
    graphics.fillRect(380, 0, tileSize * 2, rows * tileSize);

    // Add some buildings (simple rectangles for now)
    this.createBuilding(200, 100, 150, 120, 0x8b4513);
    this.createBuilding(600, 100, 180, 140, 0xa0522d);
    this.createBuilding(200, 450, 140, 100, 0x654321);
    this.createBuilding(650, 500, 160, 120, 0x8b4513);

    // Add collision for buildings
    this.createBuildingCollision(200, 100, 150, 120);
    this.createBuildingCollision(600, 100, 180, 140);
    this.createBuildingCollision(200, 450, 140, 100);
    this.createBuildingCollision(650, 500, 160, 120);
  }

  private createBuilding(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(x, y, width, height);

    // Add roof
    graphics.fillStyle(0x8b0000, 1);
    graphics.fillTriangle(
      x - 10,
      y,
      x + width / 2,
      y - 30,
      x + width + 10,
      y
    );

    // Add door
    graphics.fillStyle(0x4b2f0d, 1);
    graphics.fillRect(x + width / 2 - 15, y + height - 35, 30, 35);

    // Add window
    graphics.fillStyle(0x87ceeb, 1);
    graphics.fillRect(x + 20, y + 30, 25, 25);
    graphics.fillRect(x + width - 45, y + 30, 25, 25);
  }

  private createBuildingCollision(
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const building = this.add.rectangle(
      x + width / 2,
      y + height / 2,
      width,
      height
    );
    this.physics.add.existing(building, true); // true = static body

    if (this.player) {
      this.physics.add.collider(this.player, building);
    }
  }
}
