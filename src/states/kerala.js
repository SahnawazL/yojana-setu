// Kerala — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "kerala_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const KERALA_SCHEMES = [

  {
    id: "kerala_karunya",
    icon: "🏥", color: "#0F766E", scope: "state", state: "Kerala",
    ministry: { en: "Kerala Health Dept.", hi: "केरल स्वास्थ्य विभाग" },
    name:    { en: "Karunya Arogya Suraksha Padhathi (Kerala)",       hi: "करुण्य आरोग्य सुरक्षा पद्धति (केरल)" },
    benefit: { en: "₹5 Lakh/year cashless treatment at empanelled hospitals", hi: "₹5 लाख/वर्ष सूचीबद्ध अस्पतालों में कैशलेस इलाज" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "kasp.kerala.gov.in", hi: "kasp.kerala.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Income Certificate","Kerala Residence Proof"],
               hi: ["आधार कार्ड","राशन कार्ड","आय प्रमाण","केरल निवास प्रमाण"] },
    match: (a) => a.state === "Kerala" && ["below1","1to3","3to6"].includes(a.income),
  }

  // ADD MORE KERALA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "kerala_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Kerala",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Kerala",
  // },

];
