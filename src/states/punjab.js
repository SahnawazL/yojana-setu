// Punjab — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "punjab_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const PUNJAB_SCHEMES = [

  {
    id: "punjab_ashirwad",
    icon: "👧", color: "#C026D3", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Social Security Dept.", hi: "पंजाब सामाजिक सुरक्षा विभाग" },
    name:    { en: "Ashirwad Scheme (Punjab)",                        hi: "आशीर्वाद योजना (पंजाब)" },
    benefit: { en: "₹21,000 cash gift on daughter's marriage for BPL families", hi: "BPL परिवारों में बेटी की शादी पर ₹21,000 नकद सहायता" },
    tag:     { en: "Women / Marriage", hi: "महिला / विवाह" },
    annual: 21000,
    apply:   { en: "sswepb.punjab.gov.in", hi: "sswepb.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BPL Ration Card","Marriage Certificate","Bank Account"],
               hi: ["आधार कार्ड","BPL राशन कार्ड","विवाह प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.state === "Punjab" && a.who === "women" && ["below1","1to3"].includes(a.income),
  }

  // ADD MORE PUNJAB SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "punjab_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Punjab",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Punjab",
  // },

];
