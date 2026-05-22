// Chhattisgarh — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "chhattisgarh_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const CHHATTISGARH_SCHEMES = [

  {
    id: "cg_dr_khoobasuram",
    icon: "🌾", color: "#15803D", scope: "state", state: "Chhattisgarh",
    ministry: { en: "Chhattisgarh Agriculture Dept.", hi: "छत्तीसगढ़ कृषि विभाग" },
    name:    { en: "Rajiv Gandhi Kisan Nyay Yojana (CG)",             hi: "राजीव गांधी किसान न्याय योजना (छत्तीसगढ़)" },
    benefit: { en: "₹9,000–₹13,000/acre input subsidy for paddy & other crops", hi: "धान व अन्य फसलों पर ₹9,000–₹13,000/एकड़ इनपुट सब्सिडी" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 13000,
    apply:   { en: "kisan.cg.gov.in", hi: "kisan.cg.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (B1/P2)","Bank Passbook","Farmer Registration"],
               hi: ["आधार कार्ड","भूमि अभिलेख (B1/P2)","बैंक पासबुक","किसान पंजीकरण"] },
    match: (a) => a.state === "Chhattisgarh" && a.who === "farmer",
  }

  // ADD MORE CHHATTISGARH SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "chhattisgarh_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Chhattisgarh",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Chhattisgarh",
  // },

];
