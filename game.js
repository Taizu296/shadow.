const game = document.getElementById("game");
const player = document.getElementById("player");

const hpText = document.getElementById("hp");
const killsText = document.getElementById("kills");
const levelText = document.getElementById("level");
const xpFill = document.getElementById("xpfill");

let playerX = window.innerWidth / 2;
let playerY = window.innerHeight / 2;

let targetX = playerX;
let targetY = playerY;

let hp = 100;
let kills = 0;

let level = 1;
let xp = 0;
let xpNeeded = 5;

let enemies = [];
let projectiles = [];

let gameRunning = true;

player.style.left = playerX + "px";
player.style.top = playerY + "px";


/* -------------------------
   TOUCH MOVEMENT
------------------------- */

const joystick = document.getElementById("joystick");
const joystickKnob = document.getElementById("joystickKnob");

let moveX = 0;
let moveY = 0;

function moveJoystick(e) {
  e.preventDefault();

  const touch = e.touches[0];
  const rect = joystick.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = touch.clientX - centerX;
  let dy = touch.clientY - centerY;

  const distance = Math.hypot(dx, dy);
  const maxDistance = 34;

  if (distance > maxDistance) {
    dx = (dx / distance) * maxDistance;
    dy = (dy / distance) * maxDistance;
  }

  joystickKnob.style.transform =
    `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

  moveX = dx / maxDistance;
  moveY = dy / maxDistance;
}

function stopJoystick() {
  moveX = 0;
  moveY = 0;

  joystickKnob.style.transform =
    "translate(-50%, -50%)";
}

joystick.addEventListener("touchstart", moveJoystick, {
  passive: false
});

joystick.addEventListener("touchmove", moveJoystick, {
  passive: false
});

joystick.addEventListener("touchend", stopJoystick);
joystick.addEventListener("touchcancel", stopJoystick);


/* -------------------------
   SPAWN ENEMY
------------------------- */

function spawnEnemy() {

  if (!gameRunning) return;

  const enemy = document.createElement("div");

  enemy.className = "enemy";
  enemy.innerHTML = "👹";

  let x;
  let y;

  const side = Math.floor(Math.random() * 4);

  if (side === 0) {
    x = Math.random() * window.innerWidth;
    y = -40;
  }

  if (side === 1) {
    x = window.innerWidth + 40;
    y = Math.random() * window.innerHeight;
  }

  if (side === 2) {
    x = Math.random() * window.innerWidth;
    y = window.innerHeight + 40;
  }

  if (side === 3) {
    x = -40;
    y = Math.random() * window.innerHeight;
  }

  const enemyData = {
    element: enemy,
    x: x,
    y: y,
    hp: 2,
    speed: 0.65 + Math.random() * 0.35
  };

  enemy.style.left = x + "px";
  enemy.style.top = y + "px";

  game.appendChild(enemy);
  enemies.push(enemyData);
}

/* -------------------------
   FIND CLOSEST ENEMY
------------------------- */

function closestEnemy() {

  let closest = null;
  let closestDistance = Infinity;

  enemies.forEach(enemy => {

    const dx = enemy.x - playerX;
    const dy = enemy.y - playerY;

    const distance = Math.hypot(dx, dy);

    if (distance < closestDistance) {

      closestDistance = distance;
      closest = enemy;
    }
  });

  return closest;
}


/* -------------------------
   SHOOT MAGIC
------------------------- */

function shoot() {

  if (!gameRunning) return;

  const enemy = closestEnemy();

  if (!enemy) return;

  const projectile = document.createElement("div");

  projectile.className = "projectile";

  game.appendChild(projectile);

  const dx = enemy.x - playerX;
  const dy = enemy.y - playerY;

  const distance = Math.hypot(dx, dy);

  const speed = 7;

  const projectileData = {

    element: projectile,

    x: playerX,
    y: playerY,

    vx: (dx / distance) * speed,
    vy: (dy / distance) * speed
  };

  projectile.style.left = playerX + "px";
  projectile.style.top = playerY + "px";

  projectiles.push(projectileData);
}


/* -------------------------
   KILL ENEMY
------------------------- */

function killEnemy(enemy) {

  enemy.element.remove();

  enemies = enemies.filter(e => e !== enemy);

  kills++;
  xp++;

  killsText.textContent = kills;

  if (xp >= xpNeeded) {

    level++;

    xp = 0;

    xpNeeded = Math.ceil(xpNeeded * 1.4);

    levelText.textContent = level;
  }

  xpFill.style.width =
    (xp / xpNeeded * 100) + "%";
}


/* -------------------------
   GAME OVER
------------------------- */

function gameOver() {

  gameRunning = false;

  document.getElementById("finalKills")
    .textContent = kills;

  document.getElementById("gameOver")
    .style.display = "flex";
}


/* -------------------------
   GAME LOOP
------------------------- */

function update() {

  if (!gameRunning) return;

  /* Smooth player movement */

  const pdx = targetX - playerX;
  const pdy = targetY - playerY;

  const playerDistance = Math.hypot(pdx, pdy);

  if (playerDistance > 3) {

    playerX += pdx * 0.08;
    playerY += pdy * 0.08;
  }

  playerX = Math.max(
    30,
    Math.min(window.innerWidth - 30, playerX)
  );

  playerY = Math.max(
    100,
    Math.min(window.innerHeight - 30, playerY)
  );

  player.style.left = playerX + "px";
  player.style.top = playerY + "px";


  /* Move enemies */

  enemies.forEach(enemy => {

    const dx = playerX - enemy.x;
    const dy = playerY - enemy.y;

    const distance = Math.hypot(dx, dy);

    enemy.x +=
      (dx / distance) * enemy.speed;

    enemy.y +=
      (dy / distance) * enemy.speed;

    enemy.element.style.left =
      enemy.x + "px";

    enemy.element.style.top =
      enemy.y + "px";


    /* Enemy hits player */

    if (distance < 38) {

      hp -= 0.15;

      hpText.textContent =
        Math.max(0, Math.ceil(hp));

      if (hp <= 0) {
        gameOver();
      }
    }
  });


  /* Move projectiles */

  projectiles.forEach(projectile => {

    projectile.x += projectile.vx;
    projectile.y += projectile.vy;

    projectile.element.style.left =
      projectile.x + "px";

    projectile.element.style.top =
      projectile.y + "px";


    /* Collision */

    enemies.forEach(enemy => {

      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      if (distance < 28) {

        enemy.hp--;

        projectile.element.remove();

        projectiles =
          projectiles.filter(
            p => p !== projectile
          );

        if (enemy.hp <= 0) {
          killEnemy(enemy);
        }
      }
    });


    /* Remove projectile outside screen */

    if (
      projectile.x < -50 ||
      projectile.x > window.innerWidth + 50 ||
      projectile.y < -50 ||
      projectile.y > window.innerHeight + 50
    ) {

      projectile.element.remove();

      projectiles =
        projectiles.filter(
          p => p !== projectile
        );
    }
  });

  requestAnimationFrame(update);
}


/* -------------------------
   START
------------------------- */

setInterval(spawnEnemy, 1100);
setInterval(shoot, 650);

update();
