import { useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { useUsers } from "./hooks/useUsers";
import { useJobSubmission } from "./hooks/useJobSubmission";
import { TaskEditor } from "./components/TaskEditor";
import { UserEditor } from "./components/UserEditor";
import { PeriodsInput } from "./components/PeriodsInput";
import { ResultTable } from "./components/ResultTable";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

function App() {
  const { tasks, setTasks, resetToDefaults, loaded } = useTasks();
  const { users, setUser } = useUsers();
  const [nPeriods, setNPeriods] = useState(26);
  const { status, result, error, submit } = useJobSubmission();

  if (!loaded)
    return <div className="p-8 text-center text-muted-foreground">Indlæser...</div>;

  const isSubmitting = status === "Queued" || status === "Processing";

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-6">Opgaveplan</h1>

      <div className="space-y-4">
        <TaskEditor tasks={tasks} onChange={setTasks} />

        <div className="flex gap-4">
          <UserEditor users={users} setUser={setUser} />
          <PeriodsInput value={nPeriods} onChange={setNPeriods} />
        </div>

        <div className="flex gap-2">
          <Button
            disabled={isSubmitting || tasks.length === 0}
            onClick={() => submit(tasks, [...users], nPeriods)}
          >
            {isSubmitting ? `${status}...` : "Beregn"}
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            Nulstil opgaver
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {result && (
        <div className="mt-6">
          <ResultTable result={result} users={users} />
        </div>
      )}
    </div>
  );
}

export default App;
