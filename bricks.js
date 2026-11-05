// ============================================================
// bricks.js: where the bricks are, and how they are drawn
// ============================================================

const BRICK_COLUMNS = 8;
const BRICK_ROWS = 4;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 6;     // empty space between bricks
const BRICKS_TOP = 50;   // how far down the first row starts

function stayStill(brick) {}

function slide(brick) {
  brick.x += brick.speed;
  if (Math.abs(brick.x - brick.startX) > 30) {
    brick.speed = -brick.speed;
  }
}

// Creates bricks with the color and type needed by drawing and collisions.
const BrickFactory = {
  create(type, x, y, width, height, row) {
    return {
      x,
      y,
      width,
      height,
      type,
      move: row === 0 ? slide : stayStill,
      speed: row === 0 ? 1 : 0,
      startX: x,
      color: type === "speed" ? "darkblue" : "white"
    };
  }
};

// Builds the list of bricks. Each brick is an object with an
// x, y, width, and height.
function makeBricks() {
  const list = [];

  // Center the whole block of bricks on the screen.
  const totalWidth = BRICK_COLUMNS * BRICK_WIDTH + (BRICK_COLUMNS - 1) * BRICK_GAP;
  const left = (WIDTH - totalWidth) / 2;

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLUMNS; col++) {
      // Select only the top-left brick as the single Speed brick.
      const type = row === 0 && col === 0 ? "speed" : "normal";
      list.push(BrickFactory.create(
        type,
        left + col * (BRICK_WIDTH + BRICK_GAP),
        BRICKS_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        BRICK_WIDTH,
        BRICK_HEIGHT,
        row
      ));
    }
  }

  return list;
}

// Draws every brick in the list.
function drawBricks() {
  for (const brick of bricks) {
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  }
}
