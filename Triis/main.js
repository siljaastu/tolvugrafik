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

// Update game state with current state of blocks at the end of the round
function endOfRound() {
  if (isGameOver()) {
    clearInterval(intervalId);
    alert(
      "Leik lokið! Þú fékkst " + score + " stig. Ýttu á OK til að prófa aftur."
    );
    resetGame();
    return;
  }

  var filledLevels = [];

  // Detach cubes from the active block
  const cubes = detachCubes(activeBlock);
  
  // Remove the (now empty) block from our scene
  scene.remove(activeBlock);

  for (const cube of cubes) {
    // Add individual cube to the scene
    scene.add(cube);

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

  newBlock();
}

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
  const gameOver = isAbovePlayfield && !isSpaceBelow(activeBlock);
  console.log(gameOver);
  return gameOver;
}

let theme = "dark"; // default

function applyTheme(t) {
  theme = t;
  if (t === "light") {
    scene.background = new THREE.Color(0xffffff);
    if (window.updateGridColor) window.updateGridColor(0x242973); // litur í light
  } else {
    scene.background = new THREE.Color(0x000000);
    if (window.updateGridColor) window.updateGridColor(0xffe70a); // litur í dark
  }
}
const themeButton = document.getElementById("toggle-theme");

function updateThemeButton(themeName) {
  if (!themeButton) return;
  themeButton.classList.remove("ui-button--dark", "ui-button--light");
  themeButton.classList.add(
    themeName === "dark" ? "ui-button--light" : "ui-button--dark"
  );
  themeButton.textContent =
    themeName === "dark" ? "Skipta í ljóst þema" : "Skipta í dökkt þema";
}

if (themeButton) {
  themeButton.classList.add("ui-button");
  themeButton.addEventListener("click", () => {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    updateThemeButton(next);
  });
}

applyTheme(theme);
updateThemeButton(theme);

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
  const moveDown = new THREE.Vector3(0, -cubeSize, 0);
  moveBlock(activeBlock, moveDown);

  // Have reached the bottom or on top of another cube
  if (!isSpaceBelow(activeBlock)) {
    endOfRound();
  }
};

// Start game
resetGame();
