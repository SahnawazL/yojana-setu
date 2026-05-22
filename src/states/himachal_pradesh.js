// Himachal Pradesh — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "himachal_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const HIMACHAL_PRADESH_SCHEMES = [

  {
    id: "hp_sahara",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Himachal Pradesh",
    ministry: { en: "HP Health & Family Welfare Dept.", hi: "हिमाचल प्रदेश स्वास्थ्य विभाग" },
    name:    { en: "Sahara Yojana (Himachal Pradesh)",                hi: "सहारा योजना (हिमाचल प्रदेश)" },
    benefit: { en: "₹3,000/month financial aid for patients of serious chronic diseases", hi: "गंभीर पुरानी बीमारियों के रोगियों को ₹3,000/माह सहायता" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 36000,
    apply:   { en: "hpsocialjustice.gov.in", hi: "hpsocialjustice.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Medical Certificate (Disease Proof)","Income Certificate","Bank Account","Domicile Certificate"],
               hi: ["आधार कार्ड","चिकित्सा प्रमाण पत्र (बीमारी का प्रमाण)","आय प्रमाण","बैंक खाता","अधिवास प्रमाण"] },
    match: (a) => a.state === "Himachal Pradesh" && ["below1","1to3"].includes(a.income),
  }

  // ADD MORE HIMACHAL PRADESH SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "himachal_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Himachal Pradesh",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Himachal Pradesh",
  // },

];
