// Rajasthan — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "rajasthan_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const RAJASTHAN_SCHEMES = [

  {
    id: "rajasthan_chiranjeevi",
    icon: "🏥", color: "#7C3AED", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Health Dept.", hi: "राजस्थान स्वास्थ्य विभाग" },
    name:    { en: "Mukhyamantri Chiranjeevi Yojana", hi: "मुख्यमंत्री चिरंजीवी योजना" },
    benefit: { en: "₹25 Lakh/year cashless treatment", hi: "₹25 लाख/वर्ष कैशलेस इलाज" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 2500000,
    apply:   { en: "chiranjeevi.rajasthan.gov.in", hi: "chiranjeevi.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Jan Aadhaar Card","Income Certificate"],
               hi: ["आधार कार्ड","जन आधार कार्ड","आय प्रमाण"] },
    match: (a) => a.state === "Rajasthan" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "raj_palanhar",
    icon: "👨‍👧", color: "#7C3AED", scope: "state", state: "Rajasthan",
    ministry: { en: "Rajasthan Social Justice & Empowerment Dept.", hi: "राजस्थान सामाजिक न्याय एवं अधिकारिता विभाग" },
    name:    { en: "Palanhar Yojana (Rajasthan)",                     hi: "पालनहार योजना (राजस्थान)" },
    benefit: { en: "₹1,500/month for orphan/destitute child care till age 18", hi: "अनाथ/निराश्रित बच्चे की 18 वर्ष तक देखभाल के लिए ₹1,500/माह" },
    tag:     { en: "Child / Social", hi: "बच्चे / सामाजिक" },
    annual: 18000,
    apply:   { en: "sje.rajasthan.gov.in", hi: "sje.rajasthan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Jan Aadhaar Card","Child's Birth Certificate","Orphan/Destitute Proof","Guardian Bank Account"],
               hi: ["आधार कार्ड","जन आधार कार्ड","बच्चे का जन्म प्रमाण","अनाथ/निराश्रित प्रमाण","अभिभावक बैंक खाता"] },
    match: (a) => a.state === "Rajasthan" && ["below1","1to3"].includes(a.income),
  }

  // ADD MORE RAJASTHAN SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "rajasthan_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Rajasthan",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Rajasthan",
  // },

];
