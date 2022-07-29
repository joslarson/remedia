import * as React from 'react';

import { json2mq } from './json2mq';
import { QueryObject } from './types';

// @ts-ignore
export interface MediaQuery<Q extends QueryObject> extends Q {}

export class MediaQuery<Q extends QueryObject = QueryObject> {
  private _queryString: string;

  constructor(query: Readonly<Q>) {
    // copy query object props to MediaQuery instance
    Object.assign(this, query);
    // set media query string value
    this._queryString = json2mq(query);
  }

  toString() {
    return this._queryString;
  }

  subscribe(listener: (ev: MediaQueryListEvent) => void) {
    return subscribeToMediaQuery(this, listener);
  }

  unsubscribe(listener: (ev: MediaQueryListEvent) => void) {
    return unsubscribeFromMediaQuery(this, listener);
  }

  use(initialState: boolean = false): boolean {
    return useMediaQuery(this, initialState);
  }

  get(): boolean {
    return getDoesMediaQueryMatch(this);
  }

  /**
   * This is a hack to make styled-component types happy to interpolate
   * instances of MediaQuery. It's not actually used for anything.
   */
  getName() {
    return 'MediaQuery';
  }
}

// @ts-ignore
export interface CompoundMediaQuery<Q extends QueryObject[] = QueryObject[]>
  extends Q {}
export class CompoundMediaQuery<Q extends QueryObject[] = QueryObject[]> {
  length: Q['length'];
  private _queryString: string;

  constructor(...query: Q) {
    query.forEach((q, i) => (this[i] = q));
    this.length = query.length;
    this._queryString = json2mq(query);
  }

  [Symbol.iterator](): Iterator<Q[number]> {
    let index = -1;
    return {
      next: () => {
        if (index !== this.length) {
          index += 1;
        } else {
          return { value: null, done: true };
        }

        return { value: this[index], done: false };
      },
    };
  }

  toString() {
    return this._queryString;
  }

  subscribe(listener: (ev: MediaQueryListEvent) => void): () => void {
    return subscribeToMediaQuery(this, listener);
  }

  unsubscribe(listener: (ev: MediaQueryListEvent) => void): void {
    return unsubscribeFromMediaQuery(this, listener);
  }

  use(initialState: boolean = false): boolean {
    return useMediaQuery(this, initialState);
  }

  get(): boolean {
    return getDoesMediaQueryMatch(this);
  }

  /**
   * This is a hack to make styled-component types happy to interpolate
   * instances of CompoundMediaQuery. It's not actually used for anything.
   */
  getName() {
    return 'CompoundMediaQuery';
  }
}

export const queryListCache: { [key: string]: MediaQueryList } = {};

const getOrCreateMediaQueryList = (
  query: QueryObject | MediaQuery | CompoundMediaQuery
) => {
  const mediaQueryString =
    query instanceof MediaQuery || query instanceof CompoundMediaQuery
      ? query.toString()
      : remedia(query).toString();

  if (!queryListCache[mediaQueryString]) {
    queryListCache[mediaQueryString] = window.matchMedia(mediaQueryString);
  }

  return queryListCache[mediaQueryString];
};

function subscribeToMediaQuery(
  query: QueryObject | MediaQuery | CompoundMediaQuery,
  listener: (ev: MediaQueryListEvent) => void
) {
  const mediaQueryList = getOrCreateMediaQueryList(query);

  if (typeof mediaQueryList.addEventListener === 'function') {
    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  } else {
    mediaQueryList.addListener(listener);
    return () => mediaQueryList.removeListener(listener);
  }
}

function unsubscribeFromMediaQuery(
  query: QueryObject | MediaQuery | CompoundMediaQuery,
  listener: (ev: MediaQueryListEvent) => void
) {
  const mediaQueryList = getOrCreateMediaQueryList(query);

  if (typeof mediaQueryList.addEventListener === 'function') {
    mediaQueryList.removeEventListener('change', listener);
  } else {
    mediaQueryList.removeListener(listener);
  }
}

function useMediaQuery(
  query: QueryObject | MediaQuery | CompoundMediaQuery,
  initialState = false
) {
  const [matches, setMatches] = React.useState(initialState);

  React.useEffect(() => {
    setMatches(getDoesMediaQueryMatch(query));

    let isMounted = true;
    const unsubscribe = subscribeToMediaQuery(query, ev => {
      if (!isMounted) return;
      setMatches(ev.matches);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return matches;
}

function getDoesMediaQueryMatch(
  query: QueryObject | MediaQuery | CompoundMediaQuery
) {
  const mediaQueryList = getOrCreateMediaQueryList(query);
  return mediaQueryList.matches;
}

const queryCache: { [key: string]: MediaQuery | CompoundMediaQuery } = {};

// All of these overloads are just to improve autocomplete, otherwise
// theres no autocomplete for object literals.

type UnwrapQueryList<Q extends (QueryObject | MediaQuery)[]> = {
  [K in keyof Q]: Q[K] extends MediaQuery<infer IQ> ? IQ : Q[K];
};

export function remedia<Q extends QueryObject>(
  query: Readonly<Q>
): MediaQuery<Q>;
export function remedia<Q0 extends QueryObject, Q1 extends QueryObject>(
  query0: Readonly<Q0>,
  query1: Readonly<Q1>
): CompoundMediaQuery<[Q0, Q1]>;
export function remedia<
  Q0 extends QueryObject,
  Q1 extends QueryObject,
  Q2 extends QueryObject
>(
  query0: Readonly<Q0>,
  query1: Readonly<Q1>,
  query2: Readonly<Q2>
): CompoundMediaQuery<[Q0, Q1, Q2]>;
export function remedia<
  Q0 extends QueryObject,
  Q1 extends QueryObject,
  Q2 extends QueryObject,
  Q3 extends QueryObject
>(
  query0: Readonly<Q0>,
  query1: Readonly<Q1>,
  query2: Readonly<Q2>,
  query3: Readonly<Q3>
): CompoundMediaQuery<[Q0, Q1, Q2, Q3]>;
export function remedia<
  Q0 extends QueryObject,
  Q1 extends QueryObject,
  Q2 extends QueryObject,
  Q3 extends QueryObject,
  Q4 extends QueryObject
>(
  query0: Readonly<Q0>,
  query1: Readonly<Q1>,
  query2: Readonly<Q2>,
  query3: Readonly<Q3>,
  query4: Readonly<Q4>
): CompoundMediaQuery<[Q0, Q1, Q2, Q3, Q4]>;
export function remedia<Q extends (QueryObject | MediaQuery)[]>(
  ...query: Readonly<Q>
): Q extends { length: 1 }
  ? Q[0] extends MediaQuery
    ? Q[0]
    : MediaQuery<Q[0]>
  : CompoundMediaQuery<UnwrapQueryList<Q>>;
export function remedia<Q extends (QueryObject | MediaQuery)[]>(...query: Q) {
  const newQuery =
    query.length === 1
      ? query[0] instanceof MediaQuery
        ? query[0]
        : new MediaQuery({ ...query[0] })
      : new CompoundMediaQuery(...query);

  const cacheKey = newQuery.toString();

  if (!queryCache[cacheKey]) {
    queryCache[cacheKey] = newQuery;
  }

  return queryCache[cacheKey] as Q extends { length: 1 }
    ? Q[0] extends MediaQuery
      ? Q[0]
      : MediaQuery<Q[0]>
    : CompoundMediaQuery<Q>;
}

export default remedia;
