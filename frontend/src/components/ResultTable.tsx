import type { JobResult } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  result: JobResult;
  users: [string, string];
}

export function ResultTable({ result, users }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Week</TableHead>
              {users.map((u) => (
                <TableHead key={u}>{u}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.map((period) => (
              <TableRow key={period.periodNumber}>
                <TableCell className="font-semibold text-center">
                  {period.periodNumber}
                </TableCell>
                {period.users.map((ua) => (
                  <TableCell key={ua.userName} className="align-top">
                    {ua.tasks.map((t) => (
                      <div key={t.label} className="text-sm py-0.5">
                        {t.label}{" "}
                        <span className="text-muted-foreground text-xs">
                          ({t.workload}m)
                        </span>
                      </div>
                    ))}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
