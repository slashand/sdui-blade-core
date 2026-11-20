import { afterEach, describe, expect, it, vi } from 'vitest';
import { BladeHistory } from './blade-history.js';

afterEach(() => vi.restoreAllMocks());

describe('BladeHistory', () => {
  function browserAt(path: string) {
    let current = new URL(path, 'https://example.test');
    let currentState: unknown = null;
    const listeners = new Set<() => void>();
    const entries = [{ url: current.href, state: currentState }];
    let index = 0;
    const browser = {
      location: {
        get href() {
          return current.href;
        },
      },
      history: {
        get state() {
          return currentState;
        },
        pushState: vi.fn((state: unknown, _unused: string, destination: string) => {
          current = new URL(destination, current);
          currentState = state;
          entries.splice(++index);
          entries.push({ url: current.href, state });
        }),
        replaceState: vi.fn((state: unknown, _unused: string, destination: string) => {
          current = new URL(destination, current);
          currentState = state;
          entries[index] = { url: current.href, state };
        }),
      },
      addEventListener: vi.fn((_type: string, listener: () => void) => listeners.add(listener)),
      removeEventListener: vi.fn((_type: string, listener: () => void) => listeners.delete(listener)),
    } as unknown as Window;
    const restore = (entry: { url: string; state: unknown }) => {
      current = new URL(entry.url);
      currentState = entry.state;
      listeners.forEach((listener) => listener());
    };
    return { browser, back: () => restore(entries[--index]), forward: () => restore(entries[++index]) };
  }

  it('records each stack and Back closes one blade at a time without writing a frame', () => {
    const { browser, back, forward } = browserAt('/demo?theme=dark#section');
    const history = new BladeHistory(browser, 'b');
    const navigations: string[][] = [];
    const stop = history.listen((ids) => navigations.push(ids));
    history.record(['root']);
    history.record(['root', 'child']);
    history.record(['root', 'child', 'grandchild']);
    back();
    back();
    back();
    forward();
    expect(navigations).toEqual([['root', 'child'], ['root'], [], ['root']]);
    expect(browser.history.pushState).toHaveBeenCalledTimes(3);
    expect(browser.location.href).toContain('theme=dark');
    expect(browser.location.href).toContain('#section');
    stop();
    back();
    expect(navigations).toHaveLength(4);
  });

  it('replaces hydration or in-place updates and avoids duplicate frames', () => {
    const { browser } = browserAt('/demo?b=root');
    const history = new BladeHistory(browser, 'b');
    expect(history.read()).toEqual(['root']);
    history.record(['root']);
    history.record(['root', 'child'], true);
    expect(browser.history.pushState).not.toHaveBeenCalled();
    expect(browser.history.replaceState).toHaveBeenCalledOnce();
  });

  it('updates the durable URL when the same blade becomes transient and handles separator characters', () => {
    const { browser } = browserAt('/demo');
    const history = new BladeHistory(browser, 'b');
    history.record(['a,b']);
    expect(history.readDurable()).toEqual(['a,b']);
    history.record(['a,b'], true, []);
    expect(history.readDurable()).toEqual([]);
    expect(history.read()).toEqual(['a,b']);
  });

  it('keeps transient blades out of the URL while Back and Forward restore each layer', () => {
    const { browser, back, forward } = browserAt('/demo');
    const history = new BladeHistory(browser, 'b');
    const navigations: string[][] = [];
    history.listen((ids) => navigations.push(ids));
    history.record(['root'], false, ['root']);
    history.record(['root', 'child'], false, ['root']);
    history.record(['root', 'child', 'grandchild'], false, ['root']);
    expect(new URL(browser.location.href).searchParams.get('b')).toBe('root');
    expect(history.readDurable()).toEqual(['root']);
    back();
    back();
    forward();
    expect(navigations).toEqual([['root', 'child'], ['root'], ['root', 'child']]);
  });
});
