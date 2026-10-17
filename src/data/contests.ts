// CTFTime results, from the snapshot `npm run contests` writes.
import snapshot from "./contests.json";

export interface Result {
  place: number;
  name: string;
  eventId: number;
  rating: number;
}

export interface Season {
  year: number;
  /** Overall CTFTime rank that year. */
  rank: number | null;
  points: number | null;
  /** Newest first, as CTFTime lists them. */
  results: Result[];
}

export const TEAM_URL = `https://ctftime.org/team/${snapshot.teamId}`;
export const FETCHED: string = snapshot.fetched;
export const SEASONS: Season[] = snapshot.years;

export const eventUrl = (id: number) => `https://ctftime.org/event/${id}`;

export const ALL_RESULTS = SEASONS.flatMap((s) => s.results);

export interface Tally {
  first: number;
  second: number;
  third: number;
  top10: number;
  played: number;
}

export const tally = (results: Result[]): Tally => ({
  first: results.filter((r) => r.place === 1).length,
  second: results.filter((r) => r.place === 2).length,
  third: results.filter((r) => r.place === 3).length,
  top10: results.filter((r) => r.place <= 10).length,
  played: results.length,
});

export const TOTAL = tally(ALL_RESULTS);

/** Best overall CTFTime rank across all seasons. */
export const BEST_RANK = Math.min(
  ...SEASONS.flatMap((s) => (s.rank === null ? [] : [s.rank])),
);
