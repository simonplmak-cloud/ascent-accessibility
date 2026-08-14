import { eq, sql } from "drizzle-orm";
import { getDb } from "../index";
import { assessment, finding, job } from "../schema";
import type {
  Assessment,
  Finding,
  Job,
  NewAssessment,
  NewFinding,
  NewJob,
} from "../schema";

export interface CompleteAssessmentInput {
  score: number;
  passBand: "pass" | "partial" | "fail";
  pagesScanned: number;
  partial: boolean;
}

export const assessmentRepository = {
  async create(input: NewAssessment): Promise<Assessment> {
    const db = getDb();
    const [row] = await db.insert(assessment).values(input).returning();
    return row!;
  },

  async findById(id: string): Promise<Assessment | undefined> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(assessment)
      .where(eq(assessment.id, id))
      .limit(1);
    return row;
  },

  async setStatus(id: string, status: Assessment["status"]): Promise<void> {
    const db = getDb();
    await db.update(assessment).set({ status }).where(eq(assessment.id, id));
  },

  async complete(id: string, input: CompleteAssessmentInput): Promise<void> {
    const db = getDb();
    await db
      .update(assessment)
      .set({
        status: "completed",
        score: input.score,
        passBand: input.passBand,
        pagesScanned: input.pagesScanned,
        partial: input.partial,
      })
      .where(eq(assessment.id, id));
  },

  async fail(id: string): Promise<void> {
    const db = getDb();
    await db.update(assessment).set({ status: "failed" }).where(eq(assessment.id, id));
  },

  async insertFindings(items: NewFinding[]): Promise<void> {
    if (items.length === 0) return;
    const db = getDb();
    await db.insert(finding).values(items);
  },

  async findFindings(assessmentId: string): Promise<Finding[]> {
    const db = getDb();
    return db.select().from(finding).where(eq(finding.assessmentId, assessmentId));
  },

  async createJob(input: NewJob): Promise<Job> {
    const db = getDb();
    const [row] = await db.insert(job).values(input).returning();
    return row!;
  },

  async getJob(assessmentId: string): Promise<Job | undefined> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(job)
      .where(eq(job.assessmentId, assessmentId))
      .limit(1);
    return row;
  },

  async setJobStatus(
    assessmentId: string,
    status: Job["status"],
    lastError?: string,
  ): Promise<void> {
    const db = getDb();
    await db
      .update(job)
      .set({ status, lastError: lastError ?? null })
      .where(eq(job.assessmentId, assessmentId));
  },

  async incrementJobAttempts(assessmentId: string): Promise<void> {
    const db = getDb();
    await db
      .update(job)
      .set({ attempts: sql`${job.attempts} + 1` })
      .where(eq(job.assessmentId, assessmentId));
  },
};
