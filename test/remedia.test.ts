import remedia, {
  CompoundMediaQuery,
  MediaQuery,
  queryListCache,
} from '../src/remedia';

class MockMediaQueryList {
  media: string;
  private _matches: boolean = false;
  private _listeners: ((ev: MediaQueryListEvent) => void)[] = [];

  constructor(media: string) {
    this.media = media;
  }

  get matches() {
    return this._matches;
  }

  set matches(matches: boolean) {
    this._matches = matches;
    this._listeners.forEach(listener =>
      listener({ matches } as MediaQueryListEvent)
    );
  }

  addListener(listener: (ev: MediaQueryListEvent) => void) {
    if (this._listeners.indexOf(listener) === -1) {
      this._listeners.push(listener);
    }
  }

  removeListener(listener: (ev: MediaQueryListEvent) => void) {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  addEventListener(
    _type: 'change',
    listener: (ev: MediaQueryListEvent) => void
  ) {
    this.addListener(listener);
  }

  removeEventListener(
    _type: 'change',
    listener: (ev: MediaQueryListEvent) => void
  ) {
    this.removeListener(listener);
  }
}

window.matchMedia = jest
  .fn()
  .mockImplementation((query: string) => new MockMediaQueryList(query));

describe('remedia', () => {
  it('should handle basic query', () => {
    const mq = remedia({ maxWidth: 1200 });
    const mqString = mq.toString();

    expect(mqString).toBe('(max-width: 1200px)');
    expect(mq instanceof MediaQuery).toBe(true);
    expect(mq.maxWidth).toBe(1200);

    const listener = jest.fn();
    mq.subscribe(listener);

    expect(mq.get()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(0);
    // @ts-ignore
    queryListCache[mqString].matches = true;
    expect(mq.get()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    mq.unsubscribe(listener);
    // @ts-ignore
    queryListCache[mqString].matches = false;
    expect(mq.get()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should handle compound query', () => {
    const mq = remedia({ maxWidth: 1200 }, { minWidth: 768 });
    const mqString = mq.toString();

    expect(mqString).toBe('(max-width: 1200px), (min-width: 768px)');
    expect(mq instanceof CompoundMediaQuery).toBe(true);
    expect(mq[0].maxWidth).toBe(1200);
    expect(mq[1].minWidth).toBe(768);

    const listener = jest.fn();
    mq.subscribe(listener);

    expect(mq.get()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(0);
    // @ts-ignore
    queryListCache[mqString].matches = true;
    expect(mq.get()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    mq.unsubscribe(listener);
    // @ts-ignore
    queryListCache[mqString].matches = false;
    expect(mq.get()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should combine queries by spreading', () => {
    const mq1 = remedia({ maxWidth: 1200 });
    const mq2 = remedia({ minWidth: 768 });

    const mqCombo = remedia({ ...mq1, ...mq2 });
    const mqComboString = mqCombo.toString();
    expect(mqComboString).toBe('(max-width: 1200px) and (min-width: 768px)');
  });
});
