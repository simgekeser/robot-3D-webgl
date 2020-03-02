"use strict";

var canvas, gl, program;

var NumVertices = 36; 

var points = [];
var colors = [];
var mystack = [];
//

var lightPosition = vec4(8.0, 8.0, 8.0, 1.0 );
var lightAmbient = vec4(0.7, 0.7, 0.7, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 2.0, 2.0, 2.0, 2.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
//
var sliderScale=1;
var near = 0.3;
var far = 3.0;
var radius = 4.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;
var p=0;
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
//
var reposition=[0,0];
//
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

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];
var a=0;
var b=0;
var c=0;

var light=0;
var lightFlag=0;

// Parameters controlling the size of the Robot's arm
var HAND_HEIGHT      = 0.8;
var HAND_WIDTH       = 0.5;
var BASE_HEIGHT      = 6.0;
var BASE_WIDTH       = 2.5;
var BASE_GEN         = 2.25;
var LOWER_ARM_HEIGHT = 3.5;
var LOWER_ARM_WIDTH  = 0.25;
var UPPER_ARM_HEIGHT = 3.5;
var UPPER_ARM_WIDTH  = 0.75;
var HEAD_WIDTH 		 = 1;
var HEAD_HEIGHT 	 = 2;
var UPPER_LEG_WIDTH  = 0.9;
var UPPER_LEG_HEIGHT = 3.5;
var LOWER_LEG_WIDTH  = 0.3;
var LOWER_LEG_HEIGHT =3.5

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis


var theta = [ 0, 0, 0];
var alpha = [ 0, 0, 0];
var phi=[0,0];
var flag=0;
var sliderReposition=1;
var angle = 0;

var modelViewMatrixLoc;
var changeColor=0;
var changeColor2=0;
var changeColor3=0;
var changeColor4=0;
var vBuffer, cBuffer;
var colorDeneme,colorDeneme2,colorDeneme3,colorDeneme4;
var scaleFlag=0;
var iskeletFlag=0;
var repositionFlagX=0;
var repositionFlagY=0;

//----------------------------------------------------------------------------

function quad(  r,a,  b,  c,  d ) {
    colors.push(vertexColors[r]);
    points.push(vertices[a]);
    colors.push(vertexColors[r]);
    points.push(vertices[b]);
    colors.push(vertexColors[r]);
    points.push(vertices[c]);
    colors.push(vertexColors[r]);
    points.push(vertices[a]);
    colors.push(vertexColors[r]);
    points.push(vertices[c]);
    colors.push(vertexColors[r]);
    points.push(vertices[d]);
}

function colorCube() {
    quad( 6,1, 0, 3, 2 );
    quad( 6,2, 3, 7, 6 );
    quad( 6,3, 0, 4, 7 );
    quad( 6,6, 5, 1, 2 );
    quad( 6,4, 5, 6, 7 );
    quad( 6,5, 4, 0, 1 );
}

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext("webgl");
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable( gl.DEPTH_TEST );

	aspect =  canvas.width/canvas.height;
	
	
   
    //  Load shaders and initialize attribute buffers
	
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    colorCube();
	var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects
    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

	var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
  
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	 

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,"shininess"),materialShininess);


	
	//Buttonnn
	document.getElementById("bacakRengi").onclick = function(){
		 
		 if(changeColor==0){
					changeColor = 1;
					colorDeneme = [Math.random(), Math.random(), Math.random(), 1];
					}
				else 
				colorDeneme = [Math.random(), Math.random(), Math.random(), 1];
		 
	 };
    document.getElementById("govdeRengi").onclick = function(){
		if(changeColor2==0){
				changeColor2 = 1;
				colorDeneme2 = [Math.random(), Math.random(), Math.random(), 1];
			}
				else 
				colorDeneme2 = [Math.random(), Math.random(), Math.random(), 1];
	};
	
    document.getElementById("kolRengi").onclick = function(){
		if(changeColor3==0){
				changeColor3 = 1;
				colorDeneme3 = [Math.random(), Math.random(), Math.random(), 1];
			}
				else 
				colorDeneme3 = [Math.random(), Math.random(), Math.random(), 1];		
	};
	document.getElementById("elRengi").onclick = function(){
		if(changeColor4==0){
				changeColor4 = 1;
				colorDeneme4 = [Math.random(), Math.random(), Math.random(), 1];
			}
				else 
				colorDeneme4 = [Math.random(), Math.random(), Math.random(), 1];		
	};
	
	document.getElementById("iskelet yapısı").onclick = function(){
		if(iskeletFlag==0)
		iskeletFlag=1;
		else
			iskeletFlag=0;
	};
	 document.getElementById("slider").onchange = function(event) {
		 
				 sliderScale = event.target.value;
			
      
    };
	document.getElementById("slider2").onchange = function(event) {
		 
			   
			    reposition[0] = event.target.value;
				repositionFlagX=1;
      
    };
	document.getElementById("slider3").onchange = function(event) {
		 
			    
			    reposition[1] =  event.target.value;
				repositionFlagY=1;
      
    };
	document.getElementById("slider4").onchange = function(event) {
		 
			    
			    light =  event.target.value;
				lightFlag=1;
      
    };
	
	
	window.onkeydown = function(Event) {
	
		switch( Event.keyCode ) {
			
			case 38:
				alpha[0]+=5; 
				break;
			case 40:
				alpha[0]-=5; 
				break;
			case 39:
				alpha[1]+=5; 
				break;
			case 37:
				alpha[1]-=5;
				break;			
			case 80: //p tuşu
			
			if(p==0) {
				
					var f = 60* Math.PI / 180;
					f = Math.tan(Math.PI * 0.5 - 0.5 * f);
					var rangeInv = 1.0 / (near - far);
					var pMatrix = [f / aspect+1, 0, 0, 0,
									0, f, 0, 0,
									0, 0, (near + far) * rangeInv, -1,
									0, 0, near * far * rangeInv * 2,21		
					];
					
					
					gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(pMatrix) );
					p=1;
					
				}
		    else if(p==1) {
					projectionMatrix = ortho(-8, 8, -8,8, -8,8);
					gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );
					p=0;
			}
			break;
							
		}
	
	};
	
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-8, 8, -8, 8, -8, 8);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    render();
}


function torso() {
	
	var s = scale4(BASE_WIDTH/sliderScale, BASE_HEIGHT/sliderScale, BASE_GEN/sliderScale);
	var instanceMatrix = mult( translate( 0.0,0.0, 0.0 ), s);
	
    var t = mult(modelViewMatrix, instanceMatrix);
	var col = mat4();
	col = mult(col,scale4(1,0.1,0.9));
	if(changeColor2==1){
	var col = mat4();
	col = mult(col,scale4(colorDeneme2[0],colorDeneme2[1],colorDeneme2[2],colorDeneme2[3]));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
	}else{
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );}
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
}
	else
		gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}


function leftUpperArm() {
	
    var s = scale4(UPPER_ARM_WIDTH/sliderScale, UPPER_ARM_HEIGHT/sliderScale, UPPER_ARM_WIDTH/sliderScale);
    var instanceMatrix = mult(translate( 0, 0/sliderScale, 0.0 ),s);
	
	var t = mult(modelViewMatrix, instanceMatrix);
	var col = mat4();
	col = mult(col,scale4(0.7,0.4,0.1));	
	if(changeColor3==1){
	var col = mat4();
	col = mult(col,scale4(colorDeneme3[0],colorDeneme3[1],colorDeneme3[2]));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
	}else{
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );}
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
	}
	else
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}


function hand() {
	
	var s = scale4(HAND_WIDTH/sliderScale, HAND_HEIGHT/sliderScale, HAND_WIDTH/sliderScale);
	var instanceMatrix = mult( translate( 0.0, (-3.5-LOWER_ARM_HEIGHT*0.3)/sliderScale, 0.0 ), s);
	
	var t = mult(modelViewMatrix, instanceMatrix);
    var col = mat4();
	col = mult(col,scale4(1,0.4,0.1));
	if(changeColor4==1){
	var col = mat4();
	col = mult(col,scale4(colorDeneme4[0],colorDeneme4[1],colorDeneme4[2]));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
	}else{
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );}
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
	}
	else
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}


function leftLowerArm()
{
	
	var s = scale4(LOWER_ARM_WIDTH/sliderScale, LOWER_ARM_HEIGHT/sliderScale, LOWER_ARM_WIDTH/sliderScale);
	var instanceMatrix = mult( translate( 0, -2.5/sliderScale, 0.0 ), s);
		
    var t = mult(modelViewMatrix, instanceMatrix);
	var col = mat4();
	col = mult(col,scale4(0.7,0.4,0.1));
	if(changeColor3==1){
	var col = mat4();
	col = mult(col,scale4(colorDeneme3[0],colorDeneme3[1],colorDeneme3[2]));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
	}else{
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );}
	
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
	}
	else
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function rightUpperArm() {
	
    var s = scale4(UPPER_ARM_WIDTH/sliderScale, UPPER_ARM_HEIGHT/sliderScale, UPPER_ARM_WIDTH/sliderScale);
    var instanceMatrix = mult(translate( 0, 0, 0.0 ),s);
	
    var t = mult(modelViewMatrix, instanceMatrix);
	var col = mat4();
	col = mult(col,scale4(0.7,0.4,0.1));
		if(changeColor3==1){
	var col = mat4();
	col = mult(col,scale4(colorDeneme3[0],colorDeneme3[1],colorDeneme3[2]));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
	}else{
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );}
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
	}
	else
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}


function rightLowerArm()
{
	
    var s = scale4(LOWER_ARM_WIDTH/sliderScale, LOWER_ARM_HEIGHT/sliderScale, LOWER_ARM_WIDTH/sliderScale);
    var instanceMatrix = mult( translate( 0, -2.5/sliderScale, 0.0 ), s);
	
    var t = mult(modelViewMatrix, instanceMatrix);
	var col = mat4();
	col = mult(col,scale4(0.7,0.4,0.1));
		if(changeColor3==1){
	var col = mat4();
	col = mult(col,scale4(colorDeneme3[0],colorDeneme3[1],colorDeneme3[2]));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
	}else{
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );}
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
	}
	else
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function head()
{
	
	var s = scale4(HEAD_WIDTH/sliderScale, HEAD_HEIGHT/sliderScale, HEAD_WIDTH/sliderScale);
	var instanceMatrix = mult( translate( 0, 4/sliderScale, 0.0 ), s);
		
    var t = mult(modelViewMatrix, instanceMatrix);
	t=mult(t,rotate(phi[0] , 1 , 0 ,0));
	t=mult(t,rotate(phi[1] , 0 , 1 ,0));
	var col = mat4();
	col = mult(col,scale4(0.8,0.2,0.1));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
	;}
	else
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function leftUpperLeg() {
	
    var s = scale4(UPPER_LEG_WIDTH/sliderScale, UPPER_LEG_HEIGHT/sliderScale, UPPER_LEG_WIDTH/sliderScale);
    var instanceMatrix = mult(translate( 0, 0, 0.0 ),s);
	
    var t = mult(modelViewMatrix, instanceMatrix);
	var col = mat4();
	col = mult(col,scale4(0,0.7,0.8));
	
	if(changeColor==1){
	var col = mat4();
	col = mult(col,scale4(colorDeneme[0],colorDeneme[1],colorDeneme[2]));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
	}else{
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );}
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
	}
	else
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}


function leftLowerLeg()
{
	
    var s = scale4(LOWER_LEG_WIDTH/sliderScale, LOWER_LEG_HEIGHT/sliderScale, LOWER_LEG_WIDTH/sliderScale);
    var instanceMatrix = mult( translate( 0, -3.0/sliderScale, 0.0 ), s);
	
    var t = mult(modelViewMatrix, instanceMatrix);
	var col = mat4();
	col = mult(col,scale4(0.6,0.7,1.3));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
	}
	else
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}


function rightUpperLeg() {

    var s = scale4(UPPER_LEG_WIDTH/sliderScale, UPPER_LEG_HEIGHT/sliderScale, UPPER_LEG_WIDTH/sliderScale);
    var instanceMatrix = mult(translate( 0, 0 , 0.0 ),s);
	
	var t = mult(modelViewMatrix, instanceMatrix);
	var col = mat4();
	col = mult(col,scale4(0,0.7,0.8));
	if(changeColor==1){
	var col = mat4();
	col = mult(col,scale4(colorDeneme[0],colorDeneme[1],colorDeneme[2]));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
	}else{
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );}
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
	}
	else
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

}

function rightLowerLeg()
{

    var s = scale4(LOWER_LEG_WIDTH/sliderScale, LOWER_LEG_HEIGHT/sliderScale, LOWER_LEG_WIDTH/sliderScale);
    var instanceMatrix = mult( translate( 0 , -3.0/sliderScale, 0.0 ), s);
	
    var t = mult(modelViewMatrix, instanceMatrix);
	var col = mat4();
	col = mult(col,scale4(0.6,0.7,1.3));
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "aColor"),  false, flatten(col) );
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
	if(iskeletFlag==1){
    gl.drawArrays( gl.LINE_LOOP, 0, NumVertices );
	}
	else{
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );}
}

function getRandomColor() {
	return [Math.random(), Math.random(), Math.random(),1];
}
			
function render(){
	
	 viewerPos = vec3(4.0+light, 20.0+light, light);
	
	modelViewMatrix = rotate(alpha[0], 1, 0, 0 );
	modelViewMatrix = mult(modelViewMatrix,rotate(alpha[1],0,1,0))
	modelViewMatrix = mult(modelViewMatrix,rotate(alpha[2],0,0,1))
	
	if(repositionFlagX==1){
	modelViewMatrix = mult(modelViewMatrix,translate( reposition[0],0,0 ));}
	
	if(repositionFlagY==1){
	modelViewMatrix = mult(modelViewMatrix,translate( 0,reposition[1],0 ));}
	
	modelViewMatrix = mult(modelViewMatrix,translate( 0,2/sliderScale,0 ));     
	
	torso();
	mystack.push(modelViewMatrix); 
	
	head();	
	
		modelViewMatrix = mult(modelViewMatrix, rotate(-5/sliderScale, 0, 0, 1/sliderScale));//sağ kol
		modelViewMatrix = mult(modelViewMatrix,translate( -1.5/sliderScale, 1/sliderScale, 0.0 ));
	
	leftUpperArm();	
	
		modelViewMatrix = mult(modelViewMatrix, rotate(10/sliderScale, 0, 1/sliderScale,0 ));
	
	leftLowerArm();
	hand();
		
	modelViewMatrix = mystack.pop();
	mystack.push(modelViewMatrix);
	
		modelViewMatrix = mult(modelViewMatrix, rotate(5/sliderScale, 0, 0, 1/sliderScale));//sol kol 
		modelViewMatrix = mult(modelViewMatrix,translate( 1.5/sliderScale,1/sliderScale, 0, 0 ));

	rightUpperArm();
	
	modelViewMatrix = mult(modelViewMatrix, rotate(10/sliderScale, 0, 1/sliderScale,0 ));
    rightLowerArm();
	hand();
	
	modelViewMatrix = mystack.pop();
    mystack.push(modelViewMatrix);
		
		modelViewMatrix = mult(modelViewMatrix, rotate(-3/sliderScale, 0, 0, 1/sliderScale));
		modelViewMatrix = mult(modelViewMatrix,translate( -0.5/sliderScale, -4.5/sliderScale, 0.0 ));
	
	leftUpperLeg();
    leftLowerLeg();
	hand();
	
	modelViewMatrix = mystack.pop();
	mystack.push(modelViewMatrix);
	
		modelViewMatrix = mult(modelViewMatrix, rotate(3/sliderScale, 0, 0, 1/sliderScale));
		modelViewMatrix = mult(modelViewMatrix,translate( 0.5/sliderScale, -4.5/sliderScale, 0.0 ));
	
	rightUpperLeg();
    rightLowerLeg();	
    hand();
		
	requestAnimationFrame(render);
}