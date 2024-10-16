class Keyboard {
  private _element: HTMLElement;
  private _pressed: boolean[] = [];
  private _released: boolean[] = [];
  private _releaseFunc: ((() => void) | undefined)[] = [];

  constructor(element: HTMLElement) {
    this._element = element;
    this._keyDownEvent();
    this._keyUpEvent();
  }

  _keyDownEvent() {
    this._element.addEventListener("keydown", (event: KeyboardEvent) => {
      const key = event.keyCode;
      this._pressed[key] = true;

      if (this._releaseFunc[key] && !this._released[key]) {
        this._released[key] = true;
        this._releaseFunc[key]!();
      }
    });
  }

  _keyUpEvent() {
    this._element.addEventListener("keyup", (event: KeyboardEvent) => {
      this._pressed[event.keyCode] = false;
      this._released[event.keyCode] = false;
    });
  }

  public Press(key: number): boolean {
    return this._pressed[key];
  }

  public Release(key: number, callback: () => void): void {
    this._releaseFunc[key] = callback;
  }
}

export default Keyboard;
