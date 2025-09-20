/////////////////////////////////////////////////////////////////
//
//     Ferningur skoppar um gluggann.  Notandi getur breytt
//     hraðanum með upp/niður örvum.
//     Hann hoppar upp þegar hann lendir á spaðanum.
//     Spaðann er hægt að hreyfa með vinstri og hægri örvatökkum.
//
/////////////////////////////////////////////////////////////////

var canvas;
var gl;

var program;
var vPosition;
var locBox;
var locColor;

// ball
var box = vec2(0.0, 0.0);
var dX, dY;
var boxRad = 0.05;
var boxVertices = new Float32Array([
  -0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, 0.05,
]);
var boxBuffer;

// paddle
var vertices = [
  vec2(-0.1, -0.9),
  vec2(-0.1, -0.86),
  vec2(0.1, -0.86),
  vec2(0.1, -0.9),
];
var paddleBuffer;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.8, 0.8, 0.8, 1.0);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  vPosition = gl.getAttribLocation(program, "vPosition");
  locBox = gl.getUniformLocation(program, "boxPos");
  locColor = gl.getUniformLocation(program, "color");

  // buffer for ball
  boxBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, boxVertices, gl.STATIC_DRAW);

  // buffer for paddle
  paddleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, paddleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);

  // initial random ball direction / slembistefna
  dX = Math.random() * 0.02 - 0.01;
  dY = Math.random() * 0.02 + 0.015;

  // keys for paddle and ball
  window.addEventListener("keydown", function (e) {
    switch (e.keyCode) {
      case 37: // left arrow
        xmove = -0.04;
        for (i = 0; i < 4; i++) {
          vertices[i][0] += xmove;
        }
        break;

      case 39: // right arrow
        xmove = 0.04;
        for (i = 0; i < 4; i++) {
          vertices[i][0] += xmove;
        }
        break;

      case 38: // up arrow – speed ball
        dX *= 1.1;
        dY *= 1.1;
        break;

      case 40: // down arrow – slow ball
        dX /= 1.1;
        dY /= 1.1;
        break;
    }

    // update buffer if paddle was moved
    gl.bindBuffer(gl.ARRAY_BUFFER, paddleBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
  });

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // ball bounce of wall
  if (Math.abs(box[0] + dX) > 1.0 - boxRad) dX = -dX;
  if (Math.abs(box[1] + dY) > 1.0 - boxRad) dY = -dY;

  // paddle/ ball collision
  var paddleTop = vertices[1][1];
  var paddleBottom = vertices[0][1];
  var paddleLeft = vertices[0][0];
  var paddleRight = vertices[3][0];

  if (
    box[1] - boxRad <= paddleTop &&
    box[1] - boxRad >= paddleBottom &&
    box[0] >= paddleLeft &&
    box[0] <= paddleRight
  ) {
    dY = Math.abs(dY); // bounce up
  }

  // update ball position
  box[0] += dX;
  box[1] += dY;

  // draw - ball
  gl.uniform4fv(locColor, vec4(1.0, 0.0, 0.0, 1.0)); // Green
  gl.bindBuffer(gl.ARRAY_BUFFER, boxBuffer);
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  gl.uniform2fv(locBox, flatten(box));
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  // draw - paddle
  gl.uniform4fv(locColor, vec4(0.0, 0.0, 0.0, 1.0)); // Green
  gl.bindBuffer(gl.ARRAY_BUFFER, paddleBuffer);
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  gl.uniform2fv(locBox, flatten([0, 0])); // no translation
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  window.requestAnimFrame(render);
}
