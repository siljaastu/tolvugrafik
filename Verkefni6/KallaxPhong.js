/////////////////////////////////////////////////////////////////
//
//  Kallax hilla teiknuð úr kubbum
//  Lýst með endurskinslíkani Blinn-Phong og notar Phong litun
//
/////////////////////////////////////////////////////////////////

var canvas;
var gl;

var NumVertices = 36;

var pointsArray = [];
var normalsArray = [];

var movement = false;
var spinX = 0;
var spinY = 0;
var origX, origY;

var zDist = -2.5;
var fovy = 50.0;
var near = 0.2;
var far = 100.0;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 ); // directional
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0 );

// Single material color for the Kallax unit (example brown)
var materialAmbient = vec4(0.6, 0.4, 0.2, 1.0);
var materialDiffuse = vec4(0.6, 0.4, 0.2, 1.0);
var materialSpecular = vec4(0.9, 0.9, 0.9, 1.0);
var materialShininess = 80.0;

var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var projectionMatrix;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    // match canvas drawing buffer to displayed size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); return; }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);

    // Build unit cube (positions + face normals) - same layout as PhongCube
    normalCube();

    // Load shaders
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Upload normals buffer (vec4)
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Upload positions buffer (vec4)
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Uniform locations
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    projectionMatrix = perspective(fovy, canvas.width / canvas.height, near, far);

    // Lighting products
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    // Mouse controls (orbit)
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
        origY = e.clientY;
        e.preventDefault();
    });
    canvas.addEventListener("mouseup", function(e){ movement = false; });
    canvas.addEventListener("mousemove", function(e){
        if (movement) {
            spinY = (spinY + (e.clientX - origX)) % 360;
            spinX = (spinX + (origY - e.clientY)) % 360;
            origX = e.clientX;
            origY = e.clientY;
        }
    });

    window.addEventListener("wheel", function(e){
        if (e.deltaY > 0) zDist += 0.2;
        else zDist -= 0.2;
    });

    render();
};

// Build cube data - same as PhongCube
function normalCube() {
    quad(1,0,3,2,0);
    quad(2,3,7,6,1);
    quad(3,0,4,7,2);
    quad(6,5,1,2,3);
    quad(4,5,6,7,4);
    quad(5,4,0,1,5);
}

function quad(a, b, c, d, n) {
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var faceNormals = [
        vec4( 0.0, 0.0,  1.0, 0.0 ),  // front
        vec4( 1.0, 0.0, 0.0, 0.0 ),   // right
        vec4( 0.0, -1.0, 0.0, 0.0 ),  // down
        vec4( 0.0,  1.0, 0.0, 0.0 ),  // up
        vec4( 0.0, 0.0, -1.0, 0.0 ),  // back
        vec4( -1.0, 0.0, 0.0, 0.0 )   // left
    ];

    var indices = [ a, b, c, a, c, d ];

    for (var i = 0; i < indices.length; ++i) {
        pointsArray.push(vertices[indices[i]]);
        normalsArray.push(faceNormals[n]);
    }
}

// Draw the Kallax shelf by positioning/scaling the cube many times
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Camera
    var eye = vec3(0.0, 0.0, zDist);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);

    var mv = lookAt(eye, at, up);
    mv = mult(mv, rotateX(spinX));
    mv = mult(mv, rotateY(spinY));

    // Common scale applied to whole shelf
    var globalScale = scalem(1.3, 1.3, 1.3);
    mv = mult(mv, globalScale);

    // Helper: draw one cube with given center and size (non-uniform scale allowed)
    function drawCube(center, size) {
        var t = translate(center[0], center[1], center[2]);
        var s = scalem(size[0], size[1], size[2]);
        var modelView = mult(mv, mult(t, s));

        // normal matrix: upper-left 3x3 of modelView
        var normalMatrix = [
            vec3(modelView[0][0], modelView[0][1], modelView[0][2]),
            vec3(modelView[1][0], modelView[1][1], modelView[1][2]),
            vec3(modelView[2][0], modelView[2][1], modelView[2][2])
        ];
        normalMatrix.matrix = true;

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelView));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
        gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    }

    // Kallax shelf geometry parameters
    var t = 0.03; //thickness
    var d = 0.4; //depth
    var h = 0.8; //height

    // Right side
    drawCube([-0.4, 0.0, 0.0], [2*t, h, d]);
    // Left side
    drawCube([0.4, 0.0, 0.0], [2*t, h, d]);
    // Top 
    drawCube([0.0, 0.4, 0.0], [h + 2*t, 2*t, d]);
    // Bottom 
    drawCube([0.0, -0.4, 0.0], [h + 2*t, 2*t, d]);
    // Middle horizontal shelf
    drawCube([0.0, 0.0, 0.0], [h + t, t, d - 0.01]);
    // Middle vertical divider
    drawCube([0.0, 0.0, 0.0], [t, h + t, d - 0.02]);
    window.requestAnimFrame(render);
}
