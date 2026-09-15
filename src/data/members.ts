export interface Member {
  handle: string;
  role: string;
  bio: string;
}

export const MEMBERS: Member[] = [
  { handle: "Suvoni", role: "captain", bio: "Number theory detective and hardware aficionado. Reads textbooks for fun. Possibly the reincarnation of Shakespeare." },
  { handle: "0x157", role: "admin", bio: "Box inspector and BTLO enjoyer, forced to solve the sanity check every CTF." },
  { handle: "Matthias", role: "admin", bio: "Solves just about anything. One weakness: installing sagemath." },
  { handle: "S1mple", role: "admin", bio: "Crypto is the canvas, web is the stage." },
  { handle: "gromji", role: "all-rounder", bio: "Crypto, pwn, rev, blockchain. Name it, he can solve it." },
  { handle: "rabbitsthecat", role: "crypto, rev", bio: "Smart contract hacker and competitive programmer. A cat that is also a rabbit, by quantum superposition." },
  { handle: "Atzr", role: "pwn, rev", bio:"Full-stack in the literal sense: Thumb-2 up to the VDOM. On the hunt for 100% stability in AFL."}
];
