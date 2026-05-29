import { randomUUID } from "crypto";
import { buildAgentFromUpsert, type UpsertAgentFromEventInput } from "./agent-upsert";
import { localDb } from "./local-db";
import { mockDb } from "./mock-db";
import { getSupabaseServerClient } from "./supabase-server";
import { decryptSecret } from "./secrets";
import { LOCAL_DB_ENABLED, WORKSPACE_ID } from "./env";
import type { Agent, AgentEvent, ProviderConnection, Run, Task } from "./types";
import type { ExternalAgent } from "./adapters/base";

function nowIso() {
  return new Date().toISOString();
}

function fromAgentRow(row: Record<string, unknown>): Agent {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    providerConnectionId: row.provider_connection_id ? String(row.provider_connection_id) : undefined,
    name: String(row.name),
    role: String(row.role) as Agent["role"],
    model: String(row.model) as Agent["model"],
    provider: String(row.provider) as Agent["provider"],
    status: String(row.status) as Agent["status"],
    currentTask: row.current_task ? String(row.current_task) : undefined,
    currentTool: row.current_tool ? String(row.current_tool) : undefined,
    zone: String(row.zone) as Agent["zone"],
    progress: Number(row.progress ?? 0),
    tokensUsed: Number(row.tokens_used ?? 0),
    costUsd: Number(row.cost_usd ?? 0),
    lastEventAt: String(row.last_event_at ?? nowIso()),
    position: {
      x: Number(row.position_x ?? 0),
      y: Number(row.position_y ?? 0),
      z: Number(row.position_z ?? 0),
    },
  };
}

function fromTaskRow(row: Record<string, unknown>): Task {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    status: String(row.status) as Task["status"],
    assignedAgentIds: Array.isArray(row.assigned_agent_ids) ? (row.assigned_agent_ids as string[]) : [],
    priority: String(row.priority) as Task["priority"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function fromRunRow(row: Record<string, unknown>): Run {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    title: String(row.title),
    status: String(row.status) as Run["status"],
    startedAt: String(row.started_at),
    endedAt: row.ended_at ? String(row.ended_at) : undefined,
    totalCostUsd: Number(row.total_cost_usd ?? 0),
    totalTokens: Number(row.total_tokens ?? 0),
    provider: String(row.provider) as Run["provider"],
  };
}

function fromEventRow(row: Record<string, unknown>): AgentEvent {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    runId: String(row.run_id),
    agentId: String(row.agent_id),
    provider: String(row.provider) as AgentEvent["provider"],
    eventType: String(row.event_type) as AgentEvent["eventType"],
    title: String(row.title),
    message: row.message ? String(row.message) : undefined,
    task: row.task ? String(row.task) : undefined,
    tool: row.tool ? String(row.tool) : undefined,
    inputSummary: row.input_summary ? String(row.input_summary) : undefined,
    outputSummary: row.output_summary ? String(row.output_summary) : undefined,
    metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
    timestamp: String(row.timestamp),
  };
}

function isLocalDbEnabled() {
  return LOCAL_DB_ENABLED && localDb.isEnabled();
}

function isMemoryDbEnabled() {
  const supabase = getSupabaseServerClient();
  return !supabase && !isLocalDbEnabled();
}

function fromConnectionRow(row: Record<string, unknown>): ProviderConnection {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    provider: String(row.provider) as ProviderConnection["provider"],
    authType: String(row.auth_type) as ProviderConnection["authType"],
    displayName: String(row.display_name),
    status: String(row.status) as ProviderConnection["status"],
    lastSyncedAt: row.last_synced_at ? String(row.last_synced_at) : undefined,
    encryptedSecretRef: row.encrypted_secret_ref ? String(row.encrypted_secret_ref) : undefined,
    metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
  };
}

export const dataStore = {
  workspaceId: WORKSPACE_ID,

  async getAgent(agentId: string) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.getAgent(agentId);
    if (!supabase) return mockDb.getAgent(agentId);

    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("workspace_id", WORKSPACE_ID)
      .eq("id", agentId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromAgentRow(data) : null;
  },

  async listAgents() {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.getAgents();
    if (!supabase) return mockDb.getAgents();

    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("workspace_id", WORKSPACE_ID)
      .order("last_event_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => fromAgentRow(row));
  },

  async upsertAgentFromEvent(input: UpsertAgentFromEventInput) {
    const agents = await this.listAgents();
    const existing = agents.find((a) => a.id === input.agentId) ?? null;
    const agent = buildAgentFromUpsert(input, existing, agents.length);

    if (existing) {
      return this.updateAgent(input.agentId, agent);
    }
    return this.createAgent(agent);
  },

  async upsertAgentsFromExternal(
    connection: ProviderConnection,
    externalAgents: ExternalAgent[]
  ) {
    const results: Agent[] = [];
    const agents = await this.listAgents();

    for (let i = 0; i < externalAgents.length; i++) {
      const ext = externalAgents[i];
      const existing = agents.find((a) => a.id === ext.id) ?? null;
      const agent = buildAgentFromUpsert(
        {
          agentId: ext.id,
          agentName: ext.name,
          model: "Custom",
          provider: connection.provider === "custom_webhook" ? "custom" : connection.provider,
          providerConnectionId: connection.id,
          status: (ext.status as Agent["status"]) ?? "idle",
        },
        existing,
        agents.length + i
      );
      if (existing) {
        const updated = await this.updateAgent(ext.id, agent);
        if (updated) results.push(updated);
      } else {
        const created = await this.createAgent(agent);
        results.push(created);
      }
    }

    await this.updateConnection(connection.id, {
      lastSyncedAt: nowIso(),
      status: "connected",
    });

    return results;
  },

  async createAgent(input: Agent) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.addAgent(input);
    if (!supabase) return mockDb.addAgent(input);

    const payload = {
      id: input.id,
      workspace_id: input.workspaceId,
      provider_connection_id: input.providerConnectionId ?? null,
      name: input.name,
      role: input.role,
      model: input.model,
      provider: input.provider,
      status: input.status,
      current_task: input.currentTask ?? null,
      current_tool: input.currentTool ?? null,
      zone: input.zone,
      progress: input.progress,
      tokens_used: input.tokensUsed,
      cost_usd: input.costUsd,
      last_event_at: input.lastEventAt,
      position_x: input.position.x,
      position_y: input.position.y,
      position_z: input.position.z,
    };

    const { data, error } = await supabase.from("agents").insert(payload).select("*").single();
    if (error) throw error;
    return fromAgentRow(data);
  },

  async updateAgent(agentId: string, updates: Partial<Agent>) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.updateAgent(agentId, updates);
    if (!supabase) return mockDb.updateAgent(agentId, updates);

    const patch: Record<string, unknown> = {
      last_event_at: nowIso(),
    };

    if (updates.providerConnectionId !== undefined) patch.provider_connection_id = updates.providerConnectionId ?? null;
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.role !== undefined) patch.role = updates.role;
    if (updates.model !== undefined) patch.model = updates.model;
    if (updates.provider !== undefined) patch.provider = updates.provider;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.currentTask !== undefined) patch.current_task = updates.currentTask ?? null;
    if (updates.currentTool !== undefined) patch.current_tool = updates.currentTool ?? null;
    if (updates.zone !== undefined) patch.zone = updates.zone;
    if (updates.progress !== undefined) patch.progress = updates.progress;
    if (updates.tokensUsed !== undefined) patch.tokens_used = updates.tokensUsed;
    if (updates.costUsd !== undefined) patch.cost_usd = updates.costUsd;
    if (updates.lastEventAt !== undefined) patch.last_event_at = updates.lastEventAt;
    if (updates.position !== undefined) {
      patch.position_x = updates.position.x;
      patch.position_y = updates.position.y;
      patch.position_z = updates.position.z;
    }

    const { data, error } = await supabase
      .from("agents")
      .update(patch)
      .eq("workspace_id", WORKSPACE_ID)
      .eq("id", agentId)
      .select("*")
      .single();
    if (error) return null;
    return fromAgentRow(data);
  },

  async listTasks() {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.getTasks();
    if (!supabase) return mockDb.getTasks();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", WORKSPACE_ID)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => fromTaskRow(row));
  },

  async createTask(input: Task) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.addTask(input);
    if (!supabase) return mockDb.addTask(input);

    const payload = {
      id: input.id,
      workspace_id: input.workspaceId,
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      assigned_agent_ids: input.assignedAgentIds,
      priority: input.priority,
      created_at: input.createdAt,
      updated_at: input.updatedAt,
    };

    const { data, error } = await supabase.from("tasks").insert(payload).select("*").single();
    if (error) throw error;
    return fromTaskRow(data);
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.updateTask(taskId, updates);
    if (!supabase) return mockDb.updateTask(taskId, updates);

    const patch: Record<string, unknown> = { updated_at: nowIso() };
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description ?? null;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.assignedAgentIds !== undefined) patch.assigned_agent_ids = updates.assignedAgentIds;
    if (updates.priority !== undefined) patch.priority = updates.priority;

    const { data, error } = await supabase
      .from("tasks")
      .update(patch)
      .eq("workspace_id", WORKSPACE_ID)
      .eq("id", taskId)
      .select("*")
      .single();
    if (error) return null;
    return fromTaskRow(data);
  },

  async listRuns() {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.getRuns();
    if (!supabase) return mockDb.getRuns();
    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .eq("workspace_id", WORKSPACE_ID)
      .order("started_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => fromRunRow(row));
  },

  async listEvents(filters?: { agentId?: string | null; provider?: string | null; runId?: string | null }) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) {
      return localDb
        .getEvents()
        .filter((event) => (filters?.agentId ? event.agentId === filters.agentId : true))
        .filter((event) => (filters?.provider ? event.provider === filters.provider : true))
        .filter((event) => (filters?.runId ? event.runId === filters.runId : true));
    }
    if (!supabase) {
      return mockDb
        .getEvents()
        .filter((event) => (filters?.agentId ? event.agentId === filters.agentId : true))
        .filter((event) => (filters?.provider ? event.provider === filters.provider : true))
        .filter((event) => (filters?.runId ? event.runId === filters.runId : true));
    }

    let query = supabase
      .from("events")
      .select("*")
      .eq("workspace_id", WORKSPACE_ID)
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (filters?.agentId) query = query.eq("agent_id", filters.agentId);
    if (filters?.provider) query = query.eq("provider", filters.provider);
    if (filters?.runId) query = query.eq("run_id", filters.runId);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => fromEventRow(row));
  },

  async addEvent(event: AgentEvent) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.addEvent(event);
    if (!supabase) return mockDb.addEvent(event);

    const payload = {
      id: event.id || `evt_${randomUUID()}`,
      workspace_id: event.workspaceId,
      run_id: event.runId,
      agent_id: event.agentId,
      provider: event.provider,
      event_type: event.eventType,
      title: event.title,
      message: event.message ?? null,
      task: event.task ?? null,
      tool: event.tool ?? null,
      input_summary: event.inputSummary ?? null,
      output_summary: event.outputSummary ?? null,
      metadata: event.metadata ?? null,
      timestamp: event.timestamp,
    };

    const { data, error } = await supabase.from("events").insert(payload).select("*").single();
    if (error) throw error;
    return fromEventRow(data);
  },

  async listConnections() {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.getConnections();
    if (!supabase) return mockDb.getConnections();
    const { data, error } = await supabase
      .from("provider_connections")
      .select("*")
      .eq("workspace_id", WORKSPACE_ID)
      .order("last_synced_at", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data ?? []).map((row) => fromConnectionRow(row));
  },

  async createConnection(input: ProviderConnection, plaintextSecret?: string) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.addConnection(input, plaintextSecret);
    if (!supabase) return mockDb.addConnection(input, plaintextSecret);

    const payload = {
      id: input.id,
      workspace_id: input.workspaceId,
      provider: input.provider,
      auth_type: input.authType,
      display_name: input.displayName,
      status: input.status,
      last_synced_at: input.lastSyncedAt ?? null,
      encrypted_secret_ref: input.encryptedSecretRef ?? null,
      metadata: input.metadata ?? null,
    };

    const { data, error } = await supabase
      .from("provider_connections")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return fromConnectionRow(data);
  },

  async updateConnection(connectionId: string, updates: Partial<ProviderConnection>) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.updateConnection(connectionId, updates);
    if (!supabase) return mockDb.updateConnection(connectionId, updates);

    const patch: Record<string, unknown> = {};
    if (updates.displayName !== undefined) patch.display_name = updates.displayName;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.lastSyncedAt !== undefined) patch.last_synced_at = updates.lastSyncedAt ?? null;
    if (updates.metadata !== undefined) patch.metadata = updates.metadata ?? null;

    const { data, error } = await supabase
      .from("provider_connections")
      .update(patch)
      .eq("workspace_id", WORKSPACE_ID)
      .eq("id", connectionId)
      .select("*")
      .single();
    if (error) return null;
    return fromConnectionRow(data);
  },

  async getConnectionSecret(connectionId: string): Promise<string | null> {
    const connections = await this.listConnections();
    const connection = connections.find((c) => c.id === connectionId);
    if (!connection) return null;

    if (isLocalDbEnabled()) return localDb.getConnectionSecret(connectionId);
    if (isMemoryDbEnabled()) return mockDb.getConnectionSecret(connectionId);

    const decrypted = decryptSecret(connection.encryptedSecretRef);
    return decrypted;
  },

  async deleteConnection(connectionId: string) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) {
      localDb.deleteConnection(connectionId);
      return;
    }
    if (!supabase) {
      mockDb.deleteConnection(connectionId);
      return;
    }

    const { error } = await supabase
      .from("provider_connections")
      .delete()
      .eq("workspace_id", WORKSPACE_ID)
      .eq("id", connectionId);
    if (error) throw error;
  },

  async getWebhookSecret(workspaceId: string, webhookId: string) {
    const supabase = getSupabaseServerClient();
    if (isLocalDbEnabled()) return localDb.getWebhookSecret(workspaceId, webhookId);
    if (!supabase) return mockDb.getWebhookSecret(workspaceId, webhookId);

    const { data, error } = await supabase
      .from("webhook_endpoints")
      .select("signing_secret")
      .eq("workspace_id", workspaceId)
      .eq("webhook_id", webhookId)
      .maybeSingle();

    if (error) throw error;
    return data?.signing_secret ?? "";
  },
};
