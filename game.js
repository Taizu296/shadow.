"use strict";

/* =========================================================
   SHADOW HUNTERS V1
   Core Engine
========================================================= */

const $ = id => document.getElementById(id);

const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

const startScreen = $("startScreen");
const characterScreen = $("characterScreen");
const gameScreen = $("gameScreen");
const levelUpScreen = $("levelUpScreen");
const pauseScreen = $("pauseScreen");
const victoryScreen = $("victoryScreen");
const gameOverScreen = $("gameOverScreen");

const playerNameInput = $("playerName");
const continueButton = $("continueButton");
const backToStart = $("backToStart");
const startGameButton = $("startGameButton");

const hudPlayerName = $("hudPlayerName");
const hpNumber = $("hpNumber");
const hpFill = $("hpFill");
const playerPortrait = $("playerPortrait");

const runTimer = $("runTimer");
const bossHud = $("bossHud");
const bossName = $("bossName");
const bossHpFill = $("bossHpFill");

const levelText = $("levelText");
const xpFill = $("xpFill");

const pauseButton = $("pauseButton");
const resumeButton = $("resumeButton");
const quitButton = $("quitButton");

const infinityButton = $("infinityButton");
const finishRunButton = $("finishRunButton");
const restartButton = $("restartButton");

const finalTime = $("finalTime");
const finalKills = $("finalKills");
const finalScore = $("finalScore");
const finalBest = $("finalBest");

const upgradeChoices = $("upgradeChoices");
const pauseBuild = $("pauseBuild");

const skillSlots = [...document.querySelectorAll(".skillSlot")];
const characterCards = [...document.querySelectorAll(".characterCard")];


/* =========================================================
   CONFIG
========================================================= */

const WORLD = {
  width: 4200,
  height: 3000
};

const RUN_DURATION = 20 * 60;

const CAMERA_ZOOM = 0.58;

const MAX_SKILLS = 3;
const MAX_PASSIVES = 4;

const MAX_ENEMIES = 260;
const MAX_PROJECTILES = 220;

const PLAYER_RADIUS = 22;


/* =========================================================
   CHARACTER DATA
========================================================= */

const CHARACTERS = {

  mage: {
    name: "Magier",
    subtitle: "Shamane",
    portrait: "✦",

    color: "#9d70ff",
    secondary: "#d8c2ff",

    hp: 100,
    speed: 285,

    baseName: "Magiekugeln",

    base: {
      damage: 18,
      cooldown: 0.42,
      speed: 760,
      range: 900,
      size: 9
    }
  },

  vampire: {
    name: "Seelenvampir",
    subtitle: "Corrupted Sura",
    portrait: "☠",

    color: "#e73d58",
    secondary: "#7c1730",

    hp: 125,
    speed: 255,

    baseName: "Seelendieb",

    base: {
      damage: 22,
      cooldown: 0.62,
      range: 720
    }
  },

  assassin: {
    name: "Assassine",
    subtitle: "Phantom Assassin",
    portrait: "◈",

    color: "#846cff",
    secondary: "#2d244f",

    hp: 90,
    speed: 330,

    baseName: "Kunai",

    base: {
      damage: 15,
      cooldown: 0.27,
      speed: 900,
      range: 850,
      size: 7
    }
  },

  tank: {
    name: "Katana-Tank",
    subtitle: "Wandering Juggernaut",
    portrait: "⚔",

    color: "#e6ad55",
    secondary: "#6e4926",

    hp: 165,
    speed: 235,

    baseName: "Katana-Hieb",

    base: {
      damage: 31,
      cooldown: 0.7,
      range: 115,
      arc: Math.PI * 0.72
    }
  }
};


/* =========================================================
   SPECIAL SKILL DEFINITIONS
   Mechaniken folgen in nächsten Versionen
========================================================= */

const CLASS_SKILLS = {

  mage: [
    {
      id: "thunder",
      icon: "⚡",
      name: "Donnerbeschwörung",
      description: "AoE-Blitz auf Gegnergruppen."
    },
    {
      id: "orbit_orbs",
      icon: "🔮",
      name: "Seelenorbs",
      description: "Orbs kreisen um dich und greifen Gegner an."
    },
    {
      id: "ice_wall",
      icon: "🧊",
      name: "Eiswand",
      description: "Errichtet Hindernisse für Gegner."
    },
    {
      id: "chain_lightning",
      icon: "ϟ",
      name: "Kettenblitz",
      description: "Blitz springt zwischen Gegnern."
    },
    {
      id: "black_hole",
      icon: "●",
      name: "Schwarzes Loch",
      description: "Zieht große Gegnergruppen zusammen."
    }
  ],

  vampire: [
    {
      id: "soul_eaters",
      icon: "👻",
      name: "Totesser",
      description: "Gestohlene Seelen kämpfen für dich."
    },
    {
      id: "demon_grab",
      icon: "✋",
      name: "Dämonengriff",
      description: "Der Dämonenarm verschlingt Gegner."
    },
    {
      id: "demon_shield",
      icon: "🛡",
      name: "Dämonenschild",
      description: "Massive Schadensreduktion."
    },
    {
      id: "soul_pull",
      icon: "🩸",
      name: "Seelensog",
      description: "Zieht Gegner heran und heilt dich."
    },
    {
      id: "curse",
      icon: "☠",
      name: "Fluchkreis",
      description: "Schädlicher Fluch auf dem Boden."
    }
  ],

  assassin: [
    {
      id: "shuriken_ring",
      icon: "✣",
      name: "Shuriken-Ring",
      description: "Shuriken kreisen um dich."
    },
    {
      id: "clone",
      icon: "👥",
      name: "Schattenklon",
      description: "Eine Kopie verwendet deine Fähigkeiten."
    },
    {
      id: "invisibility",
      icon: "◌",
      name: "Unsichtbarkeit",
      description: "Gegner ignorieren dich zeitweise."
    },
    {
      id: "massacre",
      icon: "☠",
      name: "Massaker",
      description: "Schattenangriffe gegen viele Gegner."
    },
    {
      id: "rage",
      icon: "🩸",
      name: "Rage",
      description: "Massiver Boost und Blutung."
    }
  ],

  tank: [
    {
      id: "dash",
      icon: "➤",
      name: "Katana-Dash",
      description: "Dash zum Gegner mit starkem Hieb."
    },
    {
      id: "earthquake",
      icon: "◉",
      name: "Erdbeben",
      description: "360° AoE-Schaden."
    },
    {
      id: "heavy_strike",
      icon: "💥",
      name: "Heftiger Schlag",
      description: "Starker Treffer mit Betäubung."
    },
    {
      id: "iron_body",
      icon: "🛡",
      name: "Eiserner Körper",
      description: "Erhöht deine Verteidigung."
    },
    {
      id: "katana_whirl",
      icon: "🌀",
      name: "Katana-Wirbel",
      description: "Großer Klingenwirbel um dich."
    }
  ]
};


/* =========================================================
   PASSIVES
========================================================= */

const PASSIVES = [

  {
    id: "power",
    icon: "💪",
    name: "Macht",
    description: "+12% Gesamtschaden pro Level."
  },

  {
    id: "tempo",
    icon: "⚡",
    name: "Tempo",
    description: "-7% Angriffscooldown pro Level."
  },

  {
    id: "area",
    icon: "💥",
    name: "Flächenmacht",
    description: "+10% AoE-Größe pro Level."
  },

  {
    id: "duration",
    icon: "⏳",
    name: "Ausdauer",
    description: "+10% Skill-Dauer pro Level."
  },

  {
    id: "range",
    icon: "🎯",
    name: "Reichweite",
    description: "+8% Reichweite pro Level."
  },

  {
    id: "projectile",
    icon: "🌀",
    name: "Geschossmacht",
    description: "+8% Geschossgröße und Tempo."
  },

  {
    id: "vitality",
    icon: "❤️",
    name: "Vitalität",
    description: "+10% maximale HP pro Level."
  },

  {
    id: "armor",
    icon: "🛡",
    name: "Rüstung",
    description: "-6% erlittener Schaden pro Level."
  },

  {
    id: "movement",
    icon: "👟",
    name: "Beweglichkeit",
    description: "+7% Bewegungstempo pro Level."
  },

  {
    id: "critical",
    icon: "🍀",
    name: "Kritischer Treffer",
    description: "+5% Crit-Chance pro Level."
  },

  {
    id: "magnet",
    icon: "🧲",
    name: "Seelensammler",
    description: "+20% EXP-Einsammelradius."
  },

  {
    id: "experience",
    icon: "📖",
    name: "Erfahrung",
    description: "+8% erhaltene EXP pro Level."
  }
];


/* =========================================================
   GAME STATE
========================================================= */

let selectedCharacter = "mage";

let state = {
  running: false,
  paused: false,
  choosingUpgrade: false,
  infinity: false,
  victoryShown: false,

  elapsed: 0,
  kills: 0,
  score: 0,

  level: 1,
  xp: 0,
  xpNeeded: 8,

  spawnClock: 0,
  eliteClock: 0,

  boss: null,

  cameraX: 0,
  cameraY: 0
};

let player = null;

let enemies = [];
let projectiles = [];
let xpOrbs = [];
let healthDrops = [];
let effects = [];
let obstacles = [];

let selectedSkills = [];
let passiveLevels = {};

let lastFrame = performance.now();


/* =========================================================
   NAME
========================================================= */

const savedName =
  localStorage.getItem("shadowHuntersName");

if (savedName) {
  playerNameInput.value = savedName;
}


/* =========================================================
   SCREEN HELPERS
========================================================= */

function hideMainScreens() {
  startScreen.classList.remove("active");
  characterScreen.classList.remove("active");
  gameScreen.classList.remove("active");
}

function showScreen(screen) {
  hideMainScreens();
  screen.classList.add("active");
}

function hideOverlay(overlay) {
  overlay.style.display = "none";
}

function showOverlay(overlay) {
  overlay.style.display = "flex";
}


/* =========================================================
   MENU
========================================================= */

continueButton.addEventListener("click", () => {

  let name = playerNameInput.value.trim();

  if (!name) {
    name = "Hunter";
    playerNameInput.value = name;
  }

  localStorage.setItem(
    "shadowHuntersName",
    name
  );

  showScreen(characterScreen);
});


backToStart.addEventListener("click", () => {
  showScreen(startScreen);
});


characterCards.forEach(card => {

  card.addEventListener("click", () => {

    characterCards.forEach(c =>
      c.classList.remove("selected")
    );

    card.classList.add("selected");

    selectedCharacter =
      card.dataset.character;
  });
});


startGameButton.addEventListener(
  "click",
  startGame
);


/* =========================================================
   CANVAS
========================================================= */

function resizeCanvas() {

  const dpr =
    Math.min(window.devicePixelRatio || 1, 2);

  canvas.width =
    Math.floor(window.innerWidth * dpr);

  canvas.height =
    Math.floor(window.innerHeight * dpr);

  canvas.style.width =
    window.innerWidth + "px";

  canvas.style.height =
    window.innerHeight + "px";

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );
}

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();


/* =========================================================
   WORLD / OBSTACLES
========================================================= */

function createWorld() {

  obstacles = [
    { x: 700, y: 500, w: 260, h: 100 },
    { x: 1300, y: 780, w: 130, h: 300 },
    { x: 2100, y: 430, w: 300, h: 110 },
    { x: 3100, y: 720, w: 150, h: 330 },

    { x: 450, y: 1750, w: 180, h: 320 },
    { x: 1100, y: 2050, w: 360, h: 110 },
    { x: 2500, y: 1800, w: 160, h: 360 },
    { x: 3300, y: 2200, w: 350, h: 110 },

    { x: 1850, y: 1300, w: 210, h: 150 },
    { x: 2900, y: 1350, w: 240, h: 120 }
  ];
}


function circleRectCollision(
  x,
  y,
  radius,
  rect
) {

  const closestX =
    Math.max(
      rect.x,
      Math.min(x, rect.x + rect.w)
    );

  const closestY =
    Math.max(
      rect.y,
      Math.min(y, rect.y + rect.h)
    );

  const dx = x - closestX;
  const dy = y - closestY;

  return (
    dx * dx + dy * dy <
    radius * radius
  );
}


function positionBlocked(
  x,
  y,
  radius
) {

  return obstacles.some(
    obstacle =>
      circleRectCollision(
        x,
        y,
        radius,
        obstacle
      )
  );
}


/* =========================================================
   PLAYER
========================================================= */

function createPlayer() {

  const data =
    CHARACTERS[selectedCharacter];

  player = {
    x: WORLD.width / 2,
    y: WORLD.height / 2,

    hp: data.hp,
    maxHp: data.hp,

    speed: data.speed,

    damageMultiplier: 1,
    cooldownMultiplier: 1,
    areaMultiplier: 1,
    durationMultiplier: 1,
    rangeMultiplier: 1,
    projectileMultiplier: 1,

    armor: 0,

    critChance: 0.05,
    critDamage: 1.75,

    magnet: 115,
    xpMultiplier: 1,

    baseLevel: 1,

    attackClock: 0,

    souls: 0
  };
}


/* =========================================================
   JOYSTICKS
========================================================= */

const moveJoystick = $("moveJoystick");
const moveKnob = $("moveKnob");

const aimJoystick = $("aimJoystick");
const aimKnob = $("aimKnob");

const moveInput = {
  x: 0,
  y: 0,
  active: false,
  pointerId: null
};

const aimInput = {
  x: 1,
  y: 0,
  active: false,
  pointerId: null
};


function setupJoystick(
  element,
  knob,
  input
) {

  const maxDistance = 32;

  function updateStick(event) {

    const rect =
      element.getBoundingClientRect();

    const centerX =
      rect.left + rect.width / 2;

    const centerY =
      rect.top + rect.height / 2;

    let dx =
      event.clientX - centerX;

    let dy =
      event.clientY - centerY;

    const distance =
      Math.hypot(dx, dy);

    if (distance > maxDistance) {

      dx =
        dx / distance * maxDistance;

      dy =
        dy / distance * maxDistance;
    }

    knob.style.transform =
      `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    input.x = dx / maxDistance;
    input.y = dy / maxDistance;
  }


  element.addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      input.active = true;
      input.pointerId =
        event.pointerId;

      element.setPointerCapture(
        event.pointerId
      );

      updateStick(event);
    }
  );


  element.addEventListener(
    "pointermove",
    event => {

      if (
        !input.active ||
        event.pointerId !==
        input.pointerId
      ) {
        return;
      }

      event.preventDefault();
      updateStick(event);
    }
  );


  function release(event) {

    if (
      event.pointerId !==
      input.pointerId
    ) {
      return;
    }

    input.active = false;
    input.pointerId = null;

    knob.style.transform =
      "translate(-50%, -50%)";

    if (input === moveInput) {
      input.x = 0;
      input.y = 0;
    }
  }


  element.addEventListener(
    "pointerup",
    release
  );

  element.addEventListener(
    "pointercancel",
    release
  );
}


setupJoystick(
  moveJoystick,
  moveKnob,
  moveInput
);

setupJoystick(
  aimJoystick,
  aimKnob,
  aimInput
);


/* =========================================================
   START RUN
========================================================= */

function startGame() {

  const name =
    playerNameInput.value.trim() ||
    "Hunter";

  localStorage.setItem(
    "shadowHuntersName",
    name
  );

  state = {
    running: true,
    paused: false,
    choosingUpgrade: false,
    infinity: false,
    victoryShown: false,

    elapsed: 0,
    kills: 0,
    score: 0,

    level: 1,
    xp: 0,
    xpNeeded: 8,

    spawnClock: 0,
    eliteClock: 0,

    boss: null,

    cameraX: 0,
    cameraY: 0
  };

  enemies = [];
  projectiles = [];
  xpOrbs = [];
  healthDrops = [];
  effects = [];

  selectedSkills = [];
  passiveLevels = {};

  createWorld();
  createPlayer();

  hudPlayerName.textContent = name;

  const char =
    CHARACTERS[selectedCharacter];

  playerPortrait.textContent =
    char.portrait;

  skillSlots[0].querySelector(
    ".skillIcon"
  ).textContent = char.portrait;

  skillSlots[0].querySelector(
    "small"
  ).textContent = "LV.1";

  for (
    let i = 1;
    i < skillSlots.length;
    i++
  ) {
    skillSlots[i].innerHTML =
      "<span>+</span>";

    skillSlots[i]
      .classList
      .remove("activeSkill");
  }

  hideOverlay(levelUpScreen);
  hideOverlay(pauseScreen);
  hideOverlay(victoryScreen);
  hideOverlay(gameOverScreen);

  bossHud.style.display = "none";

  updateHud();

  showScreen(gameScreen);

  lastFrame = performance.now();
}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer(dt) {

  let dx = moveInput.x;
  let dy = moveInput.y;

  const length =
    Math.hypot(dx, dy);

  if (length > 1) {
    dx /= length;
    dy /= length;
  }

  const speed =
    player.speed * dt;

  const nextX =
    Math.max(
      PLAYER_RADIUS,
      Math.min(
        WORLD.width - PLAYER_RADIUS,
        player.x + dx * speed
      )
    );

  if (
    !positionBlocked(
      nextX,
      player.y,
      PLAYER_RADIUS
    )
  ) {
    player.x = nextX;
  }

  const nextY =
    Math.max(
      PLAYER_RADIUS,
      Math.min(
        WORLD.height - PLAYER_RADIUS,
        player.y + dy * speed
      )
    );

  if (
    !positionBlocked(
      player.x,
      nextY,
      PLAYER_RADIUS
    )
  ) {
    player.y = nextY;
  }
}


/* =========================================================
   BASE ATTACK
========================================================= */

function getAimDirection() {

  let x = aimInput.x;
  let y = aimInput.y;

  let length =
    Math.hypot(x, y);

  if (length < 0.15) {

    x = 1;
    y = 0;
    length = 1;
  }

  return {
    x: x / length,
    y: y / length
  };
}


function calculateDamage(
  baseDamage
) {

  let damage =
    baseDamage *
    player.damageMultiplier;

  if (
    Math.random() <
    player.critChance
  ) {
    damage *= player.critDamage;
  }

  return damage;
}


function fireBaseAttack() {

  const char =
    CHARACTERS[selectedCharacter];

  const base = char.base;

  const direction =
    getAimDirection();


  if (
    selectedCharacter === "mage" ||
    selectedCharacter === "assassin"
  ) {

    if (
      projectiles.length >=
      MAX_PROJECTILES
    ) {
      return;
    }

    projectiles.push({

      type:
        selectedCharacter === "mage"
          ? "magic"
          : "kunai",

      x: player.x,
      y: player.y,

      vx:
        direction.x *
        base.speed *
        player.projectileMultiplier,

      vy:
        direction.y *
        base.speed *
        player.projectileMultiplier,

      damage:
        calculateDamage(
          base.damage
        ),

      radius:
        base.size *
        player.projectileMultiplier,

      life:
        base.range /
        (
          base.speed *
          player.projectileMultiplier
        )
    });

    return;
  }


  if (
    selectedCharacter === "vampire"
  ) {

    const target =
      findEnemyInDirection(
        direction,
        base.range *
        player.rangeMultiplier,
        0.55
      );

    if (!target) return;

    target.hp -=
      calculateDamage(base.damage);

    effects.push({
      type: "soulBeam",
      x1: player.x,
      y1: player.y,
      x2: target.x,
      y2: target.y,
      life: 0.16,
      maxLife: 0.16
    });

    if (target.hp <= 0) {

      player.souls++;

      killEnemy(target);
    }

    return;
  }


  if (
    selectedCharacter === "tank"
  ) {

    const range =
      base.range *
      player.rangeMultiplier;

    enemies
      .slice()
      .forEach(enemy => {

        const dx =
          enemy.x - player.x;

        const dy =
          enemy.y - player.y;

        const distance =
          Math.hypot(dx, dy);

        if (distance > range) {
          return;
        }

        const angle =
          Math.atan2(dy, dx);

        const aimAngle =
          Math.atan2(
            direction.y,
            direction.x
          );

        const difference =
          normalizeAngle(
            angle - aimAngle
          );

        if (
          Math.abs(difference) <=
          base.arc / 2
        ) {

          enemy.hp -=
            calculateDamage(
              base.damage
            );

          if (enemy.hp <= 0) {
            killEnemy(enemy);
          }
        }
      });

    effects.push({
      type: "slash",
      x: player.x,
      y: player.y,
      angle:
        Math.atan2(
          direction.y,
          direction.x
        ),
      life: 0.18,
      maxLife: 0.18
    });
  }
}


function updateBaseAttack(dt) {

  player.attackClock -= dt;

  if (player.attackClock > 0) {
    return;
  }

  const base =
    CHARACTERS[selectedCharacter]
      .base;

  fireBaseAttack();

  player.attackClock =
    base.cooldown *
    player.cooldownMultiplier;
}


/* =========================================================
   TARGETING
========================================================= */

function findEnemyInDirection(
  direction,
  range,
  tolerance
) {

  let best = null;
  let bestDistance = Infinity;

  for (const enemy of enemies) {

    const dx =
      enemy.x - player.x;

    const dy =
      enemy.y - player.y;

    const distance =
      Math.hypot(dx, dy);

    if (
      distance === 0 ||
      distance > range
    ) {
      continue;
    }

    const dot =
      (
        dx / distance *
        direction.x
      ) +
      (
        dy / distance *
        direction.y
      );

    if (dot < tolerance) {
      continue;
    }

    if (
      distance < bestDistance
    ) {
      best = enemy;
      bestDistance = distance;
    }
  }

  return best;
}


/* =========================================================
   ENEMY TYPES
========================================================= */

function enemyStats(type) {

  const minute =
    state.elapsed / 60;

  const infinityScale =
    state.infinity
      ? 1 +
        Math.max(
          0,
          state.elapsed -
          RUN_DURATION
        ) / 75
      : 1;

  const hpScale =
    (
      1 +
      minute * 0.14 +
      minute * minute * 0.006
    ) *
    infinityScale;

  const damageScale =
    (
      1 +
      minute * 0.07
    ) *
    Math.sqrt(infinityScale);


  const types = {

    demon: {
      hp: 34,
      speed: 88,
      radius: 18,
      damage: 10,
      xp: 1,
      score: 100,
      color: "#743843"
    },

    bat: {
      hp: 19,
      speed: 145,
      radius: 13,
      damage: 7,
      xp: 2,
      score: 130,
      color: "#554078"
    },

    guardian: {
      hp: 105,
      speed: 55,
      radius: 26,
      damage: 18,
      xp: 5,
      score: 260,
      color: "#694331"
    },

    runner: {
      hp: 29,
      speed: 185,
      radius: 15,
      damage: 12,
      xp: 3,
      score: 190,
      color: "#374f5d"
    },

    elite: {
      hp: 360,
      speed: 72,
      radius: 32,
      damage: 24,
      xp: 12,
      score: 750,
      color: "#8e334c"
    },

    boss: {
      hp: 7000,
      speed: 54,
      radius: 55,
      damage: 32,
      xp: 80,
      score: 8000,
      color: "#511324"
    }
  };

  const data = types[type];

  return {
    ...data,

    hp:
      data.hp *
      hpScale,

    damage:
      data.damage *
      damageScale
  };
}


/* =========================================================
   SPAWN
========================================================= */

function chooseEnemyType() {

  const minute =
    state.elapsed / 60;

  const roll =
    Math.random();

  if (
    minute >= 8 &&
    roll < 0.12
  ) {
    return "guardian";
  }

  if (
    minute >= 5 &&
    roll < 0.27
  ) {
    return "runner";
  }

  if (
    minute >= 2 &&
    roll < 0.45
  ) {
    return "bat";
  }

  return "demon";
}


function spawnEnemy(
  forcedType = null
) {

  if (
    enemies.length >=
    MAX_ENEMIES
  ) {
    return;
  }

  const type =
    forcedType ||
    chooseEnemyType();

  const stats =
    enemyStats(type);

  const angle =
    Math.random() *
    Math.PI * 2;

  const visibleRadius =
    Math.max(
      window.innerWidth,
      window.innerHeight
    ) /
    CAMERA_ZOOM *
    0.7;

  const distance =
    visibleRadius +
    120 +
    Math.random() * 180;

  let x =
    player.x +
    Math.cos(angle) *
    distance;

  let y =
    player.y +
    Math.sin(angle) *
    distance;

  x =
    Math.max(
      stats.radius,
      Math.min(
        WORLD.width -
        stats.radius,
        x
      )
    );

  y =
    Math.max(
      stats.radius,
      Math.min(
        WORLD.height -
        stats.radius,
        y
      )
    );

  if (
    positionBlocked(
      x,
      y,
      stats.radius
    )
  ) {
    return;
  }

  enemies.push({

    type,

    x,
    y,

    hp: stats.hp,
    maxHp: stats.hp,

    speed: stats.speed,
    radius: stats.radius,

    damage: stats.damage,

    xp: stats.xp,
    score: stats.score,

    color: stats.color,

    attackClock: 0
  });
}


function updateSpawning(dt) {

  if (state.boss) return;

  state.spawnClock -= dt;
  state.eliteClock -= dt;

  const minute =
    state.elapsed / 60;

  let spawnDelay =
    Math.max(
      0.11,
      0.72 - minute * 0.026
    );

  if (state.infinity) {

    const infinityMinutes =
      Math.max(
        0,
        state.elapsed -
        RUN_DURATION
      ) / 60;

    spawnDelay =
      Math.max(
        0.055,
        spawnDelay -
        infinityMinutes * 0.018
      );
  }

  if (
    state.spawnClock <= 0
  ) {

    let amount = 1;

    if (minute >= 6) amount = 2;
    if (minute >= 12) amount = 3;
    if (state.infinity) amount++;

    for (
      let i = 0;
      i < amount;
      i++
    ) {
      spawnEnemy();
    }

    state.spawnClock =
      spawnDelay;
  }


  if (
    state.eliteClock <= 0 &&
    state.elapsed >= 180
  ) {

    spawnEnemy("elite");

    state.eliteClock =
      Math.max(
        12,
        35 - minute
      );
  }
}


/* =========================================================
   ENEMY MOVEMENT
========================================================= */

function updateEnemies(dt) {

  for (const enemy of enemies) {

    if (enemy === state.boss) {
      updateBoss(enemy, dt);
      continue;
    }

    const dx =
      player.x - enemy.x;

    const dy =
      player.y - enemy.y;

    const distance =
      Math.hypot(dx, dy);

    if (distance > 0) {

      const vx =
        dx / distance *
        enemy.speed *
        dt;

      const vy =
        dy / distance *
        enemy.speed *
        dt;

      const nextX =
        enemy.x + vx;

      if (
        !positionBlocked(
          nextX,
          enemy.y,
          enemy.radius
        )
      ) {
        enemy.x = nextX;
      } else {

        const alternateY =
          enemy.y +
          Math.sign(dy || 1) *
          enemy.speed *
          dt;

        if (
          !positionBlocked(
            enemy.x,
            alternateY,
            enemy.radius
          )
        ) {
          enemy.y =
            alternateY;
        }
      }

      const nextY =
        enemy.y + vy;

      if (
        !positionBlocked(
          enemy.x,
          nextY,
          enemy.radius
        )
      ) {
        enemy.y = nextY;
      }
    }


    enemy.attackClock -= dt;

    if (
      distance <
      enemy.radius +
      PLAYER_RADIUS +
      5 &&
      enemy.attackClock <= 0
    ) {

      damagePlayer(
        enemy.damage
      );

      enemy.attackClock =
        0.7;
    }
  }
}


/* =========================================================
   PROJECTILES
========================================================= */

function updateProjectiles(dt) {

  for (
    let i =
      projectiles.length - 1;
    i >= 0;
    i--
  ) {

    const projectile =
      projectiles[i];

    projectile.x +=
      projectile.vx * dt;

    projectile.y +=
      projectile.vy * dt;

    projectile.life -= dt;

    let removed = false;

    for (
      let e =
        enemies.length - 1;
      e >= 0;
      e--
    ) {

      const enemy =
        enemies[e];

      const dx =
        projectile.x -
        enemy.x;

      const dy =
        projectile.y -
        enemy.y;

      const radius =
        projectile.radius +
        enemy.radius;

      if (
        dx * dx +
        dy * dy <=
        radius * radius
      ) {

        enemy.hp -=
          projectile.damage;

        projectiles.splice(
          i,
          1
        );

        removed = true;

        if (enemy.hp <= 0) {
          killEnemy(enemy);
        }

        break;
      }
    }

    if (removed) {
      continue;
    }

    if (
      projectile.life <= 0 ||
      projectile.x < 0 ||
      projectile.y < 0 ||
      projectile.x > WORLD.width ||
      projectile.y > WORLD.height
    ) {

      projectiles.splice(
        i,
        1
      );
    }
  }
}


/* =========================================================
   KILLS / XP
========================================================= */

function killEnemy(enemy) {

  const index =
    enemies.indexOf(enemy);

  if (index === -1) {
    return;
  }

  enemies.splice(index, 1);

  state.kills++;
  state.score +=
    enemy.score;

  xpOrbs.push({

    x: enemy.x,
    y: enemy.y,

    value:
      enemy.xp *
      player.xpMultiplier,

    radius:
      enemy.type === "boss"
        ? 10
        : 5
  });


  if (enemy === state.boss) {

    state.boss = null;

    bossHud.style.display =
      "none";

    if (!state.infinity) {

      state.running = false;
      state.victoryShown = true;

      showOverlay(
        victoryScreen
      );
    }
  }
}


function updateXp(dt) {

  for (
    let i =
      xpOrbs.length - 1;
    i >= 0;
    i--
  ) {

    const orb =
      xpOrbs[i];

    const dx =
      player.x - orb.x;

    const dy =
      player.y - orb.y;

    const distance =
      Math.hypot(dx, dy);

    if (
      distance <
      player.magnet
    ) {

      const speed =
        350 +
        (
          player.magnet -
          distance
        ) * 4;

      if (distance > 0) {

        orb.x +=
          dx / distance *
          speed *
          dt;

        orb.y +=
          dy / distance *
          speed *
          dt;
      }
    }


    if (
      distance <
      PLAYER_RADIUS + 12
    ) {

      state.xp +=
        orb.value;

      xpOrbs.splice(i, 1);

      checkLevelUp();
    }
  }
}


function checkLevelUp() {

  if (
    state.xp <
    state.xpNeeded
  ) {
    return;
  }

  state.xp -=
    state.xpNeeded;

  state.level++;

  state.xpNeeded =
    Math.ceil(
      8 +
      state.level * 4.4 +
      state.level *
      state.level *
      0.14
    );

  showLevelUp();
}


/* =========================================================
   UPGRADE SYSTEM
========================================================= */

function getSkillLevel(id) {

  const skill =
    selectedSkills.find(
      item => item.id === id
    );

  return skill
    ? skill.level
    : 0;
}


function getAvailableUpgrades() {

  const pool = [];

  const classSkills =
    CLASS_SKILLS[
      selectedCharacter
    ];


  for (
    const skill of classSkills
  ) {

    const level =
      getSkillLevel(skill.id);

    if (
      level === 0 &&
      selectedSkills.length <
      MAX_SKILLS
    ) {

      pool.push({
        type: "skill",
        mode: "new",
        ...skill,
        level: 1
      });

      continue;
    }

    if (
      level > 0 &&
      level < 5
    ) {

      pool.push({
        type: "skill",
        mode: "level",
        ...skill,
        level: level + 1
      });
    }
  }


  if (
    player.baseLevel < 5
  ) {

    pool.push({
      type: "base",
      icon:
        CHARACTERS[
          selectedCharacter
        ].portrait,

      name:
        CHARACTERS[
          selectedCharacter
        ].baseName,

      description:
        "Verbessert deine Basiswaffe.",

      level:
        player.baseLevel + 1
    });
  }


  for (
    const passive of PASSIVES
  ) {

    const level =
      passiveLevels[
        passive.id
      ] || 0;

    const owned =
      level > 0;

    const occupied =
      Object.keys(
        passiveLevels
      ).length;

    if (
      level >= 5
    ) {
      continue;
    }

    if (
      !owned &&
      occupied >= MAX_PASSIVES
    ) {
      continue;
    }

    pool.push({
      type: "passive",
      ...passive,
      level: level + 1
    });
  }

  return pool;
}


function randomChoices(
  array,
  amount
) {

  const copy = [...array];

  for (
    let i =
      copy.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    [
      copy[i],
      copy[j]
    ] = [
      copy[j],
      copy[i]
    ];
  }

  return copy.slice(
    0,
    amount
  );
}


function showLevelUp() {

  state.running = false;
  state.choosingUpgrade = true;

  upgradeChoices.innerHTML = "";

  const available =
    getAvailableUpgrades();

  const choices =
    randomChoices(
      available,
      3
    );


  if (
    choices.length === 0
  ) {

    state.choosingUpgrade = false;
    state.running = true;

    return;
  }


  for (
    const upgrade of choices
  ) {

    const card =
      document.createElement(
        "button"
      );

    card.className =
      "upgradeCard";

    let label = "";

    if (
      upgrade.mode === "new"
    ) {
      label = "NEUER SKILL";
    } else {
      label =
        `LV.${upgrade.level}`;
    }

    card.innerHTML = `
      <div class="upgradeIcon">
        ${upgrade.icon}
      </div>

      <div class="upgradeName">
        ${upgrade.name}
      </div>

      <div class="upgradeLevel">
        ${label}
      </div>

      <div class="upgradeDescription">
        ${upgrade.description}
      </div>
    `;

    card.addEventListener(
      "click",
      () => {

        applyUpgrade(
          upgrade
        );

        hideOverlay(
          levelUpScreen
        );

        state.choosingUpgrade =
          false;

        state.running = true;

        updateHud();
      }
    );

    upgradeChoices.appendChild(
      card
    );
  }

  showOverlay(
    levelUpScreen
  );
}


function applyUpgrade(upgrade) {

  if (
    upgrade.type === "base"
  ) {

    player.baseLevel++;

    upgradeBaseWeapon();

    skillSlots[0]
      .querySelector("small")
      .textContent =
      `LV.${player.baseLevel}`;

    return;
  }


  if (
    upgrade.type === "skill"
  ) {

    let skill =
      selectedSkills.find(
        item =>
          item.id ===
          upgrade.id
      );

    if (!skill) {

      skill = {
        id: upgrade.id,
        name: upgrade.name,
        icon: upgrade.icon,
        level: 1
      };

      selectedSkills.push(
        skill
      );

    } else {

      skill.level++;
    }

    updateSkillHud();

    return;
  }


  if (
    upgrade.type ===
    "passive"
  ) {

    const current =
      passiveLevels[
        upgrade.id
      ] || 0;

    passiveLevels[
      upgrade.id
    ] = current + 1;

    applyPassive(
      upgrade.id
    );
  }
}


/* =========================================================
   BASE WEAPON LEVELS
========================================================= */

function upgradeBaseWeapon() {

  const level =
    player.baseLevel;

  const base =
    CHARACTERS[
      selectedCharacter
    ].base;


  if (level === 2) {
    player.damageMultiplier *= 1.14;
  }

  if (level === 3) {
    player.cooldownMultiplier *= 0.88;
  }

  if (level === 4) {
    player.rangeMultiplier *= 1.15;
    player.projectileMultiplier *= 1.12;
  }

  if (level === 5) {
    player.damageMultiplier *= 1.22;
    player.cooldownMultiplier *= 0.88;
  }
}


/* =========================================================
   PASSIVE EFFECTS
========================================================= */

function applyPassive(id) {

  switch (id) {

    case "power":
      player.damageMultiplier *= 1.12;
      break;

    case "tempo":
      player.cooldownMultiplier *= 0.93;
      break;

    case "area":
      player.areaMultiplier *= 1.10;
      break;

    case "duration":
      player.durationMultiplier *= 1.10;
      break;

    case "range":
      player.rangeMultiplier *= 1.08;
      break;

    case "projectile":
      player.projectileMultiplier *= 1.08;
      break;

    case "vitality": {

      const oldMax =
        player.maxHp;

      player.maxHp *= 1.10;

      player.hp +=
        player.maxHp -
        oldMax;

      break;
    }

    case "armor":
      player.armor =
        Math.min(
          0.60,
          player.armor + 0.06
        );
      break;

    case "movement":
      player.speed *= 1.07;
      break;

    case "critical":
      player.critChance =
        Math.min(
          0.60,
          player.critChance + 0.05
        );
      break;

    case "magnet":
      player.magnet *= 1.20;
      break;

    case "experience":
      player.xpMultiplier *= 1.08;
      break;
  }
}


/* =========================================================
   SKILL HUD
========================================================= */

function updateSkillHud() {

  for (
    let i = 1;
    i <= 3;
    i++
  ) {

    const slot =
      skillSlots[i];

    const skill =
      selectedSkills[i - 1];

    if (!skill) {

      slot.innerHTML =
        "<span>+</span>";

      slot.classList.remove(
        "activeSkill"
      );

      continue;
    }

    slot.innerHTML = `
      <span class="skillIcon">
        ${skill.icon}
      </span>

      <small>
        LV.${skill.level}
      </small>
    `;

    slot.classList.add(
      "activeSkill"
    );
  }
}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(amount) {

  const damage =
    amount *
    (1 - player.armor);

  player.hp -= damage;

  if (player.hp <= 0) {

    player.hp = 0;

    endRun();
  }
}


/* =========================================================
   BOSS / RUN END
========================================================= */

function spawnFinalBoss() {

  if (state.boss) {
    return;
  }

  const stats =
    enemyStats("boss");

  const boss = {

    type: "boss",

    x:
      Math.min(
        WORLD.width - 100,
        player.x + 700
      ),

    y: player.y,

    hp: stats.hp,
    maxHp: stats.hp,

    speed: stats.speed,
    radius: stats.radius,

    damage: stats.damage,

    xp: stats.xp,
    score: stats.score,

    color: stats.color,

    attackClock: 0,

    isBoss: true
  };

  enemies.push(boss);

  state.boss = boss;

  bossName.textContent =
    state.infinity
      ? "INFINITY DÄMON"
      : "DÄMONENFÜRST";

  bossHud.style.display =
    "block";
}


function updateBoss(
  boss,
  dt
) {

  const dx =
    player.x - boss.x;

  const dy =
    player.y - boss.y;

  const distance =
    Math.hypot(dx, dy);

  if (
    distance >
    boss.radius +
    PLAYER_RADIUS +
    12
  ) {

    boss.x +=
      dx / distance *
      boss.speed *
      dt;

    boss.y +=
      dy / distance *
      boss.speed *
      dt;
  }


  boss.attackClock -= dt;

  if (
    distance <
    boss.radius +
    PLAYER_RADIUS +
    15 &&
    boss.attackClock <= 0
  ) {

    damagePlayer(
      boss.damage
    );

    boss.attackClock =
      0.85;
  }


  bossHpFill.style.width =
    Math.max(
      0,
      boss.hp /
      boss.maxHp *
      100
    ) + "%";
}


function checkRunProgress() {

  if (
    !state.infinity &&
    state.elapsed >=
    RUN_DURATION &&
    !state.boss &&
    !state.victoryShown
  ) {

    spawnFinalBoss();
  }


  if (state.infinity) {

    const infinityTime =
      state.elapsed -
      RUN_DURATION;

    if (
      infinityTime > 0 &&
      Math.floor(infinityTime) %
      120 === 0 &&
      !state.boss
    ) {

      spawnFinalBoss();
    }
  }
}


/* =========================================================
   INFINITY
========================================================= */

infinityButton.addEventListener(
  "click",
  () => {

    hideOverlay(
      victoryScreen
    );

    state.infinity = true;
    state.victoryShown = false;
    state.running = true;

    state.score += 10000;

    enemies = enemies.filter(
      enemy =>
        enemy !== state.boss
    );

    state.boss = null;

    bossHud.style.display =
      "none";
  }
);


finishRunButton.addEventListener(
  "click",
  endRun
);


/* =========================================================
   PAUSE
========================================================= */

pauseButton.addEventListener(
  "click",
  () => {

    if (
      !state.running ||
      state.choosingUpgrade
    ) {
      return;
    }

    state.running = false;
    state.paused = true;

    renderPauseBuild();

    showOverlay(
      pauseScreen
    );
  }
);


resumeButton.addEventListener(
  "click",
  () => {

    hideOverlay(
      pauseScreen
    );

    state.paused = false;
    state.running = true;

    lastFrame =
      performance.now();
  }
);


quitButton.addEventListener(
  "click",
  () => {

    hideOverlay(
      pauseScreen
    );

    endRun();
  }
);


function renderPauseBuild() {

  const char =
    CHARACTERS[
      selectedCharacter
    ];

  const skillText =
    selectedSkills.length
      ? selectedSkills
        .map(
          skill =>
            `${skill.icon} ${skill.name} Lv.${skill.level}`
        )
        .join("<br>")
      : "Noch keine zusätzlichen Skills";

  const passiveText =
    Object.entries(
      passiveLevels
    )
    .map(([id, level]) => {

      const passive =
        PASSIVES.find(
          p => p.id === id
        );

      return `${passive.icon} ${passive.name} Lv.${level}`;
    })
    .join("<br>");

  pauseBuild.innerHTML = `
    <strong>
      ${char.name}
    </strong>

    <br><br>

    ${char.portrait}
    ${char.baseName}
    Lv.${player.baseLevel}

    <br><br>

    ${skillText}

    <br><br>

    ${passiveText || "Noch keine Passives"}
  `;
}


/* =========================================================
   END RUN
========================================================= */

function endRun() {

  state.running = false;
  state.paused = false;

  hideOverlay(
    victoryScreen
  );

  const best =
    Number(
      localStorage.getItem(
        "shadowHuntersBest"
      )
    ) || 0;

  const newBest =
    Math.max(
      best,
      Math.floor(state.score)
    );

  localStorage.setItem(
    "shadowHuntersBest",
    newBest
  );

  finalTime.textContent =
    formatTime(state.elapsed);

  finalKills.textContent =
    state.kills;

  finalScore.textContent =
    Math.floor(state.score);

  finalBest.textContent =
    newBest;

  showOverlay(
    gameOverScreen
  );
}


restartButton.addEventListener(
  "click",
  () => {

    hideOverlay(
      gameOverScreen
    );

    showScreen(
      characterScreen
    );
  }
);


/* =========================================================
   EFFECTS
========================================================= */

function updateEffects(dt) {

  for (
    let i =
      effects.length - 1;
    i >= 0;
    i--
  ) {

    effects[i].life -= dt;

    if (
      effects[i].life <= 0
    ) {

      effects.splice(
        i,
        1
      );
    }
  }
}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera() {

  const viewWidth =
    window.innerWidth /
    CAMERA_ZOOM;

  const viewHeight =
    window.innerHeight /
    CAMERA_ZOOM;

  state.cameraX =
    Math.max(
      0,
      Math.min(
        WORLD.width -
        viewWidth,
        player.x -
        viewWidth / 2
      )
    );

  state.cameraY =
    Math.max(
      0,
      Math.min(
        WORLD.height -
        viewHeight,
        player.y -
        viewHeight / 2
      )
    );
}


/* =========================================================
   DRAW WORLD
========================================================= */

function worldToScreen(
  x,
  y
) {

  return {
    x:
      (
        x -
        state.cameraX
      ) *
      CAMERA_ZOOM,

    y:
      (
        y -
        state.cameraY
      ) *
      CAMERA_ZOOM
  };
}


function drawWorld() {

  ctx.fillStyle = "#697461";

  ctx.fillRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  const grid = 150;

  const startX =
    Math.floor(
      state.cameraX / grid
    ) * grid;

  const startY =
    Math.floor(
      state.cameraY / grid
    ) * grid;

  const endX =
    state.cameraX +
    window.innerWidth /
    CAMERA_ZOOM;

  const endY =
    state.cameraY +
    window.innerHeight /
    CAMERA_ZOOM;


  ctx.strokeStyle =
    "rgba(40,50,38,.12)";

  ctx.lineWidth = 1;


  for (
    let x = startX;
    x <= endX;
    x += grid
  ) {

    const screen =
      worldToScreen(x, 0);

    ctx.beginPath();

    ctx.moveTo(
      screen.x,
      0
    );

    ctx.lineTo(
      screen.x,
      window.innerHeight
    );

    ctx.stroke();
  }


  for (
    let y = startY;
    y <= endY;
    y += grid
  ) {

    const screen =
      worldToScreen(0, y);

    ctx.beginPath();

    ctx.moveTo(
      0,
      screen.y
    );

    ctx.lineTo(
      window.innerWidth,
      screen.y
    );

    ctx.stroke();
  }


  drawObstacles();
}


/* =========================================================
   DRAW OBSTACLES
========================================================= */

function drawObstacles() {

  for (
    const obstacle of obstacles
  ) {

    const screen =
      worldToScreen(
        obstacle.x,
        obstacle.y
      );

    const width =
      obstacle.w *
      CAMERA_ZOOM;

    const height =
      obstacle.h *
      CAMERA_ZOOM;

    ctx.fillStyle =
      "#454b43";

    ctx.fillRect(
      screen.x,
      screen.y,
      width,
      height
    );

    ctx.strokeStyle =
      "#2e342d";

    ctx.lineWidth = 4;

    ctx.strokeRect(
      screen.x,
      screen.y,
      width,
      height
    );


    ctx.fillStyle =
      "rgba(125,139,112,.35)";

    ctx.fillRect(
      screen.x + 5,
      screen.y + 5,
      width - 10,
      8
    );
  }
}


/* =========================================================
   DRAW XP
========================================================= */

function drawXp() {

  for (
    const orb of xpOrbs
  ) {

    const p =
      worldToScreen(
        orb.x,
        orb.y
      );

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      orb.radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      orb.value >= 10
        ? "#ffd85e"
        : orb.value >= 5
          ? "#ff8057"
          : orb.value >= 2
            ? "#54b6ff"
            : "#a66cff";

    ctx.fill();
  }
}


/* =========================================================
   DRAW PROJECTILES
========================================================= */

function drawProjectiles() {

  for (
    const projectile of projectiles
  ) {

    const p =
      worldToScreen(
        projectile.x,
        projectile.y
      );

    if (
      projectile.type ===
      "kunai"
    ) {

      const angle =
        Math.atan2(
          projectile.vy,
          projectile.vx
        );

      ctx.save();

      ctx.translate(
        p.x,
        p.y
      );

      ctx.rotate(angle);

      ctx.fillStyle =
        "#d8d6e8";

      ctx.fillRect(
        -9,
        -2,
        18,
        4
      );

      ctx.restore();

      continue;
    }


    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      projectile.radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#b67cff";

    ctx.shadowBlur = 15;
    ctx.shadowColor =
      "#8b55ff";

    ctx.fill();

    ctx.shadowBlur = 0;
  }
}


/* =========================================================
   DRAW ENEMIES
========================================================= */

function drawEnemies() {

  for (
    const enemy of enemies
  ) {

    const p =
      worldToScreen(
        enemy.x,
        enemy.y
      );

    const radius =
      enemy.radius *
      CAMERA_ZOOM;


    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      enemy.color;

    ctx.fill();


    ctx.lineWidth =
      enemy.type === "elite" ||
      enemy.type === "boss"
        ? 3
        : 1.5;

    ctx.strokeStyle =
      enemy.type === "boss"
        ? "#ff5470"
        : enemy.type === "elite"
          ? "#ff8ca0"
          : "rgba(255,255,255,.18)";

    ctx.stroke();


    if (
      enemy.type === "elite" ||
      enemy.type === "boss"
    ) {

      const hpPercent =
        Math.max(
          0,
          enemy.hp /
          enemy.maxHp
        );

      const width =
        radius * 2;

      ctx.fillStyle =
        "rgba(0,0,0,.55)";

      ctx.fillRect(
        p.x - radius,
        p.y - radius - 9,
        width,
        4
      );

      ctx.fillStyle =
        "#e8455c";

      ctx.fillRect(
        p.x - radius,
        p.y - radius - 9,
        width * hpPercent,
        4
      );
    }
  }
}


/* =========================================================
   DRAW PLAYER
========================================================= */

function drawPlayer() {

  const p =
    worldToScreen(
      player.x,
      player.y
    );

  const char =
    CHARACTERS[
      selectedCharacter
    ];


  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y,
    20,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(20,20,25,.9)";

  ctx.fill();

  ctx.lineWidth = 3;

  ctx.strokeStyle =
    char.color;

  ctx.shadowBlur = 18;
  ctx.shadowColor =
    char.color;

  ctx.stroke();

  ctx.shadowBlur = 0;


  ctx.fillStyle =
    char.color;

  ctx.font =
    "bold 18px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillText(
    char.portrait,
    p.x,
    p.y
  );


  const aim =
    getAimDirection();

  ctx.beginPath();

  ctx.moveTo(
    p.x +
    aim.x * 22,
    p.y +
    aim.y * 22
  );

  ctx.lineTo(
    p.x +
    aim.x * 35,
    p.y +
    aim.y * 35
  );

  ctx.strokeStyle =
    char.secondary;

  ctx.lineWidth = 3;

  ctx.stroke();
}


/* =========================================================
   DRAW EFFECTS
========================================================= */

function drawEffects() {

  for (
    const effect of effects
  ) {

    const alpha =
      effect.life /
      effect.maxLife;


    if (
      effect.type ===
      "soulBeam"
    ) {

      const start =
        worldToScreen(
          effect.x1,
          effect.y1
        );

      const end =
        worldToScreen(
          effect.x2,
          effect.y2
        );

      ctx.beginPath();

      ctx.moveTo(
        start.x,
        start.y
      );

      ctx.lineTo(
        end.x,
        end.y
      );

      ctx.strokeStyle =
        `rgba(220,55,85,${alpha})`;

      ctx.lineWidth = 5;

      ctx.shadowBlur = 14;
      ctx.shadowColor =
        "#d92e52";

      ctx.stroke();

      ctx.shadowBlur = 0;
    }


    if (
      effect.type ===
      "slash"
    ) {

      const p =
        worldToScreen(
          effect.x,
          effect.y
        );

      ctx.save();

      ctx.translate(
        p.x,
        p.y
      );

      ctx.rotate(
        effect.angle
      );

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        65,
        -0.65,
        0.65
      );

      ctx.strokeStyle =
        `rgba(255,211,132,${alpha})`;

      ctx.lineWidth = 8;

      ctx.stroke();

      ctx.restore();
    }
  }
}


/* =========================================================
   DRAW
========================================================= */

function draw() {

  drawWorld();
  drawXp();
  drawEnemies();
  drawProjectiles();
  drawEffects();
  drawPlayer();
}


/* =========================================================
   HUD
========================================================= */

function updateHud() {

  if (!player) return;

  hpNumber.textContent =
    `${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`;

  hpFill.style.width =
    Math.max(
      0,
      player.hp /
      player.maxHp *
      100
    ) + "%";


  xpFill.style.width =
    Math.min(
      100,
      state.xp /
      state.xpNeeded *
      100
    ) + "%";

  levelText.textContent =
    `LV. ${state.level}`;


  if (state.infinity) {

    const infinityTime =
      Math.max(
        0,
        state.elapsed -
        RUN_DURATION
      );

    runTimer.textContent =
      `∞ ${formatTime(infinityTime)}`;

  } else {

    runTimer.textContent =
      formatTime(state.elapsed);
  }
}


/* =========================================================
   UTILS
========================================================= */

function normalizeAngle(angle) {

  while (
    angle > Math.PI
  ) {
    angle -=
      Math.PI * 2;
  }

  while (
    angle < -Math.PI
  ) {
    angle +=
      Math.PI * 2;
  }

  return angle;
}


function formatTime(seconds) {

  seconds =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const minutes =
    Math.floor(
      seconds / 60
    );

  const secs =
    seconds % 60;

  return (
    String(minutes)
      .padStart(2, "0") +
    ":" +
    String(secs)
      .padStart(2, "0")
  );
}


/* =========================================================
   MAIN LOOP
========================================================= */

function gameLoop(now) {

  const rawDt =
    (now - lastFrame) /
    1000;

  lastFrame = now;

  const dt =
    Math.min(
      rawDt,
      0.05
    );


  if (
    gameScreen.classList
      .contains("active") &&
    player
  ) {

    if (state.running) {

      state.elapsed += dt;

      updatePlayer(dt);
      updateBaseAttack(dt);

      updateSpawning(dt);
      updateEnemies(dt);

      updateProjectiles(dt);
      updateXp(dt);
      updateEffects(dt);

      updateCamera();

      checkRunProgress();

      updateHud();
    }

    draw();
  }

  requestAnimationFrame(
    gameLoop
  );
}


/* =========================================================
   INITIAL SCREEN
========================================================= */

showScreen(startScreen);

requestAnimationFrame(
  gameLoop
);