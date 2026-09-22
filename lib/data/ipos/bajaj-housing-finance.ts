import { IPOEntry } from "@/lib/types";

const entry: IPOEntry = {
  slug: "bajaj-housing-finance",
  companyName: "Bajaj Housing Finance Limited",
  sector: "Financial Services",
  industry: "Housing Finance",
  leadership:
    "Part of the Bajaj Group; the company provides housing and property-backed finance across retail and commercial customers.",
  listingDate: "2024-09-16",
  priceBand: "₹66 – ₹70",
  gmp: { value: 75, asOf: "2024-09-16T05:30:00Z" },
  subscription: {
    value: { retail: 7.46, sni: 41.51, bni: 104.44 },
    asOf: "2024-09-13T10:30:00Z",
  },
  allotmentChance: {
    value: { retail: 13.4, sni: 2.41, bni: 0.96 },
    asOf: "2024-09-13T10:30:00Z",
  },
  marketPosition:
    "A large housing-finance business within the Bajaj Group, with a nationwide distribution footprint and a focus on home loans and loans against property.",
  drhpSummary:
    "The 2024 public issue combined a fresh issue with an offer for sale. The stated objectives included augmenting the company's capital base to support future lending requirements and general corporate purposes.",
};

export default entry;
