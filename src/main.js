// main.js
import Phaser from 'phaser';
import { Game as MainGame } from './scenes/Game';

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#66464',
    scale: {
        mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        MainGame
    ]
};

const gameInstance = new Phaser.Game(config);

// Function to check orientation and show/hide warning GIF
function checkOrientation() {
    const warningDiv = document.getElementById('orientation-warning');
    const timeElement = document.getElementById('time');
    const gameScene = gameInstance.scene.get('Game'); // Correctly retrieve the scene

    if (!gameScene) {
        console.error("Game scene not found");
        return;
    }

    // Determine if the device is in portrait mode
    const isPortrait = window.innerHeight > window.innerWidth;
    console.log(`Orientation Check: isPortrait = ${isPortrait}`);

    if (isPortrait) {
        // Show the warning GIF
        warningDiv.style.visibility = 'visible';
        console.log("Orientation is portrait: Showing warning GIF and pausing the game.");

        // Pause the game and stop the timer if not already paused
        if (!gameScene.isPaused) {
            gameScene.pauseGame(); // Use the scene's method to pause
            // Pause the timer in the HTML
            timeElement.setAttribute('data-paused-time', timeElement.innerText);
            console.log("Game paused.");
        }
    } else {
        // Hide the warning GIF
        warningDiv.style.visibility = 'hidden';
        console.log("Orientation is landscape: Hiding warning GIF and resuming the game.");

        // Resume the game and restart the timer if paused
        if (gameScene.isPaused) {
            gameScene.resumeGame(); // Use the scene's method to resume
            // Resume the timer in the HTML
            timeElement.innerText = timeElement.getAttribute('data-paused-time');
            console.log("Game resumed.");
        }
    }
}

function setupGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    const closeModal = document.getElementById('close-modal');
    const restartButton = document.getElementById('restart-button');

    console.log('Modal:', modal);
    console.log('Close Modal:', closeModal);
    console.log('Restart Button:', restartButton);

    if (!modal) {
        console.error("Modal element not found");
        return;
    }

    if (!closeModal) {
        console.error("Close modal element not found");
        return;
    }

    if (!restartButton) {
        console.error("Restart button element not found");
        return;
    }

    // Close modal when 'x' is clicked
    closeModal.onclick = () => {
        modal.style.display = 'none';
    };

    // Restart the game when 'Restart Game' button is clicked
    restartButton.onclick = () => {
        modal.style.display = 'none';
        restartGame();
    };

    // Close modal when clicking outside the modal content
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

function restartGame() {
    const gameScene = gameInstance.scene.get('Game');
    if (gameScene) {
        gameScene.scene.restart();
        gameScene.score = 0;
        gameScene.gameOver = false;
        gameScene.isPaused = false;

        // Reset timer in HTML
        const timeElement = document.getElementById('time');
        timeElement.innerText = '45'; // Reset to initial time

        // Reset stag icons
        for (let i = 1; i <= 5; i++) {
            const stagIcon = document.getElementById(`stag-icon-${i}`);
            if (stagIcon) {
                stagIcon.classList.remove('found');
                stagIcon.style.opacity = 0.5;
                stagIcon.style.border = "none";
            }
        }

        // Hide orientation warning if visible
        const warningDiv = document.getElementById('orientation-warning');
        warningDiv.style.visibility = 'hidden';

        // Resume the game if it was paused
        gameScene.resumeGame();
        console.log("Game restarted.");
    }
}

function goFullScreen() {
    const fullscreenButton = document.getElementById('fullscreen-button');
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
                    .then(() => {
                        console.log("Entered fullscreen mode.");
                    })
                    .catch((err) => {
                        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
                    });
            } else {
                document.exitFullscreen()
                    .then(() => {
                        console.log("Exited fullscreen mode.");
                    })
                    .catch((err) => {
                        console.error(`Error attempting to exit fullscreen mode: ${err.message} (${err.name})`);
                    });
            }
        });
    } else {
        console.error("Fullscreen button not found");
    }
}

window.addEventListener('load', () => {
    goFullScreen();
    setupGameOverModal();
    checkOrientation();
});

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
