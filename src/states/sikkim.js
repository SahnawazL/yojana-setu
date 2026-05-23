// Sikkim — YojanaSetu State Schemes
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW SCHEME:
//   1. Copy any block below, paste it above the closing ];
//   2. Give it a unique id like "sikkim_new_scheme"
//   3. Update name, benefit, docs, match() and save.
//   No other file needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export const SIKKIM_SCHEMES = [

  // ── FARMER / AGRICULTURE ─────────────────────────────────────────────────

  {
    id: "sikkim_organic_mission",
    icon: "🌱", color: "#15803D", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Agriculture Dept. / Sikkim State Organic Certification Agency (SSOCA)", hi: "सिक्किम कृषि विभाग / सिक्किम राज्य जैविक प्रमाणन एजेंसी (SSOCA)" },
    name:    { en: "Sikkim Organic Mission — Farmer Support Scheme",
               hi: "सिक्किम जैविक मिशन — किसान सहायता योजना" },
    benefit: { en: "Sikkim being India's first 100% organic state, this flagship scheme provides registered farmers with: free group organic certification under PGS-India (Participatory Guarantee System) covering all farm produce; 75% subsidy on vermi-composting unit setup (₹20,000 subsidy per unit); supply of organic inputs — bio-fertilisers, neem-based pesticides — at 80% subsidy; premium market linkage through the 'Sikkim Organic' brand for exports and domestic premium markets; free soil health testing every season at block agriculture office; training on System of Rice Intensification (SRI) and organic cardamom, ginger, and large-cardamom cultivation (Sikkim's major cash crops); annual incentive of ₹5,000 per hectare for maintaining organic certification; covers all 4 districts — East, West, North, and South Sikkim",
               hi: "सिक्किम भारत का पहला 100% जैविक राज्य होने के कारण, यह प्रमुख योजना पंजीकृत किसानों को प्रदान करती है: PGS-इंडिया (सहभागिता गारंटी प्रणाली) के तहत सभी फार्म उत्पादों के लिए निःशुल्क सामूहिक जैविक प्रमाणन; वर्मी-कम्पोस्ट यूनिट स्थापना पर 75% सब्सिडी (₹20,000 प्रति यूनिट); जैविक इनपुट — जैव-उर्वरक, नीम आधारित कीटनाशक — 80% सब्सिडी पर; निर्यात और घरेलू प्रीमियम बाजारों के लिए 'सिक्किम ऑर्गेनिक' ब्रांड के माध्यम से बाजार संपर्क; ब्लॉक कृषि कार्यालय में हर सीजन निःशुल्क मृदा स्वास्थ्य परीक्षण; SRI पद्धति और जैविक इलायची, अदरक व बड़ी इलायची की खेती पर प्रशिक्षण; जैविक प्रमाणन बनाए रखने पर ₹5,000 प्रति हेक्टेयर वार्षिक प्रोत्साहन; पूर्व, पश्चिम, उत्तर और दक्षिण सिक्किम — सभी 4 जिलों को कवरेज" },
    tag:     { en: "Farmer / Organic / Subsidy", hi: "किसान / जैविक / सब्सिडी" },
    annual: 5000,
    apply:   { en: "sikkimagrisnet.nic.in / Block Agriculture Officer (offline)", hi: "sikkimagrisnet.nic.in / ब्लॉक कृषि अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Farmer Registration Certificate / Land Record (Parcha)", "Sikkim Subject Certificate / Residence Certificate", "Bank Account (Aadhaar-linked)", "Passport Photo", "Mobile Number", "Caste Certificate (if applicable for priority)"],
               hi: ["आधार कार्ड", "किसान पंजीकरण प्रमाण पत्र / भूमि अभिलेख (परचा)", "सिक्किम सब्जेक्ट प्रमाण पत्र / निवास प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मोबाइल नंबर", "जाति प्रमाण पत्र (प्राथमिकता हेतु यदि लागू हो)"] },
    match: (a) => a.state === "Sikkim" && a.who === "farmer",
  },

  {
    id: "sikkim_cmad",
    icon: "🌾", color: "#D97706", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Agriculture & Horticulture Dept. / Chief Minister's Agriculture Diversification Scheme", hi: "सिक्किम कृषि एवं बागवानी विभाग / मुख्यमंत्री कृषि विविधीकरण योजना" },
    name:    { en: "Chief Minister's Agriculture Diversification Scheme (CMADS) — Sikkim",
               hi: "मुख्यमंत्री कृषि विविधीकरण योजना (CMADS) — सिक्किम" },
    benefit: { en: "Encourages small and marginal farmers to diversify beyond subsistence crops into high-value horticulture and allied sectors — key benefits include: 60% capital subsidy on installation of polyhouse/greenhouse (up to ₹70,000 per unit); 50% subsidy on drip irrigation and micro-irrigation equipment; free supply of improved planting material for large cardamom, mandarin orange, kiwi, cherry, and dragon fruit — high-value crops suited to Sikkim's agro-climatic zones; ₹10,000 interest-free crop loan top-up per season for small/marginal farmers; linkage with Sikkim's cooperative marketing network (SIMFED) for assured buy-back of produce; covers all 4 districts with special focus on North and West Sikkim hill farmers",
               hi: "छोटे व सीमांत किसानों को जीविका फसलों से आगे उच्च मूल्य बागवानी और संबद्ध क्षेत्रों में विविधता लाने को प्रोत्साहित करती है — मुख्य लाभ: पॉलीहाउस/ग्रीनहाउस स्थापना पर 60% पूंजी सब्सिडी (प्रति यूनिट ₹70,000 तक); ड्रिप सिंचाई और सूक्ष्म सिंचाई उपकरण पर 50% सब्सिडी; बड़ी इलायची, मेंडेरिन संतरा, कीवी, चेरी और ड्रैगन फ्रूट के उन्नत पौध सामग्री की निःशुल्क आपूर्ति; छोटे/सीमांत किसानों को ₹10,000 ब्याज-मुक्त फसल ऋण टॉप-अप; SIMFED के माध्यम से उपज की सुनिश्चित बायबैक; उत्तर और पश्चिम सिक्किम पहाड़ी किसानों पर विशेष ध्यान के साथ सभी 4 जिलों में कवरेज" },
    tag:     { en: "Farmer / Horticulture / Subsidy", hi: "किसान / बागवानी / सब्सिडी" },
    annual: 10000,
    apply:   { en: "sikkimagrisnet.nic.in / District Horticulture Officer (offline)", hi: "sikkimagrisnet.nic.in / जिला बागवानी अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Farmer Registration Certificate", "Land Record / Parcha (proof of agricultural land)", "Sikkim Subject Certificate", "Bank Account (Aadhaar-linked)", "Passport Photo", "Existing crop / land use details"],
               hi: ["आधार कार्ड", "किसान पंजीकरण प्रमाण पत्र", "भूमि अभिलेख / परचा (कृषि भूमि का प्रमाण)", "सिक्किम सब्जेक्ट प्रमाण पत्र", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "मौजूदा फसल / भूमि उपयोग विवरण"] },
    match: (a) => a.state === "Sikkim" && a.who === "farmer",
  },

  // ── WOMEN / MATERNAL ──────────────────────────────────────────────────────

  {
    id: "sikkim_silm_shg",
    icon: "👩‍💼", color: "#BE185D", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Integrated Livelihood Mission (SILM) / Rural Management & Development Dept.", hi: "सिक्किम समेकित आजीविका मिशन (SILM) / ग्रामीण प्रबंधन एवं विकास विभाग" },
    name:    { en: "Sikkim Integrated Livelihood Mission — Women SHG Support (Sikkim)",
               hi: "सिक्किम समेकित आजीविका मिशन — महिला SHG सहायता (सिक्किम)" },
    benefit: { en: "Comprehensive livelihood support for women through Self-Help Groups (SHGs) — benefits include: revolving fund of ₹15,000 per newly formed SHG (interest-free); community investment fund (CIF) loans up to ₹3 lakh per SHG at 0% interest for income-generating activities; skill training in Sikkim's traditional weaving (Lepcha and Limboo textiles), food processing (organic pickles, cardamom-based products), tailoring, and eco-tourism services; market linkage through state-level fairs and online platforms under 'Sikkim Organic' brand; group life and accident insurance; connects to Pradhan Mantri MUDRA Yojana pipeline; covers rural and semi-urban women across all 4 districts; priority to women from BPL households and ST/SC communities",
               hi: "SHGs के माध्यम से महिलाओं को व्यापक आजीविका सहायता — लाभ शामिल: नए गठित SHG को ₹15,000 रिवॉल्विंग फंड (ब्याज-मुक्त); आय-सृजन गतिविधियों के लिए प्रति SHG ₹3 लाख तक 0% ब्याज पर CIF ऋण; सिक्किम की पारंपरिक बुनाई (लेपचा और लिंबू वस्त्र), खाद्य प्रसंस्करण (जैविक अचार, इलायची उत्पाद), सिलाई और इको-टूरिज्म सेवाओं में कौशल प्रशिक्षण; 'सिक्किम ऑर्गेनिक' ब्रांड के तहत ऑनलाइन और राज्य स्तरीय मेलों में बाजार संपर्क; सामूहिक जीवन एवं दुर्घटना बीमा; PMMY पाइपलाइन से जुड़ाव; सभी 4 जिलों की ग्रामीण व अर्ध-शहरी महिलाएं; BPL और ST/SC समुदायों की महिलाओं को प्राथमिकता" },
    tag:     { en: "Women / SHG / Livelihood", hi: "महिला / SHG / आजीविका" },
    annual: 0,
    apply:   { en: "rmd.sikkim.gov.in / Block Development Office (offline)", hi: "rmd.sikkim.gov.in / ब्लॉक विकास कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "SHG Membership Certificate / SHG Passbook", "Bank Account (SHG joint account)", "Sikkim Subject Certificate / Residence Proof", "Caste Certificate (for ST/SC priority)", "Passport Photo", "BPL Card (if applicable)"],
               hi: ["आधार कार्ड", "SHG सदस्यता प्रमाण पत्र / SHG पासबुक", "बैंक खाता (SHG संयुक्त खाता)", "सिक्किम सब्जेक्ट प्रमाण पत्र / निवास प्रमाण", "जाति प्रमाण पत्र (ST/SC प्राथमिकता के लिए)", "पासपोर्ट फोटो", "BPL कार्ड (यदि लागू हो)"] },
    match: (a) => a.state === "Sikkim" && a.who === "women",
  },

  {
    id: "sikkim_maternity_support",
    icon: "🤱", color: "#9333EA", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Social Justice, Empowerment & Welfare Dept. / Health & Family Welfare Dept.", hi: "सिक्किम सामाजिक न्याय, सशक्तिकरण एवं कल्याण विभाग / स्वास्थ्य एवं परिवार कल्याण विभाग" },
    name:    { en: "Sikkim Maternity Benefit & Mother-Child Nutrition Scheme",
               hi: "सिक्किम मातृत्व लाभ एवं माँ-शिशु पोषण योजना" },
    benefit: { en: "Comprehensive maternity and early childcare support for women in Sikkim — benefits include: ₹6,000 cash incentive for institutional delivery (paid in 2 installments — ₹3,000 on registration of pregnancy + ₹3,000 post delivery); free antenatal check-ups, iron-folic acid supplementation, and full immunisation for mother and newborn at government hospitals and PHCs across all 4 districts; free nutritional supplement kits (Poshan Kit) for 6 months post delivery containing cereals, pulses, and micronutrient packets; additional ₹2,000 state top-up on PMMVY (Pradhan Mantri Matru Vandana Yojana) for Sikkim residents; free transport reimbursement to district hospital for deliveries from remote North Sikkim areas; priority to first-time mothers, BPL households, ST/SC women",
               hi: "सिक्किम की महिलाओं के लिए व्यापक मातृत्व एवं शिशु देखभाल सहायता — लाभ: संस्थागत प्रसव पर ₹6,000 नकद प्रोत्साहन (2 किस्तों में — गर्भावस्था पंजीकरण पर ₹3,000 + प्रसव के बाद ₹3,000); सभी 4 जिलों में सरकारी अस्पतालों और PHCs पर निःशुल्क प्रसवपूर्व जांच, आयरन-फोलिक एसिड और माँ-शिशु के लिए पूर्ण टीकाकरण; प्रसव के बाद 6 महीने के लिए निःशुल्क पोषण किट (अनाज, दाल, सूक्ष्म पोषक पैकेट); PMMVY पर ₹2,000 राज्य टॉप-अप; उत्तर सिक्किम के दूरदराज क्षेत्रों से जिला अस्पताल तक निःशुल्क परिवहन प्रतिपूर्ति; पहली बार माँ बनने वाली महिलाओं, BPL परिवारों, ST/SC महिलाओं को प्राथमिकता" },
    tag:     { en: "Women / Maternity / Nutrition", hi: "महिला / मातृत्व / पोषण" },
    annual: 8000,
    apply:   { en: "Nearest PHC / District Hospital / ICDS Anganwadi Centre (offline)", hi: "निकटतम PHC / जिला अस्पताल / ICDS आंगनबाड़ी केंद्र (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate / Residence Proof", "Mother & Child Protection (MCP) Card", "Bank Account (Aadhaar-linked)", "Pregnancy Registration Certificate (from PHC / Hospital)", "BPL / Income Certificate (if applicable)", "Caste Certificate (for ST/SC priority)", "Passport Photo"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र / निवास प्रमाण", "माँ एवं बाल संरक्षण (MCP) कार्ड", "बैंक खाता (आधार-लिंक्ड)", "गर्भावस्था पंजीकरण प्रमाण पत्र (PHC / अस्पताल से)", "BPL / आय प्रमाण पत्र (यदि लागू हो)", "जाति प्रमाण पत्र (ST/SC प्राथमिकता के लिए)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim" && a.who === "women",
  },

  // ── HOUSING ───────────────────────────────────────────────────────────────

  {
    id: "sikkim_cmrhm",
    icon: "🏠", color: "#B45309", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Rural Development Dept. / Chief Minister's Rural Housing Mission (CMRHM)", hi: "सिक्किम ग्रामीण विकास विभाग / मुख्यमंत्री ग्रामीण आवास मिशन (CMRHM)" },
    name:    { en: "Chief Minister's Rural Housing Mission (CMRHM) — Sikkim",
               hi: "मुख्यमंत्री ग्रामीण आवास मिशन (CMRHM) — सिक्किम" },
    benefit: { en: "Financial assistance for construction or renovation of pucca houses for rural BPL/EWS households in Sikkim — key benefits: ₹1.3 lakh–₹1.6 lakh one-time grant per household (higher amount for North Sikkim due to remoteness and construction cost); released in 3 installments tied to construction milestones (foundation, walls, roof/completion); mandatory inclusion of functional toilet, safe drinking water connection, and kitchen garden; supplementary to PMAY-Gramin — households not covered under PMAY receive full CMRHM grant; earthquake-resistant construction guidelines mandatory given Sikkim's seismic zone; priority to ST/SC households, female-headed families, persons with disability, and households affected by natural disasters (landslides, floods); covers all 4 districts with special priority to North Sikkim, Dzongu, and remote Lepcha reserve areas",
               hi: "सिक्किम में ग्रामीण BPL/EWS परिवारों के लिए पक्के मकान के निर्माण या नवीनीकरण हेतु वित्तीय सहायता — मुख्य लाभ: प्रति परिवार ₹1.3 लाख–₹1.6 लाख एकमुश्त अनुदान (उत्तर सिक्किम में दूरदराज और निर्माण लागत के कारण अधिक); निर्माण मील के पत्थर (नींव, दीवार, छत) से जुड़ी 3 किस्तों में; कार्यात्मक शौचालय, सुरक्षित पेयजल कनेक्शन और किचन गार्डन अनिवार्य; PMAY-ग्रामीण का पूरक; सिक्किम के भूकंप क्षेत्र के कारण भूकंपरोधी निर्माण दिशा-निर्देश अनिवार्य; ST/SC परिवारों, महिला-प्रमुख परिवारों, दिव्यांगजनों और प्राकृतिक आपदा (भूस्खलन, बाढ़) प्रभावित परिवारों को प्राथमिकता; उत्तर सिक्किम, जोंगु और दूरदराज लेपचा आरक्षित क्षेत्रों पर विशेष प्राथमिकता के साथ सभी 4 जिलों में कवरेज" },
    tag:     { en: "Housing / BPL / Rural", hi: "आवास / BPL / ग्रामीण" },
    annual: 160000,
    apply:   { en: "Nearest Block Development Office (BDO) / District Collector Office (offline)", hi: "निकटतम ब्लॉक विकास कार्यालय (BDO) / जिला कलेक्टर कार्यालय (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "BPL / EWS Income Certificate", "Sikkim Subject Certificate", "Land Ownership Document / Patta", "Bank Account (Aadhaar-linked)", "Residence / Domicile Proof (Sikkim)", "Caste Certificate (for ST/SC priority)", "Disability Certificate (if applicable)", "Photograph of existing house / site", "Passport Photo"],
               hi: ["आधार कार्ड", "BPL / EWS आय प्रमाण पत्र", "सिक्किम सब्जेक्ट प्रमाण पत्र", "भूमि स्वामित्व दस्तावेज / पट्टा", "बैंक खाता (आधार-लिंक्ड)", "निवास / अधिवास प्रमाण (सिक्किम)", "जाति प्रमाण पत्र (ST/SC प्राथमिकता के लिए)", "दिव्यांगता प्रमाण पत्र (यदि लागू हो)", "मौजूदा मकान / स्थल की तस्वीर", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim" && ["below1","1to3"].includes(a.income),
  },

  // ── YOUTH / EMPLOYMENT ────────────────────────────────────────────────────

  {
    id: "sikkim_cmses",
    icon: "💼", color: "#0F766E", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Industries Dept. / Chief Minister's Self Employment Scheme (CMSES)", hi: "सिक्किम उद्योग विभाग / मुख्यमंत्री स्वरोजगार योजना (CMSES)" },
    name:    { en: "Chief Minister's Self Employment Scheme (CMSES) — Sikkim",
               hi: "मुख्यमंत्री स्वरोजगार योजना (CMSES) — सिक्किम" },
    benefit: { en: "Collateral-free financial assistance to educated unemployed youth and first-generation entrepreneurs in Sikkim to start micro and small enterprises — key benefits: project loan of ₹50,000–₹15 lakh with 30–40% capital subsidy on project cost (higher subsidy for women, ST/SC applicants, and differently-abled); bank loan component facilitated through Sikkim Bank/nationalised banks; free entrepreneurship development programme (EDP) training through the District Industries Centre (DIC) and Sikkim Industrial Development & Investment Corporation (SIDICO); priority sectors: organic food processing, cardamom/ginger value addition, eco-tourism and homestay, handwoven textiles, IT/BPO services, and bamboo craft — aligned with Sikkim's economic strengths; special facilitation for ex-servicemen; one-time incentive of ₹5,000 for Sikkim Subject holders starting enterprise in rural areas",
               hi: "सिक्किम में शिक्षित बेरोजगार युवाओं और पहली पीढ़ी के उद्यमियों को सूक्ष्म व लघु उद्यम शुरू करने के लिए गारंटी-मुक्त वित्तीय सहायता — मुख्य लाभ: ₹50,000–₹15 लाख परियोजना ऋण, परियोजना लागत पर 30–40% पूंजी सब्सिडी (महिला, ST/SC और दिव्यांगजनों के लिए अधिक); सिक्किम बैंक/राष्ट्रीयकृत बैंकों के माध्यम से बैंक ऋण; DIC और SIDICO के माध्यम से निःशुल्क उद्यमिता विकास कार्यक्रम (EDP) प्रशिक्षण; प्राथमिक क्षेत्र: जैविक खाद्य प्रसंस्करण, इलायची/अदरक मूल्य संवर्धन, इको-टूरिज्म और होमस्टे, हस्तनिर्मित वस्त्र, IT/BPO सेवाएं और बांस शिल्प; पूर्व सैनिकों के लिए विशेष सुविधा; ग्रामीण क्षेत्र में उद्यम शुरू करने वाले सिक्किम सब्जेक्ट धारकों को ₹5,000 एकमुश्त प्रोत्साहन" },
    tag:     { en: "Youth / Self-Employment / Entrepreneur", hi: "युवा / स्वरोजगार / उद्यमी" },
    annual: 0,
    apply:   { en: "industries.sikkim.gov.in / District Industries Centre (DIC) (offline)", hi: "industries.sikkim.gov.in / जिला उद्योग केंद्र (DIC) (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "Sikkim Subject Certificate (mandatory)", "Age Proof (Birth Certificate / Voter ID)", "Educational Qualification Certificate", "Project Report / Business Plan", "Bank Account (Aadhaar-linked)", "Caste Certificate (for higher subsidy)", "Disability Certificate (if applicable)", "Passport Photo"],
               hi: ["आधार कार्ड", "सिक्किम सब्जेक्ट प्रमाण पत्र (अनिवार्य)", "आयु प्रमाण (जन्म प्रमाण पत्र / मतदाता ID)", "शैक्षिक योग्यता प्रमाण पत्र", "परियोजना रिपोर्ट / व्यवसाय योजना", "बैंक खाता (आधार-लिंक्ड)", "जाति प्रमाण पत्र (अधिक सब्सिडी के लिए)", "दिव्यांगता प्रमाण पत्र (यदि लागू हो)", "पासपोर्ट फोटो"] },
    match: (a) => a.state === "Sikkim" && (a.who === "unemployed" || a.who === "business" || a.who === "general") && ["below1","1to3","3to6"].includes(a.income),
  },

  // ── TRIBAL / SCHEDULED TRIBE WELFARE ─────────────────────────────────────

  {
    id: "sikkim_st_welfare",
    icon: "🏛️", color: "#0369A1", scope: "state", state: "Sikkim",
    ministry: { en: "Sikkim Social Justice, Empowerment & Welfare Dept. / Tribal Welfare Division", hi: "सिक्किम सामाजिक न्याय, सशक्तिकरण एवं कल्याण विभाग / जनजातीय कल्याण प्रभाग" },
    name:    { en: "Sikkim Scheduled Tribe Welfare & Development Schemes",
               hi: "सिक्किम अनुसूचित जनजाति कल्याण एवं विकास योजनाएं" },
    benefit: { en: "Bundle of welfare and development benefits exclusively for ST communities (Lepcha, Bhutia, Limboo/Subba, and other recognised Sikkimese tribes) — includes: pre-matric and post-matric scholarship for ST students (₹400–₹1,200 per month depending on class and boarding/day status); free hostel accommodation in government tribal hostels at Gangtok, Namchi, Geyzing, and Mangan for students studying away from home; ₹5,000 annual cultural preservation grant for registered tribal cultural groups; tribal identity card issued by Tribal Welfare Dept. for priority access across all state schemes; ₹3,500 tool kit grant per annum for traditional artisans (Lepcha weavers, Bhutia thangka painters, bamboo-cane craftsmen); reservation in state government jobs and educational institutions; legal aid and land rights support through dedicated ST cell; special package for Dzongu Lepcha Reserve residents — fully protected ecological zone of North Sikkim",
               hi: "ST समुदायों (लेपचा, भूटिया, लिंबू/सुब्बा और अन्य मान्यता प्राप्त सिक्किमी जनजातियों) के लिए कल्याण एवं विकास लाभों का समूह — शामिल: ST छात्रों के लिए प्री-मैट्रिक और पोस्ट-मैट्रिक छात्रवृत्ति (कक्षा और बोर्डिंग/दिवस स्थिति के अनुसार ₹400–₹1,200 प्रतिमाह); गंगटोक, नामची, गेयज़िंग और मांगन में सरकारी जनजातीय छात्रावासों में निःशुल्क आवास; पंजीकृत जनजातीय सांस्कृतिक समूहों को ₹5,000 वार्षिक सांस्कृतिक संरक्षण अनुदान; जनजातीय कल्याण विभाग द्वारा जनजातीय पहचान पत्र; पारंपरिक कारीगरों (लेपचा बुनकर, भूटिया थांका चित्रकार, बांस-बेंत शिल्पकार) को ₹3,500 प्रतिवर्ष टूल किट; राज्य सरकारी नौकरियों और शैक्षणिक संस्थानों में आरक्षण; उत्तर सिक्किम के जोंगु लेपचा रिजर्व निवासियों के लिए विशेष पैकेज" },
    tag:     { en: "Tribal / ST / Scholarship / Welfare", hi: "जनजातीय / ST / छात्रवृत्ति / कल्याण" },
    annual: 14400,
    apply:   { en: "sikkimtribalwelfare.gov.in / District Tribal Welfare Officer (offline)", hi: "sikkimtribalwelfare.gov.in / जिला जनजातीय कल्याण अधिकारी (ऑफलाइन)" }, applyType: "offline",
    docs:    { en: ["Aadhaar Card", "ST (Scheduled Tribe) Certificate issued by Sikkim Govt.", "Sikkim Subject Certificate", "Residence / Domicile Certificate (Sikkim)", "Income Certificate (BPL preferred)", "Bank Account (Aadhaar-linked)", "Passport Photo", "For students: School / College Enrollment Certificate & Mark Sheet", "For artisans: Craft Registration Certificate / Tribal Welfare ID"],
               hi: ["आधार कार्ड", "सिक्किम सरकार द्वारा जारी ST प्रमाण पत्र", "सिक्किम सब्जेक्ट प्रमाण पत्र", "निवास / अधिवास प्रमाण पत्र (सिक्किम)", "आय प्रमाण पत्र (BPL प्राथमिक)", "बैंक खाता (आधार-लिंक्ड)", "पासपोर्ट फोटो", "छात्रों के लिए: विद्यालय / महाविद्यालय नामांकन प्रमाण पत्र एवं अंकतालिका", "कारीगरों के लिए: शिल्प पंजीकरण प्रमाण पत्र / जनजातीय कल्याण ID"] },
    match: (a) => a.state === "Sikkim" && (a.caste === "st" || a.caste === "sc"),
  },

  // ADD MORE SIKKIM SCHEMES ABOVE THIS LINE ↓
  // {
  //   id: "sikkim_new_scheme",
  //   icon: "🆕", color: "#123456", scope: "state", state: "Sikkim",
  //   ministry: { en: "Dept. Name", hi: "विभाग का नाम" },
  //   name:    { en: "Scheme Name", hi: "योजना का नाम" },
  //   benefit: { en: "Benefit details", hi: "लाभ विवरण" },
  //   tag:     { en: "Tag", hi: "टैग" },
  //   annual: 0,
  //   apply:   { en: "website.gov.in", hi: "website.gov.in" }, applyType: "online",
  //   docs:    { en: ["Aadhaar Card"], hi: ["आधार कार्ड"] },
  //   match: (a) => a.state === "Sikkim",
  // },

];
