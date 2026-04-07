// Stripe product and price IDs for subscription tiers
export const SUBSCRIPTION_TIERS = {
  solo: {
    name: "Solo Engineer",
    tier: 1,
    product_id: "prod_UHypAKnDZCPGYV",
    monthly_price_id: "price_1TJOs5JtN2Ze3hKSx2gYkT2k",
    annual_price_id: "price_1TJOt0JtN2Ze3hKSgRF0VoaJ",
    monthly_price: 199,
    annual_price: 159,
  },
  growing: {
    name: "Growing Firm",
    tier: 2,
    product_id: "prod_UHyqOJYJdZEmex",
    monthly_price_id: "price_1TJOsOJtN2Ze3hKSX9ljXrIF",
    annual_price_id: "price_1TJOtJJtN2Ze3hKShpq1ZPTL",
    monthly_price: 499,
    annual_price: 399,
  },
  enterprise: {
    name: "Enterprise",
    tier: 3,
    product_id: "prod_UHyq0VNTVzuYVZ",
    monthly_price_id: "price_1TJOskJtN2Ze3hKS1egXyIyW",
    annual_price_id: "price_1TJOteJtN2Ze3hKSeJyJHlRO",
    monthly_price: 1499,
    annual_price: 1199,
  },
} as const;

export type TierKey = keyof typeof SUBSCRIPTION_TIERS;

export function getTierByProductId(productId: string): TierKey | null {
  for (const [key, tier] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tier.product_id === productId) return key as TierKey;
  }
  return null;
}

export function getTierLevel(tierKey: TierKey | null): number {
  if (!tierKey) return 0;
  return SUBSCRIPTION_TIERS[tierKey].tier;
}
