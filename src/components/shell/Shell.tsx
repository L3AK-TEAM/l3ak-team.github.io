import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createCommands } from "./commands";
import type { Writeup } from "../../lib/writeups";
import { Prompt } from "./Prompt";
import Banner from "./Banner";
import { Command } from "./Log";
import { PS1 } from "./PS1";

const startupCommands = [
  { text: "whoami", characterDelay: 45, pauseAfter: 300 },
  { text: "ls", characterDelay: 60, pauseAfter: 200 },
];

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
  const [ready, setReady] = useState(false);
  const [startupText, setStartupText] = useState("");
  const startupIndex = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------ transcript */

  /** Appends blocks and returns the ids they were given. */
  const print = useCallback((blocks: React.ReactNode[], wipe = false) => {
    const added = blocks.map((b) => ({ id: ++commandId.current, node: b }));
    setScrollback((prev) => (wipe ? [] : prev).concat(added));
  }, []);

  const system = useCallback((command: string): React.ReactNode[] => {
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

    const callback = Object.hasOwn(commands, name) ? commands[name] : undefined;
    if (!callback) {
      return [<div className="out reveal">l3sh: command not found: {name}. try <b>help</b></div>]
    } else {
      return [...callback(args.concat(pipeArgs))];
    }
  }, [commands]);

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

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let finished = false;
    let character = 0;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function executeNext() {
      const command = startupCommands[startupIndex.current++];
      if (command) print([<Command>{command.text}</Command>, ...system(command.text)]);
    }

    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      while (startupIndex.current < startupCommands.length) executeNext();
      setStartupText("");
      setReady(true);
    }

    function typeNext() {
      const command = startupCommands[startupIndex.current];
      if (!command) return finish();
      setStartupText(command.text.slice(0, ++character));
      if (character < command.text.length) {
        timer = setTimeout(typeNext, command.characterDelay);
      } else {
        timer = setTimeout(() => {
          executeNext();
          setStartupText("");
          character = 0;
          timer = setTimeout(typeNext, command.pauseAfter);
        }, 200);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !finished) {
        event.preventDefault();
        finish();
      }
    }

    function handleSkip(event: MouseEvent) {
      if ((event.target as Element).closest('a[href="#input"]') && !finished) {
        event.preventDefault();
        finish();
      }
    }

    function handleMotionChange() {
      if (motion.matches) finish();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleSkip);
    motion.addEventListener("change", handleMotionChange);
    if (motion.matches || window.location.hash === "#input") finish();
    else timer = setTimeout(typeNext, 300);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleSkip);
      motion.removeEventListener("change", handleMotionChange);
    };
  }, [print, system]);

  // Focus only once the interactive prompt has been committed.
  useEffect(() => {
    if (booted && ready) inputRef.current?.focus({ preventScroll: true });
  }, [booted, ready]);

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

      {ready ? <Prompt
        inputRef={inputRef}
        history={history}
        onSubmit={handleSubmit}
        onClear={() => print([], true)}
      /> : <div className="prompt" aria-hidden="true">
        <PS1 />
        <span>{startupText}<span className="startup-cursor" /></span>
      </div>}
    </main>
  );
}
