import { useState, useEffect } from "react";

const STORAGE_KEY = "choreplanner-users";
const DEFAULT_USERS = ["Kristine", "Tobias"];

export function useUsers() {
  const [users, setUsers] = useState<[string, string]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return [parsed[0] || "", parsed[1] || ""];
    }
    return DEFAULT_USERS as [string, string];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const setUser = (index: 0 | 1, name: string) => {
    setUsers((prev) => {
      const next: [string, string] = [...prev];
      next[index] = name;
      return next;
    });
  };

  return { users, setUser };
}
