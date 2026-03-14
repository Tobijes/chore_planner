import type { JobResult } from "../types";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { generateSchedulePdf } from "@/utils/generateSchedulePdf";

interface Props {
  result: JobResult;
  users: [string, string];
}

export function ResultTable({ result, users }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Skema</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateSchedulePdf(result, users)}
          >
            <Printer data-icon="inline-start" />
            Udskriv
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Uge</TableHead>
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
