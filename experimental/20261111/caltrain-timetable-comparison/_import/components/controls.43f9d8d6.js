const H = 34;
const STYLE = `
.fbar { display: grid; gap: 16px; margin: 20px 0 36px; }
.fbar .row { display: flex; flex-wrap: wrap; gap: 16px 24px; align-items: flex-end; }
.fbar .grp { display: grid; gap: 7px; }
.fbar .cap { font: 600 11px/1 var(--sans-serif); letter-spacing: .06em; text-transform: uppercase; color: var(--theme-foreground-muted); }
.seg { display: inline-flex; align-items: center; box-sizing: border-box; height: ${H}px; border: 1px solid var(--theme-foreground-faintest);
  border-radius: 8px; padding: 2px; gap: 2px; background: var(--theme-background-alt); }
.seg button { font: 500 13px/1 var(--sans-serif); color: var(--theme-foreground-muted); background: none; border: none;
  border-radius: 6px; height: 100%; padding: 0 14px; cursor: pointer; }
.seg button:hover { color: var(--theme-foreground); }
.seg button[aria-pressed="true"] { background: var(--theme-background); color: var(--theme-foreground);
  box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 0 0 1px var(--theme-foreground-faintest); }
.seg button:focus-visible, .fsel:focus-visible { outline: 2px solid var(--theme-foreground-focus); outline-offset: 1px; }
.seg .fsel { height: 100%; max-width: 13em; text-overflow: ellipsis; border: none; background-color: transparent; color: var(--theme-foreground-muted); border-radius: 6px; }
.seg .fsel.on { background-color: var(--theme-background); color: var(--theme-foreground);
  box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 0 0 1px var(--theme-foreground-faintest); }
.fsel { font: 500 13px/1 var(--sans-serif); color: var(--theme-foreground); box-sizing: border-box; height: ${H}px;
  border: 1px solid var(--theme-foreground-faintest); border-radius: 8px; padding: 0 30px 0 12px; cursor: pointer;
  appearance: none; background: var(--theme-background-alt) no-repeat right 10px center / 10px 6px
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23888' stroke-width='1.5'/%3E%3C/svg%3E"); }
.fpair { display: inline-flex; align-items: center; gap: 10px; font: 400 13px var(--sans-serif); color: var(--theme-foreground-muted); }
`;
export function filterBar(rows) {
  const bar = document.createElement("div");
  bar.className = "fbar";
  bar.innerHTML = `<style>${STYLE}</style>`;
  for (const groups of rows) {
    const row = document.createElement("div");
    row.className = "row";
    for (const [caption, control] of groups) {
      const g = document.createElement("div");
      g.className = "grp";
      const c = document.createElement("span");
      c.className = "cap";
      c.textContent = caption;
      g.append(c, control);
      row.append(g);
    }
    bar.append(row);
  }
  return bar;
}
export function segmented(options, { value = options[0], label = String, title, more = [], moreLabel = "Other" } = {}) {
  const el = document.createElement("div");
  el.className = "seg";
  el.setAttribute("role", "group");
  const pick = (o) => {
    if (el.value !== o) {
      set(o);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };
  const buttons = options.map((o) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label(o);
    if (title) b.title = title(o);
    b.addEventListener("click", () => pick(o));
    el.append(b);
    return b;
  });
  let dropdown = null;
  if (more.length) {
    dropdown = select([{ key: "", label: `${moreLabel}\u2026` }, ...more.map((o, i) => ({ key: String(i), label: (title ?? label)(o) }))], "", moreLabel);
    dropdown.addEventListener("input", (e) => {
      e.stopPropagation();
      if (dropdown.value !== "") pick(more[+dropdown.value]);
    });
    el.append(dropdown);
  }
  const set = (v) => {
    el.value = v;
    buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(options[i] === v)));
    if (dropdown) {
      const i = more.indexOf(v);
      dropdown.value = i < 0 ? "" : String(i);
      dropdown.classList.toggle("on", i >= 0);
      dropdown.options[0].textContent = `${moreLabel}\u2026`;
    }
  };
  set(value);
  return el;
}
export function select(options, value, ariaLabel) {
  const el = document.createElement("select");
  el.className = "fsel";
  el.ariaLabel = ariaLabel;
  for (const o of options) el.append(Object.assign(document.createElement("option"), { value: o.key, textContent: o.label }));
  el.value = value;
  return el;
}
export function pair(a, b, between = "to") {
  const el = document.createElement("div");
  el.className = "fpair";
  const w = document.createElement("span");
  w.textContent = between;
  el.append(a, w, b);
  return el;
}
