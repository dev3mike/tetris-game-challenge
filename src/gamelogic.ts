import ScoreDisplay from "./scoredisplay.js";
import GridPainter from "./gridpainter.js";
import Input from "./input.js";
import { rgb, hsl } from "./colors.js";
import { PIECES } from "./constants/pieces.js";
import { getDelay } from "./constants/levels.js";

/* Don't change these */
const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const PLAYFIELD_ID = "playfield";
const NEXT_COLUMNS = 4;
const NEXT_ROWS = 4;
const NEXT_ID = "next";

const PLAYFIELD_BACKGROUND = rgb(30, 57, 84); // Change this one if you want to
const NEXT_BACKGROUND = hsl(90, 0.3, 0.2); // Change this one if you want to

const GAME_LOOP_INTERVAL = 50; // 50ms

const EXTRA_POINTS_FOR_MULTIPLE_LINES: Record<number, number> = {
  0: 0, // No points for 0 lines
  1: 100, // 1 line = 100 points
  2: 300, // 2 lines = 300 points
  3: 500, // 3 lines = 500 points
  4: 800  // 4 lines = 800 points
};

const LEVEL_UP_THRESHOLD = 10;

enum GameState {
  Playing,
  SpawnDelay,
  GameOver
}

enum GameEventType {
  Tick,           // Game loop tick
  PieceLocked,    // Piece has been locked in place
  PieceSpawned,   // New piece has been spawned
  LinesCleared,   // Lines have been cleared
  GameOver,       // Game has ended
  MoveLeft,       // Move piece left
  MoveRight,      // Move piece right
  Rotate,         // Rotate piece
  HardDrop       // Hard drop piece
}

interface GameEvent {
  type: GameEventType;
  data?: any;
}

interface CurrentFallingPieceType { type: keyof typeof PIECES; x: number; y: number; rotation: number; }

export class GameLogic {
  playfield: GridPainter;
  next: GridPainter;
  scoreDisplay: ScoreDisplay;
  input: Input;

  // Holds the upcoming pieces
  pieceBag: (keyof typeof PIECES)[] = [];

  // Current state of the game
  private board: string[][];          // The game board - stores colors of placed pieces
  private currentFallingPiece: CurrentFallingPieceType | null; // The piece that's currently falling
  private nextPiece: keyof typeof PIECES;  // The next piece that will appear
  private level: number;             // Current game level (1-10)
  private score: number;             // Player's current score
  private gameInterval: number;       // Timer that makes the game run
  private lastFall: number;          // When the piece last moved down
  private gameState: GameState;      // Current state of the game
  private linesCleared: number;       // How many lines player has cleared
  private canRotate: boolean;         // Whether current piece can rotate

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

    // Initialize game state
    this.board = Array(PLAYFIELD_ROWS).fill(null).map(() =>
      Array(PLAYFIELD_COLUMNS).fill(PLAYFIELD_BACKGROUND)
    );
    this.currentFallingPiece = null;
    this.nextPiece = this.getRandomPiece();
    this.level = 1;
    this.score = 0;
    this.gameInterval = 0;
    this.lastFall = 0;
    this.gameState = GameState.Playing;
    this.linesCleared = 0;
    this.canRotate = false;
  }

  /**
   * Gets a random piece from the bag. When bag is empty, refills it with all pieces.
   * This ensures you don't get too many of the same piece in a row.
   */
  private getRandomPiece(): keyof typeof PIECES {
    if (this.pieceBag.length === 0) {
      const pieces = Object.keys(PIECES) as (keyof typeof PIECES)[];
      this.pieceBag = this.shuffleArray([...pieces]);
    }

    const nextPiece = this.pieceBag.pop();
    return nextPiece ?? this.getRandomPiece();
  }

  private shuffleArray<T>(array: T[]): T[] {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Starts a new game by resetting everything to beginning state
   */
  start() {
    // Reset game state
    this.board = Array(PLAYFIELD_ROWS).fill(null).map(() =>
      Array(PLAYFIELD_COLUMNS).fill(PLAYFIELD_BACKGROUND)
    );
    this.level = 1;
    this.score = 0;
    this.linesCleared = 0;
    this.canRotate = false;
    this.gameState = GameState.SpawnDelay;  // Start with spawn delay to trigger first piece
    this.scoreDisplay.value = 0;
    this.scoreDisplay.format = "Score: {value}";
    this.lastFall = Date.now();

    // Clear any existing interval
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }

    // Start game loop
    this.gameInterval = window.setInterval(() => this.gameLoop(), GAME_LOOP_INTERVAL);
  }

  /**
   * Main game loop - runs every frame to update the game
   */
  private gameLoop() {
    if (this.gameState === GameState.GameOver) return;

    const now = Date.now();
    const hasDelayPassed = now - this.lastFall >= getDelay(this.level);

    if (hasDelayPassed) {
      this.handleGameEvent({ type: GameEventType.Tick });
      this.lastFall = now;
    }
  }

  /**
   * Handles game events based on current state
   */
  private handleGameEvent(event: GameEvent) {
    switch (this.gameState) {
      case GameState.Playing:
        this.handlePlayingState(event);
        break;
      case GameState.SpawnDelay:
        this.handleSpawnDelayState(event);
        break;
      case GameState.GameOver:
        this.handleGameOverState(event);
        break;
    }
    this.drawBoard();
  }

  /**
   * Handles events while in Playing state
   */
  private handlePlayingState(event: GameEvent) {
    switch (event.type) {
      case GameEventType.Tick:
        if (this.currentFallingPiece) {
          this.movePieceDown();
        }
        break;
      case GameEventType.MoveLeft:
        if (this.currentFallingPiece) {
          this.currentFallingPiece.x--;
          if (this.checkCollision()) {
            this.currentFallingPiece.x++;
          }
        }
        break;
      case GameEventType.MoveRight:
        if (this.currentFallingPiece) {
          this.currentFallingPiece.x++;
          if (this.checkCollision()) {
            this.currentFallingPiece.x--;
          }
        }
        break;
      case GameEventType.Rotate:
        this.handleRotation();
        break;
      case GameEventType.HardDrop:
        this.handleHardDrop();
        break;
      case GameEventType.PieceLocked:
        this.checkLines();
        this.currentFallingPiece = null;
        this.gameState = GameState.SpawnDelay;
        break;
      case GameEventType.GameOver:
        this.gameState = GameState.GameOver;
        this.gameOver();
        break;
    }
  }

  /**
   * Handles events while in SpawnDelay state
   */
  private handleSpawnDelayState(event: GameEvent) {
    if (event.type === GameEventType.Tick) {
      this.gameState = GameState.Playing;
      this.spawnPiece();
    }
  }

  /**
   * Handles events while in GameOver state
   */
  private handleGameOverState(_event: GameEvent) {
    console.log("Game over");
  }

  /**
   * Creates a new piece at the top of the board
   */
  private spawnPiece() {
    if (this.currentFallingPiece) return;

    const pieceShape = PIECES[this.nextPiece].shape;
    const pieceHeight = pieceShape.length;
    const initialY = -pieceHeight; // Start off-screen

    this.currentFallingPiece = {
      type: this.nextPiece,
      x: Math.floor((PLAYFIELD_COLUMNS - PIECES[this.nextPiece].shape[0].length) / 2),  // Center the piece properly
      y: initialY,
      rotation: 0
    };
    this.canRotate = false;  // Cannot rotate when first spawned

    // Check for game over before updating next piece or drawing
    // Game is over if the piece collides at spawn position
    if (this.checkGameOver()) {
      this.gameOver();
      return;
    }

    this.nextPiece = this.getRandomPiece();
    this.drawNextPiece();
    this.drawBoard();
  }

  /**
   * Ends the game and shows final score
   */
  private gameOver() {
    // Lock the final piece in place if it exists
    if (this.currentFallingPiece) {
      this.lockPiece(false, true); // Pass true as second parameter to indicate game over
    }

    this.gameState = GameState.GameOver;
    clearInterval(this.gameInterval);
    this.gameInterval = 0;
    this.currentFallingPiece = null;
    this.scoreDisplay.format = "Game Over! Score: {value}";
    this.drawBoard(); // One final draw to show the final state
  }

  /**
   * Checks if the game should end
   */
  private checkGameOver(): boolean {
    if (!this.currentFallingPiece) return false;

    const shape = this.getShapeInCurrentRotation(
      PIECES[this.currentFallingPiece.type].shape,
      this.currentFallingPiece.rotation
    );

    // Iterate through each row of the piece's shape matrix
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          // Convert current falling piece coordinates to board coordinates
          const boardY = this.currentFallingPiece.y + y;
          const boardX = this.currentFallingPiece.x + x;

          // Game over if:
          // 1. Any part of the piece overlaps with existing pieces in the visible board
          // 2. Any part of the piece that would be visible (boardY >= 0) overlaps
          if (boardY >= 0 &&
            boardY < PLAYFIELD_ROWS &&
            boardX >= 0 &&
            boardX < PLAYFIELD_COLUMNS &&
            this.board[boardY][boardX] !== PLAYFIELD_BACKGROUND) {
            return true;
          }
        }
      }
    }

    return false;
  }


  /**
   * Draws the current state of the game board and falling piece
   */
  private drawBoard() {
    // Clear the board
    this.clearBoard();

    // Draw the current piece
    if (this.currentFallingPiece) {
      this.drawCurrentFallingPiece(this.currentFallingPiece);
    }
  }

  /**
   * Shows the next piece that will appear
   */
  private drawNextPiece() {
    this.clearNextPiece();

    const piece = PIECES[this.nextPiece];
    const shape = piece.shape;

    // Iterate through each row of the piece's shape matrix
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          // Convert piece coordinates to next piece display coordinates
          this.next.paintCell(x, y, piece.color);
        }
      }
    }
  }

  /**
   * Rotates a piece's shape based on how many times it should rotate
   */
  private getShapeInCurrentRotation(shape: number[][], currentRotation: number): number[][] {
    if (!this.currentFallingPiece) {
      return shape;
    }

    let rotatedShape = [...shape.map(row => [...row])];  // Create a deep copy from original shape
    // Rotate the piece the correct number of times
    const rotations = currentRotation % PIECES[this.currentFallingPiece.type].orientations;
    for (let i = 0; i < rotations; i++) {
      // Rotate the piece counterclockwise
      rotatedShape = this.rotateMatrixCounterClockwise(rotatedShape);
    }
    return rotatedShape;
  }

  private rotateMatrixCounterClockwise(matrix: number[][]): number[][] {
    const N = matrix.length;
    const result = Array(N).fill(null).map(() => Array(N).fill(0));

    // The rotation point is at matrix[1][2]
    // We need to rotate around this point
    const centerX = 2;  // rotation point x
    const centerY = 1;  // rotation point y

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        // Translate to origin, rotate, then translate back
        const relativeX = x - centerX;
        const relativeY = y - centerY;

        // Rotate counterclockwise around origin
        const newX = centerX - relativeY;
        const newY = centerY + relativeX;

        // Copy the value if the new position is within bounds
        if (newX >= 0 && newX < N && newY >= 0 && newY < N) {
          result[newY][newX] = matrix[y][x];
        }
      }
    }

    return result;
  }

  /**
   * Checks if the current piece hits anything in its current position
   */
  private checkCollision(): boolean {
    if (!this.currentFallingPiece) return false;

    // Get the piece's shape and rotation
    const shape = this.getShapeInCurrentRotation(
      PIECES[this.currentFallingPiece.type].shape,
      this.currentFallingPiece.rotation
    );

    // Iterate through each row of the piece's shape matrix
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          // Convert piece coordinates to board coordinates
          const boardX = this.currentFallingPiece.x + x;
          const boardY = this.currentFallingPiece.y + y;

          // Check horizontal and bottom bounds
          if (
            boardX < 0 ||
            boardX >= PLAYFIELD_COLUMNS ||
            boardY >= PLAYFIELD_ROWS
          ) {
            return true;
          }

          // For game over check: if any part of the piece overlaps with existing pieces
          // while still having parts above the board, it's a collision
          if (boardY >= 0 && this.board[boardY][boardX] !== PLAYFIELD_BACKGROUND) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Handles piece rotation with wall kicks
   */
  private handleRotation() {
    if (!this.currentFallingPiece) return;

    const oldRotation = this.currentFallingPiece.rotation;
    this.currentFallingPiece.rotation = (this.currentFallingPiece.rotation + 1) % PIECES[this.currentFallingPiece.type].orientations;

    if (this.checkCollision()) {
      // Try wall kicks
      this.currentFallingPiece.x++; // Try right
      if (this.checkCollision()) {
        this.currentFallingPiece.x -= 2; // Try left
        if (this.checkCollision()) {
          this.currentFallingPiece.x++; // Reset x
          this.currentFallingPiece.y--; // Try up
          if (this.checkCollision()) {
            this.currentFallingPiece.y++; // Reset y
            this.currentFallingPiece.rotation = oldRotation; // Revert rotation
          }
        }
      }
    }
  }

  /**
   * Handles hard drop of the current piece
   */
  private handleHardDrop() {
    if (!this.currentFallingPiece) return;

    while (!this.checkCollision()) {
      this.currentFallingPiece.y++;
    }
    this.currentFallingPiece.y--;
    this.lockPiece(true);
    this.handleGameEvent({ type: GameEventType.PieceLocked });
  }

  /**
   * Moves the current piece down one step
   */
  private movePieceDown() {
    if (this.gameState === GameState.GameOver) return;
    if (!this.currentFallingPiece) {
      this.gameState = GameState.SpawnDelay;
      return;
    }

    this.currentFallingPiece.y++;

    if (this.checkCollision()) {
      this.currentFallingPiece.y--;
      this.lockPiece(false);
      this.handleGameEvent({ type: GameEventType.PieceLocked });
    } else {
      this.canRotate = true;
    }
  }

  private shapeHasPartsAboveBoard(shape: number[][], currentFallingPiece: { y: number }): boolean {
    let hasPartsAboveBoard = false;
    for (let y = 0; y < shape.length && !hasPartsAboveBoard; y++) {
      // Iterate through each cell in the current row
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = currentFallingPiece.y + y;
          // If any part of the piece is above the board when locking, it's game over
          if (boardY < 0) {
            hasPartsAboveBoard = true;
            break;
          }
        }
      }
    }
    return hasPartsAboveBoard;
  }

  /**
   * Fixes the current piece in place when it can't move down anymore
   */
  private lockPiece(isQuickDrop: boolean = false, isGameOver: boolean = false) {
    if (!this.currentFallingPiece) return;

    const shape = this.getShapeInCurrentRotation(
      PIECES[this.currentFallingPiece.type].shape,
      this.currentFallingPiece.rotation
    );

    // Check if any part of the piece is above the board when locking
    if (!isGameOver) {  // Skip this check during game over
      let hasPartsAboveBoard = this.shapeHasPartsAboveBoard(shape, this.currentFallingPiece);
      if (hasPartsAboveBoard) {
        this.gameOver();
        return;
      }
    }

    // Lock the piece on the board
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = this.currentFallingPiece.x + x;
          const boardY = this.currentFallingPiece.y + y;
          if (boardY >= 0 && boardY < PLAYFIELD_ROWS &&
            boardX >= 0 && boardX < PLAYFIELD_COLUMNS) {
            this.board[boardY][boardX] = PIECES[this.currentFallingPiece.type].color;
          }
        }
      }
    }

    // Add points for placing a piece when not in game over state
    if (!isGameOver) {
      const basePoints = 10 * this.level;
      this.score += isQuickDrop ? basePoints * 2 : basePoints;
      this.scoreDisplay.value = this.score;
    }
  }

  /**
   * Checks for and removes any completed lines
   */
  private checkLines() {
    if (this.gameState === GameState.GameOver) return;

    let linesCleared = 0;
    const maxLines = this.currentFallingPiece ? PIECES[this.currentFallingPiece.type].maxLines : 4;

    // Check each row from bottom to top
    for (let y = PLAYFIELD_ROWS - 1; y >= 0 && linesCleared < maxLines; y--) {
      if (this.isLineComplete(y)) {
        this.clearLine(y);
        linesCleared++;
        y++; // Check the same row again as rows above have shifted down
      }
    }

    // Update score and lines based on number of lines cleared
    if (linesCleared > 0) {
      this.linesCleared += linesCleared;

      // Points awarded for clearing lines
      const pointsPerLine = EXTRA_POINTS_FOR_MULTIPLE_LINES[linesCleared] || 0;
      const points = pointsPerLine * this.level;

      this.score += points;
      this.scoreDisplay.value = this.score;

      // Level up every 10 lines
      const newLevel = Math.min(LEVEL_UP_THRESHOLD, Math.floor(this.linesCleared / LEVEL_UP_THRESHOLD) + 1);
      if (newLevel > this.level) {
        this.level = newLevel;
        clearInterval(this.gameInterval);
        this.gameInterval = window.setInterval(() => this.gameLoop(), 50);
      }
    }
  }

  private isLineComplete(y: number): boolean {
    return this.board[y].every(cell => cell !== PLAYFIELD_BACKGROUND);
  }

  private clearLine(y: number) {
    // Move all lines above down
    for (let row = y; row > 0; row--) {
      this.board[row] = [...this.board[row - 1]];
    }
    // Clear top line
    this.board[0] = Array(PLAYFIELD_COLUMNS).fill(PLAYFIELD_BACKGROUND);
  }

  /**
   * Handles keyboard input for moving and rotating pieces
   */
  onkeydown(keyCode: string) {
    if (!this.currentFallingPiece || this.gameState !== GameState.Playing) return;

    switch (keyCode) {
      case "ArrowLeft":
        this.handleGameEvent({ type: GameEventType.MoveLeft });
        break;
      case "ArrowRight":
        this.handleGameEvent({ type: GameEventType.MoveRight });
        break;
      case "ArrowUp":
        if (this.canRotate) {
          this.handleGameEvent({ type: GameEventType.Rotate });
        }
        break;
      case "Space":
        this.handleGameEvent({ type: GameEventType.HardDrop });
        break;
    }
  }

  onkeyup(keyCode: string) {
    console.log(`up: ${keyCode}`);
  }

  /**
   * Clears the game board
   */
  private clearBoard() {
    for (let y = 0; y < PLAYFIELD_ROWS; y++) {
      for (let x = 0; x < PLAYFIELD_COLUMNS; x++) {
        this.playfield.paintCell(x, y, this.board[y][x]);
      }
    }
  }

  /**
   * Clears the next piece display
   */
  private clearNextPiece() {
    for (let y = 0; y < NEXT_ROWS; y++) {
      for (let x = 0; x < NEXT_COLUMNS; x++) {
        this.next.paintCell(x, y, NEXT_BACKGROUND);
      }
    }
  }

  /**
   * Draws the current falling piece
   */
  private drawCurrentFallingPiece(currentFallingPiece: CurrentFallingPieceType) {
    // Get the piece's shape and rotation
    const piece = PIECES[currentFallingPiece.type];
    const shape = this.getShapeInCurrentRotation(piece.shape, currentFallingPiece.rotation);

    // Iterate through each row of the piece's shape matrix
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          // Convert current falling piece coordinates to board coordinates
          const boardX = currentFallingPiece.x + x;
          const boardY = currentFallingPiece.y + y;

          // Only draw if the piece part is within the visible board area
          if (boardY >= 0 && boardY < PLAYFIELD_ROWS && boardX >= 0 && boardX < PLAYFIELD_COLUMNS) {
            this.playfield.paintCell(boardX, boardY, piece.color);
          }
        }
      }
    }
  }
}

/** Class representing an instance of a Tetris game */
export class Game {
  constructor() { }

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
