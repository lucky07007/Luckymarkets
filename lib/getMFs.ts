import { MFEntry, isMfComplete } from "@/lib/types";
import paragParikhFlexiCap from "@/lib/data/mf/parag-parikh-flexi-cap";

const allMFs: MFEntry[] = [paragParikhFlexiCap];

export function getAllMFs(): MFEntry[] {
  return allMFs.filter(isMfComplete);
}

export function getMFBySlug(slug: string): MFEntry | undefined {
  return allMFs.find((fund) => fund.slug === slug && isMfComplete(fund));
}
