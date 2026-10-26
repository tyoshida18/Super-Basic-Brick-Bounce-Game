// ============================================================
// BLOCK BREAKER (base game)
//
// game.js  = the canvas, the ball, the paddle, and the game loop
// bricks.js     = where the bricks are and how they are drawn
// collisions.js = what happens when the ball touches things
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const pauseButton = document.getElementById("pause-button");

const WIDTH = canvas.width;   // 600
const HEIGHT = canvas.height; // 450
const GameState = { score: 0, lives: 3, level: 1 };
let isPaused = false;

function pauseGame() {
  isPaused = !isPaused;
  updatePauseButton();
}

function updatePauseButton() {
  pauseButton.textContent = isPaused ? "Resume" : "Pause";
}


// ------------------------------------------------------------
// THE BALL
// x and y are the top-left corner. vx and vy are how many pixels
// the ball moves each update (vx = sideways, vy = up/down).
// A positive vy means the ball is moving DOWN the screen.
// ------------------------------------------------------------
const BALL_SPEED = 4;
const MAX_BALL_SPEED = 8;
const PADDLE_WIDTH = 90;
const MIN_PADDLE_WIDTH = 50;

const ball = {
  x: 0,
  y: 0,
  width: 12,
  height: 12,
  velocity: { ...VelocityComponent },
  beeper: new Beeper(440)
};

// Put the ball in the center and reset its speed and direction.
function resetBall() {
  ball.x = WIDTH / 2 - ball.width / 2;
  ball.y = HEIGHT / 2 - ball.height / 2;
  const speed = Math.min(BALL_SPEED + (GameState.level - 1) * 0.5, MAX_BALL_SPEED);
  ball.velocity.vx = speed;  // right
  ball.velocity.vy = speed;  // down
}


// ------------------------------------------------------------
// THE PADDLE
// ------------------------------------------------------------
const paddle = {
  x: WIDTH / 2 - 45,
  y: HEIGHT - 30,
  width: PADDLE_WIDTH,
  height: 12,
  speed: 6
};


// ------------------------------------------------------------
// THE BRICKS (the list is filled in by makeBricks() in bricks.js)
// ------------------------------------------------------------
let bricks = [];


// ------------------------------------------------------------
// KEYBOARD
// keys["arrowleft"] is true while the left arrow is held down.
// ------------------------------------------------------------
const keys = {};

function levelUp() {
  GameState.level += 1;

  const speed = Math.min(BALL_SPEED + (GameState.level - 1) * 0.5, MAX_BALL_SPEED);
  ball.velocity.vx = Math.sign(ball.velocity.vx) * speed;
  ball.velocity.vy = Math.sign(ball.velocity.vy) * speed;
  paddle.width = Math.max(PADDLE_WIDTH - (GameState.level - 1) * 5, MIN_PADDLE_WIDTH);
  paddle.x = Math.min(paddle.x, WIDTH - paddle.width);
}

function restartGame() {
  GameState.score = 0;
  GameState.lives = 3;
  GameState.level = 1;
  isPaused = false;
  updatePauseButton();
  paddle.width = PADDLE_WIDTH;
  paddle.x = WIDTH / 2 - paddle.width / 2;
  bricks = makeBricks();
  resetBall();
  Object.keys(keys).forEach(function (key) {
    keys[key] = false;
  });
  leftover = 0;
  lastTime = performance.now();
}

pauseButton.addEventListener("click", pauseGame);

document.addEventListener("keydown", function (event) {
  unlockBeeperAudio();
  keys[event.key.toLowerCase()] = true;
  if (event.key.toLowerCase() === "p" && !event.repeat) {
    pauseGame();
  }
  if (event.key.toLowerCase() === "r" && !event.repeat) {
    restartGame();
  }
  if (event.key.toLowerCase() === "l" && !event.repeat) {
    levelUp();
  }
  // Stop the arrow keys from scrolling the page.
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
  }
});

document.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
});


// ------------------------------------------------------------
// UPDATE: runs 60 times every second. Move things, then check
// what they touched.
// ------------------------------------------------------------
function update() {
  
  movePaddle();
  moveBall();

  bounceOffWalls();   // collisions.js
  bounceOffPaddle();  // collisions.js
  bounceOffBricks();  // collisions.js

  // The ball fell off the bottom: back to the center.
  if (ball.y > HEIGHT) {
    GameState.lives -= 1;
    resetBall();
  }
}
function movePaddleLeft() {
  paddle.x = paddle.x - paddle.speed;}
function movePaddle() {
  if (keys["arrowleft"] || keys["a"]) {
   movePaddleLeft();
  }
  if (keys["arrowright"] || keys["d"]) {
    paddle.x = paddle.x + paddle.speed;
  }

  // Keep the paddle on the screen.
  if (paddle.x < 0) {
    paddle.x = 0;
  }
  if (paddle.x + paddle.width > WIDTH) {
    paddle.x = WIDTH - paddle.width;
  }
}

function moveBall() {
  moveBallSystem(ball);
}

function moveBallSystem(entity) {
  entity.x = entity.x + entity.velocity.vx;
  entity.y = entity.y + entity.velocity.vy;
}


// ------------------------------------------------------------
// DRAW: paints everything on the canvas. Black background,
// white shapes.
// ------------------------------------------------------------
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "white";
  ctx.font = "bold 20px Courier New, monospace";
  ctx.textAlign = "center";
  ctx.fillText(`Level: ${GameState.level}  |  Score: ${GameState.score}  |  Lives: ${GameState.lives}`, WIDTH / 2, 28);

  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillRect(ball.x, ball.y, ball.width, ball.height);

  drawBricks();  // bricks.js

  if (isPaused) {
    ctx.font = "bold 32px Courier New, monospace";
    ctx.fillText("PAUSED", WIDTH / 2, HEIGHT / 2);
  }
}


// ------------------------------------------------------------
// THE GAME LOOP
// The browser calls frame() every time it is ready to draw.
// Some screens are faster than others, so we make sure update()
// always runs exactly 60 times per second on every computer.
// ------------------------------------------------------------
const STEP = 1000 / 60;
let lastTime = 0;
let leftover = 0;

function frame(now) {
  leftover = leftover + (now - lastTime);
  lastTime = now;

  // If the tab was hidden for a while, don't try to catch up.
  if (leftover > 250) {
    leftover = 250;
  }

  if (isPaused) {
    leftover = 0;
  } else {
    while (leftover >= STEP) {
      update();
      leftover = leftover - STEP;
    }
  }

  draw();
  requestAnimationFrame(frame);
}

function start() {
  bricks = makeBricks();  // bricks.js
  resetBall();
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

// Wait until all three script files have loaded, then start.
window.addEventListener("load", start);
