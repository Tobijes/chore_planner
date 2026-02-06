import type { Task, JobStatus, JobResult } from "../types";

const BASE = "http://localhost:5000/api/jobs";

export async function submitJob(body: {
  tasks: Task[];
  users: string[];
  nPeriods: number;
}): Promise<{ jobId: string }> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
  return res.json();
}

export function subscribeToJobEvents(
  jobId: string,
  onStatus: (status: JobStatus) => void
): EventSource {
  const es = new EventSource(`${BASE}/${jobId}/events`);
  es.onmessage = (e) => onStatus(e.data as JobStatus);
  return es;
}

export async function fetchResult(jobId: string): Promise<JobResult> {
  const res = await fetch(`${BASE}/${jobId}/result`);
  if (!res.ok) throw new Error(`Fetch result failed: ${res.status}`);
  const data = await res.json();
  return data.periods;
}

export async function deleteJob(jobId: string): Promise<void> {
  await fetch(`${BASE}/${jobId}`, { method: "DELETE" });
}
