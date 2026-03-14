import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  value: number;
  onChange: (n: number) => void;
}

export function PeriodsInput({ value, onChange }: Props) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-lg">Periods</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Label htmlFor="periods">Number of weeks:</Label>
          <Input
            id="periods"
            type="number"
            min={1}
            max={52}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </CardContent>
    </Card>
  );
}
