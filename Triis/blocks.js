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
