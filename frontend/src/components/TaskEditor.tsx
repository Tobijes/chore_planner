import type { Task } from "../types";

const FREQUENCY_OPTIONS: Task["frequency"][] = [1, 2, 4, 12];

interface Props {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
}

export function TaskEditor({ tasks, onChange }: Props) {
  const updateTask = (index: number, updates: Partial<Task>) => {
    const next = tasks.map((t, i) => {
      if (i !== index) return t;
      const updated = { ...t, ...updates };
      // Clear forceAlternation if frequency is not 1
      if (updates.frequency && updates.frequency !== 1) {
        updated.forceAlternation = false;
      }
      return updated;
    });
    onChange(next);
  };

  const addTask = () => {
    onChange([
      ...tasks,
      { label: "", frequency: 1, workload: 10, forceAlternation: false },
    ]);
  };

  const removeTask = (index: number) => {
    onChange(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="task-editor">
      <h2>Tasks</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Frequency (weeks)</th>
            <th>Workload (min)</th>
            <th>Alternate</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, i) => (
            <tr key={i}>
              <td>
                <input
                  type="text"
                  value={task.label}
                  onChange={(e) => updateTask(i, { label: e.target.value })}
                />
              </td>
              <td>
                <select
                  value={task.frequency}
                  onChange={(e) =>
                    updateTask(i, {
                      frequency: Number(e.target.value) as Task["frequency"],
                    })
                  }
                >
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f === 1
                        ? "Weekly"
                        : f === 2
                          ? "Biweekly"
                          : f === 4
                            ? "Monthly"
                            : "Quarterly"}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={task.workload}
                  onChange={(e) =>
                    updateTask(i, { workload: Number(e.target.value) })
                  }
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={task.forceAlternation}
                  disabled={task.frequency !== 1}
                  onChange={(e) =>
                    updateTask(i, { forceAlternation: e.target.checked })
                  }
                />
              </td>
              <td>
                <button
                  className="btn-remove"
                  onClick={() => removeTask(i)}
                  title="Remove task"
                >
                  x
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addTask}>+ Add Task</button>
    </div>
  );
}
