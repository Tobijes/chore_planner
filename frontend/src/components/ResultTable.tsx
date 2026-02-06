import type { JobResult } from "../types";

interface Props {
  result: JobResult;
  users: [string, string];
}

export function ResultTable({ result, users }: Props) {
  return (
    <div className="result-table">
      <h2>Schedule</h2>
      <table>
        <thead>
          <tr>
            <th>Week</th>
            {users.map((u) => (
              <th key={u}>{u}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.map((period) => (
            <tr key={period.periodNumber}>
              <td className="week-number">{period.periodNumber}</td>
              {period.users.map((ua) => (
                <td key={ua.userName}>
                  {ua.tasks.map((t) => (
                    <div key={t.label} className="task-chip">
                      {t.label}{" "}
                      <span className="workload">({t.workload}m)</span>
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
