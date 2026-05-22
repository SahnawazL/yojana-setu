// West Bengal — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "west_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const WEST_BENGAL_SCHEMES = [

  {
    id: "wb_lakshmir_bhandar",
    icon: "👩", color: "#BE185D", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Women & Child Dev.", hi: "पश्चिम बंगाल महिला एवं बाल विकास" },
    name:    { en: "Lakshmir Bhandar Scheme (West Bengal)",           hi: "लक्ष्मीर भंडार योजना (पश्चिम बंगाल)" },
    benefit: { en: "₹500–₹1,000/month to women head of household", hi: "परिवार की मुखिया महिला को ₹500–₹1,000/माह" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 12000,
    apply:   { en: "socialsecurity.wb.gov.in", hi: "socialsecurity.wb.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Voter ID","Ration Card","Bank Account"],
               hi: ["आधार कार्ड","मतदाता पहचान पत्र","राशन कार्ड","बैंक खाता"] },
    match: (a) => a.state === "West Bengal" && a.who === "women",
  }

  // ADD MORE WEST BENGAL SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "west_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "West Bengal",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "West Bengal",
  // },

];
