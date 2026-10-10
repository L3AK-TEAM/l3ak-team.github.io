// Boxes the parts of a writeup a terminal can only show as graphics —
// images and display math — in the same `+--[label]--+` frame the team
// page's portraits use:
//
//   +--[flag.PNG 732x579]-----------------------------------+
//   (the image)
//   +-------------------------------------------------------+
//
// Code blocks are left alone: mdcat prints them as bare highlighted text.
// Runs before Astro's image pass, so an <img> src is still the path
// written in the Markdown, relative to the writeup.
import path from "node:path";
import sharp from "sharp";

// Longer than any frame gets; the CSS clips it to the frame's width.
const FILL = "-".repeat(400);

const el = (tagName, className, children, extra = {}) => ({
  type: "element",
  tagName,
  properties: { className: [className], ...extra },
  children,
});
const text = (value) => ({ type: "text", value });

/** One rule of a frame: `+--[label]----+`, or `+-------+` without a label. */
function rule(label) {
  return el("span", "rule", [
    text(label ? `+--[${label}]` : "+"),
    el("span", "fill", [text(FILL)]),
    text("+"),
  ], { ariaHidden: "true" });
}

/** Spans, not a <figure>, so a frame stays valid inside the <p> an image sits in. */
function frame(node, label, kind) {
  return el("span", "frame", [rule(label), node, rule()], { dataFrame: kind });
}

const hasClass = (node, name) => {
  const c = node.properties?.className;
  return Array.isArray(c) ? c.includes(name) : c === name;
};

export default function rehypeFrames() {
  return async (tree, file) => {
    const dir = path.dirname(file.path);
    const pending = [];

    (function walk(parent) {
      const kids = parent.children ?? [];
      for (let i = 0; i < kids.length; i++) {
        const node = kids[i];
        if (node.type !== "element") continue;

        if (hasClass(node, "katex-display")) {
          kids[i] = frame(node, "tex", "math");
        } else if (node.tagName === "img" && typeof node.properties?.src === "string") {
          const src = decodeURI(node.properties.src);
          const framed = frame(node, path.basename(src), "image");
          kids[i] = framed;
          // Label with the pixel size, the way an image viewer's title bar would.
          if (!/^[a-z]+:/i.test(src)) {
            pending.push(
              sharp(path.resolve(dir, src))
                .metadata()
                .then(({ width, height }) => {
                  framed.children[0] = rule(`${path.basename(src)} ${width}x${height}`);
                }),
            );
          }
        } else {
          walk(node);
        }
      }
      // A frame is a block of its own; the hard breaks that stacked images
      // in the source would only add blank lines between them.
      const blank = (n) => n?.type === "text" && !n.value.trim();
      const sibling = (i, step) => {
        while (blank(kids[i + step])) i += step;
        return kids[i + step];
      };
      parent.children = kids.filter(
        (n, i) =>
          !(n.type === "element" && n.tagName === "br" &&
            [sibling(i, -1), sibling(i, 1)].some((s) => s && hasClass(s, "frame"))),
      );
    })(tree);

    await Promise.all(pending);
  };
}
