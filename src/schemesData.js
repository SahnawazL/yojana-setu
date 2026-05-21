// ═══════════════════════════════════════════════════════════════════════════════
// schemesData.js  —  Single source of truth for YojanaSetu
// Import this file in YojanaSetu.jsx instead of defining data inline.
//
// Exports:
//   INDIA_STATES   — array of all state/UT names
//   SCHEME_DB      — full scheme list with eligibility match() functions
//   CATEGORIES     — category tiles (home page) with filterKey for filtering
//   HOME_SCHEMES   — popular schemes shown on home page (references SCHEME_DB ids)
// ═══════════════════════════════════════════════════════════════════════════════


// ─── INDIA STATES ──────────────────────────────────────────────────────────────
export const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
  "Ladakh","Puducherry","Chandigarh","Andaman & Nicobar",
];


// ─── SCHEME DATABASE ───────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any existing block below.
//   2. Give it a unique id (e.g. "my_new_scheme").
//   3. Set scope: "national"  →  available in all states.
//              scope: "state"   →  add  state: "State Name"  matching INDIA_STATES.
//   4. Write the match() function:  (answers) => boolean
//      answers has keys: who, income, state, house, age, area
//      who     : "farmer" | "student" | "women" | "senior" | "business" | "general"
//      income  : "below1" | "1to3" | "3to6" | "above6"
//      state   : any value from INDIA_STATES
//      house   : "yes" | "no" | "kutcha"
//      age     : "below18" | "18to35" | "35to60" | "above60"
//      area    : "rural" | "urban" | "semi"
//   5. Save. The app picks it up automatically — no other file needs editing.
// ──────────────────────────────────────────────────────────────────────────────

export const SCHEME_DB = [

  // ══════════════════════ NATIONAL SCHEMES ════════════════════════════════════

  {
    id: "pmkisan",
    icon: "🌾", color: "#138808", scope: "national",
    ministry: { en: "Ministry of Agriculture", hi: "कृषि मंत्रालय" },
    name:    { en: "PM Kisan Samman Nidhi",   hi: "पीएम किसान सम्मान निधि" },
    benefit: { en: "₹6,000/year · 3 installments of ₹2,000", hi: "₹6,000/वर्ष · ₹2,000 की 3 किस्तें" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 6000,
    apply:   { en: "pmkisan.gov.in", hi: "pmkisan.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra)","Bank Passbook"],
               hi: ["आधार कार्ड","जमीन के कागज़","बैंक पासबुक"] },
    // Eligibility: farmer + income below ₹6 lakh
    match: (a) => a.who === "farmer" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pmawas_rural",
    icon: "🏠", color: "#FF9933", scope: "national",
    ministry: { en: "Ministry of Housing", hi: "आवास मंत्रालय" },
    name:    { en: "PM Awas Yojana (Gramin)",          hi: "पीएम आवास योजना (ग्रामीण)" },
    benefit: { en: "₹1.20 Lakh for house construction", hi: "मकान निर्माण के लिए ₹1.20 लाख" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 120000,
    apply:   { en: "pmayg.nic.in", hi: "pmayg.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BPL Certificate","Land Documents","Bank Account"],
               hi: ["आधार कार्ड","बीपीएल प्रमाण पत्र","जमीन के कागज़","बैंक खाता"] },
    // Eligibility: no/kutcha house + low income + rural
    match: (a) => ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income) && a.area === "rural",
  },

  {
    id: "pmawas_urban",
    icon: "🏙️", color: "#FF8C00", scope: "national",
    ministry: { en: "Ministry of Housing", hi: "आवास मंत्रालय" },
    name:    { en: "PM Awas Yojana (Urban)",         hi: "पीएम आवास योजना (शहरी)" },
    benefit: { en: "₹2.50 Lakh subsidy on home loan", hi: "होम लोन पर ₹2.50 लाख सब्सिडी" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 250000,
    apply:   { en: "pmaymis.gov.in", hi: "pmaymis.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Income Proof","Bank Statement","No Property Certificate"],
               hi: ["आधार कार्ड","आय प्रमाण","बैंक स्टेटमेंट","संपत्ति न होने का प्रमाण"] },
    match: (a) => ["no","kutcha"].includes(a.house) && ["below1","1to3","3to6"].includes(a.income) && ["urban","semi"].includes(a.area),
  },

  {
    id: "ayushman",
    icon: "🏥", color: "#003580", scope: "national",
    ministry: { en: "Ministry of Health", hi: "स्वास्थ्य मंत्रालय" },
    name:    { en: "Ayushman Bharat (PMJAY)",            hi: "आयुष्मान भारत (पीएमजेएवाई)" },
    benefit: { en: "₹5 Lakh/year free hospital treatment", hi: "₹5 लाख/वर्ष मुफ्त अस्पताल इलाज" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "beneficiary.nha.gov.in", hi: "beneficiary.nha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Income Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड","आय प्रमाण पत्र"] },
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "scholarship",
    icon: "📚", color: "#8B0000", scope: "national",
    ministry: { en: "Ministry of Education", hi: "शिक्षा मंत्रालय" },
    name:    { en: "National Scholarship (NSP)",          hi: "राष्ट्रीय छात्रवृत्ति (NSP)" },
    benefit: { en: "₹10,000 – ₹50,000/year for studies", hi: "₹10,000 – ₹50,000/वर्ष" },
    tag:     { en: "Education", hi: "शिक्षा" },
    annual: 25000,
    apply:   { en: "scholarships.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Mark Sheets","Income Certificate","Bank Account"],
               hi: ["आधार कार्ड","मार्कशीट","आय प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.who === "student" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "mudra",
    icon: "💼", color: "#6B21A8", scope: "national",
    ministry: { en: "Ministry of Finance", hi: "वित्त मंत्रालय" },
    name:    { en: "PM Mudra Yojana",                          hi: "पीएम मुद्रा योजना" },
    benefit: { en: "Loan ₹50,000 – ₹10 Lakh · No collateral", hi: "₹50,000 से ₹10 लाख · बिना गारंटी" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "mudra.org.in", hi: "mudra.org.in" }, applyType: "online",
    docs:    { en: ["Aadhaar & PAN","Business Plan","Bank Statement 6 months","Photo"],
               hi: ["आधार और पैन","व्यापार योजना","6 महीने बैंक स्टेटमेंट","फोटो"] },
    match: (a) => a.who === "business" || ["18to35","35to60"].includes(a.age),
  },

  {
    id: "ujjwala",
    icon: "🔥", color: "#EA580C", scope: "national",
    ministry: { en: "Ministry of Petroleum", hi: "पेट्रोलियम मंत्रालय" },
    name:    { en: "PM Ujjwala Yojana",                        hi: "पीएम उज्ज्वला योजना" },
    benefit: { en: "Free LPG connection + first refill free", hi: "मुफ्त एलपीजी + पहली रिफिल मुफ्त" },
    tag:     { en: "Women / BPL", hi: "महिला / बीपीएल" },
    annual: 1600,
    apply:   { en: "pmuy.gov.in", hi: "pmuy.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","BPL Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड","बीपीएल प्रमाण"] },
    match: (a) => a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "betibachao",
    icon: "👩", color: "#BE185D", scope: "national",
    ministry: { en: "Ministry of Women & Child", hi: "महिला एवं बाल विकास" },
    name:    { en: "Beti Bachao Beti Padhao",       hi: "बेटी बचाओ बेटी पढ़ाओ" },
    benefit: { en: "₹5,000 support + free education", hi: "₹5,000 सहायता + मुफ्त शिक्षा" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 5000,
    apply:   { en: "wcd.gov.in", hi: "wcd.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Birth Certificate","Bank Account"],
               hi: ["आधार कार्ड","जन्म प्रमाण","बैंक खाता"] },
    match: (a) => a.who === "women",
  },

  {
    id: "vriddhapension",
    icon: "👴", color: "#D97706", scope: "national",
    ministry: { en: "Ministry of Rural Development (NSAP)", hi: "ग्रामीण विकास मंत्रालय (NSAP)" },
    name:    { en: "Indira Gandhi National Old Age Pension (IGNOAPS)", hi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन" },
    benefit: { en: "₹200–₹500/month pension for BPL senior citizens (60+)", hi: "BPL वरिष्ठ नागरिकों (60+) को ₹200–₹500/माह पेंशन" },
    tag:     { en: "Senior / Pension", hi: "वरिष्ठ / पेंशन" },
    annual: 3600,
    apply:   { en: "nsap.nic.in", hi: "nsap.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (60+)","BPL Certificate","Bank Account"],
               hi: ["आधार कार्ड","आयु प्रमाण (60+)","बीपीएल प्रमाण","बैंक खाता"] },
    match: (a) => (a.who === "senior" || a.age === "above60") && ["below1","1to3"].includes(a.income),
  },

  {
    id: "kisancredit",
    icon: "💳", color: "#15803D", scope: "national",
    ministry: { en: "Ministry of Agriculture", hi: "कृषि मंत्रालय" },
    name:    { en: "Kisan Credit Card (KCC)",             hi: "किसान क्रेडिट कार्ड (KCC)" },
    benefit: { en: "Crop loan at 4% interest (subsidised)", hi: "4% ब्याज पर फसल लोन" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "Nearest bank branch", hi: "नज़दीकी बैंक शाखा" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card","Land Records","Bank Passbook","Photo"],
               hi: ["आधार कार्ड","जमीन के कागज़","पासबुक","फोटो"] },
    match: (a) => a.who === "farmer",
  },

  {
    id: "pmjdy",
    icon: "🏦", color: "#1D4ED8", scope: "national",
    ministry: { en: "Ministry of Finance", hi: "वित्त मंत्रालय" },
    name:    { en: "PM Jan Dhan Yojana (PMJDY)",            hi: "पीएम जन धन योजना (PMJDY)" },
    benefit: { en: "Zero-balance account + RuPay card + ₹2L accident cover", hi: "जीरो बैलेंस खाता + RuPay कार्ड + ₹2 लाख दुर्घटना बीमा" },
    tag:     { en: "Banking", hi: "बैंकिंग" },
    annual: 0,
    apply:   { en: "pmjdy.gov.in", hi: "pmjdy.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (or Voter ID / Passport)", "Passport Photo"],
               hi: ["आधार कार्ड (या मतदाता पहचान पत्र / पासपोर्ट)", "पासपोर्ट फोटो"] },
    // Eligibility: any unbanked Indian, targeted at low-income households
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "pmjjby",
    icon: "🛡️", color: "#DC2626", scope: "national",
    ministry: { en: "Ministry of Finance", hi: "वित्त मंत्रालय" },
    name:    { en: "PM Jeevan Jyoti Bima Yojana (PMJJBY)", hi: "पीएम जीवन ज्योति बीमा योजना" },
    benefit: { en: "₹2 lakh life insurance · Only ₹330/year premium", hi: "₹2 लाख जीवन बीमा · केवल ₹330/वर्ष प्रीमियम" },
    tag:     { en: "Insurance", hi: "बीमा" },
    annual: 0,
    apply:   { en: "jansuraksha.gov.in", hi: "jansuraksha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Savings Bank Account", "Mobile Number"],
               hi: ["आधार कार्ड", "बचत बैंक खाता", "मोबाइल नंबर"] },
    // Eligibility: age 18–50, any savings bank account holder
    match: (a) => ["18to35","35to60"].includes(a.age),
  },

  {
    id: "pmsby",
    icon: "🦺", color: "#EA580C", scope: "national",
    ministry: { en: "Ministry of Finance", hi: "वित्त मंत्रालय" },
    name:    { en: "PM Suraksha Bima Yojana (PMSBY)", hi: "पीएम सुरक्षा बीमा योजना" },
    benefit: { en: "₹2 lakh accident insurance · Only ₹20/year premium", hi: "₹2 लाख दुर्घटना बीमा · केवल ₹20/वर्ष प्रीमियम" },
    tag:     { en: "Insurance", hi: "बीमा" },
    annual: 0,
    apply:   { en: "jansuraksha.gov.in", hi: "jansuraksha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Savings Bank Account"],
               hi: ["आधार कार्ड", "बचत बैंक खाता"] },
    // Eligibility: age 18–70, savings bank account holder
    match: (a) => ["18to35","35to60","above60"].includes(a.age),
  },

  {
    id: "apy",
    icon: "🏛️", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Finance (PFRDA)", hi: "वित्त मंत्रालय (PFRDA)" },
    name:    { en: "Atal Pension Yojana (APY)",                         hi: "अटल पेंशन योजना (APY)" },
    benefit: { en: "Guaranteed ₹1,000–₹5,000/month pension after age 60", hi: "60 वर्ष बाद ₹1,000–₹5,000/माह गारंटीड पेंशन" },
    tag:     { en: "Pension", hi: "पेंशन" },
    annual: 0,
    apply:   { en: "jansuraksha.gov.in", hi: "jansuraksha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Bank Account (Aadhaar-linked)", "Mobile Number"],
               hi: ["आधार कार्ड", "बैंक खाता (आधार से लिंक)", "मोबाइल नंबर"] },
    // Eligibility: age 18–40, unorganised sector, not an income-tax payer
    match: (a) => ["18to35","35to60"].includes(a.age) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pmvishwakarma",
    icon: "🔨", color: "#92400E", scope: "national",
    ministry: { en: "Ministry of MSME", hi: "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय" },
    name:    { en: "PM Vishwakarma Yojana",                                hi: "पीएम विश्वकर्मा योजना" },
    benefit: { en: "₹15,000 toolkit grant + loan up to ₹3L at 5% · Free skill training", hi: "₹15,000 टूलकिट अनुदान + 5% पर ₹3 लाख तक लोन · मुफ्त कौशल प्रशिक्षण" },
    tag:     { en: "Artisan / Craftsman", hi: "कारीगर / शिल्पकार" },
    annual: 15000,
    apply:   { en: "pmvishwakarma.gov.in", hi: "pmvishwakarma.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Ration Card", "Bank Account", "Proof of Trade / Occupation"],
               hi: ["आधार कार्ड", "राशन कार्ड", "बैंक खाता", "व्यापार / व्यवसाय का प्रमाण"] },
    // Eligibility: traditional artisan/craftsman, age 18+, self-employed
    match: (a) => a.who === "business" && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "pmsvanidhi",
    icon: "🛒", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Housing & Urban Affairs", hi: "आवासन और शहरी कार्य मंत्रालय" },
    name:    { en: "PM SVANidhi (Street Vendor Loan)",             hi: "पीएम स्वनिधि (स्ट्रीट वेंडर लोन)" },
    benefit: { en: "Loan ₹10,000–₹50,000 · 7% interest subsidy · No collateral", hi: "₹10,000–₹50,000 लोन · 7% ब्याज सब्सिडी · बिना गारंटी" },
    tag:     { en: "Street Vendor", hi: "रेहड़ी-पटरी" },
    annual: 0,
    apply:   { en: "pmsvanidhi.mohua.gov.in", hi: "pmsvanidhi.mohua.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Bank Account", "Vending Certificate / Letter of Recommendation from ULB"],
               hi: ["आधार कार्ड", "बैंक खाता", "वेंडिंग प्रमाण पत्र / नगर निकाय से अनुशंसा पत्र"] },
    // Eligibility: street vendor / small trader (business), any area
    match: (a) => a.who === "business",
  },

  {
    id: "sukanya",
    icon: "🌸", color: "#DB2777", scope: "national",
    ministry: { en: "Ministry of Finance", hi: "वित्त मंत्रालय" },
    name:    { en: "Sukanya Samriddhi Yojana (SSY)",                        hi: "सुकन्या समृद्धि योजना (SSY)" },
    benefit: { en: "8.2% interest p.a. · Tax-free savings for girl's education & marriage", hi: "8.2% वार्षिक ब्याज · बेटी की पढ़ाई व शादी के लिए कर-मुक्त बचत" },
    tag:     { en: "Girl Child / Savings", hi: "बालिका / बचत" },
    annual: 0,
    apply:   { en: "nsiindia.gov.in", hi: "nsiindia.gov.in" }, applyType: "online",
    docs:    { en: ["Girl's Birth Certificate", "Parent / Guardian Aadhaar & PAN", "Passport Size Photos"],
               hi: ["बच्ची का जन्म प्रमाण पत्र", "माता-पिता का आधार व पैन कार्ड", "पासपोर्ट साइज़ फोटो"] },
    // Eligibility: parents/guardians of girl child below age 10 years
    match: (a) => a.who === "women",
  },

  {
    id: "pmmvy",
    icon: "🤱", color: "#BE185D", scope: "national",
    ministry: { en: "Ministry of Women & Child Development", hi: "महिला एवं बाल विकास मंत्रालय" },
    name:    { en: "PM Matru Vandana Yojana (PMMVY)",                        hi: "पीएम मातृ वंदना योजना (PMMVY)" },
    benefit: { en: "₹5,000 for 1st child · ₹6,000 for 2nd girl child · Direct to bank", hi: "पहले बच्चे पर ₹5,000 · दूसरी बेटी पर ₹6,000 · बैंक में सीधे" },
    tag:     { en: "Maternity", hi: "मातृत्व" },
    annual: 5000,
    apply:   { en: "pmmvy.wcd.gov.in", hi: "pmmvy.wcd.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card", "Bank Account", "MCP Card (Mother & Child Protection)", "Marriage Certificate"],
               hi: ["आधार कार्ड", "बैंक खाता", "MCP कार्ड (माँ और बच्चा सुरक्षा)", "विवाह प्रमाण पत्र"] },
    // Eligibility: pregnant/lactating women for first live birth (or 2nd if girl child)
    match: (a) => a.who === "women" && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pmfby",
    icon: "🌧️", color: "#15803D", scope: "national",
    ministry: { en: "Ministry of Agriculture", hi: "कृषि मंत्रालय" },
    name:    { en: "PM Fasal Bima Yojana (PMFBY)",                   hi: "पीएम फसल बीमा योजना (PMFBY)" },
    benefit: { en: "Full crop loss insurance at just 1.5–2% premium", hi: "केवल 1.5–2% प्रीमियम पर पूरी फसल बीमा" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "pmfby.gov.in", hi: "pmfby.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra)","Bank Passbook","Sowing Certificate"],
               hi: ["आधार कार्ड","खसरा/जमीन के कागज़","बैंक पासबुक","बुवाई प्रमाण पत्र"] },
    match: (a) => a.who === "farmer",
  },

  {
    id: "mgnrega",
    icon: "⛏️", color: "#92400E", scope: "national",
    ministry: { en: "Ministry of Rural Development", hi: "ग्रामीण विकास मंत्रालय" },
    name:    { en: "MGNREGA (Job Guarantee Scheme)",                  hi: "मनरेगा (रोजगार गारंटी योजना)" },
    benefit: { en: "100 days guaranteed wage employment/year · ₹220–₹357/day", hi: "100 दिन का गारंटीड रोजगार · ₹220–₹357/दिन" },
    tag:     { en: "Employment", hi: "रोजगार" },
    annual: 22000,
    apply:   { en: "nrega.nic.in", hi: "nrega.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Job Card (from Gram Panchayat)","Bank / Post Office Account"],
               hi: ["आधार कार्ड","जॉब कार्ड (ग्राम पंचायत से)","बैंक / डाकघर खाता"] },
    match: (a) => a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pmkvy",
    icon: "🎓", color: "#1D4ED8", scope: "national",
    ministry: { en: "Ministry of Skill Development", hi: "कौशल विकास मंत्रालय" },
    name:    { en: "PM Kaushal Vikas Yojana (PMKVY)",                hi: "पीएम कौशल विकास योजना (PMKVY)" },
    benefit: { en: "Free skill training + ₹8,000 reward + placement help", hi: "मुफ्त कौशल प्रशिक्षण + ₹8,000 पुरस्कार + नौकरी सहायता" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 8000,
    apply:   { en: "skillindiadigital.gov.in", hi: "skillindiadigital.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Educational Certificates","Bank Account","Passport Photo"],
               hi: ["आधार कार्ड","शैक्षणिक प्रमाण पत्र","बैंक खाता","पासपोर्ट फोटो"] },
    match: (a) => ["18to35","35to60"].includes(a.age) && ["below1","1to3","3to6"].includes(a.income),
  },

  {
    id: "pmegp",
    icon: "🏭", color: "#6B21A8", scope: "national",
    ministry: { en: "Ministry of MSME", hi: "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय" },
    name:    { en: "PM Employment Generation Programme (PMEGP)",      hi: "पीएम रोजगार सृजन कार्यक्रम (PMEGP)" },
    benefit: { en: "15–35% subsidy on loan up to ₹50 Lakh to start business", hi: "व्यापार शुरू करने पर ₹50 लाख तक 15–35% सब्सिडी" },
    tag:     { en: "Business", hi: "व्यापार" },
    annual: 0,
    apply:   { en: "kviconline.gov.in/pmegpeportal", hi: "kviconline.gov.in/pmegpeportal" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Project Report","Educational Certificate","Caste Certificate (if SC/ST/OBC)"],
               hi: ["आधार कार्ड","प्रोजेक्ट रिपोर्ट","शैक्षणिक प्रमाण","जाति प्रमाण पत्र (SC/ST/OBC के लिए)"] },
    match: (a) => a.who === "business" || (["18to35","35to60"].includes(a.age) && ["below1","1to3"].includes(a.income)),
  },

  {
    id: "standup_india",
    icon: "🤝", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Finance (SIDBI)", hi: "वित्त मंत्रालय (SIDBI)" },
    name:    { en: "Stand-Up India Scheme",                           hi: "स्टैंड-अप इंडिया योजना" },
    benefit: { en: "Bank loan ₹10 Lakh–₹1 Crore for SC/ST & Women entrepreneurs", hi: "SC/ST और महिला उद्यमियों को ₹10 लाख–₹1 करोड़ लोन" },
    tag:     { en: "Business / Women", hi: "व्यापार / महिला" },
    annual: 0,
    apply:   { en: "standupmitra.in", hi: "standupmitra.in" }, applyType: "online",
    docs:    { en: ["Aadhaar & PAN Card","Caste/Gender Proof","Business Plan","Bank Statement"],
               hi: ["आधार और पैन कार्ड","जाति/लिंग प्रमाण","व्यापार योजना","बैंक स्टेटमेंट"] },
    match: (a) => a.who === "business" || a.who === "women",
  },

  {
    id: "nfsa_pds",
    icon: "🌾", color: "#B45309", scope: "national",
    ministry: { en: "Ministry of Consumer Affairs & Food", hi: "उपभोक्ता मामले और खाद्य मंत्रालय" },
    name:    { en: "National Food Security Act (Ration Card / PDS)",  hi: "राष्ट्रीय खाद्य सुरक्षा अधिनियम (राशन कार्ड)" },
    benefit: { en: "5 kg grain/person/month at ₹1–₹3 · Free under PMGKAY", hi: "5 किलो अनाज/व्यक्ति/माह ₹1–₹3 में · PMGKAY के तहत मुफ्त" },
    tag:     { en: "Food Security", hi: "खाद्य सुरक्षा" },
    annual: 3600,
    apply:   { en: "nfsa.gov.in", hi: "nfsa.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Existing Ration Card","Income Certificate","Address Proof"],
               hi: ["आधार कार्ड","राशन कार्ड","आय प्रमाण पत्र","पता प्रमाण"] },
    match: (a) => ["below1","1to3"].includes(a.income),
  },

  {
    id: "sbm_gramin",
    icon: "🚽", color: "#0369A1", scope: "national",
    ministry: { en: "Ministry of Jal Shakti", hi: "जल शक्ति मंत्रालय" },
    name:    { en: "Swachh Bharat Mission – Gramin (Toilet Scheme)",  hi: "स्वच्छ भारत मिशन – ग्रामीण (शौचालय योजना)" },
    benefit: { en: "₹12,000 grant to build toilet at home",           hi: "घर में शौचालय निर्माण के लिए ₹12,000 अनुदान" },
    tag:     { en: "Sanitation", hi: "स्वच्छता" },
    annual: 12000,
    apply:   { en: "sbm.gov.in", hi: "sbm.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","No-Toilet Proof","Bank Account"],
               hi: ["आधार कार्ड","राशन कार्ड","शौचालय न होने का प्रमाण","बैंक खाता"] },
    match: (a) => a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "daynrlm",
    icon: "👩‍👩‍👧", color: "#BE185D", scope: "national",
    ministry: { en: "Ministry of Rural Development", hi: "ग्रामीण विकास मंत्रालय" },
    name:    { en: "DAY-NRLM (Self Help Group – Women)",              hi: "डीएवाई-एनआरएलएम (महिला स्वयं सहायता समूह)" },
    benefit: { en: "₹10,000–₹15 Lakh loan for SHG + interest subsidy + training", hi: "SHG को ₹10,000–₹15 लाख लोन + ब्याज सब्सिडी + प्रशिक्षण" },
    tag:     { en: "Women / SHG", hi: "महिला / SHG" },
    annual: 0,
    apply:   { en: "aajeevika.gov.in", hi: "aajeevika.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","SHG Registration Document","Bank Account (Group)","Address Proof"],
               hi: ["आधार कार्ड","SHG पंजीकरण दस्तावेज़","बैंक खाता (समूह)","पता प्रमाण"] },
    match: (a) => a.who === "women" && a.area === "rural",
  },

  {
    id: "pmpsmy",
    icon: "🩺", color: "#0891B2", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय" },
    name:    { en: "PM Surakshit Matritva Abhiyan (PMSMA)",           hi: "पीएम सुरक्षित मातृत्व अभियान (PMSMA)" },
    benefit: { en: "Free antenatal checkup on 9th of every month at govt. facilities", hi: "हर माह की 9 तारीख को मुफ्त प्रसव पूर्व जांच" },
    tag:     { en: "Maternity / Health", hi: "मातृत्व / स्वास्थ्य" },
    annual: 5000,
    apply:   { en: "pmsma.mohfw.gov.in", hi: "pmsma.mohfw.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","MCP Card","Pregnancy Proof"],
               hi: ["आधार कार्ड","MCP कार्ड","गर्भावस्था प्रमाण"] },
    match: (a) => a.who === "women",
  },

  {
    id: "pmjay_senior",
    icon: "🏥", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Health & Family Welfare", hi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय" },
    name:    { en: "Ayushman Bharat – Senior Citizens (70+)",         hi: "आयुष्मान भारत – वरिष्ठ नागरिक (70+)" },
    benefit: { en: "₹5 Lakh/year free health cover for all citizens 70 years & above", hi: "70+ वर्ष के सभी नागरिकों को ₹5 लाख/वर्ष मुफ्त स्वास्थ्य कवर" },
    tag:     { en: "Senior / Health", hi: "वरिष्ठ / स्वास्थ्य" },
    annual: 500000,
    apply:   { en: "beneficiary.nha.gov.in", hi: "beneficiary.nha.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (70+ years)","Any ID Proof"],
               hi: ["आधार कार्ड","आयु प्रमाण (70+ वर्ष)","कोई भी पहचान पत्र"] },
    match: (a) => a.who === "senior" || a.age === "above60",
  },

  {
    id: "pmgsy",
    icon: "🛣️", color: "#78350F", scope: "national",
    ministry: { en: "Ministry of Rural Development", hi: "ग्रामीण विकास मंत्रालय" },
    name:    { en: "PM Gram Sadak Yojana (PMGSY)",                    hi: "पीएम ग्राम सड़क योजना (PMGSY)" },
    benefit: { en: "All-weather road connectivity to unconnected villages · Free", hi: "असंपर्कित गांवों को हर मौसम में सड़क संपर्क · मुफ्त" },
    tag:     { en: "Rural Infrastructure", hi: "ग्रामीण बुनियादी ढांचा" },
    annual: 0,
    apply:   { en: "pmgsy.nic.in", hi: "pmgsy.nic.in" }, applyType: "online",
    docs:    { en: ["Village Connectivity Application (via Panchayat)","Population Proof"],
               hi: ["ग्राम संपर्क आवेदन (पंचायत के माध्यम से)","जनसंख्या प्रमाण"] },
    match: (a) => a.area === "rural",
  },

  {
    id: "jjm",
    icon: "💧", color: "#0891B2", scope: "national",
    ministry: { en: "Ministry of Jal Shakti", hi: "जल शक्ति मंत्रालय" },
    name:    { en: "Jal Jeevan Mission (Har Ghar Jal)",               hi: "जल जीवन मिशन (हर घर जल)" },
    benefit: { en: "Free piped drinking water connection to every rural household", hi: "हर ग्रामीण घर को मुफ्त नल जल कनेक्शन" },
    tag:     { en: "Water / Rural", hi: "जल / ग्रामीण" },
    annual: 0,
    apply:   { en: "jaljeevanmission.gov.in", hi: "jaljeevanmission.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Address Proof","Ration Card"],
               hi: ["आधार कार्ड","पता प्रमाण","राशन कार्ड"] },
    match: (a) => a.area === "rural" && ["no","kutcha"].includes(a.house),
  },

  {
    id: "ddu_gky",
    icon: "🏗️", color: "#0F766E", scope: "national",
    ministry: { en: "Ministry of Rural Development", hi: "ग्रामीण विकास मंत्रालय" },
    name:    { en: "DDU-Grameen Kaushalya Yojana (DDU-GKY)",          hi: "दीन दयाल उपाध्याय ग्रामीण कौशल्या योजना" },
    benefit: { en: "Free placement-linked skill training + ₹1,000–₹1,500/month stipend during training", hi: "मुफ्त कौशल प्रशिक्षण + प्रशिक्षण के दौरान ₹1,000–₹1,500/माह वजीफा" },
    tag:     { en: "Skill / Youth", hi: "कौशल / युवा" },
    annual: 18000,
    apply:   { en: "kaushal.rural.gov.in", hi: "kaushal.rural.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Age Proof (15–35 years)","Educational Certificate","Bank Account","BPL/Ration Card"],
               hi: ["आधार कार्ड","आयु प्रमाण (15–35 वर्ष)","शैक्षणिक प्रमाण","बैंक खाता","BPL/राशन कार्ड"] },
    match: (a) => a.area === "rural" && ["18to35"].includes(a.age) && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pmay_urban2",
    icon: "🏢", color: "#1D4ED8", scope: "national",
    ministry: { en: "Ministry of Housing & Urban Affairs", hi: "आवासन और शहरी कार्य मंत्रालय" },
    name:    { en: "PM Awas Yojana 2.0 (Urban)",                      hi: "पीएम आवास योजना 2.0 (शहरी)" },
    benefit: { en: "₹2.5 Lakh central subsidy for EWS/LIG house construction or purchase", hi: "EWS/LIG को मकान निर्माण/खरीद पर ₹2.5 लाख केंद्रीय सब्सिडी" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 250000,
    apply:   { en: "pmaymis.gov.in", hi: "pmaymis.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Income Proof (EWS/LIG)","No Property Certificate","Bank Statement","Marriage Certificate"],
               hi: ["आधार कार्ड","आय प्रमाण (EWS/LIG)","संपत्ति न होने का प्रमाण","बैंक स्टेटमेंट","विवाह प्रमाण"] },
    match: (a) => ["no","kutcha"].includes(a.house) && ["below1","1to3","3to6"].includes(a.income) && ["urban","semi"].includes(a.area),
  },

  {
    id: "pm_poshan",
    icon: "🍱", color: "#16A34A", scope: "national",
    ministry: { en: "Ministry of Education", hi: "शिक्षा मंत्रालय" },
    name:    { en: "PM POSHAN (Mid-Day Meal Scheme)",                  hi: "पीएम पोषण (मध्याह्न भोजन योजना)" },
    benefit: { en: "Free nutritious mid-day meal daily to children in Govt. schools (Class 1–8)", hi: "सरकारी स्कूलों में कक्षा 1–8 के बच्चों को मुफ्त पौष्टिक भोजन" },
    tag:     { en: "Student / Child", hi: "छात्र / बच्चे" },
    annual: 3600,
    apply:   { en: "pmposhan.education.gov.in", hi: "pmposhan.education.gov.in" }, applyType: "online",
    docs:    { en: ["School Enrollment Certificate","Aadhaar Card (child)"],
               hi: ["स्कूल नामांकन प्रमाण पत्र","आधार कार्ड (बच्चे का)"] },
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "ignwps",
    icon: "👩‍🦳", color: "#9D174D", scope: "national",
    ministry: { en: "Ministry of Rural Development", hi: "ग्रामीण विकास मंत्रालय" },
    name:    { en: "Indira Gandhi National Widow Pension (IGNWPS)",   hi: "इंदिरा गांधी राष्ट्रीय विधवा पेंशन" },
    benefit: { en: "₹300/month pension for BPL widows aged 40–79 years", hi: "40–79 वर्ष की BPL विधवाओं को ₹300/माह पेंशन" },
    tag:     { en: "Women / Widow", hi: "महिला / विधवा" },
    annual: 3600,
    apply:   { en: "nsap.nic.in", hi: "nsap.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BPL Certificate","Husband's Death Certificate","Age Proof","Bank Account"],
               hi: ["आधार कार्ड","BPL प्रमाण पत्र","पति का मृत्यु प्रमाण पत्र","आयु प्रमाण","बैंक खाता"] },
    match: (a) => a.who === "women" && ["below1","1to3"].includes(a.income) && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "soil_health_card",
    icon: "🧪", color: "#65A30D", scope: "national",
    ministry: { en: "Ministry of Agriculture & Farmers Welfare", hi: "कृषि एवं किसान कल्याण मंत्रालय" },
    name:    { en: "Soil Health Card Scheme",                          hi: "मृदा स्वास्थ्य कार्ड योजना" },
    benefit: { en: "Free soil testing + personalised crop & fertiliser recommendations", hi: "मुफ्त मिट्टी जांच + फसल और खाद की व्यक्तिगत सिफारिश" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "soilhealth.dac.gov.in", hi: "soilhealth.dac.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records","Soil Sample (collected by govt. officer)"],
               hi: ["आधार कार्ड","जमीन के कागज़","मिट्टी का नमूना (सरकारी अधिकारी द्वारा संग्रहित)"] },
    match: (a) => a.who === "farmer",
  },

  {
    id: "e_shram",
    icon: "🪪", color: "#374151", scope: "national",
    ministry: { en: "Ministry of Labour & Employment", hi: "श्रम एवं रोजगार मंत्रालय" },
    name:    { en: "e-SHRAM Card (Unorganised Workers Portal)",        hi: "ई-श्रम कार्ड (असंगठित श्रमिक पोर्टल)" },
    benefit: { en: "₹2 Lakh accident insurance + access to all labour welfare schemes", hi: "₹2 लाख दुर्घटना बीमा + सभी श्रम कल्याण योजनाओं तक पहुंच" },
    tag:     { en: "Labour / General", hi: "श्रमिक / सामान्य" },
    annual: 0,
    apply:   { en: "eshram.gov.in", hi: "eshram.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card (Aadhaar-linked mobile)","Bank Account"],
               hi: ["आधार कार्ड (आधार से लिंक मोबाइल)","बैंक खाता"] },
    match: (a) => ["below1","1to3"].includes(a.income) && a.who !== "student",
  },

  {
    id: "pmkmy",
    icon: "⚙️", color: "#B45309", scope: "national",
    ministry: { en: "Ministry of Labour & Employment", hi: "श्रम एवं रोजगार मंत्रालय" },
    name:    { en: "PM Shram Yogi Maan-dhan (PM-SYM)",                hi: "पीएम श्रम योगी मान-धन (PM-SYM)" },
    benefit: { en: "₹3,000/month pension after age 60 for unorganised workers", hi: "असंगठित श्रमिकों को 60 वर्ष बाद ₹3,000/माह पेंशन" },
    tag:     { en: "Labour / Pension", hi: "श्रमिक / पेंशन" },
    annual: 36000,
    apply:   { en: "maandhan.in", hi: "maandhan.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Bank Account (Aadhaar-linked)","Mobile Number","Self-declaration of unorganised worker"],
               hi: ["आधार कार्ड","बैंक खाता (आधार लिंक)","मोबाइल नंबर","असंगठित श्रमिक स्व-घोषणा"] },
    match: (a) => ["18to35","35to60"].includes(a.age) && ["below1","1to3"].includes(a.income) && a.who === "general",
  },

  {
    id: "nmmss",
    icon: "🎯", color: "#0369A1", scope: "national",
    ministry: { en: "Ministry of Education", hi: "शिक्षा मंत्रालय" },
    name:    { en: "National Means-cum-Merit Scholarship (NMMSS)", hi: "राष्ट्रीय साधन-सह-मेधा छात्रवृत्ति (NMMSS)" },
    benefit: { en: "₹12,000/year (₹1,000/month) for Class 9 to 12 students", hi: "कक्षा 9 से 12 के छात्रों को ₹12,000/वर्ष (₹1,000/माह)" },
    tag:     { en: "Student / Merit", hi: "छात्र / मेधा" },
    annual: 12000,
    apply:   { en: "scholarships.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Class 7/8 Mark Sheet (min. 55%)","Income Certificate (≤₹3.5L/year)","Caste Certificate (if SC/ST)","Passport Size Photos","Address Proof"],
               hi: ["आधार कार्ड","कक्षा 7/8 की मार्कशीट (न्यूनतम 55%)","आय प्रमाण पत्र (≤₹3.5 लाख/वर्ष)","जाति प्रमाण पत्र (SC/ST के लिए)","पासपोर्ट साइज़ फोटो","पता प्रमाण"] },
    // Eligibility: student in govt/govt-aided school, family income ≤ ₹3.5L, min 55% in Class 7/8
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pm_yasasvi",
    icon: "🏅", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment", hi: "सामाजिक न्याय और अधिकारिता मंत्रालय" },
    name:    { en: "PM YASASVI Scholarship (OBC/EBC/DNT)",           hi: "पीएम यशस्वी छात्रवृत्ति (OBC/EBC/DNT)" },
    benefit: { en: "₹75,000/year (Class 9) · ₹1,25,000/year (Class 11) via DBT", hi: "कक्षा 9: ₹75,000/वर्ष · कक्षा 11: ₹1,25,000/वर्ष · DBT से सीधे बैंक में" },
    tag:     { en: "Student / OBC", hi: "छात्र / OBC" },
    annual: 75000,
    apply:   { en: "scholarships.gov.in", hi: "scholarships.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","OBC/EBC/DNT Caste Certificate","Income Certificate (≤₹2.5L/year)","Previous Year Mark Sheet","School Enrollment Certificate","Bank Account (Aadhaar-linked)"],
               hi: ["आधार कार्ड","OBC/EBC/DNT जाति प्रमाण पत्र","आय प्रमाण पत्र (≤₹2.5 लाख/वर्ष)","पिछले वर्ष की मार्कशीट","स्कूल नामांकन प्रमाण","बैंक खाता (आधार लिंक)"] },
    // Eligibility: OBC/EBC/DNT student in Class 9 or 11, family income ≤ ₹2.5L, merit-based selection
    match: (a) => a.who === "student" && ["below1","1to3"].includes(a.income),
  },

  // ADD MORE NATIONAL SCHEMES HERE ↓
  // { id: "new_national_scheme", icon: "🆕", color: "#123456", scope: "national", ... }


  // ══════════════════════ STATE SCHEMES ═══════════════════════════════════════

  // ── Uttar Pradesh ──
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

  // ── Maharashtra ──
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

  // ── Bihar ──
  {
    id: "bihar_kanya",
    icon: "👧", color: "#DC2626", scope: "state", state: "Bihar",
    ministry: { en: "Bihar Women Development", hi: "बिहार महिला विकास निगम" },
    name:    { en: "Mukhyamantri Kanya Utthan (Bihar)",      hi: "मुख्यमंत्री कन्या उत्थान (बिहार)" },
    benefit: { en: "₹50,000 per girl child till graduation", hi: "स्नातक तक ₹50,000 प्रति बालिका" },
    tag:     { en: "Girl / Student", hi: "बालिका / छात्रा" },
    annual: 50000,
    apply:   { en: "medhasoft.bih.nic.in", hi: "medhasoft.bih.nic.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Birth Certificate","Income Certificate","Bank Account"],
               hi: ["आधार कार्ड","जन्म प्रमाण","आय प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Bihar" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Gujarat ──
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

  // ── Rajasthan ──
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

  // ── Tamil Nadu ──
  {
    id: "tn_amma_vodi",
    icon: "📚", color: "#B45309", scope: "state", state: "Tamil Nadu",
    ministry: { en: "Tamil Nadu School Education", hi: "तमिलनाडु स्कूल शिक्षा" },
    name:    { en: "Pudhumai Penn Scheme (TN)",               hi: "पुधुमई पेन योजना (तमिलनाडु)" },
    benefit: { en: "₹1,000/month for girl students (Std 6–12)", hi: "कक्षा 6–12 छात्राओं को ₹1,000/माह" },
    tag:     { en: "Girl Student", hi: "छात्रा" },
    annual: 12000,
    apply:   { en: "pudumaipenn.tn.gov.in", hi: "pudumaipenn.tn.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","School Certificate","Bank Account"],
               hi: ["आधार कार्ड","स्कूल प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.state === "Tamil Nadu" && a.who === "student",
  },

  // ── Delhi ──
  {
    id: "delhi_mohalla",
    icon: "🏥", color: "#0F766E", scope: "state", state: "Delhi",
    ministry: { en: "Delhi Health Dept.", hi: "दिल्ली स्वास्थ्य विभाग" },
    name:    { en: "Mohalla Clinic Scheme (Delhi)",            hi: "मोहल्ला क्लिनिक योजना (दिल्ली)" },
    benefit: { en: "Free OPD, medicines & tests near home",   hi: "घर के पास मुफ्त OPD, दवाएं और टेस्ट" },
    tag:     { en: "Health", hi: "स्वास्थ्य" },
    annual: 5000,
    apply:   { en: "health.delhi.gov.in", hi: "health.delhi.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Delhi Address Proof"],
               hi: ["आधार कार्ड","दिल्ली पता प्रमाण"] },
    match: (a) => a.state === "Delhi",
  },

  // ── Karnataka ──
  {
    id: "karnataka_rythu",
    icon: "🌾", color: "#065F46", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Agriculture", hi: "कर्नाटक कृषि" },
    name:    { en: "Rythu Samruddhi Scheme (KA)",           hi: "रायतु समृद्धि योजना (कर्नाटक)" },
    benefit: { en: "₹2,000/acre crop bonus up to 2 acres", hi: "₹2,000/एकड़ फसल बोनस (अधिकतम 2 एकड़)" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 4000,
    apply:   { en: "raitamitra.karnataka.gov.in", hi: "raitamitra.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (RTC)","Bank Account"],
               hi: ["आधार कार्ड","जमीन के कागज़ (RTC)","बैंक खाता"] },
    match: (a) => a.state === "Karnataka" && a.who === "farmer",
  },

  // ── Madhya Pradesh ──
  {
    id: "mp_ladli",
    icon: "👧", color: "#C026D3", scope: "state", state: "Madhya Pradesh",
    ministry: { en: "MP Women & Child Dept.", hi: "मध्यप्रदेश महिला एवं बाल विकास" },
    name:    { en: "Ladli Laxmi Yojana 2.0 (MP)",          hi: "लाड़ली लक्ष्मी योजना 2.0 (म.प्र.)" },
    benefit: { en: "₹1,43,000 total support for girl child", hi: "बालिका के लिए कुल ₹1,43,000 सहायता" },
    tag:     { en: "Girl Child", hi: "बालिका" },
    annual: 143000,
    apply:   { en: "ladlilaxmi.mp.gov.in", hi: "ladlilaxmi.mp.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Birth Certificate","Residence Proof","Bank Account"],
               hi: ["आधार कार्ड","जन्म प्रमाण","निवास प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Madhya Pradesh" && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── Haryana ──
  {
    id: "haryana_saksham",
    icon: "💼", color: "#4338CA", scope: "state", state: "Haryana",
    ministry: { en: "Haryana Employment Dept.", hi: "हरियाणा रोजगार विभाग" },
    name:    { en: "Saksham Yuva Scheme (Haryana)",       hi: "सक्षम युवा योजना (हरियाणा)" },
    benefit: { en: "₹9,000/month allowance for graduates", hi: "स्नातक युवाओं को ₹9,000/माह भत्ता" },
    tag:     { en: "Youth / Student", hi: "युवा" },
    annual: 108000,
    apply:   { en: "hreyahs.gov.in", hi: "hreyahs.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Graduation Certificate","Domicile Certificate","Bank Account"],
               hi: ["आधार कार्ड","स्नातक प्रमाण","निवास प्रमाण","बैंक खाता"] },
    match: (a) => a.state === "Haryana" && (a.who === "student" || a.who === "general") && ["below1","1to3"].includes(a.income),
  },

  // ── Kerala ──
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
  },

  // ── Telangana ──
  {
    id: "ts_rythu_bandhu",
    icon: "🌾", color: "#16A34A", scope: "state", state: "Telangana",
    ministry: { en: "Telangana Agriculture Dept.", hi: "तेलंगाना कृषि विभाग" },
    name:    { en: "Rythu Bandhu Scheme (Telangana)",                 hi: "रायतु बंधु योजना (तेलंगाना)" },
    benefit: { en: "₹10,000/acre per season (2 seasons/year) investment support", hi: "₹10,000/एकड़ प्रति सीजन (2 सीजन/वर्ष) निवेश सहायता" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 20000,
    apply:   { en: "rythubandhu.telangana.gov.in", hi: "rythubandhu.telangana.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Pattadar Passbook / Land Records","Bank Account"],
               hi: ["आधार कार्ड","पट्टादार पासबुक / जमीन के कागज़","बैंक खाता"] },
    match: (a) => a.state === "Telangana" && a.who === "farmer",
  },

  // ── West Bengal ──
  {
    id: "wb_lakshmir_bhandar",
    icon: "👩", color: "#BE185D", scope: "state", state: "West Bengal",
    ministry: { en: "West Bengal Women & Child Dev.", hi: "पश्चिम बंगाल महिला एवं बाल विकास" },
    name:    { en: "Lakshmir Bhandar Scheme (West Bengal)",           hi: "लक्ष्मीर भंडार योजना (पश्चिम बंगाल)" },
    benefit: { en: "₹500–₹1,000/month to women head of household", hi: "परिवार की मुखिया महिला को ₹500–₹1,000/माह" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 12000,
    apply:   { en: "socialsecurity.wb.gov.in", hi: "socialsecurity.wb.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Voter ID","Ration Card","Bank Account"],
               hi: ["आधार कार्ड","मतदाता पहचान पत्र","राशन कार्ड","बैंक खाता"] },
    match: (a) => a.state === "West Bengal" && a.who === "women",
  },

  // ── Odisha ──
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
  },

  // ── Punjab ──
  {
    id: "punjab_ashirwad",
    icon: "👧", color: "#C026D3", scope: "state", state: "Punjab",
    ministry: { en: "Punjab Social Security Dept.", hi: "पंजाब सामाजिक सुरक्षा विभाग" },
    name:    { en: "Ashirwad Scheme (Punjab)",                        hi: "आशीर्वाद योजना (पंजाब)" },
    benefit: { en: "₹21,000 cash gift on daughter's marriage for BPL families", hi: "BPL परिवारों में बेटी की शादी पर ₹21,000 नकद सहायता" },
    tag:     { en: "Women / Marriage", hi: "महिला / विवाह" },
    annual: 21000,
    apply:   { en: "sswepb.punjab.gov.in", hi: "sswepb.punjab.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","BPL Ration Card","Marriage Certificate","Bank Account"],
               hi: ["आधार कार्ड","BPL राशन कार्ड","विवाह प्रमाण पत्र","बैंक खाता"] },
    match: (a) => a.state === "Punjab" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── Jharkhand ──
  {
    id: "jharkhand_abua_awas",
    icon: "🏠", color: "#0369A1", scope: "state", state: "Jharkhand",
    ministry: { en: "Jharkhand Rural Dev. Dept.", hi: "झारखंड ग्रामीण विकास विभाग" },
    name:    { en: "Abua Awas Yojana (Jharkhand)",                   hi: "अबुआ आवास योजना (झारखंड)" },
    benefit: { en: "₹2 Lakh grant for 3-room pucca house construction", hi: "3 कमरों के पक्के मकान के लिए ₹2 लाख अनुदान" },
    tag:     { en: "Housing", hi: "आवास" },
    annual: 200000,
    apply:   { en: "abuaawasyojana.jharkhand.gov.in", hi: "abuaawasyojana.jharkhand.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Land Ownership Proof","Bank Account","No-Pucca House Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड","जमीन का प्रमाण","बैंक खाता","पक्का मकान न होने का प्रमाण"] },
    match: (a) => a.state === "Jharkhand" && ["no","kutcha"].includes(a.house) && ["below1","1to3"].includes(a.income),
  },

  // ── Assam ──
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
  },

  // ── Himachal Pradesh ──
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
  },

  // ── Chhattisgarh ──
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
  },

  // ── Uttarakhand ──
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
  },

  // ── Rajasthan (additional) ──
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
  },

  // ── Gujarat (additional) ──
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
  },

  // ── Karnataka (additional) ──
  {
    id: "karnataka_gruha_lakshmi",
    icon: "👩", color: "#BE185D", scope: "state", state: "Karnataka",
    ministry: { en: "Karnataka Women & Child Dev. Dept.", hi: "कर्नाटक महिला एवं बाल विकास विभाग" },
    name:    { en: "Gruha Lakshmi Scheme (Karnataka)",                hi: "गृह लक्ष्मी योजना (कर्नाटक)" },
    benefit: { en: "₹2,000/month to the woman head of every BPL household", hi: "हर BPL घर की महिला मुखिया को ₹2,000/माह" },
    tag:     { en: "Women", hi: "महिला" },
    annual: 24000,
    apply:   { en: "sevasindhu.karnataka.gov.in", hi: "sevasindhu.karnataka.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card (BPL)","Bank Account (women's name)","Domicile Certificate"],
               hi: ["आधार कार्ड","राशन कार्ड (BPL)","बैंक खाता (महिला के नाम)","अधिवास प्रमाण"] },
    match: (a) => a.state === "Karnataka" && a.who === "women" && ["below1","1to3"].includes(a.income),
  },

  // ── Maharashtra (additional) ──
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
  },

  // ── UP (additional) ──
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
  },

  // ══════════════════════ 5 NEW SCHEMES ══════════════════════════════════════

  {
    id: "pmkusum",
    icon: "☀️", color: "#F59E0B", scope: "national",
    ministry: { en: "Ministry of New & Renewable Energy", hi: "नवीन और नवीकरणीय ऊर्जा मंत्रालय" },
    name:    { en: "PM Kusum Yojana",                                    hi: "पीएम कुसुम योजना" },
    benefit: { en: "90% subsidy on solar pump for irrigation (up to 7.5 HP)", hi: "सिंचाई के लिए सोलर पंप पर 90% सब्सिडी (7.5 HP तक)" },
    tag:     { en: "Farmer", hi: "किसान" },
    annual: 0,
    apply:   { en: "pmkusum.mnre.gov.in", hi: "pmkusum.mnre.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Land Records (Khasra/Khatauni)","Bank Passbook","Farmer Registration Certificate"],
               hi: ["आधार कार्ड","जमीन के कागज़ (खसरा/खतौनी)","बैंक पासबुक","किसान पंजीकरण प्रमाण पत्र"] },
    // Eligibility: farmer with agricultural land, applying for solar irrigation pump
    match: (a) => a.who === "farmer",
  },

  {
    id: "startup_india",
    icon: "🚀", color: "#2563EB", scope: "national",
    ministry: { en: "Ministry of Commerce & Industry (DPIIT)", hi: "वाणिज्य और उद्योग मंत्रालय (DPIIT)" },
    name:    { en: "Startup India Scheme",                               hi: "स्टार्टअप इंडिया योजना" },
    benefit: { en: "3-yr income tax exemption · ₹10,000 Cr Fund of Funds · Fast IP filing", hi: "3 साल आयकर छूट · ₹10,000 करोड़ फंड · IP पंजीकरण में प्राथमिकता" },
    tag:     { en: "Business / Startup", hi: "व्यापार / स्टार्टअप" },
    annual: 0,
    apply:   { en: "startupindia.gov.in", hi: "startupindia.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar & PAN Card","Certificate of Incorporation / Registration","Business Plan / Pitch Deck","DPIIT Recognition Application"],
               hi: ["आधार और पैन कार्ड","निगमन / पंजीकरण प्रमाण पत्र","व्यापार योजना / पिच डेक","DPIIT मान्यता आवेदन"] },
    // Eligibility: entrepreneur / startup, age 18–60
    match: (a) => a.who === "business" && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "jal_jeevan",
    icon: "💧", color: "#0284C7", scope: "national",
    ministry: { en: "Ministry of Jal Shakti", hi: "जल शक्ति मंत्रालय" },
    name:    { en: "Jal Jeevan Mission – Har Ghar Jal",                 hi: "जल जीवन मिशन – हर घर जल" },
    benefit: { en: "Free tap water connection to every rural household (Functional Household Tap Connection)", hi: "हर ग्रामीण घर में मुफ्त नल जल कनेक्शन (FHTC)" },
    tag:     { en: "Water / Rural", hi: "जल / ग्रामीण" },
    annual: 0,
    apply:   { en: "jaljeevanmission.gov.in", hi: "jaljeevanmission.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","Address Proof","No Water Connection Certificate (from Gram Panchayat)"],
               hi: ["आधार कार्ड","राशन कार्ड","पता प्रमाण","जल कनेक्शन न होने का प्रमाण (ग्राम पंचायत से)"] },
    // Eligibility: rural household without a piped tap water connection
    match: (a) => a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  {
    id: "pm_daksh",
    icon: "🛠️", color: "#7C3AED", scope: "national",
    ministry: { en: "Ministry of Social Justice & Empowerment", hi: "सामाजिक न्याय और अधिकारिता मंत्रालय" },
    name:    { en: "PM DAKSH Yojana",                                    hi: "पीएम दक्ष योजना" },
    benefit: { en: "Free skill training for SC/ST/OBC/minorities + ₹1,000–₹1,500/month stipend", hi: "SC/ST/OBC/अल्पसंख्यकों को मुफ्त कौशल प्रशिक्षण + ₹1,000–₹1,500/माह वजीफा" },
    tag:     { en: "Skill / SC-ST-OBC", hi: "कौशल / SC-ST-OBC" },
    annual: 15000,
    apply:   { en: "pmdaksh.dosje.gov.in", hi: "pmdaksh.dosje.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Caste Certificate (SC/ST/OBC/Minority)","Income Certificate","Educational Proof","Bank Account"],
               hi: ["आधार कार्ड","जाति प्रमाण पत्र (SC/ST/OBC/अल्पसंख्यक)","आय प्रमाण","शैक्षणिक प्रमाण","बैंक खाता"] },
    // Eligibility: SC/ST/OBC/minority youth aged 18–45, income below ₹3 lakh/year
    match: (a) => ["below1","1to3"].includes(a.income) && ["18to35","35to60"].includes(a.age),
  },

  {
    id: "day_nrlm",
    icon: "🌿", color: "#16A34A", scope: "national",
    ministry: { en: "Ministry of Rural Development (DAY-NRLM)", hi: "ग्रामीण विकास मंत्रालय (DAY-NRLM)" },
    name:    { en: "DAY-NRLM – Aajeevika (Rural Livelihoods Mission)", hi: "DAY-NRLM – आजीविका (ग्रामीण आजीविका मिशन)" },
    benefit: { en: "₹15,000 revolving fund for SHGs · Interest subvention on loans · Livelihood grants", hi: "SHG को ₹15,000 रिवॉल्विंग फंड · ऋण पर ब्याज सब्सिडी · आजीविका अनुदान" },
    tag:     { en: "Women / SHG", hi: "महिला / SHG" },
    annual: 15000,
    apply:   { en: "aajeevika.gov.in", hi: "aajeevika.gov.in" }, applyType: "online",
    docs:    { en: ["Aadhaar Card","Ration Card","SHG Membership Certificate","Bank Account (SHG-linked)"],
               hi: ["आधार कार्ड","राशन कार्ड","SHG सदस्यता प्रमाण पत्र","बैंक खाता (SHG से जुड़ा)"] },
    // Eligibility: rural women from BPL/low-income households, Self-Help Group members
    match: (a) => a.who === "women" && a.area === "rural" && ["below1","1to3"].includes(a.income),
  },

  // ADD MORE STATE SCHEMES HERE ↓
  // { id: "state_new", icon:"🆕", color:"#123456", scope:"state", state:"Kerala", ... }

];


// ─── CATEGORIES (home page tiles) ─────────────────────────────────────────────
// filterKey maps to the "who" answer in eligibility checker.
// When user taps a category, the app filters SCHEME_DB using:
//   SCHEME_DB.filter(s => s.match({ who: cat.filterKey, income:"below1", age:"18to35", area:"rural", house:"no", state:"" }))
// OR you can navigate to the Search tab pre-filtered by filterKey.
// ──────────────────────────────────────────────────────────────────────────────
export const CATEGORIES = {
  en: [
    { icon: "🌾", label: "Farmer",   color: "#138808", bg: "#f0fdf4", filterKey: "farmer"   },
    { icon: "📚", label: "Student",  color: "#003580", bg: "#eff6ff", filterKey: "student"  },
    { icon: "👩", label: "Women",    color: "#BE185D", bg: "#fdf2f8", filterKey: "women"    },
    { icon: "👴", label: "Senior",   color: "#FF9933", bg: "#fff7ed", filterKey: "senior"   },
    { icon: "💼", label: "Business", color: "#6B21A8", bg: "#faf5ff", filterKey: "business" },
    { icon: "🏠", label: "Housing",  color: "#0F766E", bg: "#f0fdfa", filterKey: "housing"  },
  ],
  hi: [
    { icon: "🌾", label: "किसान",   color: "#138808", bg: "#f0fdf4", filterKey: "farmer"   },
    { icon: "📚", label: "छात्र",    color: "#003580", bg: "#eff6ff", filterKey: "student"  },
    { icon: "👩", label: "महिला",   color: "#BE185D", bg: "#fdf2f8", filterKey: "women"    },
    { icon: "👴", label: "वरिष्ठ",  color: "#FF9933", bg: "#fff7ed", filterKey: "senior"   },
    { icon: "💼", label: "व्यापार", color: "#6B21A8", bg: "#faf5ff", filterKey: "business" },
    { icon: "🏠", label: "आवास",    color: "#0F766E", bg: "#f0fdfa", filterKey: "housing"  },
  ],
};

// Helper: get schemes matching a category filterKey
// Usage: getSchemesForCategory("farmer")
export function getSchemesForCategory(filterKey) {
  // Housing: both national and state schemes matched by tag
  if (filterKey === "housing") {
    return SCHEME_DB.filter(s =>
      s.tag.en.toLowerCase().includes("housing") ||
      s.tag.en.toLowerCase().includes("awas")
    );
  }

  // Tag keywords used to match state schemes, which can't use s.match()
  // (state schemes require a.state === "X", so match() always returns false with state:"")
  const STATE_TAG_KEYWORDS = {
    farmer:   ["farmer", "kisan", "rythu", "shetkari", "kalia", "krishi"],
    student:  ["student", "education", "scholarship", "merit"],
    women:    ["women", "girl", "widow", "maternity", "shg", "naari", "marriage"],
    senior:   ["senior", "pension", "old age"],
    business: ["business", "artisan", "vendor", "entrepreneur"],
  };
  const stateKeywords = STATE_TAG_KEYWORDS[filterKey] || [];

  if (filterKey === "senior") {
    return SCHEME_DB.filter(s => {
      if (s.scope === "national") {
        return s.match({ who: "senior", income: "below1", age: "above60", area: "rural", house: "yes", state: "" });
      }
      const tagLower = s.tag.en.toLowerCase();
      return stateKeywords.some(kw => tagLower.includes(kw));
    });
  }

  return SCHEME_DB.filter(s => {
    if (s.scope === "national") {
      return s.match({ who: filterKey, income: "below1", age: "18to35", area: "rural", house: "yes", state: "" });
    }
    // State schemes: match by tag keyword instead of s.match()
    const tagLower = s.tag.en.toLowerCase();
    return stateKeywords.some(kw => tagLower.includes(kw));
  });
}


// ─── HOME SCHEMES (popular schemes shown on home page) ────────────────────────
// These reference ids from SCHEME_DB so there is ONE source of truth.
// The app looks up full details from SCHEME_DB by id.
// ──────────────────────────────────────────────────────────────────────────────
export const HOME_SCHEME_IDS = [
  "pmkisan",
  "ayushman",
  "pmawas_rural",
  "scholarship",
  "mudra",
  "ujjwala",
];

// Helper: get home scheme display objects from SCHEME_DB
// Returns array of { id, icon, name, benefit, tag, color, scope }
export function getHomeSchemes(lang = "en") {
  return HOME_SCHEME_IDS.map(id => {
    const s = SCHEME_DB.find(x => x.id === id);
    if (!s) return null;
    return {
      id:      s.id,
      icon:    s.icon,
      color:   s.color,
      scope:   s.scope,
      name:    s.name[lang],
      benefit: s.benefit[lang],
      tag:     s.tag[lang],
    };
  }).filter(Boolean);
}
