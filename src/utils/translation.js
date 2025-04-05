import translatte from "translatte";

export default async function translateText(text, targetLang) {
  try {
    const res = await translatte(text, { to: targetLang });
    return res.text;
  } catch (error) {
    console.error("Translation Error:", error);
    throw new Error("Failed to translate text");
  }
}
