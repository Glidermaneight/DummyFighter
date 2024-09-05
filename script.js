const ctx = document.getElementById("gamescreen").getContext("2d"); //Remeber the gamescreen canvas from earlier? This line of code grabs the canvas named gamescreen and stores its 2d context in a variable for a renderer to use throughout our game. Every game needs a renderer to draw images to the screen.

/*You might have heard that you should use OOP, which has classes at its core, in video games. I stopped using OOP after listening to this 45-min vid here: https://www.youtube.com/watch?v=QM1iUe6IofM TLDR, polymorphism isn't exclusive to OOP, inheritance also isn't exclusive to OOP and the OOP version can create messy hierarchies, and following encapsulation the OOP way means that you need this god object that is the whole state of the program with all these children in a really complicated system. By encapsulating half-consistenly, you still end up with a complicated mess of objects. Also, have you ever tried to read a large OOP codebase not knowing anything about it prior? Don't. I speak from experience. This object will always inherit from this thing, which uses that function, bla bla bla. You'll have run all over the codebase before you even understand its foundations. This is why I want the game to be procedural. And the industry is slowly agreeing and paying attenion to functional programming, which is stateless, and as the name implies, uses only functions. But FP isn't applicable everywhere. One example would be unironically video games.*/

const player1 = new dummy(100, 100, 130, 140, "imgs/Yellow Right Facing Dummy.jpg", "imgs/Yellow Left Facing Dummy.jpg"); //Now that we can represent both hitboxes and players, we can create a player data structure.
const player2 = new dummy(500, 100, 130, 150, "imgs/Left Orange Facing Dummy.jpg", "imgs/Right Orange Facing Dummy.jpg"); //Fighting games have two players, so we must do it again.

const healthbar1 = new square(20, 10, player1.health, 10);

const healthbar2 = new square(document.getElementById("gamescreen").width - 325, 10, player2.health, 10);

const powerGears = [
  new square(healthbar1.x, healthbar1.y + healthbar1.h * 3, healthbar1.w / 2, healthbar1.h),
  new square(healthbar2.x, healthbar2.y + healthbar1.h * 3, healthbar2.w / 2, healthbar2.h)
];


const speedGears = [
  new square(powerGears[0].x, powerGears[0].y + powerGears[0].h * 3, powerGears[0].w, powerGears[0].h),
  new square(powerGears[1].x, powerGears[1].y + powerGears[1].h * 3, powerGears[1].w, powerGears[1].h)
];

const floor = new square(0, document.getElementById("gamescreen").height - 50, document.getElementById("gamescreen").width, 50);

function facing(square1, square2) {
  if (square2.pos.x >= square1.pos.x) {
    square1.facing = "right";
    square1.image = square1.images[0]
    square2.facing = "left";
    square2.image = square2.images[0]
  }
  else {
    square1.facing = "left";
    square1.image = square1.images[1]
    square2.facing = "right";
    square2.image = square2.images[1]
  }
}

function gears(bar, square, bar2) {
  if (square.powerGear) {
    square.powerGear = true;
    if (bar.w > 0) {
      bar.w -= 0.5;
      square.powerMultiplier = 2;
    } else {
      square.powerMultipler = 1;
      bar.w = 0;
      square.powerGear = false;
    }
  }
  else {
    square.powerMultiplier = 1;
    if (bar.w <= 150) {
      bar.w += 0.1;
    }
  }
  if (square.speedGear) {
    square.speedGear = true;
    if (bar2.w > 0) {
      bar2.w -= 0.5;
      square.speedMultiplier = 2;
    } else {
      square.speedMultipler = 1;
      bar2.w = 0;
      square.speedGear = false;
    }
  }
  else {
    square.speedMultiplier = 1;
    if (bar2.w <= 150) {
      bar2.w += 0.1;
    }
  }
}

window.addEventListener("gamepadconnected", function(event) {
  if (player1.controllerIndex != null) {
    player2.controllerIndex = event.gamepad.index;
    document.removeEventListener("keydown", player2Inputs);
  } else {
    player1.controllerIndex = event.gamepad.index;
    document.removeEventListener("keydown", player1Inputs);
  }
  this.document.addEventListener("keyup", keyups);
});

window.addEventListener("gamepaddisconnected", function() {
  if (player1.controllerIndex === null) {
    player2.controllerIndex = null;
    document.addEventListener("keydown", player2Inputs);
  } else {
    player1.controllerIndex = null;
    document.addEventListener("keydown", player1Inputs);
  }
  this.document.addEventListener("keyup", keyups);
});

function player1Inputs(event) {
  if (event.code === "KeyD") {
    if (player1.crouching) {
      player1.crouching = true;
      if (player1.facing === "right") {
        player1.state = 3;
      }
      if (!player1.facing === "right") {
        player1.state = 1;
      }
    }
    else {
      player1.doIfFacing(5);
    }
  }
  else if (event.code === "KeyA") {
    if (player1.crouching) {
      player1.crouching = true;
      if (player1.facing === "right") {
        player1.state = 1;
      }
      if (!player1.facing === "right") {
        player1.state = 3;
      }
    }
    else {
      player1.doIfFacing(-5);
    }
  }
  else if (event.code === "KeyF") {
    if (player1.lastKey === "") player1.lastKey = "Light"
  }
  else if (event.code === "KeyG") {
    if (player1.lastKey === "") player1.lastKey = "Medium"
  }
  else if (event.code === "KeyH") {
    if (player1.lastKey === "") player1.lastKey = "Fierce"
  }
  else if (event.code === "KeyS") {
    player1.crouch();
  }
  else if (event.code === "KeyW" && player1.jumping != true) {
    player1.jump(30, 40);
  }
  else if (event.code === "KeyR") {
    if (!player1.powerGear) {
      player1.powerGear = true;
    }
    else {
      player1.powerGear = false;
    }
  }
  else if (event.code === "KeyT") {
    if (!player1.speedGear) {
      player1.speedGear = true;
    }
    else {
      player1.speedGear = false;
    }
  }
  else if (event.code === "KeyQ") {
    player1.airDash(-1);
  }
  else if (event.code === "KeyE") {
    player1.airDash(1);
  }
  else {
    player1.state = 5;
    player1.currentAnimation = player1.animations.stand;
  }
}

function player2Inputs(event) {
  if (event.code === "Semicolon") {
    if (player2.crouching) {
      player1.crouching = true;
      if (player2.facing === "right") {
        player2.state = 3;
      }
      if (!player2.facing === "right") {
        player2.state = 1;
      }
    }
    else {
      player2.doIfFacing(5);
      player2.movingRight = true;
    }
  }
  else if (event.code === "KeyK" && player2.pos.x > 0) {
    if (player2.crouching) {
      player2.crouching = true;
      if (player2.facing === "right") {
        player2.state = 1;
      }
      if (!player2.facing === "right") {
        player2.state = 3;
      }
    }
    else {
      player2.doIfFacing(-5);
      player2.movingRight = false;
    }
  }
  else if (event.code === "KeyO" && !player2.jumping) {
    player2.jumping = true;
    player2.pos.y -= 30
    player2.vely -= 40;
  }
  else if (event.code === "KeyL") {
    player2.crouch();
  }
  else if (event.code === "Digit9") {
    if (player2.lastKey === "") player2.lastKey = "Light"
    else player2.lastKey = ""
  }
  else if (event.code === "Digit0") {
    if (player2.lastKey === "") player2.lastKey = "Medium"
    else player2.lastKey = ""
  }
  else if (event.code === "Minus") {
    if (player2.lastKey === "") player2.lastKey = "Fierce"
    else player2.lastKey = ""
  }
  else if (event.code === "Period") {
    if (!player2.speedGear) {
      player2.speedGear = true;
    }
    else {
      player2.speedGear = false;
    }
  }
  else if (event.code === "Slash") {
    if (!player2.powerGear) {
      player2.powerGear = true;
    }
    else {
      player2.powerGear = false;
    }
  }
  else if (event.code === "KeyI") {
    player2.airDash(-1);
  }
  else if (event.code === "KeyP") {
    player2.airDash(1);
  }
  else {
    player2.state = 5;
  }
}

function keyups(event) {
  if (event.code === "KeyD" || event.code === "KeyA") {
    player1.currentAnimation = player1.animations.stand;
    player1.stop();
  }
  if (event.code === "KeyK" || event.code === "Semicolon") {
    player2.stop();
  }
  if (event.code === "KeyS") {
    player1.crouching = false;
  }
  if (event.code === "KeyL") {
    player2.crouching = false;
  }
  if (event.code === "KeyQ" || event.code === "KeyE") {
    if(player1.jumping)
      player1.velx = 0;
    else
      player1.blocking = [false, false]
  }
  if (event.code === "KeyI" || event.code === "KeyP") {
    if(player2.jumping)
      player2.velx = 0;
    else
      player2.blocking = [false, false]
  }
}
document.addEventListener("keydown", player1Inputs)
document.addEventListener("keydown", player2Inputs)
document.addEventListener("keyup", keyups)
function game() {
  if (!player1.defeated && !player2.defeated)
    ctx.clearRect(0, 0, document.getElementById("gamescreen").width, document.getElementById("gamescreen").height);
  player1.fall(floor, document.getElementById("gamescreen").height - 167);
  player2.fall(floor, document.getElementById("gamescreen").height - 173);
  player1.inbounds();
  player2.inbounds();
  player1.reset_normal();
  player2.reset_normal();
  gears(powerGears[0], player1, speedGears[0]);
  gears(powerGears[1], player2, speedGears[1]);
  player1.KO();
  player2.KO();
  player1.padInput(player2);
  player2.padInput(player1);
  player1.getAway(player2)
  player2.getAway(player1)
  //This function clears the entire canvas.
  //You want to update the game before drawing to the screen. So between clearing the screen and rendering the changes, you must detect collisisions and update the game.
  //Changes the way that the players are facing depending on where they are on the screen.
  facing(player1, player2);
  document.getElementById("gamescreen").width = window.innerWidth;
  document.getElementById("gamescreen").height = window.innerHeight;
  floor.w = document.getElementById("gamescreen").width;
  floor.y = document.getElementById("gamescreen").height - 50;
  healthbar2.x = document.getElementById("gamescreen").width - 325;
  powerGears[1].x = healthbar2.x;
  speedGears[1].x = healthbar2.x;

  ctx.fillStyle = "black"; //We have to reset the fill style of the renderer to color the floor different.
  ctx.fillRect(floor.x, floor.y, floor.w, floor.h); //Now we are drawing the floor to the screen.
  player1.determineAttackType(player2)
  player1.draw();
  player2.determineAttackType(player1)
  player2.draw();
  ctx.fillStyle = "yellow";
  ctx.fillRect(healthbar1.x, healthbar1.y, player1.health, healthbar1.h);

  ctx.fillRect(healthbar2.x, healthbar2.y, player2.health, healthbar2.h);

  ctx.fillStyle = "orange";
  ctx.fillRect(powerGears[0].x, powerGears[0].y, powerGears[0].w, powerGears[0].h);

  ctx.fillStyle = "green";
  ctx.fillRect(speedGears[0].x, speedGears[0].y, speedGears[0].w, speedGears[0].h);

  ctx.fillStyle = "orange";
  ctx.fillRect(powerGears[1].x, powerGears[1].y, powerGears[1].w, powerGears[1].h);

  ctx.fillStyle = "green";
  ctx.fillRect(speedGears[1].x, speedGears[1].y, speedGears[1].w, speedGears[1].h);
  if (!player1.defeated && !player2.defeated)
    window.requestAnimationFrame(game);
  else {
    if (player1.defeated) {
      const KO = new Image();
      KO.src = "KO-1.png.png"
      player1.src.x = player1.animations.KO.frames[0].x
      player1.src.y = player1.animations.KO.frames[0].y
      ctx.drawImage(KO, 0, 0, 252, 252, document.getElementById("gamescreen").width / 2, document.getElementById("gamescreen").height / 2, 100, 100)
    }
    if (player2.defeated) {
      const KO = new Image();
      KO.src = "KO-1.png.png"
      player2.src.x = player2.animations.KO.frames[0].x
      player2.src.y = player2.animations.KO.frames[0].y
      ctx.drawImage(KO, 0, 0, 252, 252, 400, 100, 100, 100)
    }
  }
}

window.addEventListener("load", function(){
  game();
})