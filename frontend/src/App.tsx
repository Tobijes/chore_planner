import { useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { useUsers } from "./hooks/useUsers";
import { useJobSubmission } from "./hooks/useJobSubmission";
import { TaskEditor } from "./components/TaskEditor";
import { UserEditor } from "./components/UserEditor";
import { PeriodsInput } from "./components/PeriodsInput";
import { ResultTable } from "./components/ResultTable";
import "./App.css";

function App() {
  const { tasks, setTasks, resetToDefaults, loaded } = useTasks();
  const { users, setUser } = useUsers();
  const [nPeriods, setNPeriods] = useState(26);
  const { status, result, error, submit } = useJobSubmission();

  if (!loaded) return <div className="loading">Loading...</div>;

  const isSubmitting = status === "Queued" || status === "Processing";

  return (
    <div className="app">
      <h1>Pligtplan</h1>

      <div className="config-section">
        <TaskEditor tasks={tasks} onChange={setTasks} />

        <div className="config-row">
          <UserEditor users={users} setUser={setUser} />
          <PeriodsInput value={nPeriods} onChange={setNPeriods} />
        </div>

        <div className="actions">
          <button
            className="btn-submit"
            disabled={isSubmitting || tasks.length === 0}
            onClick={() => submit(tasks, [...users], nPeriods)}
          >
            {isSubmitting ? `${status}...` : "Solve"}
          </button>
          <button className="btn-reset" onClick={resetToDefaults}>
            Reset Tasks
          </button>
        </div>

        {error && <div className="error">{error}</div>}
      </div>

      {result && <ResultTable result={result} users={users} />}
    </div>
  );
}

export default App;
