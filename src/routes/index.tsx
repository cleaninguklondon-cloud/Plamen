import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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

  // animate price changes
  const [bump, setBump] = useState(false);
  useEffect(() => {
    setBump(true);
    const t = setTimeout(() => setBump(false), 200);
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

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-5">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">End of Tenancy Cleaning</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        {/* Date & Time */}
        <Section step={1} title="Date & Time">
          <div className="grid gap-3 sm:grid-cols-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !s.date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon />
                  {s.date ? format(s.date, "PPP") : "Pick a date"}
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
                <Button
                  key={t}
                  type="button"
                  variant={s.time === t ? "default" : "outline"}
                  onClick={() => update("time", t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </Section>

        {/* Postcode */}
        <Section step={2} title="Postcode">
          <Input
            placeholder="e.g. SW1A 1AA"
            value={s.postcode}
            onChange={(e) => update("postcode", e.target.value.toUpperCase())}
          />
        </Section>

        {/* Property type */}
        <Section step={3} title="Property Type">
          <RadioGroup
            value={s.propertyType}
            onValueChange={(v) => update("propertyType", v as "flat" | "house")}
            className="grid grid-cols-2 gap-3"
          >
            {(["flat", "house"] as const).map((t) => (
              <label
                key={t}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border p-4 capitalize transition-colors",
                  s.propertyType === t && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem value={t} />
                <span className="font-medium">{t}</span>
              </label>
            ))}
          </RadioGroup>
          {s.propertyType === "flat" && (
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={s.isStudio}
                onCheckedChange={(v) => update("isStudio", Boolean(v))}
              />
              Studio (no separate bedroom)
            </label>
          )}
        </Section>

        {/* Property details */}
        <Section step={4} title="Property Details">
          <div className="divide-y">
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

        {/* Extras */}
        <Section step={5} title="Extras">
          <div className="divide-y">
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

        {/* Personal info */}
        <Section step={6} title="Your Details">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fn">First name</Label>
              <Input id="fn" value={s.firstName} onChange={(e) => update("firstName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ln">Last name</Label>
              <Input id="ln" value={s.lastName} onChange={(e) => update("lastName", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="em">Email</Label>
              <Input id="em" type="email" value={s.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ph">Phone</Label>
              <Input id="ph" type="tel" value={s.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pc">Postcode</Label>
              <Input id="pc" value={s.postcode} readOnly className="bg-muted" />
            </div>
          </div>
        </Section>

        {/* Payment */}
        <Section step={7} title="Payment">
          <RadioGroup
            value={s.paymentType}
            onValueChange={(v) => update("paymentType", v as "deposit" | "full")}
            className="space-y-2"
          >
            {[
              { v: "deposit", label: "Pay Deposit + Cash After Cleaning", sub: "20% now, rest in cash" },
              { v: "full", label: "Pay in Full Online", sub: "Card payment, all done" },
            ].map((o) => (
              <label
                key={o.v}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors",
                  s.paymentType === o.v && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem value={o.v} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium">{o.label}</div>
                  <div className="text-xs text-muted-foreground">{o.sub}</div>
                </div>
              </label>
            ))}
          </RadioGroup>
        </Section>

        {/* Summary */}
        <Section step={8} title="Summary">
          <div className="space-y-2 text-sm">
            <Row label="Total price" value={`£${total}`} />
            {s.paymentType === "deposit" ? (
              <>
                <Row label="Deposit (20%)" value={`£${deposit}`} highlight />
                <Row label="Cash on completion" value={`£${remaining}`} />
              </>
            ) : (
              <Row label="Pay now" value={`£${total}`} highlight />
            )}
          </div>
        </Section>
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col">
            <span
              className={cn(
                "text-xl font-bold tabular-nums transition-transform duration-200",
                bump && "scale-110 text-primary",
              )}
            >
              £{amountToPay}
            </span>
            <span className="text-xs text-muted-foreground">
              {s.paymentType === "deposit" ? `Deposit • £${remaining} cash after` : "Pay in full"}
            </span>
          </div>
          <Button size="lg" disabled={!valid} onClick={submit} className="min-w-[140px]">
            {s.paymentType === "deposit" ? "Pay Deposit" : "Pay Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold tabular-nums",
          highlight && "text-primary text-base",
        )}
      >
        {value}
      </span>
    </div>
  );
}
