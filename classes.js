class square {
  constructor(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }
  intersecting(square2) {
    if (this.x + this.w > square2.x &&
      this.x < square2.x + square2.w &&
      this.y + this.h > square2.y &&
      square2.y < this.y + this.h) {
      return true;
    }
  }
}

function getRefreshRate() {
  return new Promise(resolve =>
    requestAnimationFrame(t1 =>
      requestAnimationFrame(t2 =>
        resolve(1000 / (t2 - t1))
      )
    )
  )
}
let refreshRate;
getRefreshRate().then(fps => refreshRate = fps)

const lightSound = new Audio("sounds/Light Attack Sound.mp3")
const heavySound = new Audio("sounds/punch-140236.mp3")
const car = new Image()
car.src = "imgs/Left Car.png"
class animationState {
  constructor(frames, toMod) {
    this.frames = frames;
    this.toMod = toMod;
  }
}

class player {
  constructor(x, y, w, h, src1, src2) {
    this.pos = new square(x, y, w, h)
    this.src = new square(0, 0, 750, 750)
    this.hurtbox = new square(x - w / 4, y, w / 4, h)
    this.velx = 0
    this.vely = 0
    this.state = 0
    this.facing = "right"
    this.jumping = false
    this.crouching = false
    this.health = 300
    this.powerMultiplier = 1
    this.speedMultiplier = 1
    this.powerGear = false
    this.speedGear = false
    this.controllerIndex = null
    this.heightCancelled = false
    this.frameNo = this.currentFrame = 0
    this.animations = {
      run: {},
      runBack: {},
      stand: {},
      block: {},
      jump: {},
      jL: {},
      jM: {},
      jH: {},
      sl: {},
      sm: {},
      sh: {},
      hurtHead: {},
      hurtLow: {},
      crouch: {},
      crouchBlock: {},
      cl: {},
      cm: {},
      ch: {},
      KO: {}
    }
    this.currentAnimation = new animationState([{ x: 750 * 5 - 100, y: 0 }], 1)
    this.movingRight = false
    this.lastKey = ""
    this.hurt = false
    this.images = [new Image(), new Image()]
    this.images[0].src = src1
    this.images[1].src = src2
    this.image = this.images[0]
    this.animation = this.currentAnimation
    this.defeated = false;
    this.blocking = [false, false]
  }
  hitstun(opponent) {
    if (this.hurt) {
      if (opponent.crouching) {
        this.currentAnimation = this.animations.hurtLow;
      }
      else {
        this.currentAnimation = this.animations.hurtHead;
      }
      if (opponent.lastKey === "Fierce")
        heavySound.play()
      else
        lightSound.play()
    }
  }
  fall(floor, stop) {
    if (!this.pos.intersecting(floor) && this.jumping) {
      if (this.vely < 14) {
        this.vely += Math.ceil(2 * this.speedMultiplier)
      }
      this.currentAnimation = this.animations.jump;
    }
    else {
      this.pos.y = stop;
      this.src.x = 0;
      this.src.y = 0;
      this.state = 5;
      this.jumping = false;
      this.vely = 0;
      this.heightCancelled = false;
      this.currentAnimation = this.animations.stand;
    }
  }
  reset_normal() {
    this.pos.x += this.velx;
    this.pos.y += this.vely;
    if (!this.crouching)
      this.hurtbox = new square(this.pos.x + this.pos.w / 4, this.pos.y + 25, this.pos.w / 2, this.pos.h - 50)
    else
      this.hurtbox = new square(this.pos.x + this.pos.w / 4, this.pos.y + 55, this.pos.w / 2, this.pos.h - 80)
  }
  inbounds() {
    if (this.pos.x < 0) {
      this.pos.x = 0;
    } else if (this.pos.x + this.pos.w > document.getElementById("gamescreen").width) {
      this.pos.x = document.getElementById("gamescreen").width - this.pos.w;
    }
  }
  doIfFacing(delVel) {
    if (this.facing === "right") {
      this.state = 6;
      this.movingRight = true;
    } else {
      this.state = 4;
      this.movingRight = false;
    }
    if (!this.crouching) {
      this.velx = 0;
      this.velx += Math.ceil(delVel * this.speedMultiplier);
    }
  }
  jump(delPos, delVel) {
    this.jumping = true;
    this.pos.y -= delPos;
    this.vely -= delVel;
  }
  crouch() {
    if (!this.jumping) {
      this.crouching = true;
      this.state = 2;
    }
    else {
      if (!this.heightCancelled) {
        this.vely = 0;
        this.heightCancelled = true;
      }
    }
  }
  stop() {
    this.velx = 0;
    if (this.jumping === false) {
      this.state === 5;
    }
  }
  KO() {
    if (this.health < 0)
      this.defeated = true;
  }
  airDash(param) {
    this.blocking = [false, false]
    if (this.jumping) {
      this.velx = 15 * param * this.speedMultiplier;
      setTimeout(function() {
        this.velx = 0;
      }, 500);
    }
    if (!this.jumping && !this.crouching) {
      this.blocking[0] = true
    }
    if (!this.jumping && this.crouching) {
      this.blocking[1] = true
    }
  }
}

class dummy extends player {
  constructor(x, y, w, h, src1, src2) {
    super(x, y, w, h, src1, src2);
    this.animations = {
      run: new animationState([
        { x: 750 * 2 - 50, y: -5 },
        { x: 750 * 3 - 50, y: -5 },
        { x: 750 * 4 - 50, y: -5 }
      ], 3),
      runBack: new animationState([{ x: 750 * 4 - 100, y: 750 * 7 - 455 }, { x: 750 * 5 - 100, y: 750 * 7 - 455 }, { x: 750 * 6 - 100, y: 750 * 7 - 455 }], 3),
      stand: new animationState([{ x: 0, y: 0 }], 1),
      block: new animationState([{ x: 750, y: 0 }], 1),
      jump: new animationState([{ x: 750 * 5 - 100, y: 0 }], 1),
      jL: new animationState([{ x: 750 * 6, y: 0 }, { x: 0, y: 750 }, { x: 750, y: 750 }, { x: 750, y: 750 }, { x: 750, y: 750 }], 3),
      jM: new animationState([{ x: 750 - 100, y: 750 * 2 + 100 }, { x: 750 * 2 - 100, y: 750 * 2 + 100 }, { x: 750 * 3 - 100, y: 750 * 2 + 100 }, { x: 750 * 4 - 100, y: 750 * 2 + 100 }], 8),
      jH: new animationState([{ x: 750 * 2 - 100, y: 750 + 100 }, { x: 750 * 3 - 100, y: 750 + 100 }, { x: 750 * 4 - 100, y: 750 + 100 },
      { x: 750 * 5 - 100, y: 750 + 100 }, { x: 750 * 6 - 100, y: 750 + 100 }, { x: -100, y: 750 * 2 + 100 }], 6),
      sl: new animationState([{ x: 750 * 3 - 80, y: 750 * 3 + 150 }, { x: 750 * 4 - 80, y: 750 * 3 + 150 }, { x: 750 * 3 - 80, y: 750 * 3 + 150 }], 3),
      sm: new animationState([{ x: 750 * 5 - 130, y: 750 * 3 + 100 }, { x: 750 * 6 - 130, y: 750 * 4 + 100 }, { x: -130, y: 750 * 4 + 100 }, { x: 750 - 130, y: 750 * 4 + 100 }], 6),
      sh: new animationState([{ x: 750 * 2 - 100, y: 750 * 4 + 100 }, { x: 750 * 3 - 100, y: 750 * 4 + 100 }, { x: 750 * 4 - 100, y: 750 * 4 + 100 }, { x: 750 * 5 - 100, y: 750 * 4 + 100 }], 8),
      hurtHead: new animationState([{ x: 750 * 5 - 100, y: 750 * 2 + 100 }, { x: 750 * 6 - 100, y: 750 * 2 + 100 }], 3),
      hurtLow: new animationState([{ x: -100, y: 750 * 3 + 100 }, { x: 750 - 100, y: 750 * 3 + 100 }], 3),
      crouch: new animationState([{ x: 750 * 6 - 100, y: 750 * 4 + 100 }], 1),
      crouchBlock: new animationState([{ x: -100, y: 750 * 5 + 100 }], 1),
      cl: new animationState([{ x: 750 - 100, y: 750 * 5 + 100 }, { x: 750 * 2 - 100, y: 750 * 5 + 100 }, { x: 750 - 100, y: 750 * 5 + 100 }], 6),
      cm: new animationState([{ x: 750 * 3 - 100, y: 750 * 5 + 100 }, { x: 750 * 4 - 100, y: 750 * 5 + 100 }, { x: 750 * 5 - 100, y: 750 * 5 + 100 }], 8),
      ch: new animationState([{ x: 750 * 6 - 100, y: 750 * 5 + 150 }, { x: - 100, y: 750 * 6 + 150 }, { x: 750 - 100, y: 750 * 6 + 150 }, { x: 750 * 2 - 100, y: 750 * 6 + 150 }, { x: 750 * 3 - 100, y: 750 * 6 + 150 }], 10),
      KO: new animationState([{ x: 750 * 2 - 100, y: 750 * 3 + 100 }])
    }
    this.counter = 0
  }
  getAway(other) {
    if (this.hurtbox.intersecting(new square(other.hurtbox.x, other.hurtbox.y, other.hurtbox.w - 15, other.hurtbox.h - 150)) && !this.jumping && this.lastKey === "") {
      if (this.facing === "left")
        this.pos.x += 10
      if (this.facing === "right")
        this.pos.x -= 10
    }
  }
  lights(victim) {
    if (!this.hurt) {
      if (!this.crouching && !this.jumping) {
        if (this.currentFrame === 1) {
          if (this.facing === "left") {
            if (new square(this.pos.x, this.pos.y + this.pos.h / 4 + 30, 50, 20).intersecting(victim.hurtbox) && !victim.hurt && (!victim.blocking[0] && !victim.blocking[1])) {
              victim.health -= Math.ceil(1 * this.powerMultiplier);
              victim.hurt = true;
            }
          }
          if (this.facing === "right") {
            if (new square((this.pos.x + this.pos.w) - this.pos.w / 2, this.pos.y + this.pos.h / 4 + 30, 50, 20).intersecting(victim.hurtbox) && !victim.hurt && (!this.blocking[0] || !this.blocking[1])) {
              victim.health -= Math.ceil(1 * this.powerMultiplier);
              victim.hurt = true;
            }
          }
        }
      }
      if (this.crouching && !this.jumping) {
        if (this.currentFrame === 1) {
          if (this.facing === "left") {
            if (new square(this.pos.x + 30, this.pos.y + this.pos.h / 2 + 30, 50, 20).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[1]) {
              victim.health -= Math.ceil(2 * this.powerMultiplier);
              victim.hurt = true; victim.hurt = true;
            }
          }
          if (this.facing === "right") {
            if (new square((this.pos.x + this.pos.w) - this.pos.w / 2, this.pos.y + this.pos.h / 2 + 30, 50, 20).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[1]) {
              victim.health -= Math.ceil(2 * this.powerMultiplier);
              victim.hurt = true;
            }
          }
        }
      }
      if (!this.crouching && this.jumping) {
        if (this.currentFrame >= 2 && this.currentFrame <= this.animations.jL.frames.length - 1) {
          if (this.facing === "left") {
            if (new square(this.pos.x + this.pos.w / 8, this.pos.y + this.pos.h / 1.5, this.pos.w / 1.5, this.pos.h / 4).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[0]) {
              victim.health -= Math.ceil(2 * this.powerMultiplier);
              victim.hurt = true;
            }
          }
          if (this.facing === "right") {
            if (new square(this.pos.x + this.pos.w / 8, this.pos.y + this.pos.h / 1.5, this.pos.w / 1.5, this.pos.h / 4).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[0]) {
              victim.health -= Math.ceil(2 * this.powerMultiplier);
              victim.hurt = true;
            }
          }
        }
      }
    }
  }
  mediums(victim) {
    if (!this.crouching && !this.jumping) {
      if (this.currentFrame >= 1 && this.currentFrame <= 2) {
        if (this.facing === "left") {
          if (new square(this.pos.x, this.pos.y + 60, 60, 40).intersecting(victim.hurtbox) && !victim.hurt && (!victim.blocking[0] && !victim.blocking[1])) {
            victim.health -= Math.ceil(4 * this.powerMultiplier);
            victim.hurt = true;
          }
        }
        if (this.facing === "right") {
          if (new square(this.pos.x + this.hurtbox.w, this.pos.y + 60, 60, 40).intersecting(victim.hurtbox) && !victim.hurt) {
            victim.health -= Math.ceil(4 * this.powerMultiplier);
            victim.hurt = true;
          }
        }
      }
    }
    if (this.crouching && !this.jumping) {
      if (this.currentFrame === 1) {
        if (this.facing === "left") {
          if (new square(this.hurtbox.x, this.hurtbox.y, this.hurtbox.w + 10, this.hurtbox.h + 10).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[1]) {
            victim.health -= Math.ceil(2 * this.powerMultiplier);
            victim.hurt = true;
          }
        }
        if (this.facing === "right" && !victim.hurt) {
          if (new square(this.hurtbox.x, this.hurtbox.y, this.hurtbox.w + 10, this.hurtbox.h + 10).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[1]) {
            victim.health -= Math.ceil(2 * this.powerMultiplier);
            victim.hurt = true;
          }
        }
      }
    }
    if (!this.crouching && this.jumping) {
      if (this.currentFrame >= 1 && this.currentFrame <= 2) {
        if (this.facing === "left" && !victim.hurt) {
          if (new square(this.pos.x + this.hurtbox.w, this.hurtbox.y + this.hurtbox.h / 2, 50, 25).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[0]) {
            victim.health -= Math.ceil(6 * this.powerMultiplier);
            victim.hurt = true;
          }
        }
        if (this.facing === "right" && !victim.hurt) {
          if (new square(this.pos.x + this.hurtbox.w, this.hurtbox.y + this.hurtbox.h / 2, 50, 25).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[0]) {
            victim.health -= Math.ceil(6 * this.powerMultiplier);
            victim.hurt = true;
          }
        }
      }
    }
  }
  fierces(victim) {
    if (!this.crouching && !this.jumping) {
      if (this.currentFrame === 2) {
        if (this.facing === "left") {
          this.velx = -2;
          if (new square(this.pos.x, this.hurtbox.y + this.hurtbox.h / 2 + 20, 50, 25).intersecting(victim.hurtbox) && !victim.hurt && (!victim.blocking[0] && !victim.blocking[1])) {
            victim.health -= Math.ceil(7 * this.powerMultiplier);
            victim.hurt = true;
          }
        }
        if (this.facing === "right") {
          this.velx = 2;
          if (new square(this.pos.x + this.hurtbox.w, this.hurtbox.y + this.hurtbox.h / 2 + 20, 50, 25).intersecting(victim.hurtbox) && !victim.hurt && (!victim.blocking[0] && !victim.blocking[1])) {
            victim.health -= Math.ceil(7 * this.powerMultiplier);
            victim.hurt = true;
          }
        }
      }
    }
    if (this.currentFrame >= 3 && this.currentFrame <= 4 && this.crouching && !this.jumping) {
      if (this.facing === "left" && new square(this.pos.x, this.pos.y + this.pos.h / 3, 50, 50).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[1]) {
        victim.health -= Math.ceil(10 * this.powerMultiplier);
        victim.hurt = true;
      }
    }
    if (this.facing === "right" && new square(this.pos.x + this.pos.w - 30, this.pos.y + this.pos.h / 3, 50, 50).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[1]) {
      victim.health -= Math.ceil(10 * this.powerMultiplier);
      victim.hurt = true;
    }
    if (!this.crouching && this.jumping) {
      if (this.currentFrame >= 2 && this.currentFrame <= 3) {
        if (this.facing === "left") {
          if (new square(this.pos.x + this.pos.w / 4 + 7.5, this.pos.y - 20, 50, 50).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[0]) {
            victim.health -= Math.ceil(15 * this.powerMultiplier);
            victim.hurt = true;
          }
        }
        if (this.facing === "right") {
          if (new square(this.pos.x + this.pos.w / 4 + 7.5, this.pos.y - 20, 50, 50).intersecting(victim.hurtbox) && !victim.hurt && !victim.blocking[0]) {
            victim.health -= Math.ceil(15 * this.powerMultiplier);
            victim.hurt = true;
          }
        }
      }
    }
  }
  padInput(victim) {
    if (this.controllerIndex !== null) {
      this.currentAnimation = this.animations.stand
      if (!this.hurt) {
        if (navigator.getGamepads()[this.controllerIndex].axes[0] > 0.8) {
          this.doIfFacing(5);
        }
        else if (navigator.getGamepads()[this.controllerIndex].axes[0] < -0.8) {
          this.doIfFacing(-5);
        }
        else {
          this.stop();
        }
        if (navigator.getGamepads()[this.controllerIndex].axes[1] > 0.8) {
          this.crouch();
        }
        else {
          this.crouching = false;
        }
        if (navigator.getGamepads()[this.controllerIndex].buttons[0].pressed && this.jumping != true) {
          this.jumping = true
          this.jump(30, 40)
          this.currentAnimation = this.animations.jump
        }
        else if (navigator.getGamepads()[this.controllerIndex].buttons[2].pressed) {
          this.lastKey = "Light"
        }
        else if (navigator.getGamepads()[this.controllerIndex].buttons[3].pressed) {
          this.lastKey = "Medium"
        }
        else if (navigator.getGamepads()[this.controllerIndex].buttons[1].pressed) {
          this.lastKey = "Fierce"
        }
        else if (navigator.getGamepads()[this.controllerIndex].buttons[4].value > 0.8) {
          if (!this.speedGear) {
            this.speedGear = true;
          }
          else {
            this.speedGear = false;
          }
        }
        else if (navigator.getGamepads()[this.controllerIndex].buttons[5].value > 0.8) {
          if (!this.powerGear) {
            this.powerGear = true;
          }
          else {
            this.powerGear = false;
          }
        }
        else if (navigator.getGamepads()[this.controllerIndex].buttons[7].value > 0.8) {
          this.airDash(1);
        }
        else if (navigator.getGamepads()[this.controllerIndex].buttons[6].value > 0.8) {
          this.airDash(-1);
        }
      }
      else {
        this.hitstun(victim);
      }
    }
  }
  determineAttackType(victim) {
    this.currentAnimation = this.animations.stand;
    if (!this.hurt) {
      if (this.lastKey === "") {
        if (this.velx >= 5 && !this.jumping) {
          if (this.movingRight) {
            this.currentAnimation = this.animations.run;
            this.state = 6
          }
          else {
            this.currentAnimation = this.animations.runBack;
            this.state = 4
          }
        }
        if (this.velx <= -5 && !this.jumping) {
          if (!this.movingRight) {
            this.currentAnimation = this.animations.run;
            this.state = 6
          }
          else {
            this.currentAnimation = this.animations.runBack;
            this.state = 4
          }
        }
        if (this.crouching)
          this.currentAnimation = this.animations.crouch;
        if (this.jumping) {
          this.currentAnimation = this.animations.jump;
        }
        if (this.blocking[0]) {
          this.currentAnimation = this.animations.block
        }
        if (this.blocking[1]) {
          this.currentAnimation = this.animations.crouchBlock
        }
      }
      else {
        if (this.lastKey === "Light") {
          this.lights(victim);
          if (this.jumping) {
            this.currentAnimation = this.animations.jL;
            if (this.pos.intersecting(floor))
              this.currentAnimation = this.animations.stand;
          }
          if (this.crouching) {
            this.currentAnimation = this.animations.cl;
          }
          if (!this.crouching && !this.jumping) {
            this.currentAnimation = this.animations.sl;
          }
        }
        if (this.lastKey === "Medium") {
          this.mediums(victim);
          if (this.jumping) {
            this.currentAnimation = this.animations.jM;
            if (this.pos.intersecting(floor))
              this.currentAnimation = this.animations.stand;
          }
          if (this.crouching) {
            this.currentAnimation = this.animations.cm;
          }
          if (!this.crouching && !this.jumping) {
            this.currentAnimation = this.animations.sm
            if (this.facing === "right")
              this.velx = 2;
            if (this.facing === "left")
              this.velx = -2;
            this.pos.y -= 10;
          }
        }
        if (this.lastKey === "Fierce") {
          this.fierces(victim);
          if (this.jumping) {
            this.currentAnimation = this.animations.jH;
            if (this.pos.intersecting(floor))
              this.currentAnimation = this.animations.stand;
          }
          if (this.crouching) {
            this.currentAnimation = this.animations.ch;
          }
          if (!this.crouching && !this.jumping) {
            this.currentAnimation = this.animations.sh
            this.pos.y -= 10;
          }
        }
      }
      this.animation = this.currentAnimation
    }
    else {
      this.lastKey = ""
      this.hitstun(victim);
    }
  }
  draw() {
    this.frameNo++;
    if (this.currentAnimation != this.animation) {
      this.currentFrame = 0;
      this.animation = this.currentAnimation
    }
    if (this.frameNo % this.currentAnimation.toMod === 0) {
      if (this.lastKey === "Fierce" && !this.crouching && !this.jumping && this.currentFrame < this.animations.sh.frames.length - 1 && this.currentFrame >= 1) {
        this.vely -= 5;
      }
      if (this.currentFrame < this.currentAnimation.frames.length - 1) {
        this.currentFrame++;
      }
      else {
        this.currentFrame = 0;
        if (this.hurt) {
          this.currentAnimation = this.animations.stand;
          this.hurt = false;
          this.hitstop = 0
        }
        if ((this.lastKey === "Medium" || this.lastKey === "Fierce") && (!this.crouching && !this.jumping)) {
          this.velx = 0
        }
        if (this.lastKey === "Light" || this.lastKey === "Medium" || this.lastKey === "Fierce") {
          this.lastKey = "";
          if (this.jumping)
            this.currentAnimation = this.animations.jump;
          else
            this.currentAnimation = this.animations.stand;
        }
      }
    }
    this.src.x = this.currentAnimation.frames[this.currentFrame].x;
    this.src.y = this.currentAnimation.frames[this.currentFrame].y;
    ctx.drawImage(this.image, this.src.x, this.src.y, this.src.w, this.src.h, this.pos.x, this.pos.y, this.pos.w, this.pos.h);
  }
}