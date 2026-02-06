import { useState, useEffect, useRef } from "react";
import type { Task, JobStatus, JobResult } from "../types";
import { submitJob, subscribeToJobEvents, fetchResult } from "../api/jobsApi";

type Status = JobStatus | "Idle";

export function useJobSubmission() {
  const [status, setStatus] = useState<Status>("Idle");
  const [result, setResult] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const submit = async (
    tasks: Task[],
    users: string[],
    nPeriods: number
  ) => {
    eventSourceRef.current?.close();
    setResult(null);
    setError(null);

    try {
      const { jobId } = await submitJob({ tasks, users, nPeriods });
      setStatus("Queued");

      const es = subscribeToJobEvents(jobId, async (newStatus) => {
        setStatus(newStatus);
        if (newStatus === "Done") {
          es.close();
          const data = await fetchResult(jobId);
          setResult(data);
        }
        if (newStatus === "Failed") {
          es.close();
          setError("Job failed");
        }
      });

      es.onerror = () => {
        es.close();
        setError("Connection lost");
        setStatus("Failed");
      };

      eventSourceRef.current = es;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("Failed");
    }
  };

  useEffect(() => {
    return () => eventSourceRef.current?.close();
  }, []);

  return { status, result, error, submit };
}
