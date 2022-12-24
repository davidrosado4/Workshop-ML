var population;
var lifespan = 210;
var lifeP;
var count = 0;
var target; 
var maxforce = 0.4;
var mutratio = 0.01;

var rx;
var ry;
var rw;
var rh;

function setup(){
  createCanvas(windowWidth, windowHeight);
  population = new Population();
  //lifeP = createP();
  target = createVector(width/2, 50);
  rx = width/2;
  ry = height/2;
  rw = 400;
  rh = 10;
}


function draw(){
  noStroke();
  background(0);
  population.run();
  //lifeP.html(count);
  
  if(count == lifespan) {
    population.evaluate();
    population.selection();
    //population = new Population();
    count = 0;
  }
  
  count++;
  
  fill(255);
  rectMode(CENTER);
  rect(rx, ry, rw, rh);
  
  ellipse(target.x, target.y, 16, 16);
}


function Population() {
  this.rockets = [];
  this.popsize = 300;
  this.matingpool = [];
  
  for (var i = 0; i < this.popsize; i++) {
    this.rockets[i] = new Rocket();
  }
  
  this.evaluate = function() {
    var maxfit = 0;
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].calcFitness();
      if(this.rockets[i].fitness > maxfit) {
        maxfit = this.rockets[i].fitness
      }
    }
    
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].fitness /= maxfit;
    }
    
    this.matingpool = [];
    for (var i = 0; i < this.popsize; i++) {
      var n = this.rockets[i].fitness * 100;
      for (var j = 0; j < n; j++) {
        this.matingpool.push(this.rockets[i]);
      }
    }
  }
  
  this.selection = function(){
    var newRockets = [];
    for (var i = 0; i < this.rockets.length; i++){
      var parentA = random(this.matingpool).dna;
      var parentB = random(this.matingpool).dna;
      var child = parentA.crossover(parentB);
      child.mutation();
      newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
  }
  
  this.run = function(){
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].show();
      this.rockets[i].update();
    }
  }
}


function DNA(genes) {
  if(genes){
    this.genes = genes;
  } else {
    this.genes = [];
    for (var i = 0; i < lifespan; i++){
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(maxforce);
    }
  }
  
  this.crossover = function(partner) {
    var newgenes = [];
    var mid = floor(random(this.genes.length));
    for (var i = 0; i < this.genes.length; i++){
      if(i > mid) {
        newgenes[i] = this.genes[i];
      } else {
        newgenes[i] = partner.genes[i];
      }
    }
    return new DNA(newgenes);
  }
  
  this.mutation = function() {
    for(var i = 0; i < this.genes.length; i++) {
      if (random(1) < mutratio) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxforce);
      }
    }
  }
}


function Rocket(dna) {
  this.pos = createVector(width/2, height);
  this.vel = createVector();
  this.acc = createVector();
  this.completed = false;
  this.crashed = false;
  this.time;
  if(dna){
    this.dna = dna;
  } else {
    this.dna = new DNA();
  }
  this.fitness;
  
  this.applyForce = function(force) {
    this.acc.add(force);
  }
  
  this.update = function() {
    
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if(d < 10){
      this.completed = true;
      //this.pos = target.copy();
    }
    
    
    if (this.pos.x > rx - rw/2 && this.pos.x < rx + rw/2 && this.pos.y > ry - rh/2 && this.pos.y < ry + rh/2){
      this.crashed = true;
    }
    
    if (this.pos.x < 0 || this.pos.x > width){
      //this.vel.x *= -1;
      this.crashed = true;
    }
    if (this.pos.y < 0){
      //this.vel.y *= -1;
      this.crashed = true;
    }
    if (this.pos.y > height){
      this.crashed = true;
    }
    
    this.applyForce(this.dna.genes[count]);
    if(!this.completed && !this.crashed){
     this.vel.add(this.acc);
     this.pos.add(this.vel);
     this.acc.mult(0);
     //this.vel.limit(4);
    }
    if (!this.completed){
      this.time = count;
    }
    
  }
  
  this.calcFitness = function() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    //this.fitness = map(d, 0 , width, width, 0);
    this.fitness = 1/d;
    if(this.completed) {
      this.fitness *= 10;
      this.fitness *= pow(map(this.time, 0, count, 100000, 1), 2);
    }
    if (this.crashed){
      if(d > 50){
      this.fitness /= 100000;
      }
      else {
        this.fitness /= 1000;
      }
    }
    if(this.pos.y > height / 2){
      this.fitness /= 100;
    }
  }  
  
  this.show = function() {
    push();
    noStroke();
    fill(255, 100);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 25, 10);
    pop();
  }
}      
