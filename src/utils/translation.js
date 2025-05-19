// // import translatte from "translatte";

// // export default async function translateText(text, targetLang) {
// //   try {
// //     const res = await translatte(text, { to: targetLang });
// //     return res.text;
// //   } catch (error) {
// //     console.error("Translation Error:", error);
// //     throw new Error("Failed to translate text");
// //   }
// // }

// // import translatte from "translatte";

// // export default async function translateText(text, targetLang) {
// //   if (!text || typeof text !== "string" || text.trim() === "") {
// //     console.warn("Skipped translation: Invalid text:", text);
// //     return null;
// //   }

// //   try {
// //     const res = await translatte(text, { to: targetLang });
// //     return res.text;
// //   } catch (error) {
// //     console.error("Translation Error:", error);
// //     return null;
// //   }
// // }

// import translatte from "translatte";

// // Example hardcoded character map for Hindi
// const charMapHi = {
//   a: "अ",
//   b: "ब",
//   c: "क",
//   d: "द",
//   e: "ए",
//   f: "फ",
//   g: "ग",
//   h: "ह",
//   i: "इ",
//   j: "ज",
//   k: "क",
//   l: "ल",
//   m: "म",
//   n: "न",
//   o: "ओ",
//   p: "प",
//   q: "क्यू",
//   r: "र",
//   s: "स",
//   t: "त",
//   u: "उ",
//   v: "व",
//   w: "व",
//   x: "एक्स",
//   y: "य",
//   z: "ज",
//   A: "अ",
//   B: "ब",
//   C: "क",
//   D: "द",
//   E: "ए",
//   F: "फ",
//   G: "ग",
//   H: "ह",
//   I: "इ",
//   J: "ज",
//   K: "क",
//   L: "ल",
//   M: "म",
//   N: "न",
//   O: "ओ",
//   P: "प",
//   Q: "क्यू",
//   R: "र",
//   S: "स",
//   T: "त",
//   U: "उ",
//   V: "व",
//   W: "व",
//   X: "एक्स",
//   Y: "य",
//   Z: "ज",
//   " ": " ",
//   ".": ".",
//   ",": ",",
//   "-": "-",
//   "&": "&",
//   "'": "'",
// };

// // Helper: Convert character by character if no real translation
// function fallbackCharacterTranslation(text, targetLang) {
//   const map = charMaps[targetLang];
//   if (!map) return text; // if map not available, return original

//   return text
//     .split("")
//     .map((char) => map[char] || char)
//     .join("");
// }

//   // You can add other language maps (ta, kn, bn, etc.) here
//   return text;
// }

// export default async function translateText(text, targetLang) {
//   console.log("start");

//   if (!text || typeof text !== "string" || text.trim() === "") {
//     console.warn("Skipped translation: Invalid text:", text);
//     return null;
//   }

//   try {
//     const res = await translatte(text, { to: targetLang });
//     console.log("try", res);

//     const translated = res?.text?.trim();
//     const original = text.trim();

//     // Fallback to char-wise if no change
//     if (!translated || translated.toLowerCase() === original.toLowerCase()) {
//       console.log("Fallback to char map:", text);
//       return convertCharWise(original, targetLang);
//     }

//     return translated;
//   } catch (error) {
//     console.error("Translation Error:", error);
//     return convertCharWise(text, targetLang); // fallback on error
//   }
// }

// ====== 19-05 =======================

// import translatte from "translatte";
// import { fallbackCharacterTranslation } from "./FallbackTransliterationFunction.js";

// export default async function translateText(text, targetLang) {
//   if (!text || typeof text !== "string" || text.trim() === "") {
//     console.warn("Skipped translation: Invalid text:", text);
//     return null;
//   }

//   try {
//     const res = await translatte(text, { to: targetLang });
//     console.log("Translatte result:", res.text);

//     const original = text.trim().toLowerCase();
//     const translated = res.text.trim().toLowerCase();

//     if (
//       !res.text ||
//       translated === original ||
//       translated.includes(original.split(" ")[0])
//     ) {
//       console.log("Using fallback for:", text);
//       return fallbackCharacterTranslation(text, targetLang);
//     }

//     return res.text;
//   } catch (error) {
//     console.error("Translation Error:", error);
//     return fallbackCharacterTranslation(text, targetLang);
//   }
// }

import translatte from "translatte";
import { fallbackCharacterTranslation } from "./FallbackTransliterationFunction.js";

export default async function translateText(text, targetLang) {
  if (!text || typeof text !== "string" || text.trim() === "") {
    console.warn("Skipped translation: Invalid text:", text);
    return null;
  }

  // If target language is English, just return the original text (no translation)
  if (targetLang.toLowerCase() === "en") {
    return text;
  }

  try {
    const res = await translatte(text, { to: targetLang });
    console.log("Translatte result:", res.text);

    const original = text.trim().toLowerCase();
    const translated = res.text.trim().toLowerCase();

    if (
      !res.text ||
      translated === original ||
      translated.includes(original.split(" ")[0])
    ) {
      console.log("Using fallback for:", text);
      return fallbackCharacterTranslation(text, targetLang);
    }

    return res.text;
  } catch (error) {
    console.error("Translation Error:", error);
    return fallbackCharacterTranslation(text, targetLang);
  }
}
