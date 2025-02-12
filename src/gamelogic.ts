import ScoreDisplay from "./scoredisplay.js";
import GridPainter from "./gridpainter.js";
import Input from "./input.js";
import { rgb, hsl } from "./colors.js";

/* Don't change these */
const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const PLAYFIELD_ID = "playfield";
const NEXT_COLUMNS = 4;
const NEXT_ROWS = 4;
const NEXT_ID = "next";

const PLAYFIELD_BACKGROUND = rgb(50, 75, 100); // Change this one if you want to
const NEXT_BACKGROUND = hsl(90, 0.3, 0.2); // Change this one if you want to

/** Class representing Tetris game logic */
export class GameLogic {
  playfield: GridPainter;
  next: GridPainter;
  scoreDisplay: ScoreDisplay;
  input: Input;

  constructor(
    playfield: GridPainter,
    next: GridPainter,
    scoreDisplay: ScoreDisplay,
    input: Input
  ) {
    this.playfield = playfield;
    this.next = next;
    this.scoreDisplay = scoreDisplay;
    this.input = input;
    input.onkeydown = this.onkeydown.bind(this);
    input.onkeyup = this.onkeyup.bind(this);
  }

  /**
   * Start a new game
   */
  start() {
    // Start putting some code here and add methods as you see fit
    console.log("Game started...");

    // --------------- Examples ✂ cut here --------------
    // Some example code:

    // Call GridPainter#paintCell(column, row, csscolor) to fill a cell with a color
    this.playfield.paintCell(2, 2, "#ace");
    this.playfield.paintCell(2, 4, "#f2a7b9");
    this.playfield.paintCell(2, 6, "red");
    this.playfield.paintCell(2, 8, "rgb(217,92,91)");
    this.playfield.paintCell(2, 10, "hsl(97,70%,37%)");

    // You can also use the helper functions rgb(red, green, blue) and hsl(hue, saturation, luminance)
    this.playfield.paintCell(2, 12, rgb(152, 182, 239));
    this.playfield.paintCell(2, 14, hsl(240, 1.0, 0.75));

    // The GridPainter called next is supposed to display the next piece to drop
    this.next.paintCell(3, 1, rgb(255, 255, 255));
    this.next.paintCell(2, 1, rgb(255, 255, 255));
    this.next.paintCell(2, 2, rgb(255, 255, 255));
    this.next.paintCell(1, 2, rgb(255, 255, 255));

    // Update the score by setting the scoreDisplay.value property
    this.scoreDisplay.value = 123;

    // Update the score format by setting the scoreDisplay.format property
    this.scoreDisplay.format = "Points: {value}";

    // Query the playfield for information:
    console.log(
      `The playfield is ${this.playfield.cols} cells wide and ${this.playfield.rows} cells high`
    );
    // --------------- Examples ✂ cut here --------------
  }

  onkeydown(keyCode: string) {
    console.log(`down: ${keyCode}`);
  }

  onkeyup(keyCode: string) {
    console.log(`up: ${keyCode}`);
  }
}

/** Class representing an instance of a Tetris game */
export class Game {
  constructor() {}

  /**
   * Creates all components needed for a game of Tetris, and calls the start method of a GameLogic object
   */
  start() {
    // Find the containers
    const playfieldContainer = document.getElementById(
      `${PLAYFIELD_ID}-container`
    );
    const nextContainer = document.getElementById(`${NEXT_ID}-container`);

    if (playfieldContainer === null || nextContainer === null)
      throw new Error("Playfield or next container not found");

    // Create a score display
    const scoreDisplay = new ScoreDisplay(playfieldContainer, {
      value: 0,
      format: "Score: {value}",
    });

    // Create a playfield
    const playfield = new GridPainter(playfieldContainer, {
      cols: PLAYFIELD_COLUMNS,
      rows: PLAYFIELD_ROWS,
      id: PLAYFIELD_ID,
      initialColor: PLAYFIELD_BACKGROUND,
    });

    // Create a display area for the next tile
    const next = new GridPainter(nextContainer, {
      cols: NEXT_COLUMNS,
      rows: NEXT_ROWS,
      id: NEXT_ID,
      initialColor: NEXT_BACKGROUND,
    });

    // Create a way to read keyboard input
    const input = new Input();

    // Create the game logic
    const gameLogic = new GameLogic(playfield, next, scoreDisplay, input);

    // Start the game
    gameLogic.start();
  }
}
