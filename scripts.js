// Global Variables
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

function generateRoundColor() {
    var colors = ['#1abc9c', '#2ecc71','#9ca54c', '#8c52ff', '#f3b344', '#f3449b','#74bff9'];
    var randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

// Function to create a new ball object
function createBall(incrementedSpeed) {
    return {
        width: 18,
        height: 18,
        x: (this.canvas.width / 2) - 9,
        y: (this.canvas.height / 2) - 9,
        moveX: DIRECTION.IDLE,
        moveY: DIRECTION.IDLE,
        speed: incrementedSpeed || 7
    };
}

// Function to create a new AI object
function createAi(side) {
    return {
        width: 18,
        height: 180,
        x: side === 'left' ? 150 : this.canvas.width - 150,
        y: (this.canvas.height / 2) - 35,
        score: 0,
        move: DIRECTION.IDLE,
        speed: 8
    };
}

// Function to initialize the game
function initializeGame() {
    this.canvas = document.querySelector('canvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 1600;
    this.canvas.height = 1000;

    this.canvas.style.width = (this.canvas.width / 2) + 'px';
    this.canvas.style.height = (this.canvas.height / 2) + 'px';

    this.player = createAi.call(this, 'left');
    this.ai = createAi.call(this, 'right');
    this.ball = createBall.call(this);

    this.ai.speed = 5;
    this.running = this.over = false;
    this.turn = this.ai;
    this.timer = 0;
    this.color = Pong.generateRoundColor();

    this.player.score = 0;
    this.ai.score = 0;

    this.menu();
    this.listen();
}

function endGameMenu(text) {
    // Show the winner div
    var winnerDiv = document.getElementById('winnerDiv');
    var winnerText = document.getElementById('winnerText');
    winnerText.innerText = text;
    winnerDiv.classList.remove('hidden');

    // Change the canvas font size and color
    this.context.font = '45px Courier New';
    this.context.fillStyle = this.color;

    // Draw the rectangle behind the 'Press any key to begin' text.
    this.context.fillRect(
        this.canvas.width / 2 - 350,
        this.canvas.height / 2 - 48,
        700,
        100
    );

    // Change the canvas color;
    this.context.fillStyle = '#ffffff';

    // Draw the end game menu text ('Game Over' and 'Winner')
    this.context.fillText('Game Over!',
        this.canvas.width / 2,
        this.canvas.height / 2 - 15
    );

    // Display the winner based on the maximum score
    var winner = this.player.score > this.ai.score ? "Player" : "AI";
    this.context.fillText("Winner: " + winner,
        this.canvas.width / 2,
        this.canvas.height / 2 + 45
    );

    setTimeout(function () {
        Pong = Object.assign({}, Game);
        Pong.initialize();
    }, 3000);
}

function menu() {
    // Draw all the Pong objects in their current state
    Pong.draw();

    // Change the canvas font size and color
    this.context.font = '50px Courier New';
    this.context.fillStyle = this.color;

    // Draw the rectangle behind the 'Press any key to begin' text.
    this.context.fillRect(
        this.canvas.width / 2 - 350,
        this.canvas.height / 2 - 48,
        700,
        100
    );

    // Change the canvas color;
    this.context.fillStyle = '#ffffff';

    // Draw the 'press any key to begin' text
    this.context.fillText('Press any key to begin',
        this.canvas.width / 2,
        this.canvas.height / 2 + 15
    );
}

function update() {
    if (!this.over) {
        // If the ball collides with the bound limits - correct the x and y coords.
        if (this.ball.x <= 0) Pong.resetTurn.call(this, this.ai, this.player);
        if (this.ball.x >= this.canvas.width - this.ball.width) Pong.resetTurn.call(this, this.player, this.ai);
        if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
        if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

        // Move player if they player.move value was updated by a keyboard event
        if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
        else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

        // On new serve (start of each turn) move the ball to the correct side
        // and randomize the direction to add some challenge.
        if (Pong.isTurnDelayOver.call(this) && this.turn) {
            this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
            this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
            this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
            this.turn = null;
        }

        // If the player collides with the bound limits, update the x and y coords.
        if (this.player.y <= 0) this.player.y = 0;
        else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

        // Move ball in intended direction based on moveY and moveX values
        if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
        else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
        if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
        else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

        // Handle ai (AI) UP and DOWN movement
        if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
            if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
            else this.ai.y -= this.ai.speed / 4;
        }
        if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
            if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
            else this.ai.y += this.ai.speed / 4;
        }

        // Handle ai (AI) wall collision
        if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
        else if (this.ai.y <= 0) this.ai.y = 0;

        // Handle Player-Ball collisions
        if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
            if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                this.ball.x = (this.player.x + this.ball.width);
                this.ball.moveX = DIRECTION.RIGHT;
            } else {
                // If the ball passes the player's paddle, increase AI's score and reset turn
                this.ai.score++;
                Pong.resetTurn.call(this, this.player, this.ai);
            }
        }

        // Handle ai-ball collision
        if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
            if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                this.ball.x = (this.ai.x - this.ball.width);
                this.ball.moveX = DIRECTION.LEFT;
            } else {
                // If the ball passes the AI's paddle, increase player's score and reset turn
                this.player.score++;
                Pong.resetTurn.call(this, this.ai, this.player);
            }
        }
    }

    // Check for the end of the game
    if (this.player.score >= 5 || this.ai.score >= 5) {
        this.over = true;
        var winner = this.player.score > this.ai.score ? 'Player' : 'Computer';
        setTimeout(function () { Pong.endGameMenu(winner + ' wins the game!'); }, 1000);
    }
}


// Draw the objects to the canvas element
function draw() {
    // Clear the Canvas
    this.context.clearRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height
    );

    // Set the fill style to black
    this.context.fillStyle = this.color;

    // Draw the background
    this.context.fillRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height
    );

    // Set the fill style to white (For the paddles and the ball)
    this.context.fillStyle = '#ffffff';

    // Draw the Player
    this.context.fillRect(
        this.player.x,
        this.player.y,
        this.player.width,
        this.player.height
    );

    // Draw the Ai
    this.context.fillRect(
        this.ai.x,
        this.ai.y,
        this.ai.width,
        this.ai.height
    );

    // Draw the Ball
    if (Pong.isTurnDelayOver.call(this)) {
        this.context.fillRect(
            this.ball.x,
            this.ball.y,
            this.ball.width,
            this.ball.height
        );
    }

    // Draw the net (Line in the middle)
    this.context.beginPath();
    this.context.setLineDash([7, 15]);
    this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
    this.context.lineTo((this.canvas.width / 2), 140);
    this.context.lineWidth = 12;
    this.context.strokeStyle = '#ffffff';
    this.context.stroke();

    // Set the default canvas font and align it to the center
    this.context.font = '70px Courier New';
    this.context.textAlign = 'center';

    // Draw the players score (left)
    this.context.fillText(
        "You: \n"+this.player.score.toString(),
        (this.canvas.width / 2) - 350,
        150
    );

    // Draw the paddles score (right)
    this.context.fillText(
        "Computer: \n"+this.ai.score.toString(),
        (this.canvas.width / 2) + 350,
        150
    );

    // Change the font size for the center score text
    this.context.font = '30px Courier New';

}

function gameLoop() {
    Pong.update();
    Pong.draw();

    // If the game is not over, draw the next frame.
    if (!Pong.over && Pong.running)
    {
        Pong.animationFrameId = requestAnimationFrame(Pong.gameLoop);
    }    
}

function listen() {
    document.addEventListener('keydown', function (key) {
        // Handle the 'Press any key to begin' function and start the game.
        if (Pong.running === false) {
            Pong.running = true;
            window.requestAnimationFrame(Pong.gameLoop);
        }

        // Handle up arrow and w key events
        if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;

        // Handle down arrow and s key events
        if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
    });

    // Stop the player from moving when there are no keys being pressed.
    document.addEventListener('keyup', function (key) { Pong.player.move = DIRECTION.IDLE; });
}

// Reset the ball location, the player turns and set a delay before the next round begins.
function resetTurn(victor, loser) {
    this.ball = createBall.call(this, this.ball.speed);
    this.turn = loser;
    this.timer = (new Date()).getTime();
    // Change color after each score
    this.color = Pong.generateRoundColor();

}

// Wait for a delay to have passed after each turn.
function isTurnDelayOver() {
    return ((new Date()).getTime() - this.timer >= 1000);
}

function pauseGame() {
    cancelAnimationFrame(this.animationFrameId);
    document.getElementById('pauseButton').classList.add('hidden');
    document.getElementById('resumeButton').classList.remove('hidden');
}
function resumeGame() {
    this.running = true;
    this.gameLoop();
    document.getElementById('pauseButton').classList.remove('hidden');
    document.getElementById('resumeButton').classList.add('hidden');
}

function restartGame(){
    this.over = false;
    this.running = false;
    this.player.score = 0;
    this.ai.score = 0;
    this.color = this.generateRoundColor();
    this.initialize();
    document.getElementById('pauseButton').classList.remove('hidden');
    document.getElementById('resumeButton').classList.add('hidden');
}

// Main Pong object
var Pong = {
    initialize: initializeGame,
    draw: draw,
    update: update,
    gameLoop: gameLoop,
    menu: menu,
    listen: listen,
    resetTurn: resetTurn,
    isTurnDelayOver: isTurnDelayOver,
    endGameMenu: endGameMenu,
    generateRoundColor: generateRoundColor,
    pauseGame: pauseGame,
    resumeGame: resumeGame,
    restartGame: restartGame,
    animationFrameId: null,
};

// Initialize the game
Pong.initialize();
