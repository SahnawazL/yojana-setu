// Maharashtra — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "maharashtra_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const MAHARASHTRA_SCHEMES = [

  {
    id: "maha_health",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Health Dept.", hi: "महाराष्ट्र स्वास्थ्य विभाग" },
    name:    { en: "Mahatma Phule Jan Arogya Yojana",             hi: "महात्मा फुले जन आरोग्य योजना" },
    benefit: { en: "₹1.5 Lakh/year cashless hospital treatment", hi: "₹1.5 लाख/वर्ष कैशलेस अस्पताल" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 150000,
    apply:   { en: "jeevandayee.maharashtra.gov.in", hi: "jeevandayee.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Yellow/Orange Ration Card","Income Certificate"],
               hi: ["आधार कार्ड","पीला/नारंगी राशन कार्ड","आय प्रमाण पत्र"] },
    match: (a) => a.state === "Maharashtra" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "maha_shetkari",
    icon: "🌾", color: "#16A34A", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Agriculture Dept.", hi: "महाराष्ट्र कृषि विभाग" },
    name:    { en: "Shetkari Sanman Yojana (Maha)",           hi: "शेतकरी सन्मान योजना (महाराष्ट्र)" },
    benefit: { en: "₹6,000/year additional to PM Kisan",     hi: "पीएम किसान के अतिरिक्त ₹6,000/वर्ष" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 6000,
    apply:   { en: "krishi.maharashtra.gov.in", hi: "krishi.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","7/12 Land Extract","Bank Passbook"],
               hi: ["आधार कार्ड","7/12 जमीन उतारा","बैंक पासबुक"] },
    match: (a) => a.state === "Maharashtra" && a.who === "farmer",
  },

  {
    id: "maha_majhi_ladki_bahin",
    icon: "👧", color: "#C026D3", scope: "state", state: "Maharashtra",
    ministry: { en: "Maharashtra Women & Child Dev. Dept.", hi: "महाराष्ट्र महिला एवं बाल विकास विभाग" },
    name:    { en: "Majhi Ladki Bahin Yojana (Maharashtra)",          hi: "माझी लाडकी बहीण योजना (महाराष्ट्र)" },
    benefit: { en: "₹1,500/month to women aged 21–65 with income below ₹2.5 Lakh/year", hi: "21–65 वर्ष की महिलाओं को ₹1,500/माह (वार्षिक आय ₹2.5 लाख से कम)" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 18000,
    apply:   { en: "ladakibahin.maharashtra.gov.in", hi: "ladakibahin.maharashtra.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Bank Account (women's name)","Income Certificate","Maharashtra Domicile"],
               hi: ["आधार कार्ड","राशन कार्ड","बैंक खाता (महिला के नाम)","आय प्रमाण","महाराष्ट्र अधिवास प्रमाण"] },
    match: (a) => a.state === "Maharashtra" && a.who === "women" && ["below1","1to3"].includes(a.income),
  }

  // ADD MORE MAHARASHTRA SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "maharashtra_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Maharashtra",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Maharashtra",
  // },

];
