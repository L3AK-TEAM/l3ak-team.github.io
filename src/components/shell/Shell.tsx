import React, { useEffect, useMemo, useRef, useState } from "react";
import { createCommands } from "./commands";
import type { Writeup } from "../../lib/writeups";
import { Prompt } from "./Prompt";
import Banner from "./Banner";
import { Command } from "./Log";

const prefersReduced = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

interface ShellProps {
  writeups: Writeup[];
}

export default function Shell({ writeups }: ShellProps) {
  const commands = useMemo(() => createCommands(writeups), [writeups]);

  const commandId = useRef(0);
  const [scrollback, setScrollback] = useState<{ id: number; node: React.ReactNode }[]>(
    // Lazily: the initializer bumps the id counter, and a bare argument would
    // run it on every render.
    () => [{ id: ++commandId.current, node: <Banner /> }],
  );
  /** Every line submitted, oldest first; the prompt walks it with the arrows. */
  const [history, setHistory] = useState<string[]>([]);

  /** The terminal is revealed once boot starts; the prompt once it finishes. */
  const [booted, setBooted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------ transcript */

  /** Appends blocks and returns the ids they were given. */
  function print(blocks: React.ReactNode[], wipe = false) {
    const added = blocks.map((b) => ({ id: ++commandId.current, node: b }));
    setScrollback((prev) => (wipe ? [] : prev).concat(added));
  }

  function system(command: string): React.ReactNode[] {
    const line = command.trim();
    if (!line) return [];

    // Accept the piped form from the boot sequence: "ls -lt writeups/ | head -4"
    const [first, ...rest] = line.split("|").map((s) => s.trim());
    const parts = first!.split(/\s+/);
    const name = parts[0]!.toLowerCase();
    const args = parts.slice(1);
    const pipeArgs = rest.length ? rest.join(" ").split(/\s+/) : [];

    if (name === "clear") {
      setScrollback([]);
      return [];
    }

    const callback = commands[name];
    if (!callback) {
      return [<div className="out reveal">l3sh: command not found: {name}. try <b>help</b></div>]
    } else {
      return [...callback(args.concat(pipeArgs))];
    }
  }

  const scrollToBottom = () =>
    requestAnimationFrame(() =>
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: prefersReduced() ? "auto" : "smooth",
      }),
    );

  useEffect(() => {
    document.getElementById("fallback")?.remove();
    setBooted(true);
  }, []);

  // The prompt cannot focus itself on mount: the terminal is still `hidden` at
  // that point, and focus() on a display:none element is a no-op. Focus once
  // the unhide has been committed instead.
  useEffect(() => {
    if (booted) inputRef.current?.focus({ preventScroll: true });
  }, [booted]);

  /* --------------------------------------------------------------- handlers */

  function handleSubmit(line: string) {
    const entry = line.trim();
    if (entry) setHistory((prev) => [...prev, entry]);

    print([<Command>{line}</Command>]);
    print(system(line));
    scrollToBottom();
  }

  // Clicking anywhere on the transcript focuses the prompt, the way a terminal
  // emulator does. Text selection and links keep working.
  function handleMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a, button")) return;
    if (!getSelection()?.isCollapsed) return;
    setTimeout(() => {
      if (getSelection()?.isCollapsed) {
        inputRef.current?.focus({ preventScroll: true });
      }
    }, 0);
  }

  return (
    <main className="term" id="term" hidden={!booted} onMouseDown={handleMouseDown}>
      <div id="log" role="log" aria-live="polite" aria-label="Terminal output">
        {scrollback.map((e) => (<React.Fragment key={e.id}>{e.node}</React.Fragment>))}
      </div>

      <Prompt
        inputRef={inputRef}
        history={history}
        onSubmit={handleSubmit}
        onClear={() => print([], true)}
      />
    </main>
  );
}
