// The website's text for a language, and the helper that fills in {placeholders}.
import type { Locale } from "./config";
import { de } from "./messages/de";
import { en, type Messages } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { zhHans } from "./messages/zh-hans";
import { zhHant } from "./messages/zh-hant";

export type { Messages };

const dictionaries: Record<Locale, Messages> = {
  en,
  es,
  fr,
  de,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
};

export const messagesFor = (locale: Locale): Messages => dictionaries[locale];

/** "Only {count} left" with { count: 3 } → "Only 3 left". Unknown placeholders stay as written. */
export function format(text: string, values: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}
