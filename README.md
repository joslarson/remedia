# Remedia

A remedy for media queries in React.

Remedia provides an API for Media Queries that treats JavaScript and React as a first class citizens with CSS. Rather than being defined as strings, Media Queries are defined as `MediaQuery` objects that can later be combined to make new Media Queries or who's values can be referenced in other contexts.

Remedia is written in TypeScript providing a type safe API and a great developer experience. It makes use of generics and literal types to make it easy to inspect a query's underlying data just by looking at its type information:

![type information](https://github.com/joslarson/remedia/raw/master/docs/type-information.png)

## Installation

```
npm install remedia
```

## Usage

### 1. Create a `MediaQuery` instance

```js
import remedia from 'remedia';

const phoneLargeMin = remedia({ minWidth: 321 });
```

### 2. Use a `MediaQuery` in CSS

```ts
const style = css`
  font-size: 12px;

  @media ${phoneLargeMin} {
    font-size: 16px;
  }
`;
```

> `MediaQuery` instances become actual media query strings when they are interpolated, which calls the `toString()` method underneath

### 3. Subscribe to a `MediaQuery` in React with the `use` method hook

```tsx
const MyComponent: React.FC = () => {
  // `use` method defaults to false
  const matchesPhoneLargeMin = phoneLargeMin.use()
  // but you can pass true to default to true
  const matchesPhoneLargeMax = phoneLargeMin.use(true)
  ...
}
```

### 4. Build new queries from existing ones

```tsx
const tabletLandscapeMin = remedia({ minWidth: 769 });
const tabletLandscapeMax = remedia({ maxWidth: 1024 });

const tabletLandscapeRange = remedia({
  ...tabletLandscapeMin,
  ...tabletLandscapeMax,
});
```

### 5. "OR" multiple queries together

If you need to **OR** multiple queries together, just pass multiple queries into remedia.

```tsx
/* small phone portrait: *-320 */
export const phoneSmallMax = remedia({ maxWidth: 320 });

/* tablet portrait: 569–768 */
export const tabletMin = remedia({ minWidth: 569 });
export const tabletMax = remedia({ maxWidth: 768 });

// compound query using OR and built from previous queries: 0-114 or 569-768
export const narrowMainContent = remedia(phoneSmallMax, {
  ...tabletMax,
  ...tabletMin,
});
```

## Prior art and attribution

In the process of building this library I was inspired by and borrowed ideas & code from [@jaredpalmer](https://github.com/jaredpalmer)'s [`useMedia`](https://github.com/jaredpalmer/the-platform/blob/master/src/useMedia.tsx) hook.

This library also includes a forked and modified version of the great [`json2mq`](https://github.com/akiran/json2mq) library by [@kiran](https://github.com/akiran).
