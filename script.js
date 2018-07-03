var xScreenSize = innerWidth - 5; // canvas size
var yScreenSize = innerHeight - 5;
var minScreenSize = 0;
if (xScreenSize > yScreenSize) {
  minScreenSize = yScreenSize;
} else {
  minScreenSize = xScreenSize;
}
var maxScreenSize = 0;
if (xScreenSize < yScreenSize) {
  maxScreenSize = yScreenSize;
} else {
  maxScreenSize = xScreenSize;
}

var camX = 0;
var camY = 0;
var pathWidth = minScreenSize/3;
var pathDist = pathWidth/5;
var pathCreateDist = maxScreenSize;
var pathDespawnDist = pathCreateDist*1.5
var pathSpawnX = 0;
var pathSpawnY = 0;
var pathSpawnDirection = 0;
// will be changed in setup() when on wide screen.

var counter = 0;

var mass = 600;
var friction = 0.999;
var torque = 0.01;

var particles = [];
var paths = [];

function isPosit(x) { // returns true if x is 0 or higher
  return (x>=0);
}

function posit(x) { // returns positive number
  if (isPosit(x)) {return(x)};
  return(x*-1);
}

function smoothChange(now, goal, iterations) { // a = smoothChange(a, 10, 10)   smoothens change of a variable
  return(now+((goal-now)/iterations));
}

function relMouse(obToControll) {
  return([onWMouseX - obToControll.xPos , onWMouseY - obToControll.yPos]);
}

function stepPath() {
  pathSpawnDirection += random(-0.1, 0.1);
  pathSpawnX += sin(pathSpawnDirection) * pathDist;
  pathSpawnY += cos(pathSpawnDirection) * pathDist;
}

function spawnPath() {
  paths.push(new path(pathSpawnX, pathSpawnY, random(pathWidth-10, pathWidth+10)));
  stepPath();
}

function despawnPaths() {
  for (var i = 0; i < paths.length; i++) {
    if (dist(paths[i].xPos, paths[i].yPos, playedPlayer.xPos, playedPlayer.yPos) > pathDespawnDist) {
      paths.splice(i,1);
      i -= 1;
    }
  }
}

function killIfOffPath() {
  for (var i = 0; i < paths.length; i++) {
    if (dist(paths[i].xPos, paths[i].yPos, playedPlayer.xPos, playedPlayer.yPos) < paths[i].size/2) {
      return(false);
    }
  }
  respawn();
}

function respawn() {
  playedPlayer.xPos = paths[0].xPos;
  playedPlayer.yPos = paths[0].yPos;
  playedPlayer.xMom = 0;
  playedPlayer.yMom = 0;
  despawnPaths();
  pathSpawnX = paths[paths.length-1].xPos;
  pathSpawnY = paths[paths.length-1].yPos;
  pathSpawnDirection = atan2(paths[paths.length-1].xPos - paths[paths.length-2].xPos , paths[paths.length-1].yPos - paths[paths.length-2].yPos);
  stepPath();
}

function pathTick() {
  while (dist(playedPlayer.xPos, playedPlayer.yPos, pathSpawnX, pathSpawnY) < pathCreateDist) {
    spawnPath();
  }
  despawnPaths();
  killIfOffPath();
}

function player(_xPos, _yPos,_Mass, _Torque, _Friction) {
  this.xPos = _xPos;
  this.yPos = _yPos;
  this.xMom = 0;
  this.yMom = 0;
  this.mass = _Mass;
  this.torque = _Torque;
  this.friction = _Friction;
  this.tick = function() {
    if (mouseIsPressed) {
      this.xMom += relMouse(this)[0]*this.torque/this.mass;
      this.yMom += relMouse(this)[1]*this.torque/this.mass;
    }

    this.xMom = this.xMom*this.friction;
    this.yMom = this.yMom*this.friction;

    this.xPos += this.xMom;
    this.yPos += this.yMom;

    particles.push(new particle(this.xPos, this.yPos, random(2,10), color(0,127)));
  }
  this.render = function() {
    noStroke();
    fill(0);
    ellipse(this.xPos, this.yPos, 10,10);
    if (mouseIsPressed) {
      stroke(127,127);
      strokeWeight(dist(0,0,relMouse(this)[0],relMouse(this)[1])/100);
      line(this.xPos, this.yPos, onWMouseX, onWMouseY);
    }
  }
}

function particle(_xPos, _yPos, _size, _color) {
  this.xPos = _xPos;
  this.yPos = _yPos;
  this.color = _color;
  this.size = _size;
  this.tick = function() {
    this.size -= 0.1;
  }
  this.render = function() {
    noStroke();
    fill(this.color);
    ellipse(this.xPos, this.yPos, this.size, this.size);
  }
}

function path(_xPos, _yPos, _size) {
  this.xPos = _xPos;
  this.yPos = _yPos;
  this.size = _size;
  this.render = function() {
    noStroke();
    fill(255,pathDist);
    ellipse(this.xPos, this.yPos, this.size, this.size);
  }
}

var playedPlayer;

var onWMouseX = 0;
var onWMouseY = 0;

function setup() { // p5 setup
  createCanvas(xScreenSize, yScreenSize);
  background(255);
  playedPlayer = new player(0, 0, mass, torque, friction);
  if (xScreenSize > yScreenSize) {
    pathSpawnDirection = HALF_PI;
  }
}

function draw() {
  background(0);
  camX = smoothChange(camX, -playedPlayer.xPos+(xScreenSize/2)+(playedPlayer.xMom*-25), 20);
  camY = smoothChange(camY, -playedPlayer.yPos+(yScreenSize/2)+(playedPlayer.yMom*-25), 20);
  translate(camX, camY);
  onWMouseX = mouseX - camX;
  onWMouseY = mouseY - camY;

  playedPlayer.tick();

  for (var i = 0; i < paths.length; i++) {
    paths[i].render();
  }

  playedPlayer.render();

  for (var i = 0; i < particles.length; i++) {
    particles[i].tick();
    if (particles[i].size <= 0) {
      particles.splice(i,1);
      i -= 1;
    }
  }
  for (var i = 0; i < particles.length; i++) {
    particles[i].render();
  }

  pathTick();

  counter += 1;
}
