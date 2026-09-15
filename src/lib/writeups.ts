import { getCollection } from "astro:content";

export interface Writeup {
  /** The writeup's directory name, shown by `ls` and what `cat` matches on. */
  slug: string;
  /** Handle of the member who wrote it, the owner column in `ls`. */
  author: string;
  cat: string;
  /** `YYYY-MM-DD`. */
  date: string;
  title: string;
  event: string;
  chal: string;
  /** Path on this site, derived from the slug. The year shard is not in it. */
  url: string;
  blurb: string;
}

/** Every writeup, newest first. */
export async function listWriteups(): Promise<Writeup[]> {
  const entries = await getCollection("writeups");
  return entries
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((entry) => ({
      ...entry.data,
      slug: entry.id,
      date: entry.data.date.toISOString().slice(0, 10),
      url: `/writeups/${entry.id}/`,
    }));
}
