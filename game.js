const player = document.getElementById("player");

let x = window.innerWidth / 2;
let y = window.innerHeight / 2;

function movePlayer(event) {
  const touch = event.touches[0];

  x = touch.clientX;
  y = touch.clientY;

  player.style.left = x + "px";
  player.style.top = y + "px";
}

document.addEventListener("touchmove", movePlayer);
document.addEventListener("touchstart", movePlayer);