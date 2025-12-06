export type FunctionListItem = {
  functionId: string;
  name: string;
  runtime: string;
  latestVersion: number;
  updatedAt: string;
};

export type CreateFunctionPayload = {
  name: string;
  runtime: string;
  code: string;
};

export type ListFunctionsParams = {
  cursor?: string; // ISO datetime string
};

export type ListFunctionsResult = {
  items: FunctionListItem[];
  message?: string;
  // For backward compatibility with old pagination UI
  total?: number;
  page?: number;
  pageSize?: number;
};

export type DeleteFunctionParams = {
  functionId: number | string;
};

export type ExecutionRow = {
  executionId: string;
  version: number;
  status: "SUCCESS" | "ERROR" | "TIMEOUT" | "READY";
  durationMs: number;
  createdAt: string;
  input: Record<string, unknown> | null;
  output: unknown;
  errorMessage: string | null;
  cpuUsage?: number | null;
  memoryUsageMb?: number | null;
};

export type FunctionStats = {
  totalExecutions: number;
  successRate: number;
  avgDurationMs: number;
  errorRate: number;
  invocationsByVersion: Record<
    string,
    { count: number; successRate: number; avgDuration: number }
  >;
};

export type FunctionDetail = {
  functionId: string;
  name: string;
  runtime: string;
  latestVersion: number;
  code: string;
  createdAt: string;
  updatedAt: string;
  executions: ExecutionRow[];
  stats: FunctionStats;
};
