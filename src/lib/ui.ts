const useColor = !process.env.NO_COLOR && process.stdout.isTTY;

const codes = {
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  reset: "\x1b[0m",
};

function wrap(code: string, s: string): string {
  if (!useColor) return s;
  return `${code}${s}${codes.reset}`;
}

export function bold(s: string): string {
  return wrap(codes.bold, s);
}

export function dim(s: string): string {
  return wrap(codes.dim, s);
}

export function cyan(s: string): string {
  return wrap(codes.cyan, s);
}

export function green(s: string): string {
  return wrap(codes.green, s);
}

export function divider(width: number = 60): string {
  return dim("─".repeat(width));
}

export function formatDate(d: Date | null | undefined): string {
  if (!d) return "(unknown)";
  return d.toLocaleString();
}
