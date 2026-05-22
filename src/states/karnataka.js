// Karnataka — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "karnataka_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const KARNATAKA_SCHEMES = [

  {
    id: "karnataka_rythu",
    icon: "🌾", color: "#065F46", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Agriculture", hi: "कर्नाटक कृषि" },
    name:    { en: "Rythu Samruddhi Scheme (KA)",           hi: "रायतु समृद्धि योजना (कर्नाटक)" },
    benefit: { en: "₹2,000/acre crop bonus up to 2 acres", hi: "₹2,000/एकड़ फसल बोनस (अधिकतम 2 एकड़)" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 4000,
    apply:   { en: "raitamitra.karnataka.gov.in", hi: "raitamitra.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (RTC)","Bank Account"],
               hi: ["आधार कार्ड","जमीन के कागज़ (RTC)","बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer",
  },

  {
    id: "karnataka_gruha_lakshmi",
    icon: "👩", color: "#BE185D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Women & Child Dev. Dept.", hi: "कर्नाटक महिला एवं बाल विकास विभाग" },
    name:    { en: "Gruha Lakshmi Scheme (Karnataka)",                hi: "गृह लक्ष्मी योजना (कर्नाटक)" },
    benefit: { en: "₹2,000/month to the woman head of every BPL household", hi: "हर BPL घर की महिला मुखिया को ₹2,000/माह" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 24000,
    apply:   { en: "sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card (BPL)","Bank Account (women's name)","Domicile Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड (BPL)","बैंक खाता (महिला के नाम)","अधिवास प्रमाण"] },
    match: (a) => a.state === "Karnataka" && a.who === "women" && ["below1","1to3"].includes(a.income),
  }

  // ADD MORE KARNATAKA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "karnataka_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Karnataka",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Karnataka",
  // },

];
