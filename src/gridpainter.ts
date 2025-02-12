// Private instance variables for GridPainter objects, implemented using WeakMaps
const gpParent = new WeakMap(),
  gpCells = new WeakMap(),
  gpElement = new WeakMap(),
  gpOptions = new WeakMap();

// Private helper function that creates DOM elements in a CSS grid layout
const gpCreator = function gpCreator(gp: any) {
  const element = document.createElement("div");

  element.id = gp.id;
  element.className = "grid-painter";
  element.style.display = "grid";
  gpElement.set(gp, element);

  gpParent.get(gp).appendChild(element);

  for (let y = 0; y < gp.rows; ++y) {
    for (let x = 0; x < gp.cols; ++x) {
      let cell = document.createElement("div");
      cell.className = "cell";

      cell.style.gridColumnStart = `${x + 1}`;
      cell.style.gridColumnEnd = `${x + 2}`;
      cell.style.gridRowStart = `${y + 1}`;
      cell.style.gridRowEnd = `${y + 2}`;
      cell.style.backgroundColor = gp.options.initialColor;

      gpCells.get(gp)[y][x] = cell;

      element.appendChild(cell);
    }
  }
};

type GridPainterOptions = {
  id: string;
  cols: number;
  rows: number;
  initialColor: string;
};

/** Class representing a grid of cells that can be painted individually */
class GridPainter {
  constructor(parent: HTMLElement, options: GridPainterOptions) {
    // Apply some reasonable defaults
    options = Object.assign(
      {
        id: `gp-${(Math.random() * 900000 + 100000).toFixed(0)}`,
        cols: 10,
        rows: 25,
        initialColor: "#ffffff",
      },
      options
    );

    // Set private instance variables
    gpParent.set(this, parent);
    gpOptions.set(this, options);

    // Private instance variables in gpCells are two-dimensional arrays
    gpCells.set(
      this,
      Array(options.rows)
        .fill(null)
        .map(() => Array(options.cols))
    );

    // Call private helper function
    gpCreator(this);
  }

  /**
   * Returns the id of this GridPainter instance
   * @type {String}
   */
  get id() {
    return gpOptions.get(this).id;
  }

  /**
   * Returns the number of columns
   * @type {number}
   */
  get cols() {
    return gpOptions.get(this).cols;
  }

  /**
   * Returns the number of rows
   * @type {number}
   */
  get rows() {
    return gpOptions.get(this).rows;
  }

  /**
   * Returns the parent element
   * @type {HTMLElement}
   */
  get parent() {
    return gpParent.get(this);
  }

  /**
   * Returns the main element
   * @type {HTMLElement}
   */
  get element() {
    return gpElement.get(this);
  }

  /**
   * Returns the options for this GridPainter
   * @type {Object}
   */
  get options() {
    return gpOptions.get(this);
  }

  paintCell(x: number, y: number, color: string) {
    if (x < 0) {
      throw `value (${x}) of x is invalid: must not be below 0`;
    }
    if (x >= this.cols) {
      throw `value (${x}) of x is invalid: must not be over ${this.cols - 1}`;
    }
    if (y < 0) {
      throw `value (${y}) of y is invalid: must not be below 0`;
    }
    if (y >= this.rows) {
      throw `value (${y}) of y is invalid: must not be over ${this.rows - 1}`;
    }
    if (color === null || color === undefined || typeof color === "string") {
      gpCells.get(this)[y][x].style["background-color"] =
        color || this.options.initialColor;
    } else {
      throw "value of color must be a string, null, undefined or false";
    }
  }
}

export default GridPainter;
