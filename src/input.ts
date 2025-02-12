// Private instance variables for Input objects, implemented using WeakMaps
const inpKeySets = new WeakMap(),
  inpOptions = new WeakMap();

/** Class representing keyboard input */
class Input {
  constructor(initialOptions?: {
    onkeydown: Function | null;
    onkeyup: Function | null;
  }) {
    // Apply some reasonable defaults
    const options = { onkeydown: null, onkeyup: null, ...initialOptions };

    // Keep track of all currently pressed keys in a set
    const keys = new Set();

    // Set private instance variables
    inpOptions.set(this, options);
    inpKeySets.set(this, keys);

    // Start listening to keydown events
    window.addEventListener("keydown", (e) => {
      if (keys.has(e.code)) return;
      keys.add(e.code);
      if (options.onkeydown) options.onkeydown.call(this, e.code);
    });

    // Start listening to keyup events
    window.addEventListener("keyup", (e) => {
      if (!keys.has(e.code)) return;
      keys.delete(e.code);
      if (options.onkeyup) options.onkeyup.call(this, e.code);
    });
  }

  isDown(keyCode: string): boolean {
    return inpKeySets.get(this).has(keyCode);
  }

  get onkeydown() {
    return inpOptions.get(this).onkeydown;
  }

  set onkeydown(eh) {
    inpOptions.get(this).onkeydown = eh;
  }

  get onkeyup() {
    return inpOptions.get(this).onkeyup;
  }

  set onkeyup(eh) {
    inpOptions.get(this).onkeyup = eh;
  }
}

export default Input;
