/** Browser history for a blade journey. The host supplies payload resolution; Core owns URL frames. */
function sameIds(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export class BladeHistory {
  constructor(
    private readonly browser: Window,
    private readonly parameter = 'blades',
  ) {}

  read(): string[] {
    const durable = this.readDurable();
    const state = this.browser.history.state as { __sduiBlades?: { ids: string[]; durable: string } } | null;
    const saved = state?.__sduiBlades;
    return saved && saved.durable === JSON.stringify(durable) && Array.isArray(saved.ids) ? saved.ids : durable;
  }

  /** Initial document hydration intentionally drops transient history.state payloads. */
  readDurable(): string[] {
    const value = new URL(this.browser.location.href).searchParams.get(this.parameter);
    return value
      ? value
          .split(',')
          .filter(Boolean)
          .map((id) => {
            try {
              return decodeURIComponent(id);
            } catch {
              return id;
            }
          })
      : [];
  }

  /** Each blade gets a history frame; only durable IDs enter the shareable URL. */
  record(ids: readonly string[], replace = false, durableIds: readonly string[] = ids): void {
    if (sameIds(this.read(), ids) && sameIds(this.readDurable(), durableIds)) return;
    const url = new URL(this.browser.location.href);
    if (durableIds.length)
      url.searchParams.set(this.parameter, durableIds.map((id) => encodeURIComponent(id)).join(','));
    else url.searchParams.delete(this.parameter);
    const destination = `${url.pathname}${url.search}${url.hash}`;
    const previous = this.browser.history.state;
    const state = {
      ...(previous && typeof previous === 'object' ? previous : {}),
      __sduiBlades: { ids: [...ids], durable: JSON.stringify(durableIds) },
    };
    if (replace) this.browser.history.replaceState(state, '', destination);
    else this.browser.history.pushState(state, '', destination);
  }

  /** Back and Forward both report the destination stack; they never write a second frame. */
  listen(onNavigate: (ids: string[]) => void): () => void {
    const handler = () => onNavigate(this.read());
    this.browser.addEventListener('popstate', handler);
    return () => this.browser.removeEventListener('popstate', handler);
  }
}
