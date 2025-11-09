const WIDTH = 6;
const HEIGHT = 20;
const DEPTH = 6;
const UPDATE_INTERVAL = 500;

const cubeSize = 1;

// Ná í striga
const canvas = document.querySelector("#c");
const scoreDisplay = document.getElementById("score");
var score = 0;

// Skilgreina sviðsnet
const scene = new THREE.Scene();

// Skilgreina myndavél og staðsetja hana
const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1000
);
camera.position.z = 18;

// Bæta við músarstýringu
const controls = new THREE.OrbitControls(camera, canvas);
// // Snýst sjálfkrafa á tilteknum hraða (1.0 sjálfgefið)
// controls.autoRotate = true;
// controls.autoRotateSpeed = 10.0;
// // Heldur áfram að snúast eftir að músarhnappi hefur verið sleppt
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;

// Skilgreina birtingaraðferð
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

// Birta útlínur í staðinn fyrir fylltan lit, lines
const boxGeo = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH);
// const edgeMat = new THREE.LineBasicMaterial({
//   color: 0xfc0328,
//   depthTest: true,
//   transparent: true,
// });
// const edgeMesh = new THREE.LineSegments(
//   new THREE.EdgesGeometry(boxGeo),
//   edgeMat
// );
// scene.add(edgeMesh);

//////////////////////
// GAME STATE
//////////////////////

// Three-dimensional state to keep track of all cubes in y,x,z
// 20x6x6 array
var levels = undefined;

// Height map - tallest "peak" for the x-z plane
// 6x6 array
var heights = undefined;

// The currently active block
var activeBlock = undefined;

// Source - https://stackoverflow.com/a
// Posted by John Millikin, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-09, License - CC BY-SA 4.0

var intervalId = undefined;

function newBlock() {
  const pos = {
    x: -cubeSize / 2.0,
    // y: -5 + cubeSize + cubeSize / 2.0,
    y: 10 + cubeSize + cubeSize / 2.0,
    // y: -10+ cubeSize + cubeSize / 2.0,
    z: -cubeSize / 2.0,
  };
  const block =
    Math.random() < 0.5 ? createStraightBlock(pos) : createLBlock(pos);
  activeBlock = block;
  scene.add(block);
}

function setScore(newScore) {
  score += newScore;
  if (scoreDisplay) scoreDisplay.textContent = String(score);
}

function isLegalPosition(block) {
  var isLegal = true;

  for (const cube of block.children) {
    const pos = cube.getWorldPosition(new THREE.Vector3());

    isLegal &&= pos.x < WIDTH / 2.0 && pos.x > -WIDTH / 2.0;
    isLegal &&= pos.z < WIDTH / 2.0 && pos.z > -WIDTH / 2.0;
    isLegal &&= pos.y > -HEIGHT / 2.0;
  }

  isLegal &&= !checkCollision(block);

  return isLegal;
}

// Rotate the active block by the given rotation
function rotateBlock(block, amountToRotate) {
  const prevRotation = block.rotation.clone();

  block.rotation.x += amountToRotate.x;
  block.rotation.y += amountToRotate.y;
  block.rotation.z += amountToRotate.z;

  if (!isLegalPosition(block)) {
    block.rotation.copy(prevRotation);
  }
}

// Move active block by (x, y, z)
function moveBlock(block, amountToMove) {
  // Remember old position to be able to roll back if we hit something
  const prevPos = block.position.clone();

  // Update position
  block.position.add(amountToMove);

  // If we're in an invalid position, just go back to where we were... 
  if (!isLegalPosition()) {
    block.position.copy(prevPos);
  }

  // Have reached the bottom or on top of another cube
  if (!isSpaceBelow(block)) {
    endOfRound();
  }
}

function dropBlock(block) {
  let distanceToDrop = block.children
    .map((cube) => {
      const { y, x, z } = getYXZ(cube);

      // Height of the tallest "peak" in our x-z coordinate
      const peak = heights[x][z];
      const distance = y - peak;

      return distance;
    })
    .reduce((minDist, dist) => {
      return Math.min(minDist, dist);
    }, Number.MAX_VALUE);

  block.position.add(new THREE.Vector3(0, -distanceToDrop, 0));
  endOfRound();
}

// Check if the space directly below is occupied
function isSpaceBelow(block) {
  var spaceBelow = true;

  for (const cube of block.children) {
    const { y, x, z } = getYXZ(cube);

    spaceBelow &&= y > HEIGHT || (y !== 0 && levels[y - 1][x][z] === undefined);
  }

  return spaceBelow;
}

// Get the YXZ index coordinate for a cube in the "levels" state
function getYXZ(cube) {
  var yxz = {};
  const pos = cube.getWorldPosition(new THREE.Vector3());

  yxz.y = Math.floor(pos.y + HEIGHT / 2.0);
  yxz.x = Math.floor(pos.x + WIDTH / 2.0);
  yxz.z = Math.floor(pos.z + WIDTH / 2.0);

  return yxz;
}

// Check if the active block's current position collides
// with any other currently placed block
function checkCollision(block) {
  for (const cube of block.children) {
    const { y, x, z } = getYXZ(cube);

    if (y < HEIGHT && levels[y][x][z] !== undefined) {
      return true;
    }
  }
  return false;
}

// Update game state with current state of blocks at the end of the round
function endOfRound() {
  var filledLevels = [];

  for (const cube of activeBlock.children) {
    const { y, x, z } = getYXZ(cube);

    if (y < HEIGHT) {
      levels[y][x][z] = cube;
      heights[x][z] = Math.max(heights[x][z], y + 1);

      if (isLevelFilled(y)) {
        filledLevels.push(y);
      }
    }
  }

  if (filledLevels.length > 0) {
    removeLevels(levels, filledLevels);
  }
  if (!isGameOver()) {
    newBlock();
  } else {
    clearInterval(intervalId);
    alert(
      "Leik lokið! Þú fékkst " + score + " stig. Ýttu á OK til að prófa aftur."
    );
    resetGame();
  }
}

function stopGame() {}

function resetGame() {
  if (levels === undefined) {
    levels = createLevels();
  } else {
    for (var i = 0; i < HEIGHT; i++) {
      clearLevel(levels, i);
    }
  }

  if (intervalId !== undefined) {
    clearInterval(intervalId);
    intervalId = null;
  }

  heights = newHeightMap();
  score = 0;
  if (scoreDisplay) scoreDisplay.textContent = String(score);
  if (activeBlock !== undefined) {
    scene.remove(activeBlock);
    activeBlock = undefined;
  }
  newBlock();
  intervalId = setInterval(update, UPDATE_INTERVAL);
}

function isGameOver() {
  const isAbovePlayfield = activeBlock.children.some(
    (cube) => cube.getWorldPosition(new THREE.Vector3()).y > 10
  );
  const gameOver = isAbovePlayfield && !isSpaceBelow();
  console.log(gameOver);
  return gameOver;
}

let theme = "dark"; // default

function applyTheme(t) {
  theme = t;
  if (t === "light") {
    scene.background = new THREE.Color(0xffffff);
    if (window.updateGridColor) window.updateGridColor(0x03c2fc); // litur í light
  } else {
    scene.background = new THREE.Color(0x000000);
    if (window.updateGridColor) window.updateGridColor(0xffe70a); // litur í dark
  }
}

const themeButton = document.getElementById("toggle-theme");
if (themeButton) {
  themeButton.addEventListener("click", () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  });
}

// Setja sjálfgefið
applyTheme(theme);

// // optional: reposition camera so you see the tall playfield clearly
// camera.position.set(24, 24, 28);
// controls.target.set(0, HEIGHT / 2 - 1, 0);
// controls.update();

// Skilgreina ljósgjafa og bæta honum í sviðsnetið
const ambLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambLight);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-1, 2, 4);
scene.add(light);

// Hreyfifall
const animate = function () {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate();
Object.assign(window, { THREE, scene, camera, controls });

window.addEventListener("keydown", handleKeyDown);

// Tick game forward
const update = function () {
  moveBlock(activeBlock,  THREE.Vector3(0, -cubeSize, 0));
};

// Start game
resetGame();
