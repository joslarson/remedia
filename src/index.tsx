import * as React from 'react';

import { json2mq } from './json2mq';
import { QueryObject } from './types';

export * from './types';

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

  use(initialState: boolean = false): boolean {
    return useMediaQuery(this, initialState);
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

  use(initialState: boolean = false): boolean {
    return useMediaQuery(this, initialState);
  }

  /**
   * This is a hack to make styled-component types happy to interpolate
   * instances of CompoundMediaQuery. It's not actually used for anything.
   */
  getName() {
    return 'CompoundMediaQuery';
  }
}

function useMediaQuery<Q extends CompoundMediaQuery>(
  query: Q,
  initialState?: boolean
): boolean;
function useMediaQuery<Q extends MediaQuery>(
  query: Q,
  initialState?: boolean
): boolean;
function useMediaQuery<Q extends QueryObject>(
  query: Readonly<Q>,
  initialState?: boolean
): boolean;
function useMediaQuery(
  query: QueryObject | MediaQuery | CompoundMediaQuery,
  initialState = false
) {
  const [matches, setMatches] = React.useState(initialState);
  const mediaQueryString =
    query instanceof MediaQuery || query instanceof CompoundMediaQuery
      ? query.toString()
      : remedia(query).toString();

  React.useEffect(() => {
    let isMounted = true;
    const mediaQueryList = window.matchMedia(mediaQueryString);
    const queryListener = () => {
      if (!isMounted) {
        return;
      }
      setMatches(mediaQueryList.matches);
    };
    mediaQueryList.addListener(queryListener);

    setMatches(mediaQueryList.matches);

    return () => {
      isMounted = false;
      mediaQueryList.removeListener(queryListener);
    };
  }, [mediaQueryString]);

  return matches;
}

const cache: { [key: string]: MediaQuery | CompoundMediaQuery } = {};

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

  if (!cache[cacheKey]) {
    cache[cacheKey] = newQuery;
  }

  return cache[cacheKey] as Q extends { length: 1 }
    ? Q[0] extends MediaQuery
      ? Q[0]
      : MediaQuery<Q[0]>
    : CompoundMediaQuery<Q>;
}

export default remedia;
