"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2(-1, 1),
        vec2(1, 1),
        vec2(1, -1),
        vec2(-1, -1)
    ];

    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function square( a, b, c, d)
{
    points.push( a, b, c);
    points.push(a, c, d);
}

function divideSquare( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        square( a, b, c, d);
    }
    else {

        //bisect the sides

        var aab = mix( a, b, 1.0/3 );
        var abb = mix( a, b, 2.0/3 );
        var bbc = mix( b, c, 1.0/3 );
        var bcc = mix( b, c, 2.0/3 );
        var ccd = mix( c, d, 1.0/3 );
        var cdd = mix( c, d, 2.0/3 );
        var dda = mix( d, a, 1.0/3 );
        var daa = mix( d, a, 2.0/3 );
        var dab = mix( aab, cdd, 1.0/3 );
        var abc = mix( abb, ccd, 1.0/3 );
        var bcd = mix( abb, ccd, 2.0/3 );
        var cda = mix( aab, cdd, 2.0/3 );

        --count;

        // 8 new squares

        divideSquare( a, aab, dab, daa, count );
        divideSquare( aab, abb, abc, dab, count );
        divideSquare( abb, b, bbc, abc, count );
        divideSquare( abc, bbc, bcc, bcd, count );
        divideSquare( bcd, bcc, c, ccd, count );
        divideSquare( cda, bcd, ccd, cdd, count );
        divideSquare( dda, cda, cdd, d, count );
        divideSquare( daa, dab, cda, dda, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}