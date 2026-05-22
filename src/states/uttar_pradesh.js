// Uttar Pradesh — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "uttar_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const UTTAR_PRADESH_SCHEMES = [

  {
    id: "up_kanya",
    icon: "👧", color: "#E11D48", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Women Welfare Dept.", hi: "उत्तर प्रदेश महिला कल्याण विभाग" },
    name:    { en: "Kanya Sumangala Yojana (UP)",               hi: "कन्या सुमंगला योजना (उत्तर प्रदेश)" },
    benefit: { en: "₹15,000 total in 6 stages for girl child", hi: "बालिका के लिए 6 चरणों में ₹15,000" },
    tag:     { en: "Girl Child", hi: "बालिका" },
    annual: 15000,
    apply:   { en: "mksy.up.gov.in", hi: "mksy.up.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Birth Certificate","Bank Account","Family ID"],
               hi: ["आधार कार्ड","जन्म प्रमाण","बैंक खाता","परिवार आईडी"] },
    match: (a) => a.state === "Uttar Pradesh" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "up_vidhva",
    icon: "👩‍🦳", color: "#7C3AED", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP Social Welfare Dept.", hi: "उत्तर प्रदेश समाज कल्याण" },
    name:    { en: "UP Vidhwa Pension Yojana",            hi: "उत्तर प्रदेश विधवा पेंशन योजना" },
    benefit: { en: "₹500/month pension for widows",       hi: "विधवा महिलाओं को ₹500/माह पेंशन" },
    tag:     { en: "Women / Widow", hi: "विधवा" },
    annual: 6000,
    apply:   { en: "sspy-up.gov.in", hi: "sspy-up.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Husband's Death Certificate","Income Certificate","Bank Account"],
               hi: ["आधार कार्ड","पति का मृत्यु प्रमाण पत्र","आय प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.state === "Uttar Pradesh" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "up_free_tablet",
    icon: "📱", color: "#1D4ED8", scope: "state", state: "Uttar Pradesh",
    ministry: { en: "UP IT & Electronics Dept.", hi: "उत्तर प्रदेश IT और इलेक्ट्रॉनिक्स विभाग" },
    name:    { en: "UP Free Smartphone / Tablet Yojana",             hi: "यूपी मुफ्त स्मार्टफोन/टैबलेट योजना" },
    benefit: { en: "Free smartphone or tablet to youth in graduation / diploma / ITI / skill courses", hi: "स्नातक/डिप्लोमा/ITI/कौशल पाठ्यक्रम के युवाओं को मुफ्त स्मार्टफोन/टैबलेट" },
    tag:     { en: "Student / Youth", hi: "छात्र / युवा" },
    annual: 12000,
    apply:   { en: "digishakti.up.gov.in", hi: "digishakti.up.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","College / Institute Enrollment Certificate","UP Domicile","Bank Account"],
               hi: ["आधार कार्ड","कॉलेज/संस्था नामांकन प्रमाण","UP अधिवास प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Uttar Pradesh" && a.who === "student",
  }

  // ADD MORE UTTAR PRADESH SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "uttar_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Uttar Pradesh",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Uttar Pradesh",
  // },

];
