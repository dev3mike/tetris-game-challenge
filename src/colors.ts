export function rgb(r: number, g: number, b: number): string {
  return `rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)}`;
}

export function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${a.toFixed(3)}`;
}

export function hsl(h: number, s: number, l: number): string {
  return `hsl(${h.toFixed(0)},${(s * 100).toFixed(0)}%,${(l * 100).toFixed(
    0
  )}%)`;
}

export function hsla(h: number, s: number, l: number, a: number): string {
  return `hsl(${h.toFixed(0)},${(s * 100).toFixed(0)}%,${(l * 100).toFixed(
    0
  )}%,${a.toFixed(3)})`;
}
