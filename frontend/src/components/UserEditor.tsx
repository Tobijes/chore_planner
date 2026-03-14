import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  users: [string, string];
  setUser: (index: 0 | 1, name: string) => void;
}

export function UserEditor({ users, setUser }: Props) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-lg">Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {([0, 1] as const).map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Label htmlFor={`user-${i}`}>User {i + 1}:</Label>
            <Input
              id={`user-${i}`}
              type="text"
              value={users[i]}
              onChange={(e) => setUser(i, e.target.value)}
              className="w-40"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
