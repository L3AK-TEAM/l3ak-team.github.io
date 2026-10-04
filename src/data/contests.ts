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
