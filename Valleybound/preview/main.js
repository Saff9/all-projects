const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const seasonLabel = document.getElementById("seasonLabel");
const taskLabel = document.getElementById("taskLabel");
const stick = document.getElementById("stick");
const stickKnob = document.getElementById("stickKnob");
const actionButton = document.getElementById("actionButton");

const seasons = [
  {
    name: "Spring",
    grass: "#6f9f55",
    meadow: "#8fbd66",
    trees: "#6ea34f",
    chinar: "#88a85b",
    mountain: "#a6b5aa",
    sky: "#b8d4df",
    river: "#54a5bd",
    snow: "#edf2ef"
  },
  {
    name: "Summer",
    grass: "#4f8b45",
    meadow: "#77a94c",
    trees: "#325f38",
    chinar: "#477a3d",
    mountain: "#879283",
    sky: "#95c5d7",
    river: "#3c91b2",
    snow: "#e8ece8"
  },
  {
    name: "Autumn",
    grass: "#746f3f",
    meadow: "#9a8444",
    trees: "#314d35",
    chinar: "#b4572b",
    mountain: "#8d8679",
    sky: "#c9b98d",
    river: "#477f96",
    snow: "#ece8df"
  },
  {
    name: "Winter",
    grass: "#d9dfd8",
    meadow: "#eef1ed",
    trees: "#263d34",
    chinar: "#6d513e",
    mountain: "#dfe7e7",
    sky: "#b8c6cf",
    river: "#6aa8bc",
    snow: "#ffffff"
  }
];

let seasonIndex = 2;
let taskStep = 0;
let message = "Storm debris blocks the crossing. Walk over and inspect it.";
let messageTimer = 4;
const keys = new Set();
const touchMove = { x: 0, y: 0, active: false };

const player = {
  x: 260,
  y: 400,
  vx: 0,
  vy: 0,
  radius: 13,
  speed: 210,
  hasWood: false
};

const regions = [
  { name: "Srinagar Lake District", x: 210, y: 455, w: 250, h: 155, color: "#4a6f73" },
  { name: "Budgam Orchard Plain", x: 430, y: 420, w: 205, h: 135, color: "#68793f" },
  { name: "Pahalgam Shepherd River", x: 690, y: 360, w: 230, h: 150, color: "#526d45" },
  { name: "Gulmarg Flower Meadow", x: 405, y: 155, w: 260, h: 170, color: "#607c54" },
  { name: "Baramulla Trade Road", x: 755, y: 175, w: 210, h: 115, color: "#6b654a" },
  { name: "Jammu Warm Foothills", x: 865, y: 520, w: 230, h: 120, color: "#8c7043" }
];

const interactables = [
  { id: "crossing", label: "Broken crossing", x: 565, y: 385, done: false },
  { id: "wood", label: "Wood pile", x: 455, y: 485, done: false },
  { id: "house", label: "Family house", x: 330, y: 342, done: false },
  { id: "sheep", label: "Stray sheep", x: 795, y: 410, done: false }
];

const houses = [
  { x: 175, y: 500, old: true },
  { x: 235, y: 520, old: false },
  { x: 318, y: 350, old: true },
  { x: 492, y: 470, old: true },
  { x: 548, y: 505, old: false },
  { x: 850, y: 220, old: false },
  { x: 920, y: 560, old: false }
];

const animals = [
  { kind: "sheep", x: 760, y: 420, phase: 0 },
  { kind: "sheep", x: 805, y: 438, phase: 1.7 },
  { kind: "sheep", x: 825, y: 395, phase: 2.6 },
  { kind: "cow", x: 515, y: 520, phase: 0.8 },
  { kind: "cow", x: 555, y: 492, phase: 1.9 }
];

const debris = [
  { x: 548, y: 385, vx: 0, vy: 0, r: 15, mass: 1.3, kind: "branch" },
  { x: 583, y: 398, vx: 0, vy: 0, r: 18, mass: 1.7, kind: "log" },
  { x: 573, y: 365, vx: 0, vy: 0, r: 13, mass: 2.2, kind: "stone" }
];

const repairedBridge = { active: false };

function setSeason(index) {
  seasonIndex = Math.max(0, Math.min(seasons.length - 1, index));
  seasonLabel.textContent = seasons[seasonIndex].name;
  showMessage(seasons[seasonIndex].name + " changes movement, color, and the valley mood.");
}

function updateTask() {
  const text = [
    "Task: reach the broken crossing",
    "Task: collect wood from Budgam Orchard Plain",
    "Task: repair the broken crossing",
    "Task: check the family house",
    "Task: find Rafiq's stray sheep",
    "Prototype complete: valley route opened"
  ];
  taskLabel.textContent = text[taskStep];
}

function showMessage(text) {
  message = text;
  messageTimer = 4.5;
}

function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function nearestInteractable() {
  let best = null;
  for (const item of interactables) {
    const d = dist(player, item);
    if (d < 52 && (!best || d < best.d)) {
      best = { item, d };
    }
  }
  return best && best.item;
}

function crossingCleared() {
  return debris.every((body) => Math.hypot(body.x - 565, body.y - 385) > 58);
}

function interact() {
  const item = nearestInteractable();
  if (!item) return;

  if (taskStep === 0 && item.id === "crossing") {
    taskStep = 1;
    showMessage("Clear the branches and stones by walking into them, then collect wood.");
  }
  else if (taskStep === 1 && item.id === "wood") {
    player.hasWood = true;
    taskStep = 2;
    showMessage("Wood collected. Return to the crossing once the debris is pushed aside.");
  }
  else if (taskStep === 2 && item.id === "crossing") {
    if (!crossingCleared()) {
      showMessage("The crossing is still blocked. Push debris away from the yellow marker.");
      updateTask();
      return;
    }
    item.done = true;
    repairedBridge.active = true;
    taskStep = 3;
    showMessage("Bridge patched. The route to the family house is open.");
  } else if (taskStep === 3 && item.id === "house") taskStep = 4;
  else if (taskStep === 4 && item.id === "sheep") {
    item.done = true;
    taskStep = 5;
    showMessage("Rafiq's sheep is safe. The prototype route is complete.");
  }

  updateTask();
}

function drawRegion(region, season) {
  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = region.color;
  roundRect(region.x, region.y, region.w, region.h, 28);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f4f0df";
  ctx.font = "16px Segoe UI";
  ctx.fillText(region.name, region.x + 18, region.y + 28);
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawMountains(season) {
  ctx.fillStyle = season.mountain;
  for (let i = 0; i < 7; i++) {
    const x = 50 + i * 170;
    ctx.beginPath();
    ctx.moveTo(x, 160);
    ctx.lineTo(x + 90, 40 + (i % 2) * 20);
    ctx.lineTo(x + 190, 165);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = season.snow;
    ctx.beginPath();
    ctx.moveTo(x + 68, 76 + (i % 2) * 20);
    ctx.lineTo(x + 90, 40 + (i % 2) * 20);
    ctx.lineTo(x + 116, 78 + (i % 2) * 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = season.mountain;
  }
}

function drawRiver(season) {
  ctx.strokeStyle = season.river;
  ctx.lineWidth = 30;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(40, 575);
  ctx.bezierCurveTo(255, 500, 420, 430, 575, 385);
  ctx.bezierCurveTo(730, 340, 850, 410, 1160, 315);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.38)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 11; i++) {
    const x = 90 + i * 95;
    ctx.beginPath();
    ctx.moveTo(x, 550 - i * 16);
    ctx.lineTo(x + 40, 538 - i * 10);
    ctx.stroke();
  }
}

function drawBridge() {
  ctx.save();
  ctx.translate(565, 385);
  ctx.rotate(-0.26);
  ctx.fillStyle = repairedBridge.active ? "#8a6844" : "#4f3d2e";
  ctx.fillRect(-42, -9, 84, 18);
  ctx.strokeStyle = repairedBridge.active ? "#d0ad76" : "#7b5740";
  ctx.lineWidth = 3;
  for (let x = -34; x <= 34; x += 17) {
    ctx.beginPath();
    ctx.moveTo(x, -10);
    ctx.lineTo(x, 10);
    ctx.stroke();
  }
  if (!repairedBridge.active) {
    ctx.strokeStyle = "#2b211b";
    ctx.beginPath();
    ctx.moveTo(-18, -11);
    ctx.lineTo(12, 10);
    ctx.moveTo(8, -10);
    ctx.lineTo(27, 9);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTree(x, y, type, season) {
  ctx.fillStyle = "#4b3527";
  ctx.fillRect(x - 4, y + 12, 8, 24);
  ctx.fillStyle = type === "chinar" ? season.chinar : season.trees;
  ctx.beginPath();
  ctx.arc(x, y, type === "chinar" ? 21 : 16, 0, Math.PI * 2);
  ctx.fill();
  if (type === "pine") {
    ctx.beginPath();
    ctx.moveTo(x, y - 26);
    ctx.lineTo(x - 20, y + 18);
    ctx.lineTo(x + 20, y + 18);
    ctx.closePath();
    ctx.fill();
  }
}

function drawHouse(house) {
  ctx.fillStyle = house.old ? "#8b6243" : "#b8b4a7";
  ctx.fillRect(house.x - 22, house.y - 15, 44, 32);

  ctx.fillStyle = house.old ? "#5a3227" : "#6e726d";
  ctx.beginPath();
  ctx.moveTo(house.x - 28, house.y - 15);
  ctx.lineTo(house.x, house.y - 40);
  ctx.lineTo(house.x + 28, house.y - 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = house.old ? "#d2b48c" : "#4e6f8a";
  ctx.fillRect(house.x - 8, house.y - 2, 16, 19);

  if (house.old) {
    ctx.strokeStyle = "#3a241b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(house.x - 20, house.y - 12);
    ctx.lineTo(house.x + 20, house.y + 14);
    ctx.moveTo(house.x + 20, house.y - 12);
    ctx.lineTo(house.x - 20, house.y + 14);
    ctx.stroke();
  }
}

function drawAnimal(animal, time) {
  const bob = Math.sin(time * 0.002 + animal.phase) * 2;
  ctx.fillStyle = animal.kind === "sheep" ? "#eee7d9" : "#8a6a4a";
  ctx.beginPath();
  ctx.ellipse(animal.x, animal.y + bob, animal.kind === "sheep" ? 15 : 20, animal.kind === "sheep" ? 10 : 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = animal.kind === "sheep" ? "#d8cdbb" : "#5b3f2f";
  ctx.beginPath();
  ctx.arc(animal.x + 14, animal.y - 2 + bob, animal.kind === "sheep" ? 7 : 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawDebris() {
  for (const body of debris) {
    if (body.kind === "stone") {
      ctx.fillStyle = "#68675f";
      ctx.beginPath();
      ctx.arc(body.x, body.y, body.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.beginPath();
      ctx.arc(body.x - 4, body.y - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.save();
      ctx.translate(body.x, body.y);
      ctx.rotate(body.kind === "log" ? 0.35 : -0.55);
      ctx.fillStyle = body.kind === "log" ? "#6d4328" : "#82512f";
      roundRect(-body.r - 12, -6, body.r * 2 + 24, 12, 5);
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawInteractables() {
  const near = nearestInteractable();
  for (const item of interactables) {
    ctx.fillStyle = item.done ? "#6ea66f" : "#e8c35a";
    ctx.beginPath();
    ctx.arc(item.x, item.y, near === item ? 13 : 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff7d6";
    ctx.font = "14px Segoe UI";
    ctx.fillText(item.label, item.x + 14, item.y - 12);
  }
}

function drawPlayer() {
  ctx.fillStyle = "#222725";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius + 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#285d72";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f3d3ae";
  ctx.beginPath();
  ctx.arc(player.x, player.y - 15, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawMessage() {
  if (messageTimer <= 0) return;
  ctx.save();
  ctx.fillStyle = "rgba(17, 20, 18, 0.84)";
  roundRect(26, 24, 620, 42, 8);
  ctx.fill();
  ctx.fillStyle = "#f8efd3";
  ctx.font = "16px Segoe UI";
  ctx.fillText(message, 44, 51);
  ctx.restore();
}

function draw(time) {
  const season = seasons[seasonIndex];
  ctx.fillStyle = season.sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMountains(season);

  ctx.fillStyle = season.grass;
  ctx.fillRect(0, 155, canvas.width, canvas.height - 155);

  for (const region of regions) drawRegion(region, season);
  drawRiver(season);
  drawBridge();

  for (let i = 0; i < 36; i++) {
    const x = 80 + ((i * 89) % 1030);
    const y = 210 + ((i * 53) % 390);
    drawTree(x, y, i % 3 === 0 ? "chinar" : "pine", season);
  }

  for (const house of houses) drawHouse(house);
  for (const animal of animals) drawAnimal(animal, time);
  drawDebris();
  drawInteractables();
  drawPlayer();
  drawMessage();

  const near = nearestInteractable();
  if (near) {
    ctx.fillStyle = "rgba(20, 24, 22, 0.82)";
    roundRect(player.x - 75, player.y - 62, 150, 30, 6);
    ctx.fill();
    ctx.fillStyle = "#fff8db";
    ctx.font = "14px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("Press F: " + near.label, player.x, player.y - 42);
    ctx.textAlign = "left";
  }
}

let lastTime = performance.now();

function update(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000);
  lastTime = time;

  let ax = 0;
  let ay = 0;
  if (keys.has("w") || keys.has("arrowup")) ay -= 1;
  if (keys.has("s") || keys.has("arrowdown")) ay += 1;
  if (keys.has("a") || keys.has("arrowleft")) ax -= 1;
  if (keys.has("d") || keys.has("arrowright")) ax += 1;
  ax += touchMove.x;
  ay += touchMove.y;

  const len = Math.hypot(ax, ay) || 1;
  const winterSlow = seasonIndex === 3 ? 0.72 : 1;
  player.vx = (ax / len) * player.speed * winterSlow;
  player.vy = (ay / len) * player.speed * winterSlow;

  player.x = Math.max(25, Math.min(canvas.width - 25, player.x + player.vx * dt));
  player.y = Math.max(180, Math.min(canvas.height - 25, player.y + player.vy * dt));

  updateDebris(dt);
  messageTimer = Math.max(0, messageTimer - dt);

  draw(time);
  requestAnimationFrame(update);
}

function updateDebris(dt) {
  for (const body of debris) {
    const dx = body.x - player.x;
    const dy = body.y - player.y;
    const overlap = player.radius + body.r - Math.hypot(dx, dy);
    if (overlap > 0) {
      const angle = Math.atan2(dy, dx);
      const push = 160 / body.mass;
      body.vx += Math.cos(angle) * push * dt * 8;
      body.vy += Math.sin(angle) * push * dt * 8;
      player.x -= Math.cos(angle) * overlap * 0.22;
      player.y -= Math.sin(angle) * overlap * 0.22;
    }

    body.x += body.vx * dt;
    body.y += body.vy * dt;
    body.vx *= Math.pow(0.18, dt);
    body.vy *= Math.pow(0.18, dt);
    body.x = Math.max(30, Math.min(canvas.width - 30, body.x));
    body.y = Math.max(185, Math.min(canvas.height - 30, body.y));
  }
}

function setStick(clientX, clientY) {
  const rect = stick.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const max = rect.width * 0.32;
  const len = Math.hypot(dx, dy);
  const scale = len > max ? max / len : 1;
  const px = dx * scale;
  const py = dy * scale;
  stickKnob.style.transform = `translate(${px}px, ${py}px)`;
  touchMove.x = px / max;
  touchMove.y = py / max;
}

function resetStick() {
  stickKnob.style.transform = "translate(0, 0)";
  touchMove.x = 0;
  touchMove.y = 0;
  touchMove.active = false;
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (key === "1") setSeason(0);
  if (key === "2") setSeason(1);
  if (key === "3") setSeason(2);
  if (key === "4") setSeason(3);
  if (key === "f") interact();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

document.querySelectorAll("[data-season]").forEach((button) => {
  button.addEventListener("click", () => setSeason(Number(button.dataset.season)));
});

stick.addEventListener("pointerdown", (event) => {
  touchMove.active = true;
  stick.setPointerCapture(event.pointerId);
  setStick(event.clientX, event.clientY);
});

stick.addEventListener("pointermove", (event) => {
  if (touchMove.active) setStick(event.clientX, event.clientY);
});

stick.addEventListener("pointerup", resetStick);
stick.addEventListener("pointercancel", resetStick);
actionButton.addEventListener("click", interact);

setSeason(seasonIndex);
updateTask();
requestAnimationFrame(update);
