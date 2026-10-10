/** Highest first: the order the team page groups by. */
export const RANKS = ["admin", "grandmaster", "member"] as const;
export type Rank = (typeof RANKS)[number];

/** Rendered as plain-text labels, in this order, so no icon set is needed. */
export const LINK_KINDS = {
  github: "github",
} as const;
export type LinkKind = keyof typeof LINK_KINDS;

export interface Member {
  handle: string;
  rank: Rank;
  /** Categories they play, e.g. "crypto", "pwn". */
  focus: string[];
  /** Staff only: plain members are listed by handle and focus alone. */
  bio?: string;
  /** A file in src/assets/pfp/. Without one, the team page draws randomart. */
  pfp?: string;
  links: Partial<Record<LinkKind, string>>;
}

// TODO: links. Every href below is a placeholder.
export const MEMBERS: Member[] = [
  { handle: "Suvoni", rank: "admin", focus: ["crypto", "hardware"], bio: "Number theory detective and hardware aficionado. Reads textbooks for fun. Possibly the reincarnation of Shakespeare.", pfp: "suvoni.png", links: { github: "https://github.com/suvoni" } },
  { handle: "0x157", rank: "admin", focus: ["forensics", "misc"], bio: "Box inspector and BTLO enjoyer, forced to solve the sanity check every CTF.", links: { github: "https://github.com/0x157" } },
  { handle: "Matthias", rank: "admin", focus: ["crypto", "misc"], bio: "Solves just about anything. One weakness: installing sagemath.", links: { github: "https://github.com/0x-Matthias" } },
  { handle: "Atzr", rank: "admin", focus: ["pwn", "rev"], bio: "Full-stack in the literal sense: x86-TSO up through the VDOM. On the hunt for 100% stability in AFL.", pfp: "atzr.png", links: { github: "https://github.com/dylanmiddendorf" } },
  { handle: "OnyxCinder", rank: "admin", focus: ["osint"], bio: "Foo baron", pfp: "onyxcinder.png", links: {} },
  { handle: "Purple", rank: "admin", focus: ["osint"], bio: "FOO", pfp: "purple.png", links: {} },
  { handle: "S1mple", rank: "admin", focus: ["crypto", "web"], bio: "Crypto is the canvas, web is the stage.", links: { github: "https://github.com/Yazan03" } },

  { handle: "gromji", rank: "grandmaster", focus: ["crypto", "pwn", "rev", "blockchain"], bio: "Crypto, pwn, rev, blockchain. Name it, he can solve it.", links: {} },
  { handle: "rabbitsthecat", rank: "grandmaster", focus: ["crypto", "rev"], bio: "Smart contract hacker and competitive programmer. A cat that is also a rabbit, by quantum superposition.", links: { github: "https://github.com/kennyhow" } },
  { handle: "0xFr3nzy", rank: "member", focus: ["osint", "web"], links: {} },
  { handle: "__fastcall", rank: "member", focus: ["rev"], links: {} },
  { handle: "Andyrew", rank: "member", focus: ["crypto", "forensics", "rev"], links: {} },
  { handle: "aseng", rank: "member", focus: ["forensics", "rev"], links: {} },
  { handle: "nhoktiger12", rank: "member", focus: ["forensics"], links: {} },
  { handle: "modulefarmer", rank: "member", focus: ["forensics", "osint"], links: {} },
  { handle: "nullptr", rank: "member", focus: ["crypto"], links: {} },
  { handle: "xhalyl", rank: "member", focus: ["web"], links: {} },
  { handle: "0wl", rank: "member", focus: ["crypto", "osint", "rev"], links: {} },
  { handle: "0xhashiman", rank: "member", focus: ["blockchain", "crypto"], links: {} },
  { handle: "brew", rank: "member", focus: ["pwn", "rev"], links: {} },
  { handle: "CEA", rank: "member", focus: ["web"], links: {} },
  { handle: "d3cryptor.dll", rank: "member", focus: ["osint", "pwn"], links: {} },
  { handle: "daffainf", rank: "member", focus: ["crypto", "pwn", "rev", "web"], links: {} },
];

/** The one-word label the shell's `members` prints: staff by rank, everyone else by focus. */
export function roleLabel(m: Member): string {
  return m.rank === "member" ? m.focus.join(", ") : m.rank;
}

/** Links in `LINK_KINDS` order, dropping the ones a member has not set. */
export function memberLinks(m: Member): { kind: LinkKind; label: string; href: string }[] {
  return (Object.keys(LINK_KINDS) as LinkKind[]).flatMap((kind) =>
    m.links[kind] ? [{ kind, label: LINK_KINDS[kind], href: m.links[kind]! }] : [],
  );
}
