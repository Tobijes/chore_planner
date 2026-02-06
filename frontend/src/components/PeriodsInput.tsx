interface Props {
  value: number;
  onChange: (n: number) => void;
}

export function PeriodsInput({ value, onChange }: Props) {
  return (
    <div className="periods-input">
      <h2>Periods</h2>
      <label>
        Number of weeks:
        <input
          type="number"
          min={1}
          max={52}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
