import { query } from "../index";

export type LearnerStatus = "not_started" | "in_progress" | "completed" | "needs_retry";

export interface ProgressInput {
  path: string;
  activity: string;
  status: LearnerStatus;
  score?: number | null;
  attempts?: number;
  lastPosition?: string | null;
}

export interface LearnerProgress {
  user: string;
  path: string;
  activity: string;
  status: LearnerStatus;
  score: number | null;
  attempts: number;
  lastPosition: string | null;
  completedAt: string | null;
}

export interface Credential {
  id: string;
  user: string;
  path: string;
  pathVersion: string;
  score: number | null;
  completedAt: string;
  issuedAt: string;
}

function mapProgress(raw: Record<string, unknown>): LearnerProgress {
  return {
    user: String(raw.user),
    path: String(raw.path),
    activity: String(raw.activity),
    status: raw.status as LearnerStatus,
    score: raw.score == null ? null : Number(raw.score),
    attempts: Number(raw.attempts ?? 0),
    lastPosition: raw.lastPosition == null ? null : String(raw.lastPosition),
    completedAt: raw.completedAt == null ? null : String(raw.completedAt),
  };
}

function mapCredential(raw: Record<string, unknown>): Credential {
  return {
    id: String(raw.id),
    user: String(raw.user),
    path: String(raw.path),
    pathVersion: String(raw.pathVersion),
    score: raw.score == null ? null : Number(raw.score),
    completedAt: String(raw.completedAt),
    issuedAt: String(raw.issuedAt),
  };
}

export const trainingRepository = {
  async upsertProgress(userId: string, input: ProgressInput): Promise<void> {
    await query(
      `UPSERT learner_progress SET
        user = type::record($user),
        path = $path,
        activity = $activity,
        status = $status,
        score = $score,
        attempts = $attempts,
        lastPosition = $lastPosition,
        completedAt = $completedAt,
        updatedAt = time::now()
      WHERE user = type::record($user) AND activity = $activity`,
      {
        user: userId,
        path: input.path,
        activity: input.activity,
        status: input.status,
        score: input.score ?? null,
        attempts: input.attempts ?? 0,
        lastPosition: input.lastPosition ?? null,
        completedAt: input.status === "completed" ? new Date().toISOString() : null,
      },
    );
  },

  async listProgress(userId: string): Promise<LearnerProgress[]> {
    const rows = await query<Record<string, unknown>>(
      "SELECT * FROM learner_progress WHERE user = type::record($user) ORDER BY updatedAt DESC",
      { user: userId },
    );
    return rows.map(mapProgress);
  },

  async listCredentials(userId: string): Promise<Credential[]> {
    const rows = await query<Record<string, unknown>>(
      "SELECT * FROM credential WHERE user = type::record($user) ORDER BY issuedAt DESC",
      { user: userId },
    );
    return rows.map(mapCredential);
  },

  async issueCredential(
    userId: string,
    input: { path: string; pathVersion: string; score: number | null; completedAt: string },
  ): Promise<Credential> {
    const rows = await query<Record<string, unknown>>(
      `UPSERT credential SET
        user = type::record($user),
        path = $path,
        pathVersion = $pathVersion,
        score = $score,
        completedAt = $completedAt,
        issuedAt = time::now()
      WHERE user = type::record($user) AND path = $path
      RETURN id, user, path, pathVersion, score, completedAt, issuedAt`,
      { user: userId, ...input },
    );
    return mapCredential(rows[0]!);
  },

  async getCredential(id: string): Promise<Credential | null> {
    const rows = await query<Record<string, unknown>>(
      "SELECT * FROM credential WHERE id = type::record($id) LIMIT 1",
      { id },
    );
    return rows[0] ? mapCredential(rows[0]) : null;
  },
};
