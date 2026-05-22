// Telangana — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "telangana_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const TELANGANA_SCHEMES = [

  {
    id: "ts_rythu_bandhu",
    icon: "🌾", color: "#16A34A", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Agriculture Dept.", hi: "तेलंगाना कृषि विभाग" },
    name:    { en: "Rythu Bandhu Scheme (Telangana)",                 hi: "रायतु बंधु योजना (तेलंगाना)" },
    benefit: { en: "₹10,000/acre per season (2 seasons/year) investment support", hi: "₹10,000/एकड़ प्रति सीजन (2 सीजन/वर्ष) निवेश सहायता" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 20000,
    apply:   { en: "rythubandhu.telangana.gov.in", hi: "rythubandhu.telangana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Pattadar Passbook / Land Records","Bank Account"],
               hi: ["आधार कार्ड","पट्टादार पासबुक / जमीन के कागज़","बैंक खाता"] },
    match: (a) => a.state === "Telangana" && a.who === "farmer",
  }

  // ADD MORE TELANGANA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "telangana_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Telangana",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Telangana",
  // },

];
