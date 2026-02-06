import { useState, useEffect } from "react";
import type { Task } from "../types";

const STORAGE_KEY = "choreplanner-tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTasks(JSON.parse(stored));
      setLoaded(true);
    } else {
      fetch("/default.json")
        .then((r) => r.json())
        .then((defaults: Task[]) => {
          setTasks(defaults);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
          setLoaded(true);
        });
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, loaded]);

  const resetToDefaults = async () => {
    const resp = await fetch("/default.json");
    const defaults: Task[] = await resp.json();
    setTasks(defaults);
  };

  return { tasks, setTasks, resetToDefaults, loaded };
}
