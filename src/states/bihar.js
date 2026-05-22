// Bihar — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "bihar_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const BIHAR_SCHEMES = [

  {
    id: "bihar_kanya",
    icon: "👧", color: "#DC2626", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Women Development", hi: "बिहार महिला विकास निगम" },
    name:    { en: "Mukhyamantri Kanya Utthan (Bihar)",      hi: "मुख्यमंत्री कन्या उत्थान (बिहार)" },
    benefit: { en: "₹50,000 per girl child till graduation", hi: "स्नातक तक ₹50,000 प्रति बालिका" },
    tag:     { en: "Girl / Student", hi: "बालिका / छात्रा" },
    annual: 50000,
    apply:   { en: "medhasoft.bih.nic.in", hi: "medhasoft.bih.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Birth Certificate","Income Certificate","Bank Account"],
               hi: ["आधार कार्ड","जन्म प्रमाण","आय प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Bihar" && ["below1","1to3","3to6"].includes(a.income),
  }

  // ADD MORE BIHAR SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "bihar_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Bihar",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Bihar",
  // },

];
