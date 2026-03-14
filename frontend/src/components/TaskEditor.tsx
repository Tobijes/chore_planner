import type { Task } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const FREQUENCY_OPTIONS: { value: Task["frequency"]; label: string }[] = [
  { value: 1, label: "Weekly" },
  { value: 2, label: "Biweekly" },
  { value: 4, label: "Monthly" },
  { value: 12, label: "Quarterly" },
];

interface Props {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
}

export function TaskEditor({ tasks, onChange }: Props) {
  const updateTask = (index: number, updates: Partial<Task>) => {
    const next = tasks.map((t, i) => {
      if (i !== index) return t;
      const updated = { ...t, ...updates };
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Frequency (weeks)</TableHead>
              <TableHead>Workload (min)</TableHead>
              <TableHead>Alternate</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Input
                    type="text"
                    value={task.label}
                    onChange={(e) => updateTask(i, { label: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={String(task.frequency)}
                    onValueChange={(val) =>
                      updateTask(i, {
                        frequency: Number(val) as Task["frequency"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={1}
                    value={task.workload}
                    onChange={(e) =>
                      updateTask(i, { workload: Number(e.target.value) })
                    }
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={task.forceAlternation}
                    disabled={task.frequency !== 1}
                    onCheckedChange={(checked) =>
                      updateTask(i, {
                        forceAlternation: checked === true,
                      })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeTask(i)}
                    title="Remove task"
                  >
                    x
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="outline" onClick={addTask} className="mt-2">
          + Add Task
        </Button>
      </CardContent>
    </Card>
  );
}
