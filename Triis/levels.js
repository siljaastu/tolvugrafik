// Create a new empty 6x6 level
function newEmptyLevel() {
  level = [];

  for (var x = 0; x < WIDTH; x++) {
    level[x] = [];
    for (var z = 0; z < WIDTH; z++) {
      level[x][z] = undefined;
    }
  }

  return level;
}

function createLevels() {
  levels = [];
  for (var y = 0; y < HEIGHT; y++) {
    levels[y] = newEmptyLevel();
  }

  return levels;
}

function newHeightMap() {
  var heights = [];

  for (var x = 0; x < WIDTH; x++) {
    heights[x] = [];
    for (var z = 0; z < WIDTH; z++) {
      heights[x][z] = 0;
    }
  }

  return heights;
}

// Remove all cubes in given level
function clearLevel(levels, y) {
  for (var x = 0; x < WIDTH; x++) {
    for (var z = 0; z < WIDTH; z++) {
      const cube = levels[y][x][z];

      if (cube !== undefined) {
        const block = cube.parent;
        block.remove(cube);
        levels[y][x][z] = undefined;
      }
    }
  }
}

function dropLevelsAbove(levels, startLevel) {
  // Start at the current level and process all levels above (except the last one)
  for (var y = startLevel; y < levels.length - 1; y++) {
    // Drop the level above to our level
    levels[y] = levels[y + 1];

    // Update coordinates for all blocks in the dropped level
    for (var x = 0; x < WIDTH; x++) {
      for (var z = 0; z < WIDTH; z++) {
        const cube = levels[y][x][z];

        if (cube !== undefined) {
          cube.position.add(new THREE.Vector3(0, -cubeSize, 0));
        }
      }
    }
  }

  // Create an empty level at the top
  levels[levels.length - 1] = newEmptyLevel();
}

// Collapse any empty levels (=== undefined)
function collapseEmptyLevels(levels) {
  for (var y = 0; y < levels.length; y++) {
    if (levels[y] === undefined) {
      dropLevelsAbove(levels, y);
    }
  }
}

// Remove all levels specified by the filledLevels array
function removeLevels(levels, filledLevels) {
  console.log("Remove levels:", filledLevels);
  // console.log("Score before remove " + filledLevels.length + " many levels: " + score);
  setScore(filledLevels.length);
  // console.log("Score eftir: " + score);
  for (const y of filledLevels) {
    // First clear all cubes from the level
    clearLevel(levels, y);

    // Mark the level to be removed
    levels[y] = undefined;
  }

  // Update height map
  for (var x = 0; x < WIDTH; x++) {
    for (var z = 0; z < WIDTH; z++) {
      heights[x][z] = Math.max(heights[x][z] - filledLevels.length, 0);
    }
  }

  // Remove all "undefined" levels and collapse those above down
  collapseEmptyLevels(levels);
}

// Check if a level is completely filled by cubes
function isLevelFilled(y) {
  for (var x = 0; x < WIDTH; x++) {
    for (var z = 0; z < WIDTH; z++) {
      if (levels[y][x][z] === undefined) {
        return false;
      }
    }
  }
  return true;
}
