//Þið eigið að skrifa forritið clicktriangles
// þar sem við hvern músarsmell er teiknaður lítill þríhyrningur
// með miðju í skjápunktinum sem smellt var á
// (þið þurfið því að búa til 3 punkta fyrir hvern smell og setja þá í fylkið). 

var canvas;
var gl;

// Þarf hámarksfjölda punkta til að taka frá pláss í grafíkminni
var maxNumTriangles = 200;  
var index = 0;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 1.0, 0.8, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumTriangles*3, gl.DYNAMIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    canvas.addEventListener("mousedown", function(e){

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        
        // Calculate coordinates of new point
        var center = vec2(
            2*e.offsetX/canvas.width-1,
            2*(canvas.height-e.offsetY)/canvas.height-1);
        
        var a = add(center, vec2(-0.05, -0.05));
        var b = add(center, vec2(0.05, -0.05));
        var c = add(center, vec2(0, 0.05));
        
        // Add new point behind the others
        gl.bufferSubData(gl.ARRAY_BUFFER, 24*index, flatten(a));
        gl.bufferSubData(gl.ARRAY_BUFFER, 24*index+8, flatten(b));
        gl.bufferSubData(gl.ARRAY_BUFFER, 24*index+16, flatten(c));

        index++;
    } );

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3*index );

    window.requestAnimFrame(render);
}
