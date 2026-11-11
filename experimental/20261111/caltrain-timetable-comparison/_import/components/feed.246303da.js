import * as d3 from "../../_npm/d3@7.9.2/172963d6.js";
export const ROUTES = ["Local Weekday", "Local Weekend", "Limited", "Express"];
export const ROUTE_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];
export const dirName = (d) => d === 0 ? "northbound" : "southbound";
export const shortStationName = (name) => name.replace(/ Caltrain( Station)?$/, "").replace(/ Station$/, "");
export function distinctTripCounter(stopsOf) {
  return (ts) => new Set(ts.map((t) => {
    const st = stopsOf.get(t.trip_id);
    return `${d3.min(st, (r) => r.sched_s)}-${d3.max(st, (r) => r.sched_s)}`;
  })).size;
}
export function routeKm(shapeStations) {
  const byShape = d3.group(shapeStations, (r) => r.shape_id);
  const refShape = d3.greatest([...byShape.entries()].filter(([, rs]) => rs.some((r) => r.station_id === "san_francisco") && rs.some((r) => r.station_id === "tamien")), ([, rs]) => rs.length)[1];
  const sfS = refShape.find((r) => r.station_id === "san_francisco").s_m;
  return { refShape, kmFromSF: new Map(refShape.map((r) => [r.station_id, Math.abs(r.s_m - sfS) / 1e3])) };
}
