import React from "react";
import { PS1 } from "./PS1";

export function Command({ children }: { children: React.ReactNode }) {
  return (
    <div className="row reveal">
      <PS1 />
      <span style={{ color: "var(--fg)" }}>{children}</span>
    </div>
  )
}
