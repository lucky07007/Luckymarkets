import { StockEntry, isStockComplete } from "@/lib/types";
import tcs from "@/lib/data/stocks/tcs";

const allStocks: StockEntry[] = [tcs];

export function getAllStocks(): StockEntry[] {
  return allStocks.filter(isStockComplete);
}

export function getStockBySlug(slug: string): StockEntry | undefined {
  return allStocks.find((stock) => stock.slug === slug && isStockComplete(stock));
}
