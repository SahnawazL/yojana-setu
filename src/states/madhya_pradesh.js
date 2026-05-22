// Madhya Pradesh — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "madhya_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const MADHYA_PRADESH_SCHEMES = [

  {
    id: "mp_ladli",
    icon: "👧", color: "#C026D3", scope: "state", state: "Madhya Pradesh",
    ministry: { en: "MP Women & Child Dept.", hi: "मध्यप्रदेश महिला एवं बाल विकास" },
    name:    { en: "Ladli Laxmi Yojana 2.0 (MP)",          hi: "लाड़ली लक्ष्मी योजना 2.0 (म.प्र.)" },
    benefit: { en: "₹1,43,000 total support for girl child", hi: "बालिका के लिए कुल ₹1,43,000 सहायता" },
    tag:     { en: "Girl Child", hi: "बालिका" },
    annual: 143000,
    apply:   { en: "ladlilaxmi.mp.gov.in", hi: "ladlilaxmi.mp.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Birth Certificate","Residence Proof","Bank Account"],
               hi: ["आधार कार्ड","जन्म प्रमाण","निवास प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Madhya Pradesh" && ["below1","1to3","3to6"].includes(a.income),
  }

  // ADD MORE MADHYA PRADESH SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "madhya_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Madhya Pradesh",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Madhya Pradesh",
  // },

];
