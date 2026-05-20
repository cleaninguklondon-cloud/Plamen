import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface CounterProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  price?: number;
}

export function Counter({ label, value, onChange, min = 0, price }: CounterProps) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {price !== undefined && (
          <span className="text-xs text-muted-foreground">£{price} each</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onChange(value + 1)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
