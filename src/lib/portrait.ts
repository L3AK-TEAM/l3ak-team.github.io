// Build-time portraits for the team page. A photo is shown as itself;
// anyone without one gets OpenSSH's randomart of their handle. Both fill
// the same square field, framed by the same box, so the roster reads as
// one kind of output.
import { createHash } from "node:crypto";

export const FIELD_H = 4;
/** JetBrains Mono's 0.6em cells against the page's 1.6 line-height: as
 *  many whole cells across as come closest to FIELD_H lines tall. */
export const FIELD_W = Math.round((FIELD_H * 1.6) / 0.6);

/* ------------------------------------------------------------- randomart */

const SYMBOLS = " .o+=*BOX@%&#/^";

/**
 * OpenSSH's "drunken bishop" (sshkey.c, fingerprint_randomart) walked over
 * the MD5 of a handle, as ssh-keygen did before OpenSSH 6.8: half SHA-256's
 * steps, which keeps the small field from filling up. Same symbols and S/E
 * markers as `ssh-keygen -lv` on a smaller field, so it is stable per handle
 * and unique enough per team.
 */
export function randomart(handle: string): string[] {
  const digest = createHash("md5").update(handle).digest();
  const field = Array.from({ length: FIELD_W }, () => new Array<number>(FIELD_H).fill(0));
  let x = FIELD_W >> 1;
  let y = FIELD_H >> 1;
  const start = [x, y] as const;

  for (const byte of digest) {
    let b = byte;
    for (let i = 0; i < 4; i++) {
      x = Math.max(0, Math.min(FIELD_W - 1, x + (b & 1 ? 1 : -1)));
      y = Math.max(0, Math.min(FIELD_H - 1, y + (b & 2 ? 1 : -1)));
      field[x]![y]!++;
      b >>= 2;
    }
  }

  const top = SYMBOLS.length - 1;
  return Array.from({ length: FIELD_H }, (_, row) =>
    Array.from({ length: FIELD_W }, (_, col) => {
      if (col === start[0] && row === start[1]) return "S";
      if (col === x && row === y) return "E";
      return SYMBOLS[Math.min(field[col]![row]!, top)];
    }).join(""),
  );
}

/** `+---[title]---+`, centred the way ssh-keygen pads its key type. */
export function frameRule(title: string, width = FIELD_W): string {
  const label = title ? `[${title}]`.slice(0, width) : "";
  const left = Math.floor((width - label.length) / 2);
  return "+" + "-".repeat(left) + label + "-".repeat(width - left - label.length) + "+";
}
