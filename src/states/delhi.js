// Delhi — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "delhi_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const DELHI_SCHEMES = [

  {
    id: "delhi_mohalla",
    icon: "🏥", color: "#0F766E", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health Dept.", hi: "दिल्ली स्वास्थ्य विभाग" },
    name:    { en: "Mohalla Clinic Scheme (Delhi)",            hi: "मोहल्ला क्लिनिक योजना (दिल्ली)" },
    benefit: { en: "Free OPD, medicines & tests near home",   hi: "घर के पास मुफ्त OPD, दवाएं और टेस्ट" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 5000,
    apply:   { en: "health.delhi.gov.in", hi: "health.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Delhi Address Proof"],
               hi: ["आधार कार्ड","दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi",
  }

  // ADD MORE DELHI SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "delhi_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Delhi",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Delhi",
  // },

];
