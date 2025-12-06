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
  if (!Array.isArray(g.__fnStore)) {
    g.__fnStore = [];
  }
  if (Array.isArray(g.__fnStore) && g.__fnStore.length === 0) {
    g.__fnStore = [];
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
