import type { Writeup } from "../../lib/writeups";
import { MEMBERS } from "../../data/members";
import { FileList, Roster } from "./outputs";
import React from "react";

const HELP = [
  "  whoami           what this team is",
  "  ls writeups/     list published writeups, newest first",
  "  cat <name>       read a writeup summary and open it",
  "  members          the roster",
  "  cd <page>        go to team/, writeups/, or contests/",
  "  clear            wipe the screen",
].join("\n");

export const COMMAND_NAMES = [
  "help",
  "whoami",
  "ls",
  "cat",
  "members",
  "cd",
  "clear",
] as const;

/** Directories `cd` can enter, each one a page of the site. */
const PAGES: Record<string, string> = {
  "": "/",
  team: "/team/",
  writeups: "/writeups/",
  contests: "/contests/",
};

export type Commands = Record<string, (args: string[]) => React.ReactNode[]>;

export function createCommands(writeups: Writeup[]): Commands {
  return {
    help() {
      return [<div className="out reveal">available commands:</div>, <div className="out reveal">{HELP}</div>];
    },

    whoami() {
      return [
        <div className="out reveal">
          international ctf team of security researchers.
        </div>
      ];
    },

    ls(args) {
      const target = args.find((a) => !a.startsWith("-"));
      if (target && !/^writeups\/?$/.test(target)) {
        return [
          <div className="out reveal">
            ls: cannot access '{target}': no such directory. try{" "}
            <b>ls writeups/</b>
          </div>,
        ];
      }
      let files = writeups.slice();
      const headArg = args.find((a) => /^-?\d+$/.test(a.replace("head", "")));
      if (headArg) {
        files = files.slice(0, Math.abs(parseInt(headArg, 10)) || files.length);
      }
      return [<div className="out reveal">total {files.length}</div>, <FileList files={files} />];
    },

    cat(args) {
      const q = (args[0] ?? "")
        .replace(/^\.\//, "")
        .replace(/\.md$/, "")
        .toLowerCase();
      if (!q) {
        return [
          <div className="out reveal">
            cat: missing operand. try <b>cat {writeups[0]?.slug ?? "<name>"}</b>
          </div>,
        ];
      }
      const w = writeups.find(
        (x) =>
          x.slug.toLowerCase().includes(q) ||
          x.chal.toLowerCase().includes(q) ||
          x.event.toLowerCase().includes(q),
      );
      if (!w) {
        return [
          <div className="out reveal">
            cat: {q}: no such file. run <b>ls writeups/</b> for the list
          </div>,
        ];
      }
      return [
        <div className="out reveal">
          <b>{w.title}</b>
          {"\n"}
          {w.event} / {w.chal} / {w.cat} / {w.date}
          {"\n\n"}
          {w.blurb}
          {"\n\n"}
          <a href={w.url}>{w.url}</a>
        </div>,
      ];
    },

    cd(args) {
      const target = args[0] ?? "~";
      // "~", "/", "~/team", "./team/", "/team" all name the same places.
      const dir = target.replace(/^(~|\.)?\/*/, "").replace(/\/+$/, "").toLowerCase();
      const href = Object.hasOwn(PAGES, dir) ? PAGES[dir] : undefined;
      if (!href) {
        return [
          <div className="out reveal">
            cd: {target}:  No such file or directory
          </div>,
        ];
      }
      if (href !== location.pathname) location.assign(href);
      return [];
    },

    members() {
      return [
        <div className="out reveal">
          {MEMBERS.length} members.
        </div>,
        <Roster />,
      ];
    },
  };
}

export const COMPLETIONS: string[] = [...COMMAND_NAMES];
