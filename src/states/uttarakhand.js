// Uttarakhand — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "uttarakhand_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const UTTARAKHAND_SCHEMES = [

  {
    id: "uk_vatsalya",
    icon: "👶", color: "#BE185D", scope: "state", state: "Uttarakhand",
    ministry: { en: "Uttarakhand Women Empowerment & Child Dev.", hi: "उत्तराखंड महिला सशक्तिकरण एवं बाल विकास" },
    name:    { en: "Mukhyamantri Vatsalya Yojana (Uttarakhand)",      hi: "मुख्यमंत्री वात्सल्य योजना (उत्तराखंड)" },
    benefit: { en: "₹3,000/month + free education & healthcare for children orphaned by COVID/any cause", hi: "COVID/किसी कारण से अनाथ बच्चों को ₹3,000/माह + मुफ्त शिक्षा व स्वास्थ्य" },
    tag:     { en: "Child / Women", hi: "बच्चे / महिला" },
    annual: 36000,
    apply:   { en: "wecd.uk.gov.in", hi: "wecd.uk.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Parents' Death Certificate","Child's Birth Certificate","Guardian ID","Bank Account"],
               hi: ["आधार कार्ड","माता-पिता का मृत्यु प्रमाण","बच्चे का जन्म प्रमाण","अभिभावक पहचान पत्र","बैंक खाता"] },
    match: (a) => a.state === "Uttarakhand" && ["below1","1to3"].includes(a.income),
  }

  // ADD MORE UTTARAKHAND SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "uttarakhand_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Uttarakhand",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Uttarakhand",
  // },

];
