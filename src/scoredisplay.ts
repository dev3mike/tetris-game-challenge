// Private instance variables for ScoreDisplay objects, implemented using WeakMaps
const sdParent = new WeakMap(),
  sdElement = new WeakMap(),
  sdOptions = new WeakMap();

// Private helper function that creates a DOM element
const sdCreator = function gpCreator(sd: any) {
  // Create the outer element and append it to the parent
  const div = document.createElement("div");
  div.id = sd.id;
  div.className = "score-display";
  sd.parent.appendChild(div);
  sdElement.set(sd, div);

  sdRepaint(sd);
};

// Private helper function that updates the contents of the DOM element
const sdRepaint = function sdRepaint(sd: any) {
  let output = sd.format.replace("{value}", sd.value);
  let lines = output.split(/\n/g);
  sd.element.innerHTML = "";
  lines.forEach((line: string, index: number) => {
    if (index >= 1) {
      sd.element.appendChild(document.createElement("br"));
    }
    sd.element.appendChild(document.createTextNode(line));
  });
};

/** Class representing an element for displaying a player's current score */
class ScoreDisplay {
  constructor(
    parent: HTMLElement,
    options: { id?: string; value: number; format: string }
  ) {
    // Apply some reasonable defaults
    options = Object.assign(
      {
        id: `sd-${(Math.random() * 900000 + 100000).toFixed(0)}`,
        value: 0,
        format: "{value}",
      },
      options
    );

    // Set private instance variables
    sdParent.set(this, parent);
    sdOptions.set(this, options);

    // Call private helper function
    sdCreator(this);
  }

  /**
   * Returns the id of this ScoreDisplay instance
   * @type {String}
   */
  get id() {
    return sdOptions.get(this).id;
  }

  /**
   * Returns the current score of this ScoreDisplay instance
   * @type {number}
   */
  get value() {
    return sdOptions.get(this).value;
  }

  set value(v) {
    sdOptions.get(this).value = v;
    sdRepaint(this);
  }

  /**
   * Returns the format string of this ScoreDisplay instance
   * @type {String}
   */
  get format() {
    return sdOptions.get(this).format;
  }

  set format(f) {
    sdOptions.get(this).format = f;
    sdRepaint(this);
  }

  /**
   * Returns the parent element
   * @type {HTMLElement}
   */
  get parent() {
    return sdParent.get(this);
  }

  /**
   * Returns the main element
   * @type {HTMLElement}
   */
  get element() {
    return sdElement.get(this);
  }

  /**
   * Returns the options for this GridPainter
   * @type {Object}
   */
  get options() {
    return sdOptions.get(this);
  }
}

export default ScoreDisplay;
