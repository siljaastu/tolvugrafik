// a/z til að snúa um x-ás
// s/x til að snúa um y-ás
// d/c til að snúa um z-ás
function handleKeyDown(event) {
  if (isGameOver()) return;

  var mov = new THREE.Vector3(0, 0, 0);
  var rot = undefined;
  switch (event.code) {
    case "ArrowUp":
    case "KeyK":
      mov.z = -1;
      break;
    case "ArrowDown":
    case "KeyJ":
      mov.z = 1;
      break;
    case "ArrowRight":
    case "KeyL":
      mov.x = 1;
      break;
    case "ArrowLeft":
    case "KeyH":
      mov.x = -1;
      break;
    case "KeyA":
      rot = rot || new THREE.Vector3(0, 0, 0);
      rot.x = Math.PI / 2.0;
      break;
    case "KeyZ":
      rot = rot || new THREE.Vector3(0, 0, 0);
      rot.x = -Math.PI / 2.0;
      break;
    case "KeyS":
      rot = rot || new THREE.Vector3(0, 0, 0);
      rot.y = Math.PI / 2.0;
      break;
    case "KeyX":
      rot = rot || new THREE.Vector3(0, 0, 0);
      rot.y = -Math.PI / 2.0;
      break;
    case "KeyD":
      rot = rot || new THREE.Vector3(0, 0, 0);
      rot.z = Math.PI / 2.0;
      break;
    case "KeyC":
      rot = rot || new THREE.Vector3(0, 0, 0);
      rot.z = -Math.PI / 2.0;
      break;
    case "Space":
      dropBlock(activeBlock);
      break;
    // For testing
    case "Digit1":
      removeLevels(levels, [0]);
      break;
    case "Digit2":
      removeLevels(levels, [1]);
      break;
    case "Digit3":
      removeLevels(levels, [2]);
      break;
    case "Enter":
      break;
  }

  console.log(event.code);
  moveBlock(activeBlock, mov);
  if (rot) {
    rotateBlock(activeBlock, rot);
  }
}
