// Tamil Nadu — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "tamil_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const TAMIL_NADU_SCHEMES = [

  {
    id: "tn_amma_vodi",
    icon: "📚", color: "#B45309", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu School Education", hi: "तमिलनाडु स्कूल शिक्षा" },
    name:    { en: "Pudhumai Penn Scheme (TN)",               hi: "पुधुमई पेन योजना (तमिलनाडु)" },
    benefit: { en: "₹1,000/month for girl students (Std 6–12)", hi: "कक्षा 6–12 छात्राओं को ₹1,000/माह" },
    tag:     { en: "Girl Student", hi: "छात्रा" },
    annual: 12000,
    apply:   { en: "pudumaipenn.tn.gov.in", hi: "pudumaipenn.tn.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","School Certificate","Bank Account"],
               hi: ["आधार कार्ड","स्कूल प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "student",
  }

  // ADD MORE TAMIL NADU SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "tamil_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Tamil Nadu",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Tamil Nadu",
  // },

];
