import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Sparkles,
  ShieldCheck,
  Clock,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Section } from "@/components/booking/Section";
import { Counter } from "@/components/booking/Counter";
import {
  BookingState,
  EXTRAS,
  PROPERTY_DETAILS,
  TIME_SLOTS,
  calculateDeposit,
  calculateTotal,
  getInitialState,
  handlePayment,
  isValid,
} from "@/lib/booking";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [s, setS] = useState<BookingState>(getInitialState);
  const update = <K extends keyof BookingState>(k: K, v: BookingState[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  const total = useMemo(() => calculateTotal(s), [s]);
  const deposit = useMemo(() => calculateDeposit(total), [total]);
  const amountToPay = s.paymentType === "deposit" ? deposit : total;
  const remaining = s.paymentType === "deposit" ? total - deposit : 0;
  const valid = isValid(s);

  const [bump, setBump] = useState(false);
  useEffect(() => {
    setBump(true);
    const t = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(t);
  }, [amountToPay]);

  const submit = async () => {
    if (!valid) return;
    const booking = {
      total,
      paymentType: s.paymentType,
      amountToPay,
      remainingAmount: remaining,
      customerDetails: {
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        postcode: s.postcode,
      },
      propertyDetails: {
        propertyType: s.propertyType,
        isStudio: s.isStudio,
        bedrooms: s.bedrooms,
        ...s.details,
      },
      extras: s.extras,
      date: s.date?.toISOString(),
      time: s.time,
    };
    console.log("[booking]", booking);
    await handlePayment(amountToPay, booking);
  };

  const updatePropertyType = (propertyType: BookingState["propertyType"]) => {
    setS((p) => ({
      ...p,
      propertyType,
      isStudio: propertyType === "flat" ? p.isStudio : false,
    }));
  };

  const updateFlatType = (flatType: "flat" | "studio") => {
    setS((p) => ({ ...p, propertyType: "flat", isStudio: flatType === "studio" }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-28 lg:pb-12">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.93_0.04_140/.55)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-32 top-40 -z-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-96 -z-10 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />

      {/* Top nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Leaf className="h-4.5 w-4.5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold tracking-tight">
              Tenancy<span className="text-primary">.</span>Clean
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              End of tenancy specialists
            </span>
          </div>
        </div>
        <div className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Deposit-back guarantee
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" /> Same-week slots
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-4 sm:px-8 animate-rise">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Trusted by 4,200+ tenants across the UK
        </div>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Move out clean.
          <br />
          <span className="text-primary">Get your deposit back.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Build your quote in 60 seconds. Transparent pricing, eco-friendly products,
          and a fully insured team that knows what landlords inspect.
        </p>
      </section>

      {/* Split layout */}
      <main className="mx-auto grid max-w-6xl gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Section step={1} title="When should we come?" description="Pick a date and a window.">
            <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 justify-start rounded-2xl text-left font-normal",
                      !s.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon />
                    {s.date ? format(s.date, "EEE, d MMM yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={s.date}
                    onSelect={(d) => update("date", d)}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update("time", t)}
                    className={cn(
                      "h-12 rounded-2xl border text-sm font-medium transition-all",
                      s.time === t
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background hover:border-primary/50 hover:bg-accent/20",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section step={2} title="Property address" description="We'll use this to confirm coverage.">
            <Input
              placeholder="Postcode — e.g. SW1A 1AA"
              value={s.postcode}
              onChange={(e) => update("postcode", e.target.value.toUpperCase())}
              className="h-12 rounded-2xl text-base"
            />
          </Section>

          <Section step={3} title="Property type">
            <RadioGroup
              value={s.propertyType}
              onValueChange={(v) => updatePropertyType(v as BookingState["propertyType"])}
              className="grid grid-cols-2 gap-3"
            >
              {(["flat", "house"] as const).map((t) => (
                <label
                  key={t}
                  className={cn(
                    "group/card relative flex cursor-pointer items-center gap-3 rounded-2xl border p-5 transition-all",
                    s.propertyType === t
                      ? "border-primary bg-primary/[0.06] shadow-sm"
                      : "border-border bg-background hover:border-primary/40",
                  )}
                >
                  <RadioGroupItem value={t} className="data-[state=checked]:border-primary" />
                  <div className="flex flex-col">
                    <span className="font-display font-semibold capitalize text-foreground">{t}</span>
                    <span className="text-xs text-muted-foreground">
                      {t === "flat" ? "Apartment or studio" : "Townhouse or detached"}
                    </span>
                  </div>
                </label>
              ))}
            </RadioGroup>
            {s.propertyType === "flat" && (
              <div className="mt-4 space-y-2">
                <Label
                  htmlFor="flat-type"
                  className="text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Flat type
                </Label>
                <Select value={s.isStudio ? "studio" : "flat"} onValueChange={updateFlatType}>
                  <SelectTrigger
                    id="flat-type"
                    className="h-12 rounded-2xl bg-background text-base"
                  >
                    <SelectValue placeholder="Choose flat type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="studio">Studio — no separate bedroom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </Section>

          <Section step={4} title="Rooms & details" description="Tell us what to deep clean.">
            <div className="divide-y divide-border/70">
              {!s.isStudio && (
                <Counter
                  label="Bedrooms"
                  value={s.bedrooms}
                  min={1}
                  onChange={(n) => update("bedrooms", n)}
                  price={s.propertyType === "house" ? 30 : 20}
                />
              )}
              {PROPERTY_DETAILS.map((d) => (
                <Counter
                  key={d.key}
                  label={d.label}
                  price={d.price}
                  value={s.details[d.key]}
                  min={d.key === "bathrooms" ? 1 : 0}
                  onChange={(n) =>
                    setS((p) => ({ ...p, details: { ...p.details, [d.key]: n } }))
                  }
                />
              ))}
            </div>
          </Section>

          <Section step={5} title="Extras" description="Optional add-ons for a flawless handover.">
            <div className="divide-y divide-border/70">
              {EXTRAS.map((e) => (
                <Counter
                  key={e.key}
                  label={e.label}
                  price={e.price}
                  value={s.extras[e.key]}
                  onChange={(n) =>
                    setS((p) => ({ ...p, extras: { ...p.extras, [e.key]: n } }))
                  }
                />
              ))}
            </div>
          </Section>

          <Section step={6} title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="fn" label="First name" value={s.firstName} onChange={(v) => update("firstName", v)} />
              <Field id="ln" label="Last name" value={s.lastName} onChange={(v) => update("lastName", v)} />
              <Field id="em" label="Email" type="email" className="sm:col-span-2" value={s.email} onChange={(v) => update("email", v)} />
              <Field id="ph" label="Phone" type="tel" value={s.phone} onChange={(v) => update("phone", v)} />
              <div className="space-y-1.5">
                <Label htmlFor="pc" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Postcode
                </Label>
                <Input id="pc" value={s.postcode} readOnly className="h-12 rounded-2xl bg-muted" />
              </div>
            </div>
          </Section>

          <Section step={7} title="Payment preference">
            <RadioGroup
              value={s.paymentType}
              onValueChange={(v) => update("paymentType", v as "deposit" | "full")}
              className="grid gap-3"
            >
              {[
                { v: "deposit", label: "Deposit + cash on completion", sub: "Pay 20% now, the rest in cash on the day" },
                { v: "full", label: "Pay in full online", sub: "Card payment, nothing to settle later" },
              ].map((o) => (
                <label
                  key={o.v}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition-all",
                    s.paymentType === o.v
                      ? "border-primary bg-primary/[0.06] shadow-sm"
                      : "border-border bg-background hover:border-primary/40",
                  )}
                >
                  <RadioGroupItem value={o.v} className="mt-0.5" />
                  <div>
                    <div className="font-display text-sm font-semibold text-foreground">{o.label}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{o.sub}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </Section>
        </div>

        {/* Sticky summary (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-[0_30px_60px_-40px_rgba(60,80,40,0.35)] backdrop-blur">
              <div className="relative bg-primary px-6 py-7 text-primary-foreground">
                <div className="absolute inset-0 opacity-30 [background:radial-gradient(120%_80%_at_0%_0%,oklch(1_0_0/.18),transparent_60%)]" />
                <p className="relative text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
                  Your quote
                </p>
                <div className="relative mt-2 flex items-baseline gap-2">
                  <span
                    key={amountToPay}
                    className={cn(
                      "font-display text-5xl font-semibold tabular-nums",
                      bump && "animate-price",
                    )}
                  >
                    £{amountToPay}
                  </span>
                  <span className="text-sm text-primary-foreground/70">
                    {s.paymentType === "deposit" ? "due today" : "total"}
                  </span>
                </div>
                <p className="relative mt-1 text-sm text-primary-foreground/80">
                  {s.paymentType === "deposit"
                    ? `Full price £${total} · £${remaining} cash on completion`
                    : "Single payment, all-inclusive"}
                </p>
              </div>

              <div className="space-y-2.5 px-6 py-5 text-sm">
                <SummaryRow label="Property" value={summaryProperty(s)} />
                <SummaryRow label="When" value={s.date ? `${format(s.date, "d MMM")}${s.time ? ` · ${s.time}` : ""}` : "—"} />
                <SummaryRow label="Bedrooms" value={s.isStudio ? "Studio" : String(s.bedrooms)} />
                <SummaryRow label="Bathrooms" value={String(s.details.bathrooms)} />
                {extrasSummary(s).map((line) => (
                  <SummaryRow key={line.label} label={line.label} value={line.value} subtle />
                ))}
                <div className="my-3 h-px bg-border" />
                <SummaryRow label="Subtotal" value={`£${total}`} strong />
              </div>

              <div className="space-y-3 border-t border-border bg-secondary/40 px-6 py-5">
                <Button
                  size="lg"
                  disabled={!valid}
                  onClick={submit}
                  className="group h-12 w-full rounded-2xl text-base"
                >
                  {s.paymentType === "deposit" ? "Pay deposit" : "Pay now"}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Secured by Stripe · No charge until confirmed
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card/60 p-5 text-sm text-muted-foreground backdrop-blur">
              <p className="font-display font-semibold text-foreground">Deposit-back promise</p>
              <p className="mt-1.5 text-xs leading-relaxed">
                If your landlord isn't satisfied, we'll return within 72 hours and
                re-clean the flagged areas — completely free.
              </p>
            </div>
          </div>
        </aside>
      </main>

      {/* Sticky mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <div className="flex flex-col leading-tight">
            <span
              key={amountToPay}
              className={cn(
                "font-display text-2xl font-semibold tabular-nums text-foreground",
                bump && "animate-price",
              )}
            >
              £{amountToPay}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {s.paymentType === "deposit" ? `deposit · £${remaining} cash later` : "pay in full"}
            </span>
          </div>
          <Button
            size="lg"
            disabled={!valid}
            onClick={submit}
            className="h-12 min-w-[150px] rounded-2xl"
          >
            {s.paymentType === "deposit" ? "Pay deposit" : "Pay now"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-2xl text-base"
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  subtle,
}: {
  label: string;
  value: string;
  strong?: boolean;
  subtle?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn("text-muted-foreground", subtle && "text-xs")}>{label}</span>
      <span
        className={cn(
          "tabular-nums text-foreground",
          strong ? "font-display text-base font-semibold" : "text-sm font-medium",
          subtle && "text-xs text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function summaryProperty(s: BookingState) {
  if (s.propertyType === "flat") return s.isStudio ? "Studio flat" : "Flat";
  return "House";
}

function extrasSummary(s: BookingState) {
  const lines: { label: string; value: string }[] = [];
  PROPERTY_DETAILS.forEach((d) => {
    const v = s.details[d.key];
    if (d.key === "bathrooms") return;
    if (v > 0) lines.push({ label: d.label, value: `×${v}` });
  });
  EXTRAS.forEach((e) => {
    const v = s.extras[e.key];
    if (v > 0) lines.push({ label: e.label, value: `×${v}` });
  });
  return lines;
}
