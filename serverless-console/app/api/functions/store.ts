export type FunctionRow = {
  functionId: string;
  name: string;
  runtime: string;
  latestVersion: number;
  code: string;
  createdAt: string;
  updatedAt: string;
};

type GlobalStore = typeof globalThis & {
  __fnStore?: FunctionRow[];
  __fnNextId?: number;
};

const g = globalThis as GlobalStore;

function ensureState() {
  const seed = () => {
    const now = Date.now();
    return [
      {
        functionId: "1",
        name: "hello_function",
        runtime: "node18",
        latestVersion: 1,
        code: `exports.handler = async (event) => {
  const name = event?.name ?? "world";
  return { message: "Hello " + name };
};`,
        createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 30).toISOString(),
      },
      {
        functionId: "2",
        name: "image-resize",
        runtime: "python3.10",
        latestVersion: 2,
        code: `def handler(event):
    url = event.get("url")
    return {"status": "processed", "url": url}`,
        createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        functionId: "3",
        name: "data-validator",
        runtime: "python3.11",
        latestVersion: 3,
        code: `def handler(event):
    return {"valid": True, "input": event}`,
        createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      },
    ];
  };

  if (!Array.isArray(g.__fnStore)) {
    g.__fnStore = seed();
  }
  if (Array.isArray(g.__fnStore) && g.__fnStore.length === 0) {
    g.__fnStore = seed();
  }
  if (
    typeof g.__fnNextId !== "number" ||
    Number.isNaN(g.__fnNextId) ||
    g.__fnNextId < 1
  ) {
    const maxId = Math.max(0, ...(g.__fnStore || []).map((f) => Number(f.functionId) || 0));
    g.__fnNextId = maxId + 1;
  }
}

export function getStore(): FunctionRow[] {
  ensureState();
  return g.__fnStore!;
}

export function allocId(): string {
  ensureState();
  const id = g.__fnNextId!;
  g.__fnNextId = id + 1;
  return String(id);
}

export function resetStore() {
  g.__fnStore = [];
  g.__fnNextId = 1;
}

export function removeById(id: string): boolean {
  ensureState();
  const before = g.__fnStore!.length;
  g.__fnStore = g.__fnStore!.filter((f) => f.functionId !== id);
  const removed = before - g.__fnStore!.length;
  return removed > 0;
}
