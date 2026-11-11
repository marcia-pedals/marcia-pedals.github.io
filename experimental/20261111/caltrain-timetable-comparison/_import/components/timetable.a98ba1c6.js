const hm = (s) => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}`;
const sec = (s) => `:${String(Math.round(s) % 60).padStart(2, "0")}`;
const delta = (s) => s == null ? "" : `+${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
const STYLE = `
.tt { border-collapse: separate; border-spacing: 0; font-variant-numeric: tabular-nums; width: max-content; max-width: none; }
.tt th, .tt td { padding: 4px 14px; white-space: nowrap; border: none; }
.tt thead { position: sticky; top: 0; z-index: 3; }
.tt thead th { background: var(--theme-background); font: 600 11px/1.2 var(--sans-serif); letter-spacing: .06em;
  text-transform: uppercase; color: var(--theme-foreground-muted); text-align: right; }
.tt thead tr:first-child th { padding-top: 10px; }
.tt thead tr:last-child th { border-bottom: 1px solid var(--theme-foreground-faintest); padding-bottom: 6px; }
.tt thead th.trip { text-align: center; font: 600 15px/1 var(--sans-serif); letter-spacing: .01em; text-transform: none;
  color: var(--theme-foreground); }
.tt thead tr:first-child th:first-child { text-align: left; vertical-align: bottom; }
.tt th[scope="row"] { text-align: left; font: 500 13px var(--sans-serif); color: var(--theme-foreground);
  background: var(--theme-background); position: sticky; left: 0; z-index: 1; }
.tt .grp { border-left: 1px solid var(--theme-foreground-faintest); }
.tt td { font: 400 13.5px var(--sans-serif); font-variant-numeric: tabular-nums; text-align: right;
  color: color-mix(in srgb, var(--theme-foreground) 62%, var(--theme-background)); }
.tt td.rt { color: color-mix(in srgb, var(--theme-foreground) 85%, var(--theme-background)); }
.tt td.rt .sec { color: inherit; }
.tt tr.stop > * { padding-block: 6px; }
.tt tr.delta > *, .tt tr.delta > th[scope="row"] { background: var(--theme-background-alt); padding-block: 0; line-height: 18px; }
.tt tr.stop:hover > *, .tt tr.delta:hover > *, .tt tr.delta:hover > th[scope="row"] {
  background: color-mix(in srgb, var(--theme-foreground-focus) 10%, var(--theme-background)); }
.tt td.d { font-size: 12px; color: color-mix(in srgb, var(--theme-foreground) 45%, var(--theme-background)); }
.tt td.d.rt { color: color-mix(in srgb, var(--theme-foreground) 65%, var(--theme-background)); }
.tt td.pass { text-align: center; color: var(--theme-foreground-faint); font-family: var(--sans-serif); }
.tt .sec, .tt .na { color: var(--theme-foreground-faint); font-weight: 400; }
`;
export function timetableTable(rows, trips, stations) {
  const at = new Map(rows.map((r) => [`${r.trip_id}|${r.station_id}`, r]));
  const shown = stations.filter(([st]) => trips.some((t) => at.has(`${t}|${st}`)));
  const span = new Map(trips.map((t) => {
    const idx = shown.map(([st], i) => at.has(`${t}|${st}`) ? i : -1).filter((i) => i >= 0);
    return [t, [Math.min(...idx), Math.max(...idx)]];
  }));
  const esc = (x) => x.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const blank = (t, through) => {
    const [lo, hi] = span.get(t);
    return through(lo, hi) ? `<td class="pass grp" colspan="2">\u2502</td>` : `<td class="grp" colspan="2"></td>`;
  };
  const body = shown.map(([st, name], j) => {
    const cells = (f) => trips.map((t) => f(at.get(`${t}|${st}`), t)).join("");
    const delta_ = j === 0 ? "" : `<tr class="delta"><th scope="row"></th>${cells((r, t) => r ? `<td class="d grp">${delta(r.gtfs_delta_s)}</td><td class="d rt">${delta(r.rt_delta_s)}</td>` : blank(t, (lo, hi) => lo < j && j <= hi))}</tr>`;
    const stop = `<tr class="stop"><th scope="row">${esc(name)}</th>${cells((r, t) => r ? `<td class="grp">${hm(r.gtfs_s)}</td><td class="rt">${r.rt_s == null ? `<span class="na">\u2014</span>` : `${hm(r.rt_s)}<span class="sec">${sec(r.rt_s)}</span>`}</td>` : blank(t, (lo, hi) => lo < j && j < hi))}</tr>`;
    return delta_ + stop;
  }).join("");
  const el = document.createElement("div");
  el.innerHTML = `<style>${STYLE}</style><table class="tt">
    <thead>
      <tr><th rowspan="2" scope="col">Station</th>${trips.map((t) => `<th colspan="2" class="grp trip" scope="colgroup">${esc(t)}</th>`).join("")}</tr>
      <tr>${trips.map(() => `<th class="grp" scope="col">GTFS</th><th scope="col">GTFS-RT</th>`).join("")}</tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`;
  return el;
}
