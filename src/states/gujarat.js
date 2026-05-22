// Gujarat — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "gujarat_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const GUJARAT_SCHEMES = [

  {
    id: "gujarat_amrutum",
    icon: "🏥", color: "#0891B2", scope: "state", state: "Gujarat",
    ministry: { en: "Gujarat Health & Family Welfare", hi: "गुजरात स्वास्थ्य विभाग" },
    name:    { en: "Mukhyamantri Amrutum Yojana (Guj.)", hi: "मुख्यमंत्री अमृतम योजना (गुजरात)" },
    benefit: { en: "₹5 Lakh/year free medical treatment", hi: "₹5 लाख/वर्ष मुफ्त चिकित्सा" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "health.gujarat.gov.in", hi: "health.gujarat.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Income Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड","आय प्रमाण"] },
    match: (a) => a.state === "Gujarat" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "gujarat_manav_garima",
    icon: "🧰", color: "#D97706", scope: "state", state: "Gujarat",
    ministry: { en: "Gujarat Social Justice & Empowerment Dept.", hi: "गुजरात सामाजिक न्याय एवं अधिकारिता विभाग" },
    name:    { en: "Manav Garima Yojana (Gujarat)",                   hi: "मानव गरिमा योजना (गुजरात)" },
    benefit: { en: "Free toolkit worth ₹4,000 for SC artisans to start self-employment", hi: "SC कारीगरों को स्वरोजगार के लिए ₹4,000 मूल्य का मुफ्त टूलकिट" },
    tag:     { en: "Business / SC", hi: "व्यापार / SC" },
    annual: 4000,
    apply:   { en: "esamajkalyan.gujarat.gov.in", hi: "esamajkalyan.gujarat.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Caste Certificate (SC)","Income Certificate (below ₹1.20L)","Domicile Certificate","Photo"],
               hi: ["आधार कार्ड","जाति प्रमाण पत्र (SC)","आय प्रमाण (₹1.20 लाख से कम)","अधिवास प्रमाण","फोटो"] },
    match: (a) => a.state === "Gujarat" && a.who === "business" && ["below1"].includes(a.income),
  }

  // ADD MORE GUJARAT SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "gujarat_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Gujarat",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Gujarat",
  // },

];
