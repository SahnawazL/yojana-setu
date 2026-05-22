// Haryana — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "haryana_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const HARYANA_SCHEMES = [

  {
    id: "haryana_saksham",
    icon: "💼", color: "#4338CA", scope: "state", state: "Haryana",
    ministry: { en: "Haryana Employment Dept.", hi: "हरियाणा रोजगार विभाग" },
    name:    { en: "Saksham Yuva Scheme (Haryana)",       hi: "सक्षम युवा योजना (हरियाणा)" },
    benefit: { en: "₹9,000/month allowance for graduates", hi: "स्नातक युवाओं को ₹9,000/माह भत्ता" },
    tag:     { en: "Youth / Student", hi: "युवा" },
    annual: 108000,
    apply:   { en: "hreyahs.gov.in", hi: "hreyahs.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Graduation Certificate","Domicile Certificate","Bank Account"],
               hi: ["आधार कार्ड","स्नातक प्रमाण","निवास प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Haryana" && (a.who === "student" || a.who === "general") && ["below1","1to3"].includes(a.income),
  }

  // ADD MORE HARYANA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "haryana_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Haryana",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Haryana",
  // },

];
