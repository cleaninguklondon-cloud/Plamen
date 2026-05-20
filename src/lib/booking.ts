export const PROPERTY_DETAILS = [
  { key: "bathrooms", label: "Bathrooms", price: 15, default: 1 },
  { key: "toilets", label: "Toilets", price: 10, default: 0 },
  { key: "carpets", label: "Carpets", price: 10, default: 0 },
  { key: "steamCleaning", label: "Steam Cleaning", price: 12, default: 0 },
  { key: "rug", label: "Rug", price: 5, default: 0 },
  { key: "sofa", label: "Sofa", price: 15, default: 0 },
  { key: "mattress", label: "Mattress", price: 10, default: 0 },
  { key: "curtains", label: "Curtains", price: 8, default: 0 },
] as const;

export const EXTRAS = [
  { key: "externalWindows", label: "External Windows", price: 5 },
  { key: "blinds", label: "Blinds", price: 4 },
  { key: "conservatory", label: "Conservatory", price: 25 },
  { key: "doubleOven", label: "Double Oven", price: 20 },
  { key: "balcony", label: "Balcony", price: 15 },
] as const;

export const TIME_SLOTS = ["09:00", "12:00", "15:00"];

export type PropertyDetailKey = (typeof PROPERTY_DETAILS)[number]["key"];
export type ExtraKey = (typeof EXTRAS)[number]["key"];

export type BookingState = {
  date: Date | undefined;
  time: string;
  postcode: string;
  propertyType: "flat" | "house";
  isStudio: boolean;
  bedrooms: number;
  details: Record<PropertyDetailKey, number>;
  extras: Record<ExtraKey, number>;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentType: "deposit" | "full";
};

export function getInitialState(): BookingState {
  const details = {} as Record<PropertyDetailKey, number>;
  PROPERTY_DETAILS.forEach((d) => (details[d.key] = d.default));
  const extras = {} as Record<ExtraKey, number>;
  EXTRAS.forEach((e) => (extras[e.key] = 0));
  return {
    date: undefined,
    time: "",
    postcode: "",
    propertyType: "flat",
    isStudio: false,
    bedrooms: 1,
    details,
    extras,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    paymentType: "deposit",
  };
}

export function calculateTotal(s: BookingState): number {
  let total = 0;
  if (s.propertyType === "flat") {
    total += s.isStudio ? 80 : 100 + s.bedrooms * 20;
  } else {
    total += 120 + s.bedrooms * 30;
  }
  PROPERTY_DETAILS.forEach((d) => (total += s.details[d.key] * d.price));
  EXTRAS.forEach((e) => (total += s.extras[e.key] * e.price));
  return total;
}

export function calculateDeposit(total: number): number {
  return Math.round(total * 0.2);
}

export function isValid(s: BookingState): boolean {
  return Boolean(
    s.firstName.trim() &&
      s.lastName.trim() &&
      /\S+@\S+\.\S+/.test(s.email) &&
      s.phone.trim() &&
      s.postcode.trim() &&
      s.date &&
      s.time,
  );
}

// Stripe integration point — wire up server function + Stripe checkout here later.
export async function handlePayment(amount: number, bookingData: unknown) {
  console.log("[handlePayment] amount £", amount, "booking:", bookingData);
  // TODO: call server fn that creates a Stripe Checkout Session and redirect.
  return { ok: true };
}
