// Odisha — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "odisha_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const ODISHA_SCHEMES = [

  {
    id: "odisha_kalia",
    icon: "🌾", color: "#D97706", scope: "state", state: "Odisha",
    ministry: { en: "Odisha Agriculture Dept.", hi: "ओडिशा कृषि विभाग" },
    name:    { en: "KALIA Scheme (Odisha)",                           hi: "कालिया योजना (ओडिशा)" },
    benefit: { en: "₹10,000/year + life insurance + crop assistance for farmers", hi: "₹10,000/वर्ष + जीवन बीमा + फसल सहायता" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 10000,
    apply:   { en: "kalia.odisha.gov.in", hi: "kalia.odisha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records","Bank Passbook","Farmer ID"],
               hi: ["आधार कार्ड","जमीन के कागज़","बैंक पासबुक","किसान आईडी"] },
    match: (a) => a.state === "Odisha" && (a.who === "farmer" || ["below1","1to3"].includes(a.income)),
  }

  // ADD MORE ODISHA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "odisha_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Odisha",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Odisha",
  // },

];
