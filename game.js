const game = document.getElementById("game");
const player = document.getElementById("player");

const world = document.getElementById("world");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 3000;
canvas.height = 5000;

const worldWidth = 3000;
const worldHeight = 5000;

// CANVAS TEST
ctx.font = "42px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

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
let waveTime = 30;
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
let beamDamage = 2;
let beamCooldown = 2200;
let beamWidth = 12;
let beamRange = 550;
let lastBeamTime = 0;
let activeBeam = null;

function getBeamTarget() {

  let target = null;
  let closestDistance = beamRange;

  enemies.forEach(enemy => {

    const distance = Math.hypot(
      enemy.x - playerX,
      enemy.y - playerY
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      target = enemy;
    }
  });

  return target;
}

function fireBeam() {

  if (!getWeapon("arcane_beam")) return;

  const now = performance.now();

  if (now - lastBeamTime < beamCooldown) {
    return;
  }

  const target = getBeamTarget();

  if (!target) return;

  lastBeamTime = now;

  target.hp -= beamDamage;

  activeBeam = {
    startX: playerX,
    startY: playerY,
    endX: target.x,
    endY: target.y,
    createdAt: now
  };

  if (target.hp <= 0) {
    killEnemy(target);
  }
}

/* -------------------------
   WEAPON SYSTEM
------------------------- */

const maxActiveWeapons = 3;

let activeWeapons = [
  {
    id: "arcane_orb",
    name: "Magiekugeln",
    element: "arcane",
    level: 1
  }
];

function getWeapon(id) {
  return activeWeapons.find(
    weapon => weapon.id === id
  );
}

function levelWeapon(id) {

  const weapon = getWeapon(id);

  if (!weapon) return;
  if (weapon.level >= 5) return;

  weapon.level++;

  if (id === "arcane_orb") {

    if (weapon.level === 2) {
      damage *= 1.25;
    }

    if (weapon.level === 3) {
      multishot += 1;
    }

    if (weapon.level === 4) {
      attackSpeed *= 0.8;
      restartShooting();
    }

    if (weapon.level === 5) {
      damage *= 1.4;
      projectileSize *= 1.3;
    }
  }

  if (id === "arcane_beam") {

    if (weapon.level === 2) {
      // später: +25% Strahlschaden
    }

    if (weapon.level === 3) {
      // später: breiterer Strahl
    }

    if (weapon.level === 4) {
      // später: kürzere Abklingzeit
    }

    if (weapon.level === 5) {
      // später: Strahl durchdringt mehrere Gegner
    }
  }
}

const weaponPool = [
  {
    id: "arcane_beam",
    name: "Magiestrahl",
    icon: "🟣",
    element: "arcane"
  }
];

function addWeapon(id) {

  if (activeWeapons.length >= maxActiveWeapons) {
    return;
  }

  if (getWeapon(id)) {
    return;
  }

  const weaponData = weaponPool.find(
    weapon => weapon.id === id
  );

  if (!weaponData) return;

  activeWeapons.push({
    id: weaponData.id,
    name: weaponData.name,
    element: weaponData.element,
    level: 1
  });
}

const upgradePool = [
  
  {
  icon: "🔮",
  name: "Magiekugeln",
  description: "Magiekugeln auf das nächste Level verbessern",
  weaponId: "arcane_orb",
  type: "weapon",
  apply: () => {
    levelWeapon("arcane_orb");
  }
},
  
  {
  icon: "🟣",
  name: "Magiestrahl",
  description: "Neue Waffe: Feuert einen arkanen Strahl auf Gegner",
  weaponId: "arcane_beam",
  type: "newWeapon",
  apply: () => {
    addWeapon("arcane_beam");
  }
},
  
  {
  icon: "🟣",
  name: "Magiestrahl",
  description: "Magiestrahl auf das nächste Level verbessern",
  weaponId: "arcane_beam",
  type: "weapon",
  apply: () => {
    levelWeapon("arcane_beam");
  }
},
  
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
  const availableUpgrades = upgradePool.filter(upgrade => {

if (upgrade.type === "newWeapon") {

  if (getWeapon(upgrade.weaponId)) {
    return false;
  }

  if (activeWeapons.length >= maxActiveWeapons) {
    return false;
  }
}

  if (upgrade.type === "weapon") {

  const weapon = getWeapon(upgrade.weaponId);

  if (!weapon) {
    return false;
  }

  if (weapon.level >= 5) {
    return false;
  }
}

  return true;
});

const randomUpgrades = [...availableUpgrades]
  .sort(() => Math.random() - 0.5)
  .slice(0, 3);

  randomUpgrades.forEach(upgrade => {

    const card = document.createElement("div");
    card.className = "upgradeCard";

let displayName = upgrade.name;

if (upgrade.type === "weapon") {
  const weapon = getWeapon(upgrade.weaponId);

  if (weapon) {
    displayName =
      `${upgrade.name} Lv.${weapon.level + 1}`;
  }
}

    card.innerHTML = `
      <div class="upgradeIcon">${upgrade.icon}</div>

      <div>
        <div class="upgradeName">
          ${displayName}
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

let enemyType = "demon";

// Ab Welle 3 besteht eine Chance auf schnelle Gegner
if (wave >= 3 && Math.random() < 0.25) {
  enemyType = "bat";
}

// Ab Welle 5 besteht eine Chance auf Tanks
if (wave >= 5 && Math.random() < 0.15) {
  enemyType = "tank";
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
  3 + Math.floor((wave - 1) * 0.75);

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
  x: x,
  y: y,
  hp: enemyHp,
  speed: enemySpeed,
  type: enemyType
};

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

  const x = Math.min(
    worldWidth - 80,
    playerX + 400
  );

  const y = playerY;

  const bossData = {
    x: x,
    y: y,
    hp: 50 + (wave - 1) * 25,
    speed: 0.55 + (wave - 1) * 0.02,
    type: "boss",
    isBoss: true
  };

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

    const offset =
      (i - (multishot - 1) / 2) * spread;

    const angle = baseAngle + offset;

    const projectileData = {
  x: playerX,
  y: playerY,
  vx: Math.cos(angle) * projectileSpeed,
  vy: Math.sin(angle) * projectileSpeed
};

projectiles.push(projectileData);
  }
}


/* -------------------------
   KILL ENEMY
------------------------- */

function spawnXpOrb(x, y, value = 1) {

  xpOrbs.push({
  x: x,
  y: y,
  value: value
});
}

function killEnemy(enemy) {

  let xpValue = 1;

if (enemy.type === "bat") {
  xpValue = 2;
}

if (enemy.type === "tank") {
  xpValue = 5;
}

if (enemy.isBoss) {
  xpValue = 15 + wave * 3;
}

spawnXpOrb(enemy.x, enemy.y, xpValue);

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

    waveTime = 30;
    
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
  }

  // EXP einsammeln
  if (distance <= 20) {

    xp += orb.value;

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

/* DRAW ENEMIES ON CANVAS */

ctx.clearRect(
  cameraX - 100,
  cameraY - 100,
  visibleWidth + 200,
  visibleHeight + 200
);

enemies.forEach(enemy => {

  let radius = 22;
  let fillColor = "#7a1028";
  let borderColor = "#ff304f";

  if (enemy.type === "bat") {
    radius = 16;
    fillColor = "#442080";
    borderColor = "#a66cff";
  }

  if (enemy.type === "tank") {
    radius = 29;
    fillColor = "#551515";
    borderColor = "#ff704d";
  }

  if (enemy.isBoss) {
    radius = 43;
    fillColor = "#420018";
    borderColor = "#ff1744";
  }

  ctx.beginPath();
  ctx.arc(
    enemy.x,
    enemy.y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = borderColor;
  ctx.stroke();
});

/* DRAW EXP ORBS ON CANVAS */

xpOrbs.forEach(orb => {

  let color = "#9c4dff";

  if (orb.value >= 15) {
    color = "#ffd700";
  } else if (orb.value >= 5) {
    color = "#ff7043";
  } else if (orb.value >= 2) {
    color = "#42a5f5";
  }

  ctx.beginPath();
  ctx.arc(
    orb.x,
    orb.y,
    6,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = color;
  ctx.fill();
});

/* DRAW PROJECTILES ON CANVAS */

projectiles.forEach(projectile => {

  ctx.beginPath();

  ctx.arc(
    projectile.x,
    projectile.y,
    projectileSize / 2,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "#b44cff";
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#e6b3ff";
  ctx.stroke();
});

/* MOVE ENEMIES */

enemies.forEach(enemy => {

  const dx = playerX - enemy.x;
  const dy = playerY - enemy.y;

  const distance = Math.hypot(dx, dy);

  if (distance > 0) {
    enemy.x +=
      (dx / distance) * enemy.speed;

    enemy.y +=
      (dy / distance) * enemy.speed;
  }


  /* Enemy hits player */

  if (distance < 38) {

    let contactDamage = 0.15;

    if (enemy.type === "bat") {
      contactDamage = 0.08;
    }

    if (enemy.type === "tank") {
      contactDamage = 0.35;
    }

    if (enemy.isBoss) {
      contactDamage = 0.6;
    }

    hp -= contactDamage;

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

    /* Collision */

    enemies.forEach(enemy => {

      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      if (distance < 28) {

        enemy.hp -= damage;

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
  180,
  600 - (wave - 1) * 35
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
