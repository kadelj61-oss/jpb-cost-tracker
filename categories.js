// Same keyword rules used to auto-tag the original Strand South Tower import.
// Shared by the server (bulk import) and the client (live suggestions).

export const CATEGORY_RULES = [
  ["Overhead & General Conditions", ["supervision","business ins","group health","overtime (","interest (",
    "contigency","contingency","transportation,","cleanup (","punchout (","misc. - safety","vehicle expense"]],
  ["Equipment", ["concrete pump","crane","scaffolding","machine rentals","hollow metal","ceiling grinding"]],
  ["Masonry", ["masonry","filled cells"]],
  ["Sitework & Shoring", ["excavation","shoring","safety - labor"]],
  ["Rebar, Wire & Post-Tension", ["rebar","reinforcing","wire products","wire mesh","post tension","pt labor","beam accessories"]],
  ["Formwork & Lumber", ["form labor","form lumber","form rental","lumber -"]],
  ["Finishing Labor", ["finish"]],
  ["Concrete", ["concrete"]],
];
export const CATEGORY_DEFAULT = "Other / Miscellaneous";
export const CATEGORIES = [...CATEGORY_RULES.map(([c]) => c), CATEGORY_DEFAULT];

export function classifyType(typeText) {
  const t = String(typeText || "").toLowerCase();
  for (const [cat, kws] of CATEGORY_RULES) {
    for (const kw of kws) {
      if (t.includes(kw)) return cat;
    }
  }
  return CATEGORY_DEFAULT;
}
