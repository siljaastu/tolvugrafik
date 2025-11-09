// //light mode: (muna að commenta út hitt boxColor)
// scene.background = new THREE.Color(0xffffff);
// const boxColor = 0x0;

// // safe global array for grid instances
window.allGrids = window.allGrids || [];


//darkmode (default svartur bakgrunnur)
const boxColor = 0xffe70a;

// //Debugging litir
// const boxColor2 = 0xffffff;
//const boxColor3 = 0x03c2fc;

// Grid neðst í spilaboxi
const grid = new THREE.GridHelper(6, 6, boxColor, boxColor);
grid.position.set(0, -10, 0);
scene.add(grid);
window.allGrids.push(grid);

// // Grid í miðju spilaboxi (for debugging)
// const midGrid = new THREE.GridHelper(6, 6);
// scene.add(midGrid);

// Grid í vinstri hlið neðst
const wallGrid = new THREE.GridHelper(6, 6, boxColor, boxColor);
wallGrid.rotation.z = Math.PI / 2;
wallGrid.position.x = -WIDTH / 2;
wallGrid.position.y = -HEIGHT / 2 + 3;
scene.add(wallGrid);
window.allGrids.push(wallGrid);

// Grid í vinstri hlið miðju
const wallGrid2 = new THREE.GridHelper(6, 6, boxColor, boxColor);
wallGrid2.rotation.z = Math.PI / 2;
wallGrid2.position.x = -WIDTH / 2;
wallGrid2.position.y = -HEIGHT / 2 + 9;
scene.add(wallGrid2);
window.allGrids.push(wallGrid2);

// Grid í vinstri hlið næstefst
const wallGrid3 = new THREE.GridHelper(6, 6, boxColor, boxColor);
wallGrid3.rotation.z = Math.PI / 2;
wallGrid3.position.x = -WIDTH / 2;
wallGrid3.position.y = -HEIGHT / 2 + 15;
scene.add(wallGrid3);
window.allGrids.push(wallGrid3);

// Grid í vinstri hlið efst vinstri
const wallGrid4a = new THREE.GridHelper(2, 2, boxColor, boxColor);
wallGrid4a.rotation.z = Math.PI / 2;
wallGrid4a.position.x = -WIDTH / 2;
wallGrid4a.position.y = -HEIGHT / 2 + 19;
wallGrid4a.position.z = WIDTH / 3;
scene.add(wallGrid4a);
window.allGrids.push(wallGrid4a);

// Grid í vinstri hlið efst mið
const wallGrid4b = new THREE.GridHelper(2, 2, boxColor, boxColor);
wallGrid4b.rotation.z = Math.PI / 2;
wallGrid4b.position.x = -WIDTH / 2;
wallGrid4b.position.y = -HEIGHT / 2 + 19;
scene.add(wallGrid4b);
window.allGrids.push(wallGrid4b);

// Grid í vinstri hlið efst hægri
const wallGrid4c = new THREE.GridHelper(2, 2, boxColor, boxColor);
wallGrid4c.rotation.z = Math.PI / 2;
wallGrid4c.position.x = -WIDTH / 2;
wallGrid4c.position.y = -HEIGHT / 2 + 19;
wallGrid4c.position.z = -WIDTH / 3;
scene.add(wallGrid4c);
window.allGrids.push(wallGrid4c);

// Grid í hægri hlið neðst
const wallGridh = new THREE.GridHelper(6, 6, boxColor, boxColor);
wallGridh.rotation.x = Math.PI / 2;
wallGridh.position.z = -WIDTH / 2;
wallGridh.position.y = -HEIGHT / 2 + 3;
scene.add(wallGridh);
window.allGrids.push(wallGridh);

// Grid í hægri hlið miðju
const wallGridh2 = new THREE.GridHelper(6, 6, boxColor, boxColor);
wallGridh2.rotation.x = Math.PI / 2;
wallGridh2.position.z = -WIDTH / 2;
wallGridh2.position.y = -HEIGHT / 2 + 9;
scene.add(wallGridh2);
window.allGrids.push(wallGridh2);

// Grid í hægri hlið næstefst
const wallGridh3 = new THREE.GridHelper(6, 6, boxColor, boxColor);
wallGridh3.rotation.x = Math.PI / 2;
wallGridh3.position.z = -WIDTH / 2;
wallGridh3.position.y = -HEIGHT / 2 + 15;
scene.add(wallGridh3);
window.allGrids.push(wallGridh3);

// Grid í hægri hlið efst vinstri
const wallGridh3a = new THREE.GridHelper(2, 2, boxColor, boxColor);
wallGridh3a.rotation.x = Math.PI / 2;
wallGridh3a.position.z = -WIDTH / 2;
wallGridh3a.position.y = -HEIGHT / 2 + 19;
wallGridh3a.position.x = -WIDTH / 3;
scene.add(wallGridh3a);
window.allGrids.push(wallGridh3a);

// Grid í hægri hlið efsti mið
const wallGridh3b = new THREE.GridHelper(2, 2, boxColor, boxColor);
wallGridh3b.rotation.x = Math.PI / 2;
wallGridh3b.position.z = -WIDTH / 2;
wallGridh3b.position.y = -HEIGHT / 2 + 19;
scene.add(wallGridh3b);
window.allGrids.push(wallGridh3b);

// Grid í hægri hlið efst hægri
const wallGridh3c = new THREE.GridHelper(2, 2, boxColor, boxColor);
wallGridh3c.rotation.x = Math.PI / 2;
wallGridh3c.position.z = -WIDTH / 2;
wallGridh3c.position.y = -HEIGHT / 2 + 19;
wallGridh3c.position.x = WIDTH / 3;
scene.add(wallGridh3c);
window.allGrids.push(wallGridh3c);

window.updateGridColor = function (hexColor) {
  for (const g of window.allGrids) {
    if (!g) continue;
    const mats = Array.isArray(g.material) ? g.material : [g.material];
    for (const m of mats) {
      if (m && m.color) m.color.setHex(hexColor);
    }
  }
};
