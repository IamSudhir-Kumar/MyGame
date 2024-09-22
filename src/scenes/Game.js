import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");
    this.map = null;
    this.stages = [];
    this.score = 0;
    this.scoreText = null;
    this.timer = null;
    this.timerText = null;
    this.gameOver = false;
    this.pinch = {
      active: false,
      initialDistance: 0,
      initialZoom: 0,
    };
    this.drag = {
      active: false,
      startX: 0,
      startY: 0,
    };
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("background", "Map3k.jpg");
    this.load.image("stag1", "Stag1.png");
    this.load.image("stag2", "Stag2.png");
    this.load.image("stag3", "Stag3.png");
    this.load.image("stag4", "Stag4.png");
    this.load.image("stag5", "Stag5.png");
  }

  create() {
    // Add background image (map)
    this.map = this.add.image(0, 0, "background").setOrigin(0, 0);

    // Set camera bounds to the full map size
    this.cameras.main.setBounds(0, 0, this.map.width, this.map.height);

    // Center the camera on the map
    this.cameras.main.centerOn(this.map.width / 2, this.map.height / 2);
    this.cameras.main.zoom = 0.5;

    // Enable multi-touch
    this.input.addPointer(1);

    this.input.on("pointerdown", this.onPointerDown, this);
    this.input.on("pointermove", this.onPointerMove, this);
    this.input.on("pointerup", this.onPointerUp, this);
    this.input.on("wheel", this.onWheel, this);

    // Add stages
    this.addStages();

    // Add score text
    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontSize: "32px",
      fill: "#fff",
    });
    this.scoreText.setScrollFactor(0);

    // Add timer
    this.timerText = this.add.text(10, 50, "Time: 45", {
      fontSize: "32px",
      fill: "#fff",
    });
    this.timerText.setScrollFactor(0);

    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  addStages() {
    // Define stage positions (x, y coordinates on the map) and scales
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

    this.score += 1;
    this.scoreText.setText("Score: " + this.score);

    // Make the stage uninteractable and change its appearance
    stage.disableInteractive();
    stage.setTint(0x808080); // Gray out the stage

    // Light up the corresponding stag icon
    const stagIcon = document.getElementById(`stag-icon-${index + 1}`);
    if (stagIcon) {
      stagIcon.style.opacity = 1;
      stagIcon.style.filter = "none";
      stagIcon.style.border = "2px solid gold";
    }

    // Check if all stages are found
    if (this.score === this.stages.length) {
      this.endGame(true);
    }
  }

  updateTimer() {
    if (this.gameOver) return;

    // Get the current time from the HTML
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
    this.timer.remove();

    // Save score and remaining time to local storage
    const timeRemaining = document.getElementById("time").innerText;
    localStorage.setItem("finalScore", this.score);
    localStorage.setItem("remainingTime", timeRemaining);

    let message = userWon
      ? `You found all the stags!`
      : `Time's up! You couldn't find all stags.`;

    // Display game over message
    let gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "GAME OVER",
      { fontSize: "64px", fill: "#fff" }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    // Display final message
    let finalMessageText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 70,
      message,
      { fontSize: "32px", fill: "#fff" }
    );
    finalMessageText.setOrigin(0.5);
    finalMessageText.setScrollFactor(0);

    // Display final score
    let finalScoreText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 120,
      "Final Score: " + this.score,
      { fontSize: "32px", fill: "#fff" }
    );
    finalScoreText.setOrigin(0.5);
    finalScoreText.setScrollFactor(0);
  }

  onPointerDown(pointer) {
    if (this.gameOver) return;

    if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
      // Start pinch zoom
      this.pinch.active = true;
      this.pinch.initialDistance = Phaser.Math.Distance.Between(
        this.input.pointer1.x,
        this.input.pointer1.y,
        this.input.pointer2.x,
        this.input.pointer2.y
      );
      this.pinch.initialZoom = this.cameras.main.zoom;
    } else if (!this.pinch.active) {
      // Start drag
      this.drag.active = true;
      this.drag.startX =
        this.cameras.main.scrollX + pointer.x / this.cameras.main.zoom;
      this.drag.startY =
        this.cameras.main.scrollY + pointer.y / this.cameras.main.zoom;
    }
  }

  onPointerMove(pointer) {
    if (this.gameOver) return;

    if (
      this.pinch.active &&
      this.input.pointer1.isDown &&
      this.input.pointer2.isDown
    ) {
      // Handle pinch zoom
      const currentDistance = Phaser.Math.Distance.Between(
        this.input.pointer1.x,
        this.input.pointer1.y,
        this.input.pointer2.x
      );

      const zoomFactor = currentDistance / this.pinch.initialDistance;
      const newZoom = this.pinch.initialZoom * zoomFactor;
      this.setZoom(newZoom);
    } else if (this.drag.active) {
      // Handle drag
      const dragX = this.drag.startX - pointer.x / this.cameras.main.zoom;
      const dragY = this.drag.startY - pointer.y / this.cameras.main.zoom;
      this.cameras.main.scrollX = dragX;
      this.cameras.main.scrollY = dragY;
    }
  }

  onPointerUp() {
    this.pinch.active = false;
    this.drag.active = false;
  }

  onWheel(event) {
    if (this.gameOver) return;

    // Handle mouse wheel zoom
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = this.cameras.main.zoom * zoomFactor;
    this.setZoom(newZoom);
  }

  setZoom(newZoom) {
    // Apply zoom with min and max limits
    const clampedZoom = Phaser.Math.Clamp(newZoom, 0.5, 3);

    // Get current center point
    const centerX = this.cameras.main.midPoint.x;
    const centerY = this.cameras.main.midPoint.y;

    // Set new zoom
    this.cameras.main.setZoom(clampedZoom);

    // Adjust scroll to maintain center point
    this.cameras.main.centerOn(centerX, centerY);
  }
}
