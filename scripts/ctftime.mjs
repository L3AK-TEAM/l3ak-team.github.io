// Snapshot L3ak's CTFTime results into src/data/contests.json.
//
// The API has no per-team results endpoint, so this reads the team page.
// It runs by hand (`npm run contests`) rather than in CI: CTFTime sits behind
// Cloudflare, and a blocked fetch should not be able to break a deploy.
import { writeFile } from "node:fs/promises";

const TEAM_ID = 220336;
const PAGE = `https://ctftime.org/team/${TEAM_ID}`;
const OUT = new URL("../src/data/contests.json", import.meta.url);

const res = await fetch(PAGE, { headers: { "User-Agent": "l3ak.team results snapshot" } });
if (!res.ok) throw new Error(`${PAGE}: HTTP ${res.status}`);
const html = await res.text();

const text = (s) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const years = [];
for (const [, year, pane] of html.matchAll(
  /<div class="tab-pane[^"]*" id="rating_(\d{4})">([\s\S]*?)<\/table>/g,
)) {
  const rank = pane.match(/Overall rating place:\s*<b>\s*(\d+)/);
  const points = pane.match(/with <b>([\d.]+)<\/b> pts/);
  const results = [
    ...pane.matchAll(
      /<td class="place[^"]*">(\d+)<\/td><td><a href="\/event\/(\d+)">([\s\S]*?)<\/a><\/td><td>([\d.]+)<\/td><td>([\d.]+)<\/td>/g,
    ),
  ].map(([, place, eventId, name, , rating]) => ({
    place: Number(place),
    name: text(name),
    eventId: Number(eventId),
    rating: Number(rating),
  }));
  if (results.length === 0) continue;
  years.push({
    year: Number(year),
    rank: rank ? Number(rank[1]) : null,
    points: points ? Number(points[1]) : null,
    results,
  });
}

const organizedTable = html.match(/Organized CTF events<\/h3>([\s\S]*?)<\/table>/);
const organized = organizedTable
  ? [
      ...organizedTable[1].matchAll(
        /<a href="\/event\/(\d+)">([\s\S]*?)<\/a><\/td><td>([\d.]+)<\/td>/g,
      ),
    ].map(([, eventId, name, weight]) => ({
      name: text(name),
      eventId: Number(eventId),
      weight: Number(weight),
    }))
  : [];

if (years.length === 0) throw new Error("no results parsed; did the page layout change?");

const snapshot = { teamId: TEAM_ID, fetched: new Date().toISOString().slice(0, 10), years, organized };
await writeFile(OUT, JSON.stringify(snapshot, null, 2) + "\n");
console.log(
  `wrote ${years.reduce((n, y) => n + y.results.length, 0)} results over ${years.length} years, ${organized.length} organized`,
);
