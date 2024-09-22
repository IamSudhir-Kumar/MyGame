// game.js
import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");
    this.map = null;
    this.stages = [];
    this.score = 0;
    this.timer = null;
    this.gameOver = false;
    this.isPaused = false;
    this.isDragging = false;
    this.lastPointerPosition = { x: 0, y: 0 };
    this.pointers = [];
    this.initialPinchDistance = 0;
    this.initialZoom = 0.5;
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("background", "Map3k.jpg");
    this.load.image("stag1", "Stag1.png");
    this.load.image("stag2", "Stag2.png");
    this.load.image("stag3", "Stag3.png");
    this.load.image("stag4", "Stag4.png");
    this.load.image("stag5", "Stag5.png");
    // Load found stag images if different
    this.load.image("stag1_found", "Stag1.png");
    this.load.image("stag2_found", "Stag1.png");
    this.load.image("stag3_found", "Stag1.png");
    this.load.image("stag4_found", "Stag1.png");
    this.load.image("stag5_found", "Stag1.png");
  }

  create() {
    console.log("Game scene created");
    // Add background image (map)
    this.map = this.add.image(0, 0, "background").setOrigin(0, 0);

    // Set camera bounds to the full map size
    this.cameras.main.setBounds(0, 0, this.map.width, this.map.height);

    // Center the camera on the map
    this.cameras.main.centerOn(this.map.width / 2, this.map.height / 2);
    this.cameras.main.zoom = this.initialZoom;

    // Enable camera panning
    this.input.on('pointerdown', this.startDrag, this);
    this.input.on('pointerup', this.stopDrag, this);
    this.input.on('pointermove', this.onDrag, this);

    // Enable camera zooming with mouse wheel
    this.input.on('wheel', this.handleZoom, this);

    // Handle pinch-to-zoom
    this.input.addPointer(2); // Add support for 2 pointers (for multi-touch)
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.on('pointermove', this.onPointerMove, this);

    // Add stages
    this.addStages();

    // Timer and score are now in the HTML navbar, no need for canvas text
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Listen for pause and resume events
    this.events.on('pause', this.onPause, this);
    this.events.on('resume', this.onResume, this);
  }

  addStages() {
    const stageData = [
      { x: 2742, y: 694, scale: 0.3 },
      { x: 321, y: 671, scale: 0.4 },
      { x: 1255, y: 916, scale: 0.4 },
      { x: 1174, y: 1535, scale: 0.29 },
      { x: 2866, y: 1738, scale: 0.3 },
    ];

    for (let i = 1; i <= 5; i++) {
      const data = stageData[i - 1];
      const stage = this.add.image(data.x, data.y, `stag${i}`);
      stage.setScale(data.scale);
      stage.setInteractive();
      stage.on("pointerdown", () => this.onStageClick(stage, i - 1));
      this.stages.push(stage);
    }
  }

  onStageClick(stage, index) {
    if (this.gameOver) return;
    if (stage.texture.key.includes('found')) return; // Prevent multiple clicks on the same stag

    this.score += 1;
    const stagIcon = document.getElementById(`stag-icon-${index + 1}`);
    if (stagIcon) {
      stagIcon.classList.add('found'); // Apply glowing effect via CSS
      stagIcon.classList.add('score-animate'); // Trigger score animation

      // Remove the animation class after animation completes
      stagIcon.addEventListener('animationend', () => {
        stagIcon.classList.remove('score-animate');
      });
    }

    // Change the stag image to indicate it has been found
    stage.setTexture(`stag${index + 1}_found`); // Ensure you have these textures loaded

    if (this.score === this.stages.length) {
      this.endGame(true);
    }
  }

  updateTimer() {
    if (this.gameOver || this.isPaused) return;

    let timeElement = document.getElementById("time");
    let timeLeft = parseInt(timeElement.innerText) - 1;
    timeElement.innerText = timeLeft.toString().padStart(2, "0");

    if (timeLeft <= 0) {
      this.endGame(false);
      timeElement.innerText = "Game Over";
    }
  }

  endGame(userWon) {
    this.gameOver = true;
    // Stop the timer
    this.timer.remove();

    // Display the game over modal
    const modal = document.getElementById('game-over-modal');
    const message = document.getElementById('game-over-message');
    const details = document.getElementById('game-over-details');

    if (userWon) {
      message.textContent = "Congratulations!";
      details.textContent = "You've found all the stags!";
    } else {
      message.textContent = "Game Over";
      details.textContent = "Time's up!";
    }

    modal.style.display = 'flex'; // Show the modal

    // Pause the game scene
    this.pauseGame();
  }

  pauseGame() {
    if (!this.isPaused) {
      this.scene.pause();
      this.isPaused = true;
      console.log("Game paused");
    }
  }

  resumeGame() {
    if (this.isPaused) {
      this.scene.resume();
      this.isPaused = false;
      console.log("Game resumed");
    }
  }

  onPause() {
    this.isPaused = true;
    console.log("Pause event received");
  }

  onResume() {
    this.isPaused = false;
    console.log("Resume event received");
  }

  // Dragging Methods
  startDrag(pointer) {
    if (this.isPaused) return;
    this.isDragging = true;
    this.lastPointerPosition = { x: pointer.x, y: pointer.y };
  }

  stopDrag(pointer) {
    this.isDragging = false;
  }

  onDrag(pointer) {
    if (!this.isDragging || this.isPaused) return;
    const dx = pointer.x - this.lastPointerPosition.x;
    const dy = pointer.y - this.lastPointerPosition.y;

    this.cameras.main.scrollX -= dx / this.cameras.main.zoom;
    this.cameras.main.scrollY -= dy / this.cameras.main.zoom;

    this.lastPointerPosition = { x: pointer.x, y: pointer.y };
  }

  // Zooming Method for Mouse Wheel
  handleZoom(pointer, gameObjects, deltaX, deltaY, deltaZ) {
    if (this.isPaused) return;

    const zoomStep = 0.1;
    if (deltaY > 0) {
      this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom - zoomStep, 0.5, 2);
    } else {
      this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom + zoomStep, 0.5, 2);
    }
  }

  // Pinch-to-Zoom Methods for Mobile
  onPointerDown(pointer) {
    this.pointers.push(pointer);
    if (this.pointers.length === 2) {
      // Calculate initial distance between two pointers
      const distance = Phaser.Math.Distance.Between(
        this.pointers[0].x, this.pointers[0].y,
        this.pointers[1].x, this.pointers[1].y
      );
      this.initialPinchDistance = distance;
      this.initialZoom = this.cameras.main.zoom;
    }
  }

  onPointerUp(pointer) {
    this.pointers = this.pointers.filter(p => p.id !== pointer.id);
  }

  onPointerMove(pointer) {
    if (this.pointers.length === 2) {
      const p1 = this.pointers[0];
      const p2 = this.pointers[1];

      // Get the distance between the two pointers
      const currentDistance = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
      console.log(`Current Distance: ${currentDistance}`);  // Debugging line

      // Calculate the scale factor based on the initial pinch distance
      const scaleFactor = currentDistance / this.initialPinchDistance;
      let newZoom = this.initialZoom * scaleFactor;

      // Clamp the new zoom to a reasonable range
      newZoom = Phaser.Math.Clamp(newZoom, 0.5, 2);

      // Apply the new zoom to the camera
      this.cameras.main.zoom = newZoom;
      console.log(`New Zoom: ${newZoom}`);  // Debugging line
    }
  }
}
