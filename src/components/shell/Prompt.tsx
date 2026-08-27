import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { PS1 } from "./PS1";

interface Props {
  inputRef: RefObject<HTMLInputElement | null>;
  /** Lines submitted so far, oldest first. The shell owns the session record. */
  history: string[];
  /** Echoes the line and runs it. */
  onSubmit(line: string): void;
  onClear(): void;
}

export function Prompt({ inputRef, history, onSubmit, onClear }: Props) {
  // The line being typed. A recalled entry is shown in its place and is never
  // written to, so stepping back off the end of the history restores the draft.
  const [draft, setDraft] = useState("");
  // Where the arrows are in `history`, or null while the draft is on screen.
  // It cannot dangle: history only ever grows, and submitting resets this.
  const [index, setIndex] = useState<number | null>(null);
  const value = index === null ? draft : (history[index] ?? "");

  const caretRef = useRef<HTMLSpanElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);

  // The mirror holds the same text with the same font, so its width is where
  // the caret belongs.
  useLayoutEffect(() => {
    const caret = caretRef.current;
    const mirror = mirrorRef.current;
    const input = inputRef.current;
    if (!caret || !mirror || !input) return;
    const w = Math.min(mirror.offsetWidth, input.clientWidth - 2);
    caret.style.transform = `translateX(${Math.max(0, w)}px)`;
  }, [value, inputRef]);

  /** Walks the history: -1 toward older entries, +1 toward newer. */
  function recall(delta: -1 | 1) {
    if (!history.length) return;
    setIndex((prev) => {
      // Only Up enters the history; nothing is newer than the draft.
      if (prev === null) return delta === 1 ? null : history.length - 1;
      // Walking past the newest entry lands back on the draft.
      const next = prev + delta;
      return next >= history.length ? null : Math.max(0, next);
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Editing a recalled entry hands over a copy and leaves the history, the
    // way readline does — the entry itself stays as it was submitted.
    setIndex(null);
    setDraft(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      onSubmit(value);
      setDraft("");
      setIndex(null);
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      // Otherwise the caret jumps to the ends of the line the browser shows.
      e.preventDefault();
      recall(e.key === "ArrowUp" ? -1 : 1);
      return;
    }

    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      onClear();
    }
  }

  return (
    <div className="prompt">
      <PS1 />
      <label className="field" htmlFor="input">
        <span className="skip">Type a command</span>
        <input
          id="input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
        />
        <span className="caret" ref={caretRef} aria-hidden="true" />
        <span id="mirror" ref={mirrorRef} aria-hidden="true">
          {value}
        </span>
      </label>
    </div>
  );
}
