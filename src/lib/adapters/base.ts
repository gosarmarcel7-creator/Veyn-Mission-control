import type { AuthType, ProviderConnection, AgentEvent } from "../types";

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export interface ExternalAgent {
  id: string;
  name: string;
  model?: string;
  status?: string;
}

export interface ExternalRun {
  id: string;
  status: string;
  startedAt: string;
}

export interface ProviderAdapter {
  id: string;
  name: string;
  authTypes: AuthType[];
  testConnection(connection: ProviderConnection): Promise<ConnectionTestResult>;
  listAgents?(connection: ProviderConnection): Promise<ExternalAgent[]>;
  listRuns?(connection: ProviderConnection): Promise<ExternalRun[]>;
  normalizeEvent(raw: unknown): AgentEvent;
}
