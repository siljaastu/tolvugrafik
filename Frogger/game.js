// @ts-nocheck — disable TS linting because of gl always throwing errors

const canvasEl = document.getElementById("gameCanvas");
const canvas = canvasEl;

const scoreEl = document.getElementById("score");
const scoreDisplay = scoreEl;

const gl = canvas.getContext("webgl");
if (!gl) {
  alert("WebGL not supported in your browser.");
  throw new Error("WebGL initialization failed.");
}

// 1. Shader utility functions
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl, vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  return program;
}

// 2. Shaders
const vertexShaderSrc = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`;

const fragmentShaderSrc = `
  precision mediump float;
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;
  }
`;

const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
const program = createProgram(gl, vs, fs);

// 3. Get shader variable locations
const posLoc = gl.getAttribLocation(program, "a_position");
const resLoc = gl.getUniformLocation(program, "u_resolution");
const colorLoc = gl.getUniformLocation(program, "u_color");

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.9, 0.9, 0.9, 1.0);

// 4. Game variables and state
const frogSize = 35;
let frog = {
  x: canvas.width / 2 - frogSize / 2,
  y: canvas.height - 50,
  dir: "up",
};

let isUp = false;
let isDown = false;
let isRight = false;
let isLeft = false;

const road = {
  y: 150,
  height: 230,
};

const laneCount = 5;
const laneHeight = 40;
const lanes = [];
for (let i = 0; i < laneCount; i++) {
  lanes.push(road.y + 20 + i * laneHeight);
}

const carColors = [
  [1, 0, 0, 1], // Red
  [1, 1, 1, 1], // White
  [0.2, 0.2, 1, 1], // Blue
  [1, 1, 0, 1], // Yellow
  [1, 0, 1, 1], // Magenta
  [0, 1, 1, 1], // Cyan
  [1, 0.5, 0, 1], // Orange
  [0.5, 1, 0, 1], // Lime Green
  //exta if having 2 cars per lane
  [0.6, 0.6, 0.6, 1], // Silver 
  [0, 0.5, 0, 1], // Green
];

const cars = [];
let colorIndex = 0;

lanes.forEach((y, i) => {
  const carsInLane = (i + 1) % 2 === 0 ? 1 : 2;

  for (let j = 0; j < carsInLane; j++) {
    cars.push({
      x: j * 400 * (i % 2 === 0 ? 1 : -1) + (i % 2 === 0 ? 0 : canvas.width),
      y,
      //width: colorIndex % 4 === 0 ? 60 : 60,
      width: 60,
      height: 28,
      speed: 1 + i * 0.65,
      dir: i % 2 === 0 ? 1 : -1,
      color: carColors[colorIndex % carColors.length],
    });
    colorIndex += 1;
  }
});

let score = 0;
let roadSide = "A";

// 5. Drawing functions
function drawRect(x, y, w, h, color) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      x,
      y,
      x + w,
      y,
      x,
      y + h,
      x,
      y + h,
      x + w,
      y,
      x + w,
      y + h,
    ]),
    gl.STATIC_DRAW
  );
  gl.uniform4fv(colorLoc, color);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function drawFrog() {
  let verts;
  if (frog.dir === "up") {
    verts = [
      frog.x,
      frog.y + frogSize,
      frog.x + frogSize / 2,
      frog.y,
      frog.x + frogSize,
      frog.y + frogSize,
    ];
  } else {
    verts = [
      frog.x,
      frog.y,
      frog.x + frogSize / 2,
      frog.y + frogSize,
      frog.x + frogSize,
      frog.y,
    ];
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  gl.uniform4fv(colorLoc, [0.4, 0.6, 0., 1.0]); // frog color 0.1, 0.4, 0.3, 1.0
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// 6. Main drawing
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(posLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.uniform2f(resLoc, canvas.width, canvas.height);

  // Pavement
  drawRect(0, 0, canvas.width, road.y, [0.9, 0.9, 0.9, 1.0]); //[0.7, 0.8, 0.7, 1.0]
  drawRect(
    0,
    road.y + road.height,
    canvas.width,
    canvas.height - (road.y + road.height),
    [0.9, 0.9, 0.9, 1.0]
  );

  // Road
  drawRect(0, road.y, canvas.width, road.height, [0.3, 0.3, 0.3, 1]);
  // Cars
  cars.forEach((c) => drawRect(c.x, c.y, c.width, c.height, c.color));
  // Frog
  drawFrog();
  // Score bars (green)
  let j = 25;
  for (let i = 0; i < 10; i++) {
    if (i < score) {
      drawRect(j, 25, 5, 40, [0.4, 0.6, 0., 1.0]); //filled bars
    } else {
      drawRect(j, 25, 5, 40, [0.8, 0.8, 0.8, 1]); //empty bars
    }
    j += 18;
  }
}

// 7. Game update
function update() {
  if (score >= 10) {
    resetGame("winner");
    drawScene();
    requestAnimationFrame(update);
    return;
  }

  cars.forEach((c) => {
    c.x += c.speed * c.dir;
    if (c.dir === 1 && c.x > canvas.width) c.x = -c.width;
    if (c.dir === -1 && c.x + c.width < 0) c.x = canvas.width;
  });

  for (const c of cars) {
    if (
      frog.x < c.x + c.width &&
      frog.x + frogSize > c.x &&
      frog.y < c.y + c.height &&
      frog.y + frogSize > c.y
    ) {
      resetGame("collision");
      break;
    }
  }

  const frogTop = frog.y;
  const frogBot = frog.y + frogSize;
  const roadTop = road.y;
  const roadBot = road.y + road.height;
  const above = frogBot < roadTop;
  const below = frogTop > roadBot;

  const step = 20;
  if (isUp) {
    frog.y -= step;
    frog.dir = "up";
  }
  if (isDown) {
    frog.y += step;
    frog.dir = "down";
  }
  if (isRight) {
    frog.x += step;
  }
  if (isLeft) {
    frog.x -= step;
  }
  isUp = isDown = isRight = isLeft = false;

  frog.x = Math.max(0, Math.min(canvas.width - frogSize, frog.x));
  frog.y = Math.max(0, Math.min(canvas.height - frogSize, frog.y));

  if (roadSide === "A" && above) {
    score++;
    scoreDisplay.textContent = `Stig: ${score}`;
    roadSide = "B";
  } else if (roadSide === "B" && below) {
    score++;
    scoreDisplay.textContent = `Stig: ${score}`;
    roadSide = "A";
  }
  drawScene();
  requestAnimationFrame(update);
}

// 8. Reset game
function resetGame(reason = "reset") {
  if (reason === "winner") {
    alert(
      `Þú náðir 10 stigum og vannst leikinn!\nTil hamingju!\nÝttu á OK til að spila aftur.`
    );
  } else if (reason === "collision") {
    alert(
      `Ónei bíll keyrði á Fríðu frosk!\nÞú fékkst ${score} stig.\nÝttu á OK til að prófa aftur.`
    );
  }

  frog.x = canvas.width / 2 - frogSize / 2;
  frog.y = canvas.height - 40;
  score = 0;
  scoreDisplay.textContent = `Stig: ${score}`;
  roadSide = "A";
  frog.dir = "up";
  isUp = isDown = isRight = isLeft = false;
}

// 9. Keyboard control
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    isUp = true;
    isDown = false;
    isRight = false;
    isLeft = false;
  }
  if (e.key === "ArrowDown") {
    isUp = false;
    isDown = true;
    isRight = false;
    isLeft = false;
  }
  if (e.key === "ArrowRight") {
    isUp = false;
    isDown = false;
    isRight = true;
    isLeft = false;
  }
  if (e.key === "ArrowLeft") {
    isUp = false;
    isDown = false;
    isRight = false;
    isLeft = true;
  }
});

// 10. Start loop
drawScene();
requestAnimationFrame(update);
