import { defineCollection } from "astro:content";
import {z} from "astro/zod";
import { glob } from "astro/loaders";

/** `<year>/<slug>/index.md`, relative to the collection base. */
const SHARDED = /^(\d{4})\/([^/]+)\/index\.md$/;

const writeups = defineCollection({
  // Matched wider than `SHARDED` on purpose: a writeup filed in the wrong shape
  // should fail the build rather than be silently left out of the site.
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/writeups",
    generateId: ({ entry }) => {
      const match = SHARDED.exec(entry);
      if (!match) {
        throw new Error(
          `Writeup '${entry}' is not in a year shard. Move it to ` +
            `src/content/writeups/<year>/<slug>/index.md, and put its images ` +
            `in that same directory.`,
        );
      }
      return match[2]!;
    },
  }),
  schema: z.object({
    /** Handle of the member who wrote it, the owner column in `ls`. */
    author: z.string(),
    cat: z.string(),
    date: z.coerce.date(),
    title: z.string(),
    event: z.string(),
    chal: z.string(),
    blurb: z.string(),
  }),
});

export const collections = { writeups };
