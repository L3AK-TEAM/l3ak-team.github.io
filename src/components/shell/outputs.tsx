import type { Writeup } from "../../lib/writeups";
import { MEMBERS } from "../../data/members";

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

/** 2024-04-21 -> "Apr 21 2024", the column `ls -l` prints for older files. */
function lsDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)} ${y}`;
}

/** `ls -lt writeups/` — one row per file, in the column order `ls -l` uses. */
export function FileList({ files }: { files: Writeup[] }) {
  return (
    <div className="files reveal">
      {files.map((w) => (
        <a className="file" key={w.slug} href={w.url}>
          <span className="perms">-rw-r--r--</span>
          <span className="author">{w.author}</span>
          <span className="date">{lsDate(w.date)}</span>
          <span className="name">{w.slug}.md</span>
          <span className="title">{w.title}</span>
          <span className="tags">{w.cat.split(/,\s*/).join(" ")}</span>
        </a>
      ))}
    </div>
  );
}

/** `members` — two columns of handle/role. */
export function Roster() {
  return (
    <div className="roster reveal">
      {MEMBERS.map((m) => (
        <span className="who" key={m.handle}>
          <span className="h">{m.handle}</span>
          <span className="r">{m.role}</span>
        </span>
      ))}
    </div>
  );
}

