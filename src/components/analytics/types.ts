export interface DashboardData {
  total_users: number;
  total_queries: number;
  velocity_count: number;
  bluepond_count: number;
  q_stats: {
    min_per_user: number;
    median_per_user: number;
    max_per_user: number;
    min_per_session: number;
    median_per_session: number;
    max_per_session: number;
  };
  overall_accuracy: { label: string; value: number }[];
  response_time: {
    median: number;
    per_user: { min: number; median: number; max: number };
    per_session: { min: number; median: number; max: number };
  };
  time_series: { date: string; count: number }[];
  queries_per_user: { user: string; count: number }[];
  latency_buckets: Record<string, number>;
  word_count_buckets: Record<string, number>;
  user_accuracy: { user: string; like: number; dislike: number }[];
  cost_stats: { count?: number; min?: string; avg?: string; median?: string; max?: string; total?: string };
  cost_per_user: { min?: string; median?: string; max?: string };
  cost_per_session: { min?: string; median?: string; max?: string };
  sense_dev: Record<string, SenseDevUser>;
}

export interface SenseDevUser {
  "0-5s"?: QueryItem[];
  "5-10s"?: QueryItem[];
  "10-15s"?: QueryItem[];
  "15-20s"?: QueryItem[];
  "20s+"?: QueryItem[];
  empty?: QueryItem[];
  spend_vs_resp?: {
    spend_stats: { min: number; median: number; max: number };
    resp_len_stats: { min: number; median: number; max: number };
    sess_q_stats: { min: number; median: number; max: number };
    sess_plot: { session: string; full_session: string; count: number }[];
    raw: { spend_s: number; resp_len: number }[];
  };
}

export interface QueryItem {
  ref_id: string;
  query_id?: string;
  session_created?: string;
  elapsed_s?: number;
  query: string;
  response_data: string;
  rating?: "like" | "dislike" | null;
  comment?: string;
  meta_total?: Record<string, number>;
  module_outputs?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface FilterState {
  env: string;
  quickRange: string;
  startDate: string;
  endDate: string;
  tenants: string;
  users: string;
}
