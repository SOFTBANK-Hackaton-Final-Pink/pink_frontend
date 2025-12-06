import type {
  CreateFunctionPayload,
  FunctionListItem,
  ListFunctionsParams,
  ListFunctionsResult,
  DeleteFunctionParams,
  FunctionDetail,
} from "./types";

export type { ListFunctionsParams, CreateFunctionPayload, FunctionDetail } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

const handleJson = async <T>(res: Response) => {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Request failed (${res.status}): ${body || res.statusText}`);
  }
  return (await res.json()) as T;
};

export async function listFunctions(
  params: ListFunctionsParams,
): Promise<ListFunctionsResult> {
  const query = new URLSearchParams();
  if (params.cursor) query.set("cursor", params.cursor);

  const res = await fetch(`${API_BASE}/functions?${query.toString()}`, {
    cache: "no-store",
  });

  const json = await handleJson<{ data: FunctionListItem[]; message?: string }>(
    res,
  );

  const normalized: FunctionListItem[] = (json.data ?? [])
    .map((item) => {
      const rawId =
        (item as any).functionId ??
        (item as any).id ??
        (item as any).function_id;
      const parsedId = rawId == null ? "" : String(rawId).trim();
      return {
        functionId: parsedId,
        name: (item as any).name ?? "",
        runtime: (item as any).runtime ?? "",
        latestVersion: (item as any).latestVersion ?? 0,
        updatedAt: (item as any).updatedAt ?? "",
      };
    })
    .filter((item) => item.functionId !== "");

  return {
    items: normalized,
    message: json.message,
    // Backward compatibility for existing UI (page/pageSize/total)
    total: normalized.length,
    page: 1,
    pageSize: normalized.length,
  };
}

export async function createFunction(body: CreateFunctionPayload) {
  const res = await fetch(`${API_BASE}/functions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleJson(res);
}

export async function deleteFunction(functionId: DeleteFunctionParams["functionId"]) {
  const id = String(functionId ?? "").trim();
  if (!id) throw new Error("Invalid function id");
  const res = await fetch(`${API_BASE}/functions/${id}`, {
    method: "DELETE",
  });
  if (res.status === 404) {
    // treat missing as success for idempotency
    return { success: true, deleted: false };
  }
  return handleJson(res);
}

export async function getFunctionDetail(functionId: string): Promise<FunctionDetail> {
  const id = String(functionId ?? "").trim();
  if (!id) throw new Error("Invalid function id");
  const res = await fetch(`${API_BASE}/functions/${id}`, { cache: "no-store" });
  const json = await handleJson<{ data: FunctionDetail }>(res);
  return json.data;
}
