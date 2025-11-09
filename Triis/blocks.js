// import { cubeSize } from "./consts";

// /* A basic cube used to create any block */
// function createCube(pos, size, color) {
//   const geometry = new THREE.BoxGeometry(size, size, size);
//   const material = new THREE.MeshPhongMaterial({ color: color });
//   const edgeMat = new THREE.LineBasicMaterial({
//   color: 0xffffff,
//   depthTest: true,
// });
// const cube = new THREE.LineSegments(
//   new THREE.EdgesGeometry(geometry),
//   edgeMat
// );
// //   const cube = new THREE.Mesh(geometry, material);
//   cube.position.set(
//     pos.x,
//     pos.y,
//     pos.z
//   );
//   return cube;
// }

function createCube(pos, size, color) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  
  // Create the solid cube
  const material = new THREE.MeshPhongMaterial({ color: color });
  const solidCube = new THREE.Mesh(geometry, material);
  
  // Create the wireframe edges
  const edgeMat = new THREE.LineBasicMaterial({
    color: color*0.0001, //dekkja valinn lit fyrir línur
    depthTest: true,
  });
  const wireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    edgeMat
  );
  
  // Create a group to hold both
  const cubeGroup = new THREE.Group();
  cubeGroup.add(solidCube);
  cubeGroup.add(wireframe);
  
  // Set the position of the entire group
  cubeGroup.position.set(pos.x, pos.y, pos.z);
  
  return cubeGroup;
}

function createStraightBlock(pos) {
  const color = getRandomColor();

  var cubes = [
    createCube({x: 0, y: cubeSize, z: 0}, cubeSize, color),    // Top cube
    createCube({x: 0, y: 0, z: 0}, cubeSize, color),          // Middle cube  
    createCube({x: 0, y: -cubeSize, z: 0}, cubeSize, color),  // Bottom cube
  ];

  var block = new THREE.Group();
  for (const cube of cubes) {
    block.add(cube);
  }

  block.position.set(pos.x, pos.y, pos.z);
  return block;
}

function createLBlock(pos) {
  const color = getRandomColor();

  var cubes = [
    createCube({x: 0, y: cubeSize, z: 0}, cubeSize, color),    // Top cube
    createCube({x: 0, y: 0, z: 0}, cubeSize, color),          // Middle/bottom cube  
    createCube({x: cubeSize, y: 0, z: 0}, cubeSize, color),  // Bottom/Out cube
  ];

  var block = new THREE.Group();
  for (const cube of cubes) {
    block.add(cube);
  }

  block.position.set(pos.x, pos.y, pos.z);
  return block;
}

/* Creates and returns a random color hex code */
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
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

// Check if the space directly below is occupied
function isSpaceBelow(block) {
  var spaceBelow = true;

  for (const cube of block.children) {
    const { y, x, z } = getYXZ(cube);

    spaceBelow &&= y > HEIGHT || (y !== 0 && levels[y - 1][x][z] === undefined);
  }

  return spaceBelow;
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
  if (!isLegalPosition(block)) {
    block.position.copy(prevPos);
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
  // endOfRound();
}