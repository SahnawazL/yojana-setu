// Jharkhand — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "jharkhand_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const JHARKHAND_SCHEMES = [

  {
    id: "jharkhand_abua_awas",
    icon: "🏠", color: "#0369A1", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Rural Dev. Dept.", hi: "झारखंड ग्रामीण विकास विभाग" },
    name:    { en: "Abua Awas Yojana (Jharkhand)",                   hi: "अबुआ आवास योजना (झारखंड)" },
    benefit: { en: "₹2 Lakh grant for 3-room pucca house construction", hi: "3 कमरों के पक्के मकान के लिए ₹2 लाख अनुदान" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 200000,
    apply:   { en: "abuaawasyojana.jharkhand.gov.in", hi: "abuaawasyojana.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Land Ownership Proof","Bank Account","No-Pucca House Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड","जमीन का प्रमाण","बैंक खाता","पक्का मकान न होने का प्रमाण"] },
    match: (a) => a.state === "Jharkhand" && ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income),
  }

  // ADD MORE JHARKHAND SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "jharkhand_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Jharkhand",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Jharkhand",
  // },

];
