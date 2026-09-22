import { IPOEntry, isIpoComplete } from "@/lib/types";
import bajajHousingFinance from "@/lib/data/ipos/bajaj-housing-finance";

const allIpos: IPOEntry[] = [bajajHousingFinance];

export function getAllIpos(): IPOEntry[] {
  return allIpos.filter(isIpoComplete);
}

export function getIpoBySlug(slug: string): IPOEntry | undefined {
  return allIpos.find((ipo) => ipo.slug === slug && isIpoComplete(ipo));
}
