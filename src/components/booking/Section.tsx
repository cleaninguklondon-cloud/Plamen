import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ step, title, description, children, className }: SectionProps) {
  return (
    <section
      className={cn(
        "group relative rounded-3xl border border-border/70 bg-card/80 p-6 sm:p-8 shadow-[0_1px_0_rgba(0,0,0,0.02),0_20px_40px_-30px_rgba(60,80,40,0.18)] backdrop-blur-sm transition-colors hover:border-accent/60",
        className,
      )}
    >
      <header className="mb-5 flex items-start gap-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-display text-xs font-semibold text-primary tabular-nums">
          {String(step).padStart(2, "0")}
        </span>
        <div className="flex flex-col">
          <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}
