import "./style.css";
import { Game } from "./gamelogic";

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
  game.start();
});
