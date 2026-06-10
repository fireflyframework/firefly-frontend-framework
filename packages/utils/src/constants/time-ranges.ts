/**
 * Identifier of a time-range chip surfaced in dashboards toolbars.
 * Extend this union when adding new well-known windows; the
 * matching offset in milliseconds belongs in
 * {@link TIME_RANGE_OFFSETS_MS}.
 */
export type TimeRange = 'LAST_24H' | 'LAST_7D' | 'LAST_30D' | 'ALL';

/** Display label for a chip — short, lowercase, no period. */
export interface TimeRangeOption {
  readonly value: TimeRange;
  readonly label: string;
}

/**
 * Canonical chip order rendered left-to-right. The progression goes
 * from "tightest window" to "all history" — easier to scan.
 */
export const TIME_RANGE_OPTIONS: ReadonlyArray<TimeRangeOption> = [
  { value: 'LAST_24H', label: '24h' },
  { value: 'LAST_7D', label: '7d' },
  { value: 'LAST_30D', label: '30d' },
  { value: 'ALL', label: 'All' },
];

/**
 * Offset in milliseconds the page subtracts from `Date.now()` when
 * resolving a chip to a concrete `startedAfter`. `'ALL'` is absent
 * on purpose — the caller treats it as "no filter".
 */
export const TIME_RANGE_OFFSETS_MS: Readonly<Record<Exclude<TimeRange, 'ALL'>, number>> = {
  LAST_24H: 24 * 60 * 60 * 1000,
  LAST_7D: 7 * 24 * 60 * 60 * 1000,
  LAST_30D: 30 * 24 * 60 * 60 * 1000,
};
