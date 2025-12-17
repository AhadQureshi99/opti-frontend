const CACHE_PREFIX = "offline_api_cache:";

function parseSymbol(currencyString) {
  if (!currencyString) return null;
  // look for symbol inside parentheses, e.g. "INR - Indian Rupee (₹)"
  const m = String(currencyString).match(/\(([^)]+)\)/);
  if (m) return m[1];
  // if string is like "₹" or "USD - US Dollar $" try last token
  const parts = String(currencyString).trim().split(" ");
  const last = parts[parts.length - 1];
  if (last && /[^A-Za-z0-9]/.test(last)) return last;
  return null;
}

export function getCurrencyFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + "profile");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const u = parsed && parsed.user ? parsed.user : parsed;
    return u && u.currency ? u.currency : null;
  } catch (e) {
    return null;
  }
}

export function getCurrencySymbol(currencyString) {
  // if user provided a full currency string, parse it; else if it's a symbol return as-is
  if (!currencyString) {
    const cached = getCurrencyFromCache();
    currencyString = cached || "INR - Indian Rupee (₹)";
  }
  // if it's a short symbol like "₹" just return it
  if (
    typeof currencyString === "string" &&
    currencyString.length <= 3 &&
    /[^A-Za-z0-9]/.test(currencyString)
  ) {
    return currencyString;
  }
  const s = parseSymbol(currencyString);
  if (s) return s;
  // fallback mapping for common codes
  const code = String(currencyString || "").split(" ")[0] || "INR";
  const map = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    PKR: "₨",
    AED: "د.إ",
    SAR: "﷼",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
    CNY: "¥",
    CHF: "CHF",
    SGD: "S$",
    MYR: "RM",
    BDT: "৳",
    THB: "฿",
    KRW: "₩",
    ZAR: "R",
    TRY: "₺",
    BRL: "R$",
    MXN: "$",
    NZD: "NZ$",
    RUB: "₽",
  };
  return map[code] || "₹";
}

export function formatCurrency(amount, currencyInput) {
  const symbol = getCurrencySymbol(currencyInput);
  const num = typeof amount === "number" ? amount : Number(amount || 0);
  if (Number.isNaN(num)) return `${symbol}0.00`;
  return `${symbol}${num.toFixed(2)}`;
}

export default {
  getCurrencySymbol,
  formatCurrency,
  getCurrencyFromCache,
};
