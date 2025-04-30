import {
  charMapBg,
  charMapBn,
  charMapDe,
  charMapEs,
  charMapFr,
  charMapGu,
  charMapHi,
  charMapIt,
  charMapJa,
  charMapKn,
  charMapMl,
  charMapMn,
  charMapMr,
  charMapNl,
  charMapPa,
  charMapPl,
  charMapPt,
  charMapRu,
  charMapTa,
  charMapTe,
  charMapVi,
  charMapZh,
} from "./language.js";

export const charMaps = {
  hi: charMapHi,
  kn: charMapKn,
  ta: charMapTa,
  te: charMapTe,
  gu: charMapGu,
  mr: charMapMr,
  ml: charMapMl,
  pa: charMapPa,
  bn: charMapBn,
  ru: charMapRu,
  es: charMapEs,
  zh: charMapZh,
  mn: charMapMn,
  pl: charMapPl,
  bg: charMapBg,
  fr: charMapFr,
  de: charMapDe,
  nl: charMapNl,
  it: charMapIt,
  pt: charMapPt,
  ja: charMapJa,
  vi: charMapVi,
};

export function fallbackCharacterTranslation(text, targetLang) {
  console.log("map");
  const map = charMaps[targetLang];

  if (!map) return text; // if map not available, return original

  return text
    .split("")
    .map((char) => map[char] || char)
    .join("");
}
