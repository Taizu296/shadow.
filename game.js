const game = document.getElementById("game");
const player = document.getElementById("player");

const world = document.getElementById("world");

const worldWidth = 3000;
const worldHeight = 5000;

const hpText = document.getElementById("hp");
const killsText = document.getElementById("kills");
const levelText = document.getElementById("level");
const xpFill = document.getElementById("xpfill");

const waveText = document.getElementById("wave");
const waveTimerText = document.getElementById("waveTimer");

const scoreText = document.getElementById("score");
const highscoreText = document.getElementById("highscore");

let playerX = worldWidth / 2;
let playerY = worldHeight / 2;

let hp = 100;
let kills = 0;

let score = 0;
let highscore = Number(localStorage.getItem("shadowHighscore")) || 0;

highscoreText.textContent = highscore;

let level = 1;
let xp = 0;
let xpNeeded = 5;

let wave = 1;
let waveTime = 60;
let bossActive = false;
let waveBoss = null;
let swarmActive = false;

setInterval(() => {

  if (!gameRunning) return;
  if (bossActive) return;

  waveTime--;

  waveTimerText.textContent = waveTime;

/* SCHWARM-EVENT */

/* Jede zweite Welle bei 15 Sekunden Restzeit */
if (
  wave % 2 === 0 &&
  waveTime === 15 &&
  !swarmActive
) {
  swarmActive = true;
  startSwarm();
}

  if (waveTime <= 0) {
  waveTime = 0;
  waveTimerText.textContent = "BOSS";
  
  swarmActive = false;
  bossActive = true;

  spawnBoss();
}

}, 1000);

let enemies = [];
let projectiles = [];
let xpOrbs = [];

let gameRunning = true;

let damage = 1;
let attackSpeed = 650;
let playerSpeed = 4.5;
let projectileSpeed = 7;
let projectileSize = 13;
let multishot = 1;

const upgradePool = [
  {
    icon: "🔥",
    name: "Magische Macht",
    description: "+20% Schaden",
    apply: () => {
      damage *= 1.2;
    }
  },

  {
    icon: "⚡",
    name: "Schneller Zaubern",
    description: "+15% Angriffsgeschwindigkeit",
    apply: () => {
      attackSpeed *= 0.85;
      restartShooting();
    }
  },

  {
    icon: "🏃",
    name: "Beweglichkeit",
    description: "+12% Bewegungsgeschwindigkeit",
    apply: () => {
      playerSpeed *= 1.12;
    }
  },

  {
    icon: "🚀",
    name: "Arkane Beschleunigung",
    description: "+20% Projektilgeschwindigkeit",
    apply: () => {
      projectileSpeed *= 1.2;
    }
  },

  {
    icon: "💥",
    name: "Große Magie",
    description: "+20% Projektilgröße",
    apply: () => {
      projectileSize *= 1.2;
    }
  },

  {
    icon: "🌀",
    name: "Multishot",
    description: "+1 Projektil pro Angriff",
    apply: () => {
      multishot += 1;
    }
  }
];

function showLevelUp() {

  gameRunning = false;

  const levelUpScreen =
    document.getElementById("levelUp");

  const choices =
    document.getElementById("upgradeChoices");

  choices.innerHTML = "";

  // Pool mischen und 3 unterschiedliche Upgrades nehmen
  const randomUpgrades = [...upgradePool]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  randomUpgrades.forEach(upgrade => {

    const card = document.createElement("div");
    card.className = "upgradeCard";

    card.innerHTML = `
      <div class="upgradeIcon">${upgrade.icon}</div>

      <div>
        <div class="upgradeName">
          ${upgrade.name}
        </div>

        <div class="upgradeDescription">
          ${upgrade.description}
        </div>
      </div>
    `;

    card.addEventListener("click", () => {

      upgrade.apply();

      levelUpScreen.style.display = "none";

      gameRunning = true;

      update();
    });

    choices.appendChild(card);
  });

  levelUpScreen.style.display = "flex";
}

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
  
  joystick.style.opacity = "0.15";

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
  joystick.style.opacity = "0.45";
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

let enemyType = "demon";

// Ab Welle 3 besteht eine Chance auf schnelle Gegner
if (wave >= 3 && Math.random() < 0.25) {
  enemyType = "bat";
  enemy.innerHTML = "🦇";
  enemy.classList.add("bat");
}

// Ab Welle 5 besteht eine Chance auf Tanks
if (wave >= 5 && Math.random() < 0.15) {
  enemyType = "tank";
  enemy.innerHTML = "💀";
  enemy.classList.remove("bat");
  enemy.classList.add("tank");
}

  let x;
let y;

const side = Math.floor(Math.random() * 4);

const spawnDistanceX = window.innerWidth / 2 + 80;
const spawnDistanceY = window.innerHeight / 2 + 80;

if (side === 0) {
  x = playerX + (Math.random() - 0.5) * window.innerWidth;
  y = playerY - spawnDistanceY;
}

if (side === 1) {
  x = playerX + spawnDistanceX;
  y = playerY + (Math.random() - 0.5) * window.innerHeight;
}

if (side === 2) {
  x = playerX + (Math.random() - 0.5) * window.innerWidth;
  y = playerY + spawnDistanceY;
}

if (side === 3) {
  x = playerX - spawnDistanceX;
  y = playerY + (Math.random() - 0.5) * window.innerHeight;
}

/* Innerhalb der Map halten */

x = Math.max(30, Math.min(worldWidth - 30, x));
y = Math.max(30, Math.min(worldHeight - 30, y));

  const baseHp =
  2 + Math.floor((wave - 1) / 2);

let enemyHp = baseHp;

let enemySpeed =
  0.65 +
  Math.random() * 0.35 +
  (wave - 1) * 0.025;

if (enemyType === "bat") {
  enemyHp = Math.max(1, baseHp - 1);
  enemySpeed *= 4.6;
}

if (enemyType === "tank") {
  enemyHp = baseHp * 3;
  enemySpeed *= 0.55;
}

const enemyData = {
  element: enemy,
  x: x,
  y: y,
  hp: enemyHp,
  speed: enemySpeed,
  type: enemyType
};

  enemy.style.left = x + "px";
  enemy.style.top = y + "px";

  world.appendChild(enemy);
  enemies.push(enemyData);
}

function startSwarm() {

  const swarmInterval = setInterval(() => {

    if (!gameRunning || !swarmActive || bossActive) {
      clearInterval(swarmInterval);
      return;
    }

    // Pro Schub mehrere Gegner erzeugen
    for (let i = 0; i < 4; i++) {
      spawnEnemy();
    }

  }, 500);

  // Schwarm läuft 15 Sekunden
  setTimeout(() => {
    swarmActive = false;
    clearInterval(swarmInterval);
  }, 15000);
}

function spawnBoss() {

  if (!gameRunning || waveBoss) return;

  const boss = document.createElement("div");

  boss.className = "enemy boss";
  boss.innerHTML = "👿";

  const x = Math.min(worldWidth - 80, playerX + 400);
  const y = playerY;

  const bossData = {
    element: boss,
    x: x,
    y: y,
    hp: 30 + (wave - 1) * 10,
    speed: 0.45,
    isBoss: true
  };

  boss.style.left = x + "px";
  boss.style.top = y + "px";

  world.appendChild(boss);

  enemies.push(bossData);

  waveBoss = bossData;
}

/* -------------------------
   FIND CLOSEST ENEMY
------------------------- */

function closestEnemy() {

  let closest = null;
  let closestDistance = 450;

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

  const dx = enemy.x - playerX;
  const dy = enemy.y - playerY;

  const baseAngle = Math.atan2(dy, dx);

  // Mehrere Projektile leicht auffächern
  const spread = 0.18;

  for (let i = 0; i < multishot; i++) {

    const projectile = document.createElement("div");
    projectile.className = "projectile";

    projectile.style.width = projectileSize + "px";
    projectile.style.height = projectileSize + "px";

    world.appendChild(projectile);

    const offset =
      (i - (multishot - 1) / 2) * spread;

    const angle = baseAngle + offset;

    const projectileData = {
      element: projectile,

      x: playerX,
      y: playerY,

      vx: Math.cos(angle) * projectileSpeed,
      vy: Math.sin(angle) * projectileSpeed
    };

    projectile.style.left = playerX + "px";
    projectile.style.top = playerY + "px";

    projectiles.push(projectileData);
  }
}


/* -------------------------
   KILL ENEMY
------------------------- */

function spawnXpOrb(x, y) {

  const orb = document.createElement("div");
  orb.className = "xpOrb";

  orb.style.left = x + "px";
  orb.style.top = y + "px";

  world.appendChild(orb);

  xpOrbs.push({
    element: orb,
    x: x,
    y: y,
    value: 1
  });
}

function killEnemy(enemy) {

  spawnXpOrb(enemy.x, enemy.y);

  enemy.element.remove();

  enemies = enemies.filter(e => e !== enemy);

  kills++;

  killsText.textContent = kills;
  
  /* SCORE */

let points = 100;

if (enemy.type === "bat") {
  points = 150;
}

if (enemy.type === "tank") {
  points = 300;
}

if (enemy.isBoss) {
  points = 1000 * wave;
}

score += points;

scoreText.textContent = score;

/* HIGHSCORE */

if (score > highscore) {
  highscore = score;
  localStorage.setItem("shadowHighscore", highscore);
  highscoreText.textContent = highscore;
}

  /* Boss besiegt */

  if (enemy.isBoss) {

    waveBoss = null;
    bossActive = false;

    wave++;

    waveTime = 60;
    
    startEnemySpawning();

    waveText.textContent = wave;
    waveTimerText.textContent = waveTime;
  }
}


/* -------------------------
   GAME OVER
------------------------- */

function gameOver() {

  gameRunning = false;

  document.getElementById("finalScore")
    .textContent = score;

  document.getElementById("finalHighscore")
    .textContent = highscore;

  document.getElementById("finalWave")
    .textContent = wave;

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

  /* Joystick player movement */

playerX += moveX * playerSpeed;
playerY += moveY * playerSpeed;

  playerX = Math.max(
  30,
  Math.min(worldWidth - 30, playerX)
);

playerY = Math.max(
  30,
  Math.min(worldHeight - 30, playerY)
);

  player.style.left = playerX + "px";
  player.style.top = playerY + "px";

/* CAMERA FOLLOW */

/* CAMERA FOLLOW */

/* CAMERA FOLLOW */

const zoom = 0.8;

const visibleWidth = window.innerWidth / zoom;
const visibleHeight = window.innerHeight / zoom;

const cameraX = Math.max(
  0,
  Math.min(
    playerX - visibleWidth / 2,
    worldWidth - visibleWidth
  )
);

const cameraY = Math.max(
  0,
  Math.min(
    playerY - visibleHeight / 2,
    worldHeight - visibleHeight
  )
);

world.style.transform =
  `scale(${zoom}) translate(${-cameraX}px, ${-cameraY}px)`;

/* EXP ORBS */

xpOrbs.forEach(orb => {

  const dx = playerX - orb.x;
  const dy = playerY - orb.y;

  const distance = Math.hypot(dx, dy);

  // Kugel wird in der Nähe angezogen
  if (distance < 100 && distance > 20) {

    orb.x += (dx / distance) * 6;
    orb.y += (dy / distance) * 6;

    orb.element.style.left = orb.x + "px";
    orb.element.style.top = orb.y + "px";
  }

  // EXP einsammeln
  if (distance <= 20) {

    xp += orb.value;

    orb.element.remove();

    xpOrbs = xpOrbs.filter(o => o !== orb);

    if (xp >= xpNeeded) {

      level++;
      xp -= xpNeeded;

      xpNeeded = Math.ceil(xpNeeded * 1.4);

      levelText.textContent = level;

      showLevelUp();
    }

    xpFill.style.width =
      (xp / xpNeeded * 100) + "%";
  }
});

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

        enemy.hp -= damage;

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
  projectile.x > worldWidth + 50 ||
  projectile.y < -50 ||
  projectile.y > worldHeight + 50
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

let enemySpawnInterval;

function startEnemySpawning() {

  clearInterval(enemySpawnInterval);

  // Jede Welle spawnen Gegner schneller
  const spawnRate = Math.max(
    350,
    1100 - (wave - 1) * 70
  );

  enemySpawnInterval = setInterval(
    spawnEnemy,
    spawnRate
  );
}

startEnemySpawning();

let shootInterval = setInterval(shoot, attackSpeed);

function restartShooting() {
  clearInterval(shootInterval);
  shootInterval = setInterval(shoot, attackSpeed);
}

update();
