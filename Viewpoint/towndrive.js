////////////////////////////////////////////////////////////////////
//    Bíll sem keyrir í hringi í umhverfi með húsum.  Hægt að
//    breyta sjónarhorni áhorfanda með því að slá á 1, 2, ..., 8.
//    Einnig hægt að breyta hæð áhorfanda með upp/niður örvum.
////////////////////////////////////////////////////////////////////
var canvas;
var gl;

// Globals (modernized)
const COLORS = [
  vec4(0.1, 0.1, 0.8, 1.0),
  vec4(0.9, 0.2, 0.3, 1.0),
  vec4(0.1, 0.6, 0.1, 1.0),
  vec4(0.8, 0.9, 0.1, 1.0),
  vec4(0.4, 0.4, 0.4, 1.0),
  vec4(1.0, 0.5, 0.0, 1.0),
  vec4(0.6, 0.0, 0.6, 1.0),
  vec4(0.0, 0.0, 0.0, 1.0),
  vec4(1.0, 0.0, 0.0, 1.0),
  vec4(0.0, 0.0, 1.0, 1.0),
  vec4(0.45, 0.3, 0.2, 1.0)
];

const LOWBLUE = COLORS[0];
const WARM_RED = COLORS[1];
const GREEN = COLORS[2];
const YELLOW = COLORS[3];
const GRAY = COLORS[4];
const ORANGE = COLORS[5];
const PURPLE = COLORS[6];
const BLACK = COLORS[7];
const RED = COLORS[8];
const BLUE = COLORS[9];
const BROWN = COLORS[10];

const TRACK_RADIUS = 95.0;
const TRACK_INNER = 90.0;
const TRACK_OUTER = 105.0;
const TRACK_PTS = 100;

const TRACK2_RADIUS = 108.0;
const TRACK2_INNER = 105.0;
const TRACK2_OUTER = 115.0;
const TRACK2_PTS = 100;

const CAR_SCALE = 1.0;
let CAR_SPEED1 = 1.2;
let CAR_SPEED2 = 0.9;
let CAR_COLOR1 = ORANGE;
let CAR_COLOR2 = PURPLE;

const numCubeVertices = 36;

let airplane = { t: 0, prevYaw: undefined };

const walkCam = { x: 0.0, y: 0.0, yaw: 0.0 };

const keyState = {};

let carDirection = 0.0;
let carXPos = 100.0;
let carYPos = 0.0;

let carDirection2 = 180.0;
let carXPos2 = 120.0;
let carYPos2 = 0.0;

let height = 0.0;
let view = 1;

let colorLoc, mvLoc, pLoc, proj;
let cubeBuffer, trackBuffer, track2Buffer, vPosition;
let trackVertexCount = 0;
let track2VertexCount = 0;

const cVertices = [
  vec3(-0.5, 0.5, 0.5),
  vec3(-0.5, -0.5, 0.5),
  vec3(0.5, -0.5, 0.5),
  vec3(0.5, -0.5, 0.5),
  vec3(0.5, 0.5, 0.5),
  vec3(-0.5, 0.5, 0.5),

  vec3(0.5, 0.5, 0.5),
  vec3(0.5, -0.5, 0.5),
  vec3(0.5, -0.5, -0.5),
  vec3(0.5, -0.5, -0.5),
  vec3(0.5, 0.5, -0.5),
  vec3(0.5, 0.5, 0.5),

  vec3(0.5, -0.5, 0.5),
  vec3(-0.5, -0.5, 0.5),
  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5, -0.5, -0.5),
  vec3(0.5, -0.5, -0.5),
  vec3(0.5, -0.5, 0.5),

  vec3(0.5, 0.5, -0.5),
  vec3(-0.5, 0.5, -0.5),
  vec3(-0.5, 0.5, 0.5),
  vec3(-0.5, 0.5, 0.5),
  vec3(0.5, 0.5, 0.5),
  vec3(0.5, 0.5, -0.5),

  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5, 0.5, -0.5),
  vec3(0.5, 0.5, -0.5),
  vec3(0.5, 0.5, -0.5),
  vec3(0.5, -0.5, -0.5),
  vec3(-0.5, -0.5, -0.5),

  vec3(-0.5, 0.5, -0.5),
  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5, -0.5, 0.5),
  vec3(-0.5, -0.5, 0.5),
  vec3(-0.5, 0.5, 0.5),
  vec3(-0.5, 0.5, -0.5),
];

let tVertices = [];
let t2Vertices = [];

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.7, 1.0, 0.7, 1.0);
  gl.enable(gl.DEPTH_TEST);

  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  // build tracks
  tVertices = [];
  t2Vertices = [];
  createTrack();
  createSecondTrack();
  numTrackVertices = tVertices.length;
  numTrack2Vertices = t2Vertices.length;

  // upload track buffers
  trackBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trackBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(tVertices), gl.STATIC_DRAW);

  track2Buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, track2Buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(t2Vertices), gl.STATIC_DRAW);

  // cube buffer uploaded once
  cubeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(cVertices), gl.STATIC_DRAW);

  vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  colorLoc = gl.getUniformLocation(program, "fColor");
  mvLoc = gl.getUniformLocation(program, "modelview");
  pLoc = gl.getUniformLocation(program, "projection");

  proj = perspective(50.0, canvas.width / canvas.height, 1.0, 500.0);
  gl.uniformMatrix4fv(pLoc, false, flatten(proj));

  document.getElementById("Viewpoint").innerHTML = "1: Fjarlægt sjónarhorn";
  document.getElementById("Height").innerHTML = "Viðbótarhæð: " + height;

  window.addEventListener("keydown", function (e) {
    switch (e.keyCode) {
      case 48:
        view = 0;
        document.getElementById("Viewpoint").innerHTML =
          "0: Séð frá gangandi vegfaranda";
        break;
      case 49:
        view = 1;
        document.getElementById("Viewpoint").innerHTML =
          "1: Fjarlægt sjónarhorn";
        break;
      case 50:
        view = 2;
        document.getElementById("Viewpoint").innerHTML =
          "2: Horfa á bílinn innan úr hringnum";
        break;
      case 51:
        view = 3;
        document.getElementById("Viewpoint").innerHTML =
          "3: Horfa á bílinn fyrir utan hringinn";
        break;
      case 52:
        view = 4;
        document.getElementById("Viewpoint").innerHTML =
          "4: Sjónarhorn ökumanns";
        break;
      case 53:
        view = 5;
        document.getElementById("Viewpoint").innerHTML =
          "5: Horfa alltaf á eitt hús innan úr bílnum";
        break;
      case 54:
        view = 6;
        document.getElementById("Viewpoint").innerHTML =
          "6: Fyrir aftan og ofan bílinn";
        break;
      case 55:
        view = 7;
        document.getElementById("Viewpoint").innerHTML =
          "7: Horft aftur úr bíl fyrir framan";
        break;
      case 56:
        view = 8;
        document.getElementById("Viewpoint").innerHTML =
          "8: Til hliðar við bílinn";
        break;
      case 38:
        height += 2.0;
        document.getElementById("Height").innerHTML = "Viðbótarhæð: " + height;
        break;
      case 40:
        height -= 2.0;
        document.getElementById("Height").innerHTML = "Viðbótarhæð: " + height;
        break;
    }
  });

  window.addEventListener("keydown", function (e) {
    keyState[e.key.toLowerCase()] = true;
  });
  window.addEventListener("keyup", function (e) {
    keyState[e.key.toLowerCase()] = false;
  });

  render();
};

function createTrack() {
  let theta = 0.0;
  tVertices = [];
  for (let i = 0; i <= TRACK_PTS; i++) {
    const p1 = vec3(
      TRACK_OUTER * Math.cos(radians(theta)),
      TRACK_OUTER * Math.sin(radians(theta)),
      0.0
    );
    const p2 = vec3(
      TRACK_INNER * Math.cos(radians(theta)),
      TRACK_INNER * Math.sin(radians(theta)),
      0.0
    );
    tVertices.push(p1, p2);
    theta += 360.0 / TRACK_PTS;
  }
}

function createSecondTrack() {
  let theta = 0.0;
  t2Vertices = [];
  for (let i = 0; i <= TRACK2_PTS; i++) {
    const p1 = vec3(TRACK2_OUTER * Math.cos(radians(theta)), TRACK2_OUTER * Math.sin(radians(theta)), 0.0);
    const p2 = vec3(TRACK2_INNER * Math.cos(radians(theta)), TRACK2_INNER * Math.sin(radians(theta)), 0.0);
    t2Vertices.push(p1, p2);
    theta += 360.0 / TRACK2_PTS;
  }
}

function drawBox(mv, sx, sy, sz, color) {
  const m = mult(mv, scalem(sx, sy, sz));
  gl.uniform4fv(colorLoc, color);
  gl.uniformMatrix4fv(mvLoc, false, flatten(m));
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}

function drawBridge(
  mv,
  cx,
  cy,
  openWidth,
  spanDepth,
  totalHeight,
  thickness,
  color
) {
  const base = mult(mv, translate(cx, cy, 0.0));
  const halfOpen = openWidth * 0.5;
  const pillarX = halfOpen + thickness * 0.5;
  const pillarZ = totalHeight * 0.5;

  drawBox(
    mult(base, translate(-pillarX, 0.0, pillarZ)),
    thickness,
    spanDepth,
    totalHeight,
    color
  );

  drawBox(
    mult(base, translate(pillarX, 0.0, pillarZ)),
    thickness,
    spanDepth,
    totalHeight,
    color
  );

  const topZ = totalHeight - thickness * 0.5;
  const topWidth = openWidth + thickness * 3.0;
  const topThickness = thickness * 2.0;
  drawBox(
    mult(base, translate(0.0, 0.0, topZ)),
    topWidth,
    spanDepth * 1.2,
    topThickness,
    color
  );
}

function housePlain(mv, sx, sy, sz, color) {
  const body = mult(mv, translate(0, 0, sz * 0.5)); // body slightly shorter so roof sits nicely
  drawBox(body, sx, sy, sz, color);
}
function houseRoof(mv, sx, sy, sz, color) {
  const bodySz = sz * 1.2;
  const body = mult(mv, translate(0, 0, bodySz * 0.5));
  drawBox(body, sx, sy, bodySz, color);

  const roofThickness = Math.max(0.4, sz * 0.1);
  const raise = Math.max(0.5, sz * 0.06); // raise roof slightly higher so halves meet above body
  const roofZ = bodySz + roofThickness * 0.7 + raise;
  const eaveExtend = Math.max(0.18, sy * 0.06);
  const plateX = sx * 1.05;
  const plateY = sy * 0.6 + eaveExtend;
  const peakInset = Math.max(0.02, roofThickness * 0.25);

  let left = mv;
  left = mult(left, translate(0.0, sy * 0.25 + eaveExtend * 0.5, roofZ - peakInset));
  left = mult(left, rotateX(-24.0));
  left = mult(left, scalem(plateX, plateY, roofThickness));
  drawBox(left, 1.0, 1.0, 1.0, BLACK);

  let right = mv;
  right = mult(right, translate(0.0, -sy * 0.25 - eaveExtend * 0.5, roofZ - peakInset));
  right = mult(right, rotateX(24.0));
  right = mult(right, scalem(plateX, plateY, roofThickness));
  drawBox(right, 1.0, 1.0, 1.0, BLACK);
}

// drawHouse: type 0 = plain, 1 = roof
function drawHouse(type, mv, x, y, rotDeg, sx, sy, sz, colorIndexOrColor) {
  let color = COLORS[0];
  if (colorIndexOrColor !== undefined) {
    if (typeof colorIndexOrColor === "number") {
      color = COLORS[Math.abs(colorIndexOrColor) % COLORS.length];
    } else if (colorIndexOrColor.length === 4) {
      color = colorIndexOrColor;
    }
  }

  let base = mult(mv, translate(x, y, 0.0));
  base = mult(base, rotateZ(-rotDeg));

  sx = Math.max(2.5, sx);
  sy = Math.max(2.5, sy);
  sz = Math.max(2.5, sz);

  if (type === 0) housePlain(base, sx, sy, sz, color);
  else houseRoof(base, sx, sy, sz, color);
}


function drawTown(vm) {
  const placements = [
    [-20.0, 50.0, 6.0, 1, 0],
    [0.0, 70.0, 10.0, 0, 1],
    [20.0, -10.0, 8.0, 1, 2],
    [40.0, 120.0, 10.0, 0, 3],
    [-30.0, -50.0, 7.0, 1, 0],
    [10.0, -60.0, 10.0, 0, 1],
    [-20.0, 75.0, 8.0, 1, 2],
    [-40.0, 140.0, 10.0, 0, 3],
  ];

  for (let i = 0; i < placements.length; ++i) {
    const p = placements[i];
    const x = p[0], y = p[1], h = p[2];
    const type = p[3] === 1 ? 1 : 0;
    const colorIndex = p[4] !== undefined ? p[4] : i % COLORS.length;
    const sx = Math.max(4.0, h * 1.2);
    const sy = Math.max(4.0, h * 1.0);
    const sz = h;
    drawHouse(type, vm, x, y, 180.0, sx, sy, sz, colorIndex);
  }
}

function drawScenery(mv) {
  gl.uniform4fv(colorLoc, GRAY);
  gl.bindBuffer(gl.ARRAY_BUFFER, trackBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, numTrackVertices);

  gl.uniform4fv(colorLoc, GRAY);
  gl.bindBuffer(gl.ARRAY_BUFFER, track2Buffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, numTrack2Vertices);

  drawBridge(
    mv,
    -100.0, //cx
    19.0,   //cy
    40.0,   //open width
    15.0,   //depth of top
    20.0,   //totalHeight
    1.8,    //thickness
    COLORS[10] //color
  );
  drawTown(mv);
}

function drawCar(mv, color) {
  mv = mult(mv, scalem(CAR_SCALE, CAR_SCALE, CAR_SCALE));
  color = color || BLUE;
  gl.uniform4fv(colorLoc, color);
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

  var mvBody = mult(mv, scalem(10.0, 3.0, 2.0));
  mvBody = mult(mvBody, translate(0.0, 0.0, 0.5));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mvBody));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  var mvTop = mult(mv, scalem(4.0, 3.0, 2.0));
  mvTop = mult(mvTop, translate(-0.2, 0.0, 1.5));
  gl.uniformMatrix4fv(mvLoc, false, flatten(mvTop));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}

function drawAirplane(mv) {
  const a = 100;
  const t = airplane.t || 0.0;

  const baseHeight = Math.max(TRACK_OUTER, TRACK2_OUTER) * 0.5 + 8.0;
  const pz = Math.max(
    2.0,
    Math.min(490.0, baseHeight + 6.0 * Math.sin(5.0 * t))
  );

  const px = a * Math.sin(t);
  const py = a * Math.sin(t) * Math.cos(t);

  const dpx = a * Math.cos(t);
  const dpy = a * (Math.cos(2.0 * t) - Math.sin(t) * Math.sin(t));

  const yawRad = Math.atan2(dpy, dpx);
  if (typeof airplane.prevYaw !== "number") airplane.prevYaw = yawRad;

  const deltaUnwrapped =
    ((yawRad - airplane.prevYaw + Math.PI) % (2 * Math.PI)) - Math.PI;
  airplane.prevYaw = yawRad;

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const bankDeg = clamp(30.0 * deltaUnwrapped, -25, 25);

  const base = mult(
    mult(mult(mv, translate(px, py, pz)), rotateZ(degrees(yawRad))),
    rotateX(bankDeg)
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

  // plane
  gl.uniform4fv(colorLoc, RED);
  gl.uniformMatrix4fv(mvLoc, false, flatten(mult(base, scalem(10, 1.5, 1.5))));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  // wings
  gl.uniform4fv(colorLoc, BLUE);
  gl.uniformMatrix4fv(mvLoc, false, flatten(mult(base, scalem(2, 10, 0.3))));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

  // tail
  const tail = mult(mult(base, translate(-4.5, 0, 1.0)), scalem(1.0, 0.3, 1.5));
  gl.uniform4fv(colorLoc, BLUE);
  gl.uniformMatrix4fv(mvLoc, false, flatten(tail));
  gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  updateAirplane();

  carDirection += CAR_SPEED1;
  if (carDirection >= 360.0) carDirection -= 360.0;
  carXPos = TRACK_RADIUS * Math.sin(radians(carDirection));
  carYPos = TRACK_RADIUS * Math.cos(radians(carDirection));

  carDirection2 -= CAR_SPEED2;
  if (carDirection2 < 0.0) carDirection2 += 360.0;
  carXPos2 = TRACK2_RADIUS * Math.sin(radians(carDirection2));
  carYPos2 = TRACK2_RADIUS * Math.cos(radians(carDirection2));

  function drawCarAt(vm, x, y, dirDeg, color) {
    var local = vm;
    local = mult(local, translate(x, y, 0.1 * CAR_SCALE));
    local = mult(local, rotateZ(-dirDeg));
    drawCar(local, color);
  }

  var mv = mat4();
  var viewMatrix;

  switch (view) {
    case 0:
      mv = getWalkingView();
      viewMatrix = mv;
      drawScenery(viewMatrix);
      drawCarAt(viewMatrix, carXPos, carYPos, carDirection, CAR_COLOR1);
      drawCarAt(viewMatrix, carXPos2, carYPos2, carDirection2, CAR_COLOR2);
      break;

    case 1:
      mv = lookAt(
        vec3(250.0, 0.0, 100.0 + height),
        vec3(0.0, 0.0, 0.0),
        vec3(0.0, 0.0, 1.0)
      );
      viewMatrix = mv;
      drawScenery(viewMatrix);
      drawCarAt(viewMatrix, carXPos, carYPos, carDirection, CAR_COLOR1);
      drawCarAt(viewMatrix, carXPos2, carYPos2, carDirection2, CAR_COLOR2);
      break;

    case 2:
      mv = lookAt(
        vec3(75.0, 0.0, 5.0 + height),
        vec3(carXPos, carYPos, 0.0),
        vec3(0.0, 0.0, 1.0)
      );
      viewMatrix = mv;
      drawScenery(viewMatrix);
      drawCarAt(viewMatrix, carXPos, carYPos, carDirection, CAR_COLOR1);
      drawCarAt(viewMatrix, carXPos2, carYPos2, carDirection2, CAR_COLOR2);
      break;

    case 3:
      mv = lookAt(
        vec3(125.0, 0.0, 5.0 + height),
        vec3(carXPos, carYPos, 0.0),
        vec3(0.0, 0.0, 1.0)
      );
      viewMatrix = mv;
      drawScenery(viewMatrix);
      drawCarAt(viewMatrix, carXPos, carYPos, carDirection, CAR_COLOR1);
      drawCarAt(viewMatrix, carXPos2, carYPos2, carDirection2, CAR_COLOR2);
      break;

    case 4:
      mv = lookAt(
        vec3(-3.0, 0.0, 5.0 + height),
        vec3(12.0, 0.0, 2.0 + height),
        vec3(0.0, 0.0, 1.0)
      );
      viewMatrix = mv;
      var mvScenery = mult(viewMatrix, rotateZ(carDirection));
      mvScenery = mult(mvScenery, translate(-carXPos, -carYPos, 0.0));
      drawScenery(mvScenery);
      drawCarAt(mvScenery, carXPos, carYPos, carDirection, CAR_COLOR1);
      drawCarAt(mvScenery, carXPos2, carYPos2, carDirection2, CAR_COLOR2);
      break;

    case 5:
      mv = rotateY(-carDirection);
      mv = mult(
        mv,
        lookAt(
          vec3(3.0, 0.0, 5.0 + height),
          vec3(40.0 - carXPos, 120.0 - carYPos, 0.0),
          vec3(0.0, 0.0, 1.0)
        )
      );
      viewMatrix = mv;
      var mvScenery5 = mult(viewMatrix, rotateZ(carDirection));
      mvScenery5 = mult(mvScenery5, translate(-carXPos, -carYPos, 0.0));
      drawScenery(mvScenery5);
      drawCarAt(mvScenery5, carXPos, carYPos, carDirection, CAR_COLOR1);
      drawCarAt(mvScenery5, carXPos2, carYPos2, carDirection2, CAR_COLOR2);
      break;

    case 6:
      mv = lookAt(
        vec3(-12.0, 0.0, 6.0 + height),
        vec3(15.0, 0.0, 4.0),
        vec3(0.0, 0.0, 1.0)
      );
      viewMatrix = mv;
      var mvScenery6 = mult(viewMatrix, rotateZ(carDirection));
      mvScenery6 = mult(mvScenery6, translate(-carXPos, -carYPos, 0.0));
      drawScenery(mvScenery6);
      drawCarAt(mvScenery6, carXPos, carYPos, carDirection, CAR_COLOR1);
      drawCarAt(mvScenery6, carXPos2, carYPos2, carDirection2, CAR_COLOR2);
      break;

    case 7:
      mv = lookAt(
        vec3(25.0, 5.0, 5.0 + height),
        vec3(0.0, 0.0, 2.0),
        vec3(0.0, 0.0, 1.0)
      );
      viewMatrix = mv;
      var mvScenery7 = mult(viewMatrix, rotateZ(carDirection));
      mvScenery7 = mult(mvScenery7, translate(-carXPos, -carYPos, 0.0));
      drawScenery(mvScenery7);
      drawCarAt(mvScenery7, carXPos, carYPos, carDirection, CAR_COLOR1);
      drawCarAt(mvScenery7, carXPos2, carYPos2, carDirection2, CAR_COLOR2);
      break;

    case 8:
      mv = lookAt(
        vec3(2.0, 20.0, 5.0 + height),
        vec3(2.0, 0.0, 2.0),
        vec3(0.0, 0.0, 1.0)
      );
      viewMatrix = mv;
      var mvScenery8 = mult(viewMatrix, rotateZ(carDirection));
      mvScenery8 = mult(mvScenery8, translate(-carXPos, -carYPos, 0.0));
      drawScenery(mvScenery8);
      drawCarAt(mvScenery8, carXPos, carYPos, carDirection, CAR_COLOR1);
      drawCarAt(mvScenery8, carXPos2, carYPos2, carDirection2, CAR_COLOR2);
      break;
  }

  drawAirplane(viewMatrix);
  requestAnimFrame(render);
}

function updateAirplane() {
  airplane.t += 0.01;
  if (airplane.t > 2 * Math.PI) airplane.t -= 2 * Math.PI;
}

function getWalkingView() {
  var moveSpeed = 1.0;
  var turnSpeed = 0.03;

  if (keyState["w"]) {
    walkCam.x += moveSpeed * Math.cos(walkCam.yaw);
    walkCam.y += moveSpeed * Math.sin(walkCam.yaw);
  }
  if (keyState["s"]) {
    walkCam.x -= moveSpeed * Math.cos(walkCam.yaw);
    walkCam.y -= moveSpeed * Math.sin(walkCam.yaw);
  }
  if (keyState["a"]) walkCam.yaw += turnSpeed;
  if (keyState["d"]) walkCam.yaw -= turnSpeed;

  var eye = vec3(walkCam.x, walkCam.y, 4.0 + height);
  var at = vec3(
    walkCam.x + Math.cos(walkCam.yaw),
    walkCam.y + Math.sin(walkCam.yaw),
    4.0 + height
  );
  var up = vec3(0, 0, 1);

  return lookAt(eye, at, up);
}

function radians(deg) {
  return (deg * Math.PI) / 180.0;
}
function degrees(rad) {
  return (rad * 180.0) / Math.PI;
}
