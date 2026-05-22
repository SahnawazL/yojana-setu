// Assam — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "assam_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const ASSAM_SCHEMES = [

  {
    id: "assam_orunodoi",
    icon: "👩", color: "#EA580C", scope: "state", state: "Assam",
    ministry: { en: "Assam Finance Dept.", hi: "असम वित्त विभाग" },
    name:    { en: "Orunodoi Scheme (Assam)",                        hi: "ओरुनोदोई योजना (असम)" },
    benefit: { en: "₹1,250/month direct cash to women of low-income families", hi: "कम आय वाली महिलाओं को ₹1,250/माह सीधे बैंक में" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 15000,
    apply:   { en: "orunodoi.assam.gov.in", hi: "orunodoi.assam.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Bank Account (women's name)","Income Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड","बैंक खाता (महिला के नाम)","आय प्रमाण पत्र"] },
    match: (a) => a.state === "Assam" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "assam_atal_amrit",
    icon: "🏥", color: "#0369A1", scope: "state", state: "Assam",
    ministry: { en: "Assam Health & Family Welfare Dept.", hi: "असम स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Atal Amrit Abhiyan (Assam)",                     hi: "अटल अमृत अभियान (असम)" },
    benefit: { en: "₹2 Lakh/year cashless treatment for 5 critical illness groups", hi: "5 गंभीर रोग समूहों के लिए ₹2 लाख/वर्ष कैशलेस इलाज" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 200000,
    apply:   { en: "atalamritabhiyan.assam.gov.in", hi: "atalamritabhiyan.assam.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card (BPL/APBPL)","Income Certificate","Residence Proof"],
               hi: ["आधार कार्ड","राशन कार्ड (BPL/APBPL)","आय प्रमाण पत्र","निवास प्रमाण"] },
    match: (a) => a.state === "Assam" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "assam_nijut_moina",
    icon: "📚", color: "#BE185D", scope: "state", state: "Assam",
    ministry: { en: "Assam Education Dept.", hi: "असम शिक्षा विभाग" },
    name:    { en: "Mukhyamantri Nijut Moina (Assam)",               hi: "मुख्यमंत्री निजुत मोइना (असम)" },
    benefit: { en: "₹1,000–₹2,500/month stipend for girl students (Class 11 to PG) to prevent child marriage", hi: "बाल विवाह रोकने के लिए छात्राओं को ₹1,000–₹2,500/माह वजीफा" },
    tag:     { en: "Girl Student", hi: "छात्रा" },
    annual: 12000,
    apply:   { en: "sebaonline.org", hi: "sebaonline.org" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","School / College Enrollment Certificate","Bank Account (girl's name)","Birth Certificate"],
               hi: ["आधार कार्ड","स्कूल/कॉलेज नामांकन प्रमाण","बैंक खाता (छात्रा के नाम)","जन्म प्रमाण पत्र"] },
    match: (a) => a.state === "Assam" && a.who === "student",
  },

  {
    id: "assam_pragyan_bharati",
    icon: "🛵", color: "#7C3AED", scope: "state", state: "Assam",
    ministry: { en: "Assam Education Dept.", hi: "असम शिक्षा विभाग" },
    name:    { en: "Pragyan Bharati Scheme (Assam)",                  hi: "प्रज्ञान भारती योजना (असम)" },
    benefit: { en: "Free scooty for girls scoring 75%+ in HSLC/HS · Free bicycle for other meritorious students", hi: "HSLC/HS में 75%+ लाने वाली छात्राओं को मुफ्त स्कूटी · अन्य को साइकिल" },
    tag:     { en: "Student / Girl", hi: "छात्रा" },
    annual: 60000,
    apply:   { en: "sebaonline.org", hi: "sebaonline.org" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","HSLC / HS Marksheet (75%+)","School Certificate","Bank Account"],
               hi: ["आधार कार्ड","HSLC/HS अंकसूची (75%+)","स्कूल प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.state === "Assam" && a.who === "student",
  },

  {
    id: "assam_anundoram",
    icon: "💻", color: "#1D4ED8", scope: "state", state: "Assam",
    ministry: { en: "Assam Education Dept. (SEBA)", hi: "असम शिक्षा विभाग (SEBA)" },
    name:    { en: "Anundoram Borooah Award (Assam)",                 hi: "आनंदराम बरुआ पुरस्कार (असम)" },
    benefit: { en: "₹1 Lakh cash + free laptop for students scoring Distinction in HSLC", hi: "HSLC में डिस्टिंक्शन पाने पर ₹1 लाख नकद + मुफ्त लैपटॉप" },
    tag:     { en: "Student / Merit", hi: "छात्र / मेधावी" },
    annual: 100000,
    apply:   { en: "sebaonline.org", hi: "sebaonline.org" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","HSLC Marksheet (Distinction)","School Certificate","Bank Account"],
               hi: ["आधार कार्ड","HSLC अंकसूची (डिस्टिंक्शन)","स्कूल प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.state === "Assam" && a.who === "student",
  },

  {
    id: "assam_krishi_sajuli",
    icon: "🚜", color: "#15803D", scope: "state", state: "Assam",
    ministry: { en: "Assam Agriculture Dept.", hi: "असम कृषि विभाग" },
    name:    { en: "Mukhyamantri Krishi Sa-Sajuli Yojana (Assam)",   hi: "मुख्यमंत्री कृषि सा-साजुली योजना (असम)" },
    benefit: { en: "Free farm equipment kit worth ₹5,000 to small & marginal farmers", hi: "छोटे और सीमांत किसानों को ₹5,000 के मुफ्त कृषि उपकरण" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 5000,
    apply:   { en: "agri.assam.gov.in", hi: "agri.assam.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records / Patta","Bank Passbook","Farmer Registration Certificate"],
               hi: ["आधार कार्ड","जमीन के कागज़/पट्टा","बैंक पासबुक","किसान पंजीकरण प्रमाण पत्र"] },
    match: (a) => a.state === "Assam" && a.who === "farmer",
  },

  {
    id: "assam_swanirbhar_naari",
    icon: "💼", color: "#D97706", scope: "state", state: "Assam",
    ministry: { en: "Assam Women & Child Dev. Dept.", hi: "असम महिला एवं बाल विकास विभाग" },
    name:    { en: "Swanirbhar Naari Scheme (Assam)",                 hi: "स्वनिर्भर नारी योजना (असम)" },
    benefit: { en: "Interest-free loan up to ₹50,000 + training for women's self-employment", hi: "महिला स्वरोजगार के लिए ₹50,000 तक ब्याज मुक्त लोन + प्रशिक्षण" },
    tag:     { en: "Women / Business", hi: "महिला / व्यापार" },
    annual: 0,
    apply:   { en: "wcd.assam.gov.in", hi: "wcd.assam.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Bank Account","Business Plan / Activity Details","Income Certificate","Residence Proof"],
               hi: ["आधार कार्ड","बैंक खाता","व्यापार योजना/गतिविधि विवरण","आय प्रमाण","निवास प्रमाण"] },
    match: (a) => a.state === "Assam" && a.who === "women",
  },

  {
    id: "assam_amrit_briksha",
    icon: "🌳", color: "#065F46", scope: "state", state: "Assam",
    ministry: { en: "Assam Forest & Environment Dept.", hi: "असम वन एवं पर्यावरण विभाग" },
    name:    { en: "Amrit Briksha Andolan (Assam)",                   hi: "अमृत बृक्ष आंदोलन (असम)" },
    benefit: { en: "₹100/sapling reward for planting & nurturing trees for 3 years", hi: "3 साल तक पेड़ उगाने पर ₹100/पौधा पुरस्कार" },
    tag:     { en: "Environment", hi: "पर्यावरण" },
    annual: 5000,
    apply:   { en: "forest.assam.gov.in", hi: "forest.assam.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Bank Account","Land / Land Use Proof","Sapling Planting Proof"],
               hi: ["आधार कार्ड","बैंक खाता","जमीन उपयोग प्रमाण","पौधारोपण प्रमाण"] },
    match: (a) => a.state === "Assam",
  },

  {
    id: "assam_mukhyamantri_atmanirbhar",
    icon: "🧑‍💻", color: "#4338CA", scope: "state", state: "Assam",
    ministry: { en: "Assam Skill, Employment & Entrepreneurship Dept.", hi: "असम कौशल, रोजगार एवं उद्यमिता विभाग" },
    name:    { en: "Mukhyamantri Atmanirbhar Asom Abhiyan",           hi: "मुख्यमंत्री आत्मनिर्भर असम अभियान" },
    benefit: { en: "₹2 Lakh interest-free loan + free skill training for unemployed youth", hi: "बेरोजगार युवाओं के लिए ₹2 लाख ब्याज मुक्त लोन + मुफ्त कौशल प्रशिक्षण" },
    tag:     { en: "Youth / Business", hi: "युवा / व्यापार" },
    annual: 0,
    apply:   { en: "seed.assam.gov.in", hi: "seed.assam.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Educational Certificate","Bank Account","Business Plan","Domicile Certificate"],
               hi: ["आधार कार्ड","शैक्षणिक प्रमाण","बैंक खाता","व्यापार योजना","अधिवास प्रमाण पत्र"] },
    match: (a) => a.state === "Assam" && ["18to35","35to60"].includes(a.age) && ["below1","1to3"].includes(a.income),
  }

  // ADD MORE ASSAM SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "assam_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Assam",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Assam",
  // },

];
