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
  const active = value > min;
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{label}</span>
        {price !== undefined && (
          <span className="text-xs text-muted-foreground">£{price} each</span>
        )}
      </div>
      <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-accent/40"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span
          className={
            "w-7 text-center font-display text-sm font-semibold tabular-nums " +
            (active ? "text-primary" : "text-muted-foreground")
          }
        >
          {value}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
