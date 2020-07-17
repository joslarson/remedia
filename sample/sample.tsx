import remedia from 'remedia';

/* small phone portrait: *-320 */
const phoneSmallMax = remedia({ maxWidth: 320 });

/* tablet portrait: 569–768 */
const tabletMin = remedia({ minWidth: 569 });
const tabletMax = remedia({ maxWidth: 768 });

// compound query using OR and built from previous queries: 0-114 or 569-768
const narrowMainContent = remedia(phoneSmallMax, {
  ...tabletMax,
  ...tabletMin,
});
