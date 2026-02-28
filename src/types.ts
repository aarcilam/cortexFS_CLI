export interface CortexConfig {
  brainRoot: string | null;
}

export interface KnowledgeEntry {
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SessionState {
  summary: string;
  timestamp: string;
}
