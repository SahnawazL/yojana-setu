import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  INDIA_STATES,
  SCHEME_DB,
  CATEGORIES,
  getHomeSchemes,
  getSchemesForCategory,
} from "./schemesData.js";
import { auth } from "./firebase.js";
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from "firebase/auth";
import AIChat from "./AIChat.jsx";

// ─── COUNT-UP HOOK ─────────────────────────────────────────────────────────────
function useCountUp(targets, trigger, duration=1400){
  const [counts,setCounts]=useState(targets.map(()=>0));
  const raf=useRef(null);
  useEffect(()=>{
    if(!trigger){setCounts(targets.map(()=>0));return;}
    const start=performance.now();
    const step=(now)=>{
      const p=Math.min((now-start)/duration,1);
      const ease=1-Math.pow(1-p,3); // cubic ease-out
      setCounts(targets.map(t=>Math.floor(ease*t)));
      if(p<1) raf.current=requestAnimationFrame(step);
    };
    raf.current=requestAnimationFrame(step);
    return()=>{if(raf.current)cancelAnimationFrame(raf.current);};
  },[trigger]);
  return counts;
}
// ─── STAT TARGETS (stable reference — prevents useCountUp from re-animating) ──
const STAT_TARGETS = [3000, 28, 50];
const STORAGE_KEY = "yojana_eligibility_answers";
const fontFamily = (lang) => lang==="hi"
  ? "'Noto Sans Devanagari',sans-serif"
  : "'Noto Sans',sans-serif";

// ─── INDIA FLAG COLORS ─────────────────────────────────────────────────────────
const SAFFRON    = "#FF9933";
const IND_GREEN  = "#138808";
const ASHOKA_BLUE= "#06038D";
const NAVY_BLUE  = "#003580";

// ─── THEME TOKENS ──────────────────────────────────────────────────────────────
const THEME={
  light:{
    appBg:"#f5f5f0",card:"#fff",card2:"#f8f9fa",
    text:"#1a1a1a",textMid:"#555",textSub:"#888",textLight:"#aaa",
    border:"#f0f0f0",border2:"#e8e8e8",border3:"#e0e0e0",
    inputBg:"#fff",searchBg:"#f5f5f0",pillBg:"#f5f5f0",
    optionBg:"#fff",optionActive:"#FFF7ED",divider:"#f3f3f3",
    navBg:"#fff",navBorder:"#f0f0f0",handle:"#e0e0e0",handle2:"#e4e4e4",
  },
  dark:{
    appBg:"#111111",card:"#1c1c1e",card2:"#252527",
    text:"#f0f0f0",textMid:"#aaa",textSub:"#888",textLight:"#555",
    border:"#2c2c2e",border2:"#3a3a3c",border3:"#3a3a3c",
    inputBg:"#2c2c2e",searchBg:"#2c2c2e",pillBg:"#2c2c2e",
    optionBg:"#2c2c2e",optionActive:"#2d1800",divider:"#2c2c2e",
    navBg:"#1c1c1e",navBorder:"#2c2c2e",handle:"#3a3a3c",handle2:"#3a3a3c",
  }
};

// ─── ASHOKA CHAKRA SVG (24-spoke wheel) ────────────────────────────────────────
function AshokaChakra({size=18,color=ASHOKA_BLUE,spinning=false}){
  const spokes=Array.from({length:24},(_,i)=>i);
  const cx=size/2,cy=size/2,r=size/2-1,innerR=r*0.28;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{flexShrink:0,animation:spinning?"chakra-spin 3s linear infinite":"none"}}>
      <style>{`@keyframes chakra-spin{from{transform-box:fill-box;transform-origin:center;transform:rotate(0deg)}to{transform-box:fill-box;transform-origin:center;transform:rotate(360deg)}}`}</style>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size*0.055}/>
      <circle cx={cx} cy={cy} r={innerR} fill={color}/>
      {spokes.map(i=>{
        const a=(i*360/24)*Math.PI/180;
        return <line key={i} x1={cx+innerR*Math.cos(a)} y1={cy+innerR*Math.sin(a)} x2={cx+r*0.78*Math.cos(a)} y2={cy+r*0.78*Math.sin(a)} stroke={color} strokeWidth={size*0.042}/>;
      })}
    </svg>
  );
}

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────────
const T = {
  en: {
    appName:"YojanaSetu", appSub:"Official Scheme Finder",
    greeting:(n)=> n ? `Namaste, ${n} 🙏` : "Namaste, Citizen 🙏",
    headline:"Find Your Schemes", subheadline:"Discover benefits you truly deserve",
    searchPlaceholder:"Search schemes...", searchBtn:"Search",
    stats:[{number:"3,000+",label:"Schemes"},{number:"28",label:"States"},{number:"50L+",label:"Beneficiaries"}],
    aiBannerTitle:"Ask AI Assistant", aiBannerSub:"Ask anything about any scheme in Hindi or English",
    categoriesTitle:"Categories", categoriesSub:"Browse by Category", seeAll:"See All →",
    ctaTitle:"Check Eligibility",
    ctaSub:(hp)=> hp ? "Results ready from your profile · Tap to view" : "6 quick questions · Get matched instantly",
    ctaBtn:(hp)=> hp ? "View My Schemes →" : "Start Now →",
    schemesTitle:"Popular Schemes", schemesSub:"Top government benefits",
    helplineTitle:"Government Helpline", helplineSub:"Available 24×7 · 1800-111-555", helplineBtn:"Call Now",
    navHome:"Home", navSearch:"Search", navSchemes:"Schemes", navAI:"AI Help", navProfile:"Profile",
    checkerTitle:"Eligibility Check", checkerSub:"6 quick questions",
    stepOf:(c,t)=>`Step ${c} of ${t}`,
    nextBtn:"Next →", backBtn:"← Back", checkBtn:"Find My Schemes 🎯",
    matchSub:(n)=>`You qualify for ${n} scheme${n!==1?"s":""}`,
    centralLabel:"🇮🇳 Central", stateLabel:(s)=>`📍 ${s}`,
    noMatchTitle:"No exact matches", noMatchSub:"Try a different state or change your answers",
    retakeBtn:"Retake", doneBtn:"Done",
    applyLabel:"How to Apply", docsLabel:"Documents Needed", totalBenefit:"Total annual benefit",
    searchStatePh:"Search your state...",
    centralSchemes:"Central Government Schemes", stateSchemes:"State Government Schemes",
    profileTitle:"My Profile", setupTitle:"Set Up Profile", setupSub:"Fill once · Used everywhere",
    editBtn:"Edit", matchedBtn:"My Matched Schemes", saveBtn:"Save Profile ✓", skipBtn:"Skip",
    profileStats:["Schemes matched","Docs saved","Guided"],
    // Category filter sheet
    catSchemes:"Schemes", backHome:"← Back", allSchemes:"All Schemes",
    noSchemesFound:"No schemes found for this category.",
    steps:[
      {title:"Personal Details",sub:"Tell us about yourself",icon:"👤"},
      {title:"Your Location",sub:"Where do you live?",icon:"📍"},
      {title:"Family & Income",sub:"Your household details",icon:"👨‍👩‍👧"},
      {title:"Occupation",sub:"What do you do?",icon:"💼"},
      {title:"Documents",sub:"Basic document info",icon:"📄"},
    ],
    fields:{
      name:"Full Name", namePh:"Enter your full name",
      gender:"Gender", genders:[{v:"male",l:"Male 👨"},{v:"female",l:"Female 👩"},{v:"other",l:"Other 🧑"}],
      age:"Age Group", ages:[{v:"below18",l:"Below 18"},{v:"18to35",l:"18–35 yrs"},{v:"35to60",l:"35–60 yrs"},{v:"above60",l:"Above 60"}],
      state:"State / UT", selectState:"Select your state",
      area:"Area Type", areas:[{v:"rural",l:"Rural / Village 🏡"},{v:"urban",l:"Urban / City 🏙️"},{v:"semi",l:"Semi-urban 🏘️"}],
      family:"Family Size", families:[{v:"1to2",l:"1–2 members"},{v:"3to4",l:"3–4 members"},{v:"5to6",l:"5–6 members"},{v:"7plus",l:"7 or more"}],
      income:"Annual Household Income", incomes:[{v:"below1",l:"Below ₹1 Lakh"},{v:"1to3",l:"₹1–3 Lakh"},{v:"3to6",l:"₹3–6 Lakh"},{v:"above6",l:"Above ₹6 Lakh"}],
      caste:"Category", castes:[{v:"general",l:"General"},{v:"obc",l:"OBC"},{v:"sc",l:"SC"},{v:"st",l:"ST"},{v:"ews",l:"EWS"}],
      occupation:"Occupation", occupations:[{v:"farmer",l:"Farmer 🌾"},{v:"student",l:"Student 📚"},{v:"women",l:"Homemaker 👩"},{v:"senior",l:"Senior Citizen 👴"},{v:"business",l:"Business 💼"},{v:"general",l:"Salaried 🧑"}],
      house:"Do you own a pucca house?", houses:[{v:"yes",l:"Yes — I have a house"},{v:"no",l:"No — I need housing"},{v:"kutcha",l:"Kutcha / Temporary"}],
      aadhaar:"Aadhaar (last 4 digits)", aadhaarPh:"e.g. 4521",
      bank:"Bank Account Number", bankPh:"Enter account number",
      phone:"Mobile Number", phonePh:"10-digit number",
    },
    questions:[
      {id:"who",   q:"Who are you?",               icon:"👤", hint:"Select what best describes you",
        options:[{value:"farmer",label:"Farmer 🌾"},{value:"student",label:"Student 📚"},{value:"women",label:"Woman 👩"},{value:"senior",label:"Senior Citizen 👴"},{value:"business",label:"Business Owner 💼"},{value:"general",label:"General Citizen 🧑"}]},
      {id:"income",q:"Annual household income?",   icon:"💰", hint:"Total family income per year",
        options:[{value:"below1",label:"Below ₹1 Lakh"},{value:"1to3",label:"₹1–3 Lakh"},{value:"3to6",label:"₹3–6 Lakh"},{value:"above6",label:"Above ₹6 Lakh"}]},
      {id:"state", q:"Which state do you live in?",icon:"🗺️", hint:"Central + your state schemes will be shown", type:"state"},
      {id:"house", q:"Do you own a pucca house?",  icon:"🏠", hint:"Pucca = permanent brick/concrete house",
        options:[{value:"no",label:"No — I need housing"},{value:"yes",label:"Yes — I have a house"},{value:"kutcha",label:"Kutcha / Temporary"}]},
      {id:"age",   q:"What is your age?",          icon:"🎂", hint:"Age of the main applicant",
        options:[{value:"below18",label:"Below 18"},{value:"18to35",label:"18–35 years"},{value:"35to60",label:"35–60 years"},{value:"above60",label:"Above 60 years"}]},
      {id:"area",  q:"Your area type?",            icon:"📍", hint:"Your residential area",
        options:[{value:"rural",label:"Rural / Village 🏡"},{value:"urban",label:"Urban / City 🏙️"},{value:"semi",label:"Semi-urban / Town 🏘️"}]},
    ]
  },
  hi: {
    appName:"योजना सेतु", appSub:"सरकारी योजना खोजक",
    greeting:(n)=> n ? `नमस्ते, ${n} 🙏` : "नमस्ते, नागरिक 🙏",
    headline:"आपकी योजनाएं खोजें", subheadline:"जानें आप किन लाभों के हकदार हैं",
    searchPlaceholder:"योजना खोजें...", searchBtn:"खोजें",
    stats:[{number:"3,000+",label:"योजनाएं"},{number:"28",label:"राज्य"},{number:"50L+",label:"लाभार्थी"}],
    aiBannerTitle:"AI सहायक से पूछें", aiBannerSub:"हिंदी या अंग्रेज़ी में कोई भी सवाल पूछें",
    categoriesTitle:"श्रेणियां", categoriesSub:"श्रेणी के अनुसार देखें", seeAll:"सभी देखें →",
    ctaTitle:"पात्रता जांचें",
    ctaSub:(hp)=> hp ? "प्रोफाइल से परिणाम तैयार · देखें" : "6 सवाल · तुरंत जानें",
    ctaBtn:(hp)=> hp ? "मेरी योजनाएं →" : "शुरू करें →",
    schemesTitle:"लोकप्रिय योजनाएं", schemesSub:"शीर्ष सरकारी लाभ",
    helplineTitle:"सरकारी हेल्पलाइन", helplineSub:"24×7 · 1800-111-555", helplineBtn:"कॉल करें",
    navHome:"होम", navSearch:"खोजें", navSchemes:"योजनाएं", navAI:"AI", navProfile:"प्रोफाइल",
    checkerTitle:"पात्रता जांच", checkerSub:"6 आसान सवाल",
    stepOf:(c,t)=>`सवाल ${c} / ${t}`,
    nextBtn:"अगला →", backBtn:"← वापस", checkBtn:"मेरी योजनाएं खोजें 🎯",
    matchSub:(n)=>`आप ${n} योजना${n!==1?"ओं":""} के हकदार हैं`,
    centralLabel:"🇮🇳 केंद्रीय", stateLabel:(s)=>`📍 ${s}`,
    noMatchTitle:"कोई मिलान नहीं", noMatchSub:"राज्य या जवाब बदलकर दोबारा कोशिश करें",
    retakeBtn:"फिर से", doneBtn:"पूरा हुआ",
    applyLabel:"आवेदन कैसे करें", docsLabel:"ज़रूरी दस्तावेज़", totalBenefit:"कुल वार्षिक लाभ",
    searchStatePh:"अपना राज्य खोजें...",
    centralSchemes:"केंद्र सरकार की योजनाएं", stateSchemes:"राज्य सरकार की योजनाएं",
    profileTitle:"मेरी प्रोफाइल", setupTitle:"प्रोफाइल बनाएं", setupSub:"एक बार भरें · हर जगह काम आएगा",
    editBtn:"बदलें", matchedBtn:"मेरी योजनाएं", saveBtn:"सहेजें ✓", skipBtn:"छोड़ें",
    profileStats:["मिलान योजनाएं","दस्तावेज़","सहायता"],
    catSchemes:"योजनाएं", backHome:"← वापस", allSchemes:"सभी योजनाएं",
    noSchemesFound:"इस श्रेणी में कोई योजना नहीं मिली।",
    steps:[
      {title:"व्यक्तिगत विवरण",sub:"अपने बारे में बताएं",icon:"👤"},
      {title:"आपका स्थान",sub:"आप कहाँ रहते हैं?",icon:"📍"},
      {title:"परिवार और आय",sub:"घर की जानकारी",icon:"👨‍👩‍👧"},
      {title:"व्यवसाय",sub:"आप क्या करते हैं?",icon:"💼"},
      {title:"दस्तावेज़",sub:"बुनियादी जानकारी",icon:"📄"},
    ],
    fields:{
      name:"पूरा नाम", namePh:"अपना पूरा नाम लिखें",
      gender:"लिंग", genders:[{v:"male",l:"पुरुष 👨"},{v:"female",l:"महिला 👩"},{v:"other",l:"अन्य 🧑"}],
      age:"आयु वर्ग", ages:[{v:"below18",l:"18 से कम"},{v:"18to35",l:"18–35 वर्ष"},{v:"35to60",l:"35–60 वर्ष"},{v:"above60",l:"60 से अधिक"}],
      state:"राज्य / केंद्र शासित प्रदेश", selectState:"अपना राज्य चुनें",
      area:"क्षेत्र का प्रकार", areas:[{v:"rural",l:"ग्रामीण 🏡"},{v:"urban",l:"शहरी 🏙️"},{v:"semi",l:"अर्ध-शहरी 🏘️"}],
      family:"परिवार का आकार", families:[{v:"1to2",l:"1–2 सदस्य"},{v:"3to4",l:"3–4 सदस्य"},{v:"5to6",l:"5–6 सदस्य"},{v:"7plus",l:"7 या अधिक"}],
      income:"वार्षिक घरेलू आय", incomes:[{v:"below1",l:"₹1 लाख से कम"},{v:"1to3",l:"₹1–3 लाख"},{v:"3to6",l:"₹3–6 लाख"},{v:"above6",l:"₹6 लाख से अधिक"}],
      caste:"श्रेणी", castes:[{v:"general",l:"सामान्य"},{v:"obc",l:"ओबीसी"},{v:"sc",l:"अनु. जाति"},{v:"st",l:"अनु. जनजाति"},{v:"ews",l:"ईडब्ल्यूएस"}],
      occupation:"व्यवसाय", occupations:[{v:"farmer",l:"किसान 🌾"},{v:"student",l:"छात्र 📚"},{v:"women",l:"गृहिणी 👩"},{v:"senior",l:"वरिष्ठ 👴"},{v:"business",l:"व्यापारी 💼"},{v:"general",l:"वेतनभोगी 🧑"}],
      house:"क्या आपके पास पक्का मकान है?", houses:[{v:"yes",l:"हां — मेरे पास मकान है"},{v:"no",l:"नहीं — मुझे चाहिए"},{v:"kutcha",l:"कच्चा / अस्थायी"}],
      aadhaar:"आधार (अंतिम 4 अंक)", aadhaarPh:"जैसे 4521",
      bank:"बैंक खाता नंबर", bankPh:"खाता नंबर लिखें",
      phone:"मोबाइल नंबर", phonePh:"10 अंकों का नंबर",
    },
    questions:[
      {id:"who",   q:"आप कौन हैं?",                  icon:"👤", hint:"जो आप पर लागू हो वो चुनें",
        options:[{value:"farmer",label:"किसान 🌾"},{value:"student",label:"छात्र 📚"},{value:"women",label:"महिला 👩"},{value:"senior",label:"वरिष्ठ नागरिक 👴"},{value:"business",label:"व्यापारी 💼"},{value:"general",label:"सामान्य नागरिक 🧑"}]},
      {id:"income",q:"वार्षिक घरेलू आय?",            icon:"💰", hint:"परिवार की कुल सालाना आय",
        options:[{value:"below1",label:"₹1 लाख से कम"},{value:"1to3",label:"₹1–3 लाख"},{value:"3to6",label:"₹3–6 लाख"},{value:"above6",label:"₹6 लाख से अधिक"}]},
      {id:"state", q:"आप किस राज्य में रहते हैं?",  icon:"🗺️", hint:"केंद्रीय + आपके राज्य की योजनाएं दिखेंगी", type:"state"},
      {id:"house", q:"क्या आपके पास पक्का मकान है?", icon:"🏠", hint:"पक्का = ईंट/सीमेंट का स्थायी मकान",
        options:[{value:"no",label:"नहीं — मुझे चाहिए"},{value:"yes",label:"हां — मेरे पास है"},{value:"kutcha",label:"कच्चा / अस्थायी"}]},
      {id:"age",   q:"आपकी उम्र क्या है?",           icon:"🎂", hint:"मुख्य आवेदक की उम्र",
        options:[{value:"below18",label:"18 से कम"},{value:"18to35",label:"18–35 वर्ष"},{value:"35to60",label:"35–60 वर्ष"},{value:"above60",label:"60 से अधिक"}]},
      {id:"area",  q:"आपका क्षेत्र?",                icon:"📍", hint:"आपके रहने का क्षेत्र",
        options:[{value:"rural",label:"ग्रामीण / गांव 🏡"},{value:"urban",label:"शहरी / नगर 🏙️"},{value:"semi",label:"अर्ध-शहरी 🏘️"}]},
    ]
  }
};

// ─── PROFILE TRANSLATIONS ─────────────────────────────────────────────────────
const PT = {
  en:{
    signInTitle:"Sign In",
    signInSub:"Sign in to save your matched schemes & profile",
    phoneLabel:"Mobile Number",
    phonePh:"Enter 10-digit mobile number",
    getOtpBtn:"Get OTP →",
    otpTitle:"Enter OTP",
    otpSub:(ph)=>`Sent to +91 ${ph.slice(0,5)} ••••••`,
    verifyBtn:"Verify & Continue →",
    resendIn:(s)=>`Resend OTP in ${s}s`,
    resendBtn:"Resend OTP",
    demoNote:"Enter any 6-digit OTP (UI Demo)",
    step1Title:"Your Name & Gender",
    step2Title:"State & Category",
    step1of2:"STEP 1 OF 2",step2of2:"STEP 2 OF 2",
    fillOnce:"Fill once · Used everywhere",
    prefilled:"Pre-filled from your eligibility check ✓",
    nameLabel:"Full Name",namePh:"Enter your full name",
    genderLabel:"Gender",
    genders:[{v:"male",l:"Male 👨"},{v:"female",l:"Female 👩"},{v:"other",l:"Other 🧑"}],
    stateLabel:"State / UT",statePh:"Search your state...",
    catLabel:"You are a...",
    categories:[
      {v:"farmer",l:"Farmer 🌾"},{v:"student",l:"Student 📚"},
      {v:"women",l:"Homemaker 👩"},{v:"senior",l:"Senior Citizen 👴"},
      {v:"business",l:"Business Owner 💼"},{v:"general",l:"General Citizen 🧑"},
    ],
    nextBtn:"Next →",backBtn:"← Back",saveBtn:"Save & Continue →",
    dashTitle:"My Profile",
    viewSchemes:"View My Matched Schemes",
    schemesMatched:"Schemes",stateLabel2:"State",catLabel2:"Category",
    settingsTitle:"Settings",langLabel:"Language",
    editProfile:"Edit Profile",signOut:"Sign Out",
    signOutConfirm:"Sign out of YojanaSetu?",
    darkLabel:"Dark Mode",
    darkSub:(on)=>on?"On":"Off",
  },
  hi:{
    signInTitle:"साइन इन करें",
    signInSub:"योजनाएं और प्रोफाइल सहेजने के लिए साइन इन करें",
    phoneLabel:"मोबाइल नंबर",
    phonePh:"10 अंकों का मोबाइल नंबर",
    getOtpBtn:"OTP भेजें →",
    otpTitle:"OTP दर्ज करें",
    otpSub:(ph)=>`+91 ${ph.slice(0,5)} •••••• पर भेजा गया`,
    verifyBtn:"सत्यापित करें →",
    resendIn:(s)=>`OTP ${s} सेकंड में भेजें`,
    resendBtn:"OTP दोबारा भेजें",
    demoNote:"कोई भी 6 अंक दर्ज करें (UI Demo)",
    step1Title:"आपका नाम और लिंग",
    step2Title:"राज्य और श्रेणी",
    step1of2:"चरण 1 / 2",step2of2:"चरण 2 / 2",
    fillOnce:"एक बार भरें · हर जगह काम आएगा",
    prefilled:"पात्रता जांच से पहले से भरा गया ✓",
    nameLabel:"पूरा नाम",namePh:"अपना पूरा नाम लिखें",
    genderLabel:"लिंग",
    genders:[{v:"male",l:"पुरुष 👨"},{v:"female",l:"महिला 👩"},{v:"other",l:"अन्य 🧑"}],
    stateLabel:"राज्य / केंद्र शासित प्रदेश",statePh:"अपना राज्य खोजें...",
    catLabel:"आप हैं...",
    categories:[
      {v:"farmer",l:"किसान 🌾"},{v:"student",l:"छात्र 📚"},
      {v:"women",l:"गृहिणी 👩"},{v:"senior",l:"वरिष्ठ नागरिक 👴"},
      {v:"business",l:"व्यापारी 💼"},{v:"general",l:"सामान्य नागरिक 🧑"},
    ],
    nextBtn:"अगला →",backBtn:"← वापस",saveBtn:"सहेजें →",
    dashTitle:"मेरी प्रोफाइल",
    viewSchemes:"मेरी मिलान योजनाएं देखें",
    schemesMatched:"योजनाएं",stateLabel2:"राज्य",catLabel2:"श्रेणी",
    settingsTitle:"सेटिंग्स",langLabel:"भाषा",
    editProfile:"प्रोफाइल बदलें",signOut:"साइन आउट",
    signOutConfirm:"YojanaSetu से साइन आउट करें?",
    darkLabel:"डार्क मोड",
    darkSub:(on)=>on?"चालू":"बंद",
  }
};

// ─── LANG TOGGLE ───────────────────────────────────────────────────────────────
function LangToggle({lang,onToggle}){
  const isHindi=lang==="hi";
  return(
    <button onClick={onToggle} style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.35)",borderRadius:22,padding:"3px 4px",cursor:"pointer",height:34,width:72,position:"relative",overflow:"hidden",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:isHindi?"calc(50% - 2px)":3,width:"calc(50% - 2px)",bottom:3,background:"#fff",borderRadius:16,transition:"left 0.28s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",zIndex:0}}/>
      <span style={{flex:1,textAlign:"center",fontSize:11,fontWeight:700,color:!isHindi?"#FF8C00":"rgba(255,255,255,0.7)",position:"relative",zIndex:1}}>EN</span>
      <span style={{flex:1,textAlign:"center",fontSize:11,fontWeight:700,color:isHindi?"#FF8C00":"rgba(255,255,255,0.7)",position:"relative",zIndex:1}}>हिं</span>
    </button>
  );
}

// ─── SCHEME CARD (used in eligibility results & category sheet) ────────────────
function SchemeCard({scheme,lang,expanded,onToggle,dark=false}){
  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const bf=fontFamily(lang);
  const isNational=scheme.scope==="national";
  return(
    <div style={{background:th.card,borderRadius:18,marginBottom:10,border:`1.5px solid ${scheme.color}28`,boxShadow:"0 2px 12px rgba(0,0,0,0.05)",overflow:"hidden"}}>
      <div onClick={onToggle} style={{padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}}>
        <div style={{width:46,height:46,background:scheme.color+"15",borderRadius:13,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1.5px solid ${scheme.color}22`,marginTop:2}}>{scheme.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:5}}>
            <span style={{fontSize:9,fontWeight:700,background:isNational?"#EFF6FF":"#FEF9C3",color:isNational?"#1D4ED8":"#854D0E",borderRadius:6,padding:"2px 7px",border:`1px solid ${isNational?"#BFDBFE":"#FEF08A"}`}}>
              {isNational?t.centralLabel:t.stateLabel(scheme.state)}
            </span>
            <span style={{fontSize:9,fontWeight:700,background:scheme.color+"18",color:scheme.color,borderRadius:6,padding:"2px 7px"}}>{scheme.tag[lang]}</span>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:th.text,lineHeight:1.35,fontFamily:bf,marginBottom:4}}>{scheme.name[lang]}</div>
          <div style={{fontSize:12,color:scheme.color,fontWeight:600}}>{scheme.benefit[lang]}</div>
          <div style={{fontSize:10,color:th.textLight,marginTop:3,fontFamily:bf}}>{scheme.ministry[lang]}</div>
        </div>
        <div style={{fontSize:16,color:scheme.color,fontWeight:700,transform:expanded?"rotate(90deg)":"rotate(0)",transition:"transform 0.25s",marginTop:2,flexShrink:0}}>›</div>
      </div>
      {expanded&&(
        <div style={{borderTop:`1px solid ${scheme.color}18`,background:scheme.color+"06"}}>
          <div style={{padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:700,color:th.textSub,letterSpacing:0.6,marginBottom:8,textTransform:"uppercase"}}>📄 {t.docsLabel}</div>
            {scheme.docs[lang].map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:i<scheme.docs[lang].length-1?`1px solid ${th.border}`:"none",fontFamily:bf}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:scheme.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{color:scheme.color,fontSize:10,fontWeight:800}}>✓</span>
                </div>
                <span style={{fontSize:12,color:th.text}}>{d}</span>
              </div>
            ))}
          </div>
          <div onClick={()=>scheme.applyType==="online"&&window.open(`https://${scheme.apply.en}`,"_blank")}
            style={{margin:"0 16px 14px",background:`linear-gradient(135deg,${scheme.color},${scheme.color}cc)`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:scheme.applyType==="online"?"pointer":"default",boxShadow:`0 4px 14px ${scheme.color}33`}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:bf}}>{t.applyLabel}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",marginTop:2}}>{scheme.applyType==="online"?"🌐 ":"🏢 "}{scheme.apply[lang]}</div>
            </div>
            <span style={{color:"#fff",fontSize:20,fontWeight:700}}>{scheme.applyType==="online"?"↗":"🏢"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CATEGORY FILTER SHEET ─────────────────────────────────────────────────────
// Opens when user taps a category tile on home page.
// Shows all matching schemes from SCHEME_DB filtered by category filterKey.
function CategorySheet({category,lang,onClose,dark=false}){
  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=fontFamily(lang);
  const [visible,setVisible]=useState(false);
  const [expandedId,setExpandedId]=useState(null);

  useEffect(()=>{const id=setTimeout(()=>setVisible(true),30);return()=>clearTimeout(id);},[]);
  const schemes=useMemo(()=>getSchemesForCategory(category.filterKey),[category.filterKey]);
  const nationalSchemes=useMemo(()=>schemes.filter(s=>s.scope==="national"),[schemes]);
  const stateSchemes=useMemo(()=>schemes.filter(s=>s.scope==="state"),[schemes]);

  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:th.appBg,borderRadius:"24px 24px 0 0",maxHeight:"90vh",display:"flex",flexDirection:"column",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)",fontFamily:bf}}>

        {/* Sheet Header */}
        <div style={{background:th.card,borderRadius:"24px 24px 0 0",padding:"12px 20px 16px",flexShrink:0,borderBottom:`1px solid ${th.border}`}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <div style={{width:40,height:4,background:th.handle,borderRadius:2}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,background:category.bg,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1.5px solid ${category.color}30`,flexShrink:0}}>
              {category.icon}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:800,color:th.text,fontFamily:bf}}>{category.label} {t.catSchemes}</div>
              <div style={{fontSize:12,color:th.textSub,marginTop:1}}>{schemes.length} {isHindi?"योजनाएं मिलीं":"schemes found"}</div>
            </div>
            <div onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:th.pillBg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:th.textMid}}>✕</div>
          </div>
          {/* Color bar */}
          <div style={{height:3,borderRadius:4,background:`linear-gradient(90deg,${category.color},${category.color}55)`,marginTop:14}}/>
        </div>

        {/* Schemes List */}
        <div style={{overflowY:"auto",padding:"14px 16px 40px",flex:1}}>
          {schemes.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:"#aaa"}}>
              <div style={{fontSize:44,marginBottom:12}}>🔍</div>
              <div style={{fontSize:14,fontWeight:600,fontFamily:bf}}>{t.noSchemesFound}</div>
            </div>
          )}

          {/* National schemes */}
          {nationalSchemes.length>0&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{height:1,flex:1,background:th.border2}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #BFDBFE"}}>
                  🇮🇳 {t.centralSchemes} ({nationalSchemes.length})
                </span>
                <div style={{height:1,flex:1,background:th.border2}}/>
              </div>
              {nationalSchemes.map(s=>(
                <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                  expanded={expandedId===s.id}
                  onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
              ))}
            </>
          )}

          {/* State schemes */}
          {stateSchemes.length>0&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 10px"}}>
                <div style={{height:1,flex:1,background:th.border2}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#854D0E",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #FEF08A"}}>
                  📍 {t.stateSchemes} ({stateSchemes.length})
                </span>
                <div style={{height:1,flex:1,background:th.border2}}/>
              </div>
              {stateSchemes.map(s=>(
                <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                  expanded={expandedId===s.id}
                  onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SCHEME DETAIL SHEET (tapping home page scheme card) ──────────────────────
function SchemeDetailSheet({schemeId,lang,onClose,dark=false}){
  const th=THEME[dark?"dark":"light"];
  // Looks up full scheme data from SCHEME_DB by id
  const scheme=useMemo(()=>SCHEME_DB.find(s=>s.id===schemeId),[schemeId]);
  const t=T[lang];
  const bf=fontFamily(lang);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{const id=setTimeout(()=>setVisible(true),30);return()=>clearTimeout(id);},[]);
  const applyUrl=useMemo(()=>scheme?.applyType==="online"?`https://${scheme.apply.en}`:null,[scheme]);
  if(!scheme)return null;
  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:th.card,borderRadius:"24px 24px 0 0",maxHeight:"85vh",overflowY:"auto",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)",fontFamily:bf}}>
        <div style={{display:"flex",justifyContent:"center",paddingTop:12}}>
          <div style={{width:40,height:4,background:th.handle,borderRadius:2}}/>
        </div>
        <div style={{background:`linear-gradient(135deg,${scheme.color}15,${scheme.color}05)`,margin:16,borderRadius:20,padding:20,border:`1.5px solid ${scheme.color}22`,position:"relative"}}>
          <div onClick={onClose} style={{position:"absolute",top:12,right:12,width:30,height:30,borderRadius:"50%",background:dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:th.textMid}}>✕</div>
          <div style={{fontSize:40,marginBottom:10}}>{scheme.icon}</div>
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontWeight:700,background:scheme.scope==="national"?"#EFF6FF":"#FEF9C3",color:scheme.scope==="national"?"#1D4ED8":"#854D0E",borderRadius:8,padding:"3px 8px"}}>
              {scheme.scope==="national"?t.centralLabel:t.stateLabel(scheme.state)}
            </span>
            <span style={{fontSize:10,fontWeight:700,background:scheme.color+"18",color:scheme.color,borderRadius:8,padding:"3px 8px"}}>{scheme.tag[lang]}</span>
          </div>
          <div style={{fontSize:17,fontWeight:800,color:th.text,marginBottom:8,paddingRight:36,fontFamily:bf}}>{scheme.name[lang]}</div>
          <div style={{display:"inline-flex",background:scheme.color,borderRadius:20,padding:"5px 14px",marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{scheme.benefit[lang]}</span>
          </div>
          {scheme.annual>0&&<div style={{fontSize:12,color:th.textMid}}>📅 Annual: <strong style={{color:scheme.color}}>₹{scheme.annual.toLocaleString("en-IN")}</strong></div>}
          <div style={{fontSize:11,color:th.textSub,marginTop:4}}>{scheme.ministry[lang]}</div>
        </div>
        <div style={{padding:"0 16px 36px"}}>
          <div style={{background:th.card2,borderRadius:16,padding:16,marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:th.textSub,letterSpacing:0.6,marginBottom:10,textTransform:"uppercase"}}>📄 {t.docsLabel}</div>
            {scheme.docs[lang].map((doc,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<scheme.docs[lang].length-1?`1px solid ${th.border}`:"none"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:scheme.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{color:scheme.color,fontSize:11,fontWeight:800}}>✓</span>
                </div>
                <span style={{fontSize:13,color:th.text,fontFamily:bf}}>{doc}</span>
              </div>
            ))}
          </div>
          <div onClick={()=>applyUrl&&window.open(applyUrl,"_blank")}
            style={{background:applyUrl?`linear-gradient(135deg,${scheme.color},${scheme.color}cc)`:"#888",borderRadius:16,padding:18,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:applyUrl?"pointer":"default",boxShadow:applyUrl?`0 6px 20px ${scheme.color}40`:"none"}}>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:bf}}>{t.applyLabel}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:3}}>{scheme.applyType==="online"?"🌐 ":"🏢 "}{scheme.apply[lang]}</div>
            </div>
            <div style={{width:40,height:40,background:"rgba(255,255,255,0.2)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:"1.5px solid rgba(255,255,255,0.3)"}}>
              {scheme.applyType==="online"?"↗":"🏢"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SEARCH TAB ────────────────────────────────────────────────────────────────
// Full search tab — searches across all schemes in SCHEME_DB
function SearchTab({lang,initialQuery="",dark=false}){
  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=fontFamily(lang);
  const [query,setQuery]=useState(initialQuery);
  const [expandedId,setExpandedId]=useState(null);

  const results=useMemo(()=>query.trim().length>0
    ? SCHEME_DB.filter(s=>{
        const q=query.toLowerCase();
        return(
          s.name.en.toLowerCase().includes(q)||
          s.name.hi.toLowerCase().includes(q)||
          s.tag.en.toLowerCase().includes(q)||
          s.tag.hi.toLowerCase().includes(q)||
          s.ministry.en.toLowerCase().includes(q)||
          (s.state&&s.state.toLowerCase().includes(q))
        );
      })
    : SCHEME_DB,[query]); // show all when empty

  const national=useMemo(()=>results.filter(s=>s.scope==="national"),[results]);
  const state=useMemo(()=>results.filter(s=>s.scope==="state"),[results]);

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",background:th.appBg}}>
      {/* Search bar */}
      <div style={{background:th.card,padding:"16px 16px 12px",borderBottom:`1px solid ${th.border}`,position:"sticky",top:0,zIndex:10}}>
        <div style={{background:th.searchBg,borderRadius:14,display:"flex",alignItems:"center",gap:10,padding:"12px 16px",border:"2px solid #FF993340"}}>
          <span style={{fontSize:18}}>🔍</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.searchPlaceholder} autoFocus
            style={{border:"none",outline:"none",fontSize:14,flex:1,background:"transparent",color:th.text,fontFamily:bf}}/>
          {query&&<span onClick={()=>setQuery("")} style={{cursor:"pointer",color:"#aaa",fontSize:18}}>✕</span>}
        </div>
        <div style={{fontSize:12,color:th.textSub,marginTop:8,paddingLeft:2}}>
          {results.length} {isHindi?"योजनाएं":"schemes"} · {national.length} {isHindi?"केंद्रीय":"Central"} · {state.length} {isHindi?"राज्य":"State"}
        </div>
      </div>

      {/* Results */}
      <div style={{padding:"12px 16px 80px"}}>
        {national.length>0&&(
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{height:1,flex:1,background:th.border2}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #BFDBFE"}}>
                🇮🇳 {t.centralSchemes} ({national.length})
              </span>
              <div style={{height:1,flex:1,background:th.border2}}/>
            </div>
            {national.map(s=>(
              <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                expanded={expandedId===s.id}
                onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
            ))}
          </>
        )}
        {state.length>0&&(
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 10px"}}>
              <div style={{height:1,flex:1,background:th.border2}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#854D0E",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #FEF08A"}}>
                📍 {t.stateSchemes} ({state.length})
              </span>
              <div style={{height:1,flex:1,background:th.border2}}/>
            </div>
            {state.map(s=>(
              <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                expanded={expandedId===s.id}
                onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
            ))}
          </>
        )}
        {results.length===0&&(
          <div style={{textAlign:"center",padding:"50px 20px",color:"#aaa"}}>
            <div style={{fontSize:44,marginBottom:12}}>🔍</div>
            <div style={{fontSize:15,fontWeight:700,color:th.text,fontFamily:bf}}>{t.noMatchTitle}</div>
            <div style={{fontSize:13,marginTop:6,color:th.textSub}}>{t.noMatchSub}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STATE PICKER SHEET ────────────────────────────────────────────────────────
// Smart bottom sheet: alphabet sidebar, grouped sections, recently picked memory
const RECENT_STATE_KEY = "yojana_recent_state";

function StatePickerSheet({selectedState,onSelect,onClose,lang,dark=false}){
  const th=THEME[dark?"dark":"light"];
  const bf=fontFamily(lang);
  const isHindi=lang==="hi";
  const [search,setSearch]=useState("");
  const [visible,setVisible]=useState(false);
  const [activeLetter,setActiveLetter]=useState(null);
  const listRef=useRef(null);
  const sectionRefs=useRef({});
  const searchRef=useRef(null);

  // Persist recently selected state across sessions
  const [recentState,setRecentState]=useState(()=>{
    try{ return localStorage.getItem(RECENT_STATE_KEY)||null; }catch{ return null; }
  });

  useEffect(()=>{const id=setTimeout(()=>setVisible(true),30);return()=>clearTimeout(id);},[]);

  const isSearching=search.trim().length>0;

  // Flat filtered list (used when searching)
  const filteredStates=useMemo(()=>
    INDIA_STATES.filter(s=>s.toLowerCase().includes(search.toLowerCase()))
  ,[search]);

  // Grouped by first letter (used when not searching)
  const grouped=useMemo(()=>{
    const map={};
    INDIA_STATES.forEach(s=>{
      const letter=s[0].toUpperCase();
      if(!map[letter])map[letter]=[];
      map[letter].push(s);
    });
    return map;
  },[]);

  const alphabet=useMemo(()=>Object.keys(grouped).sort(),[grouped]);

  // Jump to letter section
  const jumpTo=(letter)=>{
    setActiveLetter(letter);
    const el=sectionRefs.current[letter];
    if(el&&listRef.current){
      listRef.current.scrollTo({top:el.offsetTop-8,behavior:"smooth"});
    }
    setTimeout(()=>setActiveLetter(null),600);
  };

  const handleSelect=(st)=>{
    try{ localStorage.setItem(RECENT_STATE_KEY,st); }catch{}
    setRecentState(st);
    onSelect(st);
    onClose();
  };

  const StateRow=({st,icon="📍"})=>(
    <div onClick={()=>handleSelect(st)}
      style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",
        background:selectedState===st?SAFFRON+"15":"transparent",
        cursor:"pointer",borderBottom:`1px solid ${th.border}`,
        transition:"background 0.15s"}}>
      <span style={{fontSize:15}}>{icon}</span>
      <span style={{flex:1,fontSize:14,fontWeight:selectedState===st?700:500,
        color:selectedState===st?SAFFRON:th.text,fontFamily:bf}}>{st}</span>
      {selectedState===st&&(
        <span style={{width:20,height:20,borderRadius:"50%",background:SAFFRON,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:10,color:"#fff",fontWeight:800,flexShrink:0}}>✓</span>
      )}
    </div>
  );

  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.55)",
        display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:th.card,
        borderRadius:"24px 24px 0 0",maxHeight:"82vh",display:"flex",flexDirection:"column",
        transform:visible?"translateY(0)":"translateY(100%)",
        transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)"}}>

        {/* Drag handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 8px",flexShrink:0}}>
          <div style={{width:40,height:4,background:th.handle,borderRadius:2}}/>
        </div>

        {/* Title + search */}
        <div style={{padding:"0 16px 12px",borderBottom:`1px solid ${th.border}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:th.text,fontFamily:bf}}>
                {isHindi?"राज्य चुनें":"Select State"}
              </div>
              <div style={{fontSize:11,color:th.textSub,marginTop:2}}>
                {isHindi?"A–Z से जल्दी जाएं या खोजें":"Jump A–Z or search"}
              </div>
            </div>
            <div onClick={onClose}
              style={{width:30,height:30,borderRadius:"50%",background:th.pillBg,
                display:"flex",alignItems:"center",justifyContent:"center",
                cursor:"pointer",fontSize:13,color:th.textMid}}>✕</div>
          </div>
          {/* Search bar — NOT autofocused, user taps to open keyboard */}
          <div style={{background:th.searchBg,borderRadius:12,display:"flex",
            alignItems:"center",gap:8,padding:"10px 14px",border:`1.5px solid ${th.border2}`}}>
            <span style={{fontSize:15}}>🔍</span>
            <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={isHindi?"राज्य खोजें...":"Search state..."}
              style={{border:"none",outline:"none",fontSize:13,flex:1,
                background:"transparent",color:th.text,fontFamily:bf}}/>
            {search
              ? <span onClick={()=>setSearch("")}
                  style={{cursor:"pointer",color:"#aaa",fontSize:16,padding:"2px 4px"}}>✕</span>
              : <span style={{fontSize:11,color:th.textLight,fontWeight:600}}>A–Z</span>
            }
          </div>
        </div>

        {/* Main body: list + alphabet sidebar side by side */}
        <div style={{flex:1,display:"flex",overflow:"hidden",position:"relative"}}>

          {/* Scrollable state list */}
          <div ref={listRef} style={{flex:1,overflowY:"auto",paddingBottom:40,paddingRight:24}}>

            {/* All States row — always on top */}
            <div onClick={()=>{onSelect("all");onClose();}}
              style={{display:"flex",alignItems:"center",gap:12,padding:"13px 20px",
                background:selectedState==="all"?ASHOKA_BLUE+"10":"transparent",
                cursor:"pointer",borderBottom:`1px solid ${th.border}`}}>
              <span style={{fontSize:18}}>🇮🇳</span>
              <span style={{flex:1,fontSize:14,fontWeight:selectedState==="all"?700:500,
                color:selectedState==="all"?ASHOKA_BLUE:th.text,fontFamily:bf}}>
                {isHindi?"सभी राज्य":"All States"}
              </span>
              {selectedState==="all"&&(
                <span style={{width:20,height:20,borderRadius:"50%",background:ASHOKA_BLUE,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,color:"#fff",fontWeight:800,flexShrink:0}}>✓</span>
              )}
            </div>

            {/* Recently picked — shown only when not searching and a prior selection exists */}
            {!isSearching&&recentState&&recentState!=="all"&&recentState!==selectedState&&(
              <>
                <div style={{padding:"8px 20px 4px",fontSize:10,fontWeight:700,
                  color:th.textSub,letterSpacing:0.8,textTransform:"uppercase",
                  background:th.card2}}>
                  {isHindi?"हाल में चुना":"Recently Picked"} 🕐
                </div>
                <StateRow st={recentState} icon="🕐"/>
              </>
            )}

            {/* Currently selected highlight — show at top when not "all" and not searching */}
            {!isSearching&&selectedState&&selectedState!=="all"&&(
              <>
                <div style={{padding:"8px 20px 4px",fontSize:10,fontWeight:700,
                  color:SAFFRON,letterSpacing:0.8,textTransform:"uppercase",
                  background:SAFFRON+"08"}}>
                  {isHindi?"चुना गया":"Selected"} ✓
                </div>
                <StateRow st={selectedState} icon="📍"/>
              </>
            )}

            {/* ── SEARCH MODE: flat filtered list ── */}
            {isSearching&&(
              <>
                {filteredStates.map(st=><StateRow key={st} st={st}/>)}
                {filteredStates.length===0&&(
                  <div style={{textAlign:"center",padding:"40px 20px",color:th.textSub,fontFamily:bf}}>
                    <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                    <div style={{fontSize:13,fontWeight:600}}>
                      {isHindi?"कोई राज्य नहीं मिला":"No state found"}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── BROWSE MODE: grouped A–Z sections ── */}
            {!isSearching&&alphabet.map(letter=>(
              <div key={letter} ref={el=>sectionRefs.current[letter]=el}>
                {/* Letter header */}
                <div style={{padding:"6px 20px 4px",fontSize:11,fontWeight:800,
                  color:activeLetter===letter?SAFFRON:th.textSub,
                  background:activeLetter===letter?SAFFRON+"12":th.card2,
                  letterSpacing:1,transition:"all 0.2s"}}>
                  {letter}
                </div>
                {grouped[letter].map(st=><StateRow key={st} st={st}/>)}
              </div>
            ))}
          </div>

          {/* ── ALPHABET SIDEBAR ── */}
          {!isSearching&&(
            <div style={{position:"absolute",right:0,top:0,bottom:0,
              width:24,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",
              paddingTop:4,paddingBottom:4,gap:1,zIndex:10}}>
              {alphabet.map(letter=>(
                <div key={letter} onClick={()=>jumpTo(letter)}
                  style={{width:20,height:20,display:"flex",alignItems:"center",
                    justifyContent:"center",borderRadius:6,cursor:"pointer",
                    fontSize:10,fontWeight:700,
                    background:activeLetter===letter?SAFFRON:"transparent",
                    color:activeLetter===letter?"#fff":th.textSub,
                    transition:"all 0.15s"}}>
                  {letter}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ALL SCHEMES TAB ───────────────────────────────────────────────────────────
// Shows all schemes with category pills + state filter working together
function SchemesTab({lang,dark=false}){
  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=fontFamily(lang);
  const [expandedId,setExpandedId]=useState(null);
  const [filter,setFilter]=useState("all");
  const [selectedState,setSelectedState]=useState("all");
  const [showStatePicker,setShowStatePicker]=useState(false);
  const cats=useMemo(()=>CATEGORIES[lang],[lang]);

  // Refs for smooth-scroll anchors
  const scrollContainerRef=useRef(null);
  const stateHeaderRef=useRef(null);
  const centralHeaderRef=useRef(null);

  // Combined filter: category + state both applied together
  const filtered=useMemo(()=>{
    let base=filter==="all" ? SCHEME_DB : getSchemesForCategory(filter);
    if(selectedState!=="all"){
      base=base.filter(s=>s.scope==="national"||s.state===selectedState);
    }
    return base;
  },[filter,selectedState]);

  const national=useMemo(()=>filtered.filter(s=>s.scope==="national"),[filtered]);
  const stateSchemes=useMemo(()=>filtered.filter(s=>s.scope==="state"),[filtered]);

  // Smooth scroll a section header into view inside the scrollable container
  const scrollToRef=(ref)=>{
    if(!ref.current||!scrollContainerRef.current) return;
    const container=scrollContainerRef.current;
    const headerEl=ref.current;
    // getBoundingClientRect is relative to viewport; we want offset inside container
    const containerTop=container.getBoundingClientRect().top;
    const elTop=headerEl.getBoundingClientRect().top;
    const offset=elTop-containerTop+container.scrollTop-12; // 12px breathing room
    container.scrollTo({top:offset,behavior:"smooth"});
  };

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",background:th.appBg}}>
      {/* Header */}
      <div style={{background:th.card,padding:"16px 16px 0",position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${th.border}`}}>

        {/* Title row — "All Schemes" + state selector button */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:17,fontWeight:800,color:th.text,fontFamily:bf}}>{t.allSchemes||"All Schemes"}</div>
          {/* State pill button */}
          <div onClick={()=>setShowStatePicker(true)}
            style={{display:"flex",alignItems:"center",gap:5,background:selectedState!=="all"?SAFFRON+"18":th.pillBg,border:`1.5px solid ${selectedState!=="all"?SAFFRON:th.border2}`,borderRadius:20,padding:"5px 11px",cursor:"pointer",flexShrink:0,transition:"background 0.2s"}}>
            <span style={{fontSize:13}}>{selectedState==="all"?"🇮🇳":"📍"}</span>
            <span style={{fontSize:11,fontWeight:700,color:selectedState!=="all"?SAFFRON:th.textMid,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:bf}}>
              {selectedState==="all"?(isHindi?"सभी राज्य":"All States"):selectedState}
            </span>
            <span style={{fontSize:10,color:th.textSub}}>▾</span>
          </div>
        </div>

        {/* Category filter pills */}
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:12,scrollbarWidth:"none"}}>
          <div onClick={()=>{setFilter("all");setExpandedId(null);}}
            style={{flexShrink:0,padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700,background:filter==="all"?"#003580":th.pillBg,color:filter==="all"?"#fff":th.textMid,cursor:"pointer",border:`1.5px solid ${filter==="all"?"#003580":th.border2}`}}>
            {isHindi?"सभी":"All"} ({filtered.length})
          </div>
          {cats.map(cat=>(
            <div key={cat.filterKey} onClick={()=>{setFilter(cat.filterKey);setExpandedId(null);}}
              style={{flexShrink:0,padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700,background:filter===cat.filterKey?cat.color:th.pillBg,color:filter===cat.filterKey?"#fff":th.textMid,cursor:"pointer",border:`1.5px solid ${filter===cat.filterKey?cat.color:th.border2}`}}>
              {cat.icon} {cat.label}
            </div>
          ))}
        </div>

        {/* Active state chip row — shown only when a state is selected */}
        {selectedState!=="all"&&(
          <div style={{display:"flex",alignItems:"center",gap:6,paddingBottom:10,flexWrap:"wrap"}}>
            {/* State name chip with X dismiss */}
            <div style={{display:"flex",alignItems:"center",gap:5,background:SAFFRON+"14",border:`1px solid ${SAFFRON}40`,borderRadius:20,padding:"4px 10px"}}>
              <span style={{fontSize:11}}>📍</span>
              <span style={{fontSize:11,fontWeight:600,color:SAFFRON,fontFamily:bf}}>{selectedState}</span>
              <span onClick={()=>setSelectedState("all")} style={{fontSize:14,color:SAFFRON,cursor:"pointer",marginLeft:2,lineHeight:1,fontWeight:700}}>✕</span>
            </div>
            {/* State schemes count pill — clickable, scrolls to state section */}
            <div
              onClick={()=>stateSchemes.length>0&&scrollToRef(stateHeaderRef)}
              style={{display:"flex",alignItems:"center",gap:4,background:stateSchemes.length>0?"#FEF9C3":"#f5f5f0",border:`1.5px solid ${stateSchemes.length>0?"#d97706":"#e0e0e0"}`,borderRadius:20,padding:"4px 10px",cursor:stateSchemes.length>0?"pointer":"default",opacity:stateSchemes.length>0?1:0.55,transition:"transform 0.15s,box-shadow 0.15s",boxShadow:stateSchemes.length>0?"0 1px 4px #d9770620":"none"}}
              onMouseDown={e=>{if(stateSchemes.length>0)e.currentTarget.style.transform="scale(0.95)";}}
              onMouseUp={e=>{e.currentTarget.style.transform="scale(1)";}}
              onTouchStart={e=>{if(stateSchemes.length>0)e.currentTarget.style.transform="scale(0.95)";}}
              onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)";}}>
              <span style={{fontSize:11}}>📍</span>
              <span style={{fontSize:11,fontWeight:700,color:stateSchemes.length>0?"#92400e":"#999",fontFamily:bf}}>
                {isHindi?"राज्य":"State"} ({stateSchemes.length})
              </span>
              {stateSchemes.length>0&&<span style={{fontSize:9,color:"#b45309",marginLeft:1}}>↓</span>}
            </div>
            {/* Central schemes count pill — clickable, scrolls to central section */}
            <div
              onClick={()=>national.length>0&&scrollToRef(centralHeaderRef)}
              style={{display:"flex",alignItems:"center",gap:4,background:"#EFF6FF",border:"1.5px solid #3b82f6",borderRadius:20,padding:"4px 10px",cursor:national.length>0?"pointer":"default",transition:"transform 0.15s,box-shadow 0.15s",boxShadow:"0 1px 4px #3b82f620"}}
              onMouseDown={e=>{e.currentTarget.style.transform="scale(0.95)";}}
              onMouseUp={e=>{e.currentTarget.style.transform="scale(1)";}}
              onTouchStart={e=>{e.currentTarget.style.transform="scale(0.95)";}}
              onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)";}}>
              <span style={{fontSize:11}}>🇮🇳</span>
              <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",fontFamily:bf}}>
                {isHindi?"केंद्रीय":"Central"} ({national.length})
              </span>
              {national.length>0&&<span style={{fontSize:9,color:"#2563eb",marginLeft:1}}>↓</span>}
            </div>
          </div>
        )}
      </div>

      {/* Scheme list — State first, then Central */}
      <div ref={scrollContainerRef} style={{padding:"12px 16px 80px",overflowY:"auto",flex:1}}>

        {/* ── STATE SCHEMES (shown first) ── */}
        {stateSchemes.length>0&&(
          <>
            <div ref={stateHeaderRef} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{height:1,flex:1,background:th.border2}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#92400e",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #d97706"}}>
                📍 {t.stateSchemes} ({stateSchemes.length})
              </span>
              <div style={{height:1,flex:1,background:th.border2}}/>
            </div>
            {stateSchemes.map(s=>(
              <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                expanded={expandedId===s.id}
                onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
            ))}
          </>
        )}

        {/* ── CENTRAL SCHEMES (shown after state) ── */}
        {national.length>0&&(
          <>
            <div ref={centralHeaderRef} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,marginTop:stateSchemes.length>0?16:0}}>
              <div style={{height:1,flex:1,background:th.border2}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #3b82f6"}}>
                🇮🇳 {t.centralSchemes} ({national.length})
              </span>
              <div style={{height:1,flex:1,background:th.border2}}/>
            </div>
            {national.map(s=>(
              <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                expanded={expandedId===s.id}
                onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
            ))}
          </>
        )}

        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:"#aaa"}}>
            <div style={{fontSize:44,marginBottom:12}}>🔍</div>
            <div style={{fontSize:14,fontWeight:600,fontFamily:bf,color:th.text}}>{t.noMatchTitle}</div>
            <div style={{fontSize:12,color:th.textSub,marginTop:6,fontFamily:bf}}>{t.noMatchSub}</div>
          </div>
        )}
      </div>

      {/* State picker bottom sheet */}
      {showStatePicker&&(
        <StatePickerSheet
          selectedState={selectedState}
          onSelect={setSelectedState}
          onClose={()=>setShowStatePicker(false)}
          lang={lang}
          dark={dark}
        />
      )}
    </div>
  );
}

// ─── ELIGIBILITY CHECKER ───────────────────────────────────────────────────────
function EligibilityChecker({lang,onClose,prefilledAnswers,dark=false}){
  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=fontFamily(lang);
  const TOTAL=t.questions.length;

  // Filter SCHEME_DB using match() functions — single source of truth
  const initResults=useCallback((ans)=>SCHEME_DB.filter(s=>s.match(ans)),[]);

  const [step,setStep]=useState(()=>{
    if(prefilledAnswers) return TOTAL;
    try{ const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"); return s?TOTAL:0; }catch{return 0;}
  });
  const [answers,setAnswers]=useState(()=>{
    if(prefilledAnswers) return prefilledAnswers;
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")||{}; }catch{return {};}
  });
  const [selected,setSelected]=useState(null);
  const [stateSearch,setStateSearch]=useState(prefilledAnswers?.state||"");
  const [visible,setVisible]=useState(false);
  const [animKey,setAnimKey]=useState(0);
  const [expandedId,setExpandedId]=useState(null);

  const [results,setResults]=useState(()=>{
    if(prefilledAnswers) return SCHEME_DB.filter(s=>s.match(prefilledAnswers));
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      return saved?SCHEME_DB.filter(s=>s.match(saved)):[];
    }catch{return [];}
  });

  useEffect(()=>{const id=setTimeout(()=>setVisible(true),30);return()=>clearTimeout(id);},[]);

  const q=step<TOTAL?t.questions[step]:null;
  const isStateQ=q?.type==="state";
  const activeVal=isStateQ?(stateSearch&&INDIA_STATES.includes(stateSearch)?stateSearch:null):(selected||(q?answers[q.id]:null));
  const canProceed=!!activeVal;
  const progress=step>=TOTAL?100:Math.round(((step+1)/TOTAL)*100);
  const filteredStates=useMemo(()=>INDIA_STATES.filter(s=>s.toLowerCase().includes(stateSearch.toLowerCase())),[stateSearch]);
  const totalAnnual=useMemo(()=>results.reduce((s,r)=>s+(r.annual||0),0),[results]);
  const nationalResults=useMemo(()=>results.filter(r=>r.scope==="national"),[results]);
  const stateResults=useMemo(()=>results.filter(r=>r.scope==="state"),[results]);

  const goNext=()=>{
    if(!canProceed)return;
    const newAnswers={...answers,[q.id]:activeVal};
    setAnswers(newAnswers);setSelected(null);setAnimKey(k=>k+1);
    if(step===TOTAL-1){
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify(newAnswers));}catch{}
      setResults(initResults(newAnswers));setStep(TOTAL);
    }
    else setStep(s=>s+1);
  };
  const goBack=()=>{
    if(step===0){onClose();return;}
    if(step===TOTAL){setStep(TOTAL-1);return;}
    const prevQ=t.questions[step-1];
    if(prevQ.type==="state")setStateSearch(answers[prevQ.id]||"");
    else setSelected(answers[prevQ.id]||null);
    setAnimKey(k=>k+1);setStep(s=>s-1);
  };
  const retake=()=>{
    try{localStorage.removeItem(STORAGE_KEY);}catch{}
    setStep(0);setAnswers({});setSelected(null);setStateSearch("");setResults([]);setExpandedId(null);setAnimKey(k=>k+1);
  };

  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:th.appBg,borderRadius:"24px 24px 0 0",maxHeight:"93vh",overflowY:"auto",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)",fontFamily:bf}}>

        {/* Sheet top — Premium Tricolor Stepper */}
        {/* Tricolor top stripe */}
        <div style={{display:"flex",height:5,borderRadius:"24px 24px 0 0",overflow:"hidden"}}>
          <div style={{flex:1,background:SAFFRON}}/>
          <div style={{flex:1,background:"#fff",borderLeft:"1px solid #f0e8dc",borderRight:"1px solid #dde8dd"}}/>
          <div style={{flex:1,background:IND_GREEN}}/>
        </div>
        <div style={{background:th.card,padding:"12px 20px 16px",position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${th.border}`}}>
          {/* Drag handle */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
            <div style={{width:38,height:3.5,background:th.handle2,borderRadius:2}}/>
          </div>
          {/* Title row */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${NAVY_BLUE},${ASHOKA_BLUE})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 3px 12px rgba(6,3,141,0.28)`,flexShrink:0}}>
                <AshokaChakra size={22} color="#fff" spinning={step<TOTAL}/>
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:th.text,letterSpacing:-0.2,lineHeight:1,fontFamily:bf}}>{t.checkerTitle}</div>
                <div style={{fontSize:10,fontWeight:700,marginTop:3,letterSpacing:0.25,fontFamily:bf,color:step<TOTAL?SAFFRON:IND_GREEN}}>
                  {step<TOTAL?`${q?.icon}  ${q?.q}`:`✅  ${t.checkerSub}`}
                </div>
              </div>
            </div>
            <div onClick={onClose} style={{width:30,height:30,borderRadius:"50%",background:th.pillBg,border:`1.5px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:th.textSub,fontWeight:700}}>✕</div>
          </div>
          {/* Premium numbered stepper — replaces both old bars */}
          {step<TOTAL&&(
            <>
              <div style={{display:"flex",alignItems:"center"}}>
                {t.questions.map((_,i)=>{
                  const done=i<step,active=i===step;
                  return [
                    <div key={`dot-${i}`} style={{width:32,height:32,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:done?IND_GREEN:active?SAFFRON:"#fff",border:`2.5px solid ${done?IND_GREEN:active?SAFFRON:"#ddd"}`,boxShadow:active?`0 0 0 5px ${SAFFRON}22,0 2px 10px ${SAFFRON}44`:done?`0 0 0 3px ${IND_GREEN}18`:"none",transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)",zIndex:1,position:"relative"}}>
                      {done
                        ?<span style={{color:"#fff",fontSize:14,fontWeight:900}}>✓</span>
                        :active
                          ?<AshokaChakra size={16} color="#fff" spinning={true}/>
                          :<span style={{color:"#ccc",fontSize:11,fontWeight:800}}>{i+1}</span>
                      }
                    </div>,
                    i<t.questions.length-1&&(
                      <div key={`line-${i}`} style={{flex:1,height:3,borderRadius:3,background:"#ebebeb",position:"relative",overflow:"hidden"}}>
                        {i<step&&<div style={{position:"absolute",inset:0,borderRadius:3,background:`linear-gradient(90deg,${SAFFRON},${IND_GREEN})`}}/>}
                      </div>
                    ),
                  ];
                })}
              </div>
              {/* Step label row */}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:7,paddingLeft:3,paddingRight:3}}>
                <span style={{fontSize:9.5,fontWeight:700,color:ASHOKA_BLUE,letterSpacing:0.4,fontFamily:bf}}>
                  {isHindi?`चरण ${step+1} / ${TOTAL}`:`STEP ${step+1} OF ${TOTAL}`}
                </span>
                <span style={{fontSize:9.5,fontWeight:600,color:"#aaa",fontFamily:bf}}>{q?.hint}</span>
              </div>
            </>
          )}
        </div>

        {/* Question step */}
        {step<TOTAL&&q&&(
          <div key={animKey} style={{padding:"20px 20px 32px",animation:"fadeSlide 0.3s ease"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:42,marginBottom:10}}>{q.icon}</div>
              <div style={{fontSize:17,fontWeight:800,color:th.text,lineHeight:1.3,fontFamily:bf}}>{q.q}</div>
              <div style={{fontSize:12,color:th.textLight,marginTop:5}}>{q.hint}</div>
            </div>

            {isStateQ?(
              <div>
                <input value={stateSearch} onChange={e=>setStateSearch(e.target.value)} placeholder={t.searchStatePh}
                  style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"2px solid #FF9933",fontSize:14,outline:"none",fontFamily:bf,marginBottom:8,boxSizing:"border-box",background:th.inputBg,color:th.text}}/>
                <div style={{background:th.card,borderRadius:14,border:`1.5px solid ${th.border}`,maxHeight:220,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
                  {(stateSearch?filteredStates:INDIA_STATES).map(state=>{
                    const sel=stateSearch===state;
                    return(
                      <div key={state} onClick={()=>setStateSearch(state)}
                        style={{padding:"12px 16px",borderBottom:`1px solid ${th.divider}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",background:sel?th.optionActive:th.card,transition:"background 0.15s"}}>
                        <span style={{fontSize:14,fontWeight:sel?700:400,color:sel?"#CC6600":th.text,fontFamily:bf}}>{state}</span>
                        {sel&&<span style={{color:"#FF9933",fontSize:16,fontWeight:700}}>✓</span>}
                      </div>
                    );
                  })}
                  {stateSearch&&filteredStates.length===0&&<div style={{padding:16,textAlign:"center",color:"#aaa",fontSize:13}}>No state found</div>}
                </div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {q.options.map(opt=>{
                  const active=activeVal===opt.value;
                  return(
                    <div key={opt.value} onClick={()=>setSelected(opt.value)}
                      style={{padding:"13px 16px",borderRadius:13,border:`2px solid ${active?"#FF9933":th.border}`,background:active?th.optionActive:th.optionBg,cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.18s",boxShadow:active?"0 4px 14px rgba(255,153,51,0.18)":"none"}}>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${active?"#FF9933":th.border3}`,background:active?"#FF9933":th.optionBg,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {active&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}
                      </div>
                      <span style={{fontSize:13,fontWeight:active?700:400,color:active?"#CC6600":th.text,fontFamily:bf}}>{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{display:"flex",gap:10,marginTop:24}}>
              <div onClick={goBack} style={{flex:1,padding:14,borderRadius:14,border:`1.5px solid ${th.border3}`,background:th.card,textAlign:"center",fontSize:14,fontWeight:600,color:th.textMid,cursor:"pointer",fontFamily:bf}}>{t.backBtn}</div>
              <div onClick={goNext} style={{flex:2,padding:14,borderRadius:14,background:canProceed?"linear-gradient(135deg,#FF9933,#FF8C00)":"#e0e0e0",textAlign:"center",fontSize:14,fontWeight:700,color:"#fff",cursor:canProceed?"pointer":"default",fontFamily:bf,boxShadow:canProceed?"0 4px 16px rgba(255,153,51,0.35)":"none",transition:"all 0.2s"}}>
                {step===TOTAL-1?t.checkBtn:t.nextBtn}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {step===TOTAL&&(
          <div style={{padding:"16px 16px 48px"}}>
            {results.length>0?(
              <>
                <div style={{background:"linear-gradient(135deg,#138808,#16a34a)",borderRadius:20,padding:"18px 20px",marginBottom:16,boxShadow:"0 6px 24px rgba(19,136,8,0.25)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <div style={{fontSize:34}}>🎉</div>
                    <div>
                      <div style={{fontSize:16,fontWeight:800,color:"#fff",fontFamily:bf}}>{t.matchSub(results.length)}</div>
                      {answers.state&&<div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:2}}>📍 {answers.state}</div>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{flex:1,background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
                      <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{nationalResults.length}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:2}}>🇮🇳 {isHindi?"केंद्रीय":"Central"}</div>
                    </div>
                    <div style={{flex:1,background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
                      <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{stateResults.length}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:2}}>📍 {isHindi?"राज्य":"State"}</div>
                    </div>
                    {totalAnnual>0&&(
                      <div style={{flex:2,background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"10px 12px",textAlign:"center",border:"1px solid rgba(255,255,255,0.3)"}}>
                        <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>₹{(totalAnnual/100000).toFixed(1)}L</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:2}}>{t.totalBenefit}</div>
                      </div>
                    )}
                  </div>
                </div>

                {nationalResults.length>0&&(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                      <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #BFDBFE"}}>🇮🇳 {t.centralSchemes} ({nationalResults.length})</span>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                    </div>
                    {nationalResults.map(s=><SchemeCard key={s.id} scheme={s} lang={lang} dark={dark} expanded={expandedId===s.id} onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>)}
                  </>
                )}
                {stateResults.length>0&&(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 10px"}}>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                      <span style={{fontSize:11,fontWeight:700,color:"#854D0E",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #FEF08A"}}>📍 {t.stateSchemes} ({stateResults.length})</span>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                    </div>
                    {stateResults.map(s=><SchemeCard key={s.id} scheme={s} lang={lang} dark={dark} expanded={expandedId===s.id} onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>)}
                  </>
                )}
              </>
            ):(
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:52,marginBottom:16}}>🔍</div>
                <div style={{fontSize:17,fontWeight:800,color:th.text,marginBottom:8,fontFamily:bf}}>{t.noMatchTitle}</div>
                <div style={{fontSize:13,color:th.textSub,lineHeight:1.6,fontFamily:bf}}>{t.noMatchSub}</div>
              </div>
            )}
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <div onClick={retake} style={{flex:1,padding:14,borderRadius:14,border:"1.5px solid #FF9933",background:th.card,textAlign:"center",fontSize:13,fontWeight:700,color:"#FF8C00",cursor:"pointer",fontFamily:bf}}>{t.retakeBtn}</div>
              <div onClick={onClose} style={{flex:1,padding:14,borderRadius:14,background:"linear-gradient(135deg,#003580,#1a56db)",textAlign:"center",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:bf}}>{t.doneBtn}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHARED PROFILE SUB-COMPONENTS (top-level — prevents focus loss on re-render) ─
function TriHeader({children,bg="linear-gradient(160deg,#FF9933 0%,#FF8C00 35%,#003580 100%)"}){
  return(
    <div style={{background:bg,padding:"52px 24px 36px",position:"relative",overflow:"hidden",flexShrink:0}}>
      <div style={{position:"absolute",right:-30,top:-30,width:170,height:170,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.1)",pointerEvents:"none"}}>
        <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",opacity:0.1,fontSize:72}}>☸</div>
      </div>
      {children}
    </div>
  );
}
function Card({children,mt=-20,dark=false}){
  const th=THEME[dark?"dark":"light"];
  return(
    <div style={{margin:`${mt}px 16px 0`,background:th.card,borderRadius:20,padding:22,boxShadow:dark?"0 6px 28px rgba(0,0,0,0.35)":"0 6px 28px rgba(0,0,0,0.10)",border:`1.5px solid ${th.border}`}}>
      {children}
    </div>
  );
}

// ─── PROFILE TAB ──────────────────────────────────────────────────────────────
function ProfileTab({lang,profile,setProfile,toggleLang,onViewChecker,dark=false,toggleDark}){
  const th=THEME[dark?"dark":"light"];
  const pt=PT[lang];
  const bf=fontFamily(lang);
  const isHindi=lang==="hi";

  // Stage: "phone" | "otp" | "setup1" | "setup2" | "dashboard"
  const [stage,setStage]=useState(profile?"dashboard":"phone");
  const [phone,setPhone]=useState(profile?.phone||"");
  const [otp,setOtp]=useState(["","","","","",""]);
  const [timer,setTimer]=useState(60);
  const [timerOn,setTimerOn]=useState(false);
  const [setupName,setSetupName]=useState(profile?.name||"");
  const [setupGender,setSetupGender]=useState(profile?.gender||"");
  const [setupState,setSetupState]=useState(profile?.state||"");
  const [stateSearch,setStateSearch]=useState(profile?.state||"");
  const [setupCat,setSetupCat]=useState(profile?.occupation||"");
  const [authLoading,setAuthLoading]=useState(false);
  const [authError,setAuthError]=useState("");
  const otpRefs=useRef([]);
  const verifierRef=useRef(null);
  const confirmationRef=useRef(null);

  // Read eligibility checker saved answers for pre-fill
  const savedAnswers=useMemo(()=>{
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")||null;}catch{return null;}
  },[]);

  // Sync stage if profile changes (e.g. after save or sign-out)
  useEffect(()=>{
    if(profile) setStage("dashboard");
    else if(stage==="dashboard") setStage("phone");
  },[profile]);

  // OTP countdown timer
  useEffect(()=>{
    if(!timerOn)return;
    if(timer<=0){setTimerOn(false);return;}
    const id=setTimeout(()=>setTimer(t=>t-1),1000);
    return()=>clearTimeout(id);
  },[timerOn,timer]);

  const startTimer=()=>{setTimer(60);setTimerOn(true);};

  // ── HANDLERS ────────────────────────────────────────────────────────────────
  const handleGetOtp=async()=>{
    if(phone.length!==10)return;
    setAuthLoading(true);setAuthError("");
    try{
      if(!verifierRef.current){
        verifierRef.current=new RecaptchaVerifier(auth,"recaptcha-container",{size:"invisible",callback:()=>{}});
      }
      const confirmation=await signInWithPhoneNumber(auth,`+91${phone}`,verifierRef.current);
      confirmationRef.current=confirmation;
      startTimer();setOtp(["","","","","",""]);setStage("otp");
    }catch(err){
      setAuthError(err.message||"Failed to send OTP. Please try again.");
      verifierRef.current=null;
    }finally{setAuthLoading(false);}
  };

  const handleOtpChange=(i,val)=>{
    if(!/^\d*$/.test(val))return;
    const next=[...otp];next[i]=val.slice(-1);setOtp(next);
    if(val&&i<5)setTimeout(()=>otpRefs.current[i+1]?.focus(),0);
  };

  const handleOtpKey=(i,e)=>{
    if(e.key==="Backspace"&&!otp[i]&&i>0)otpRefs.current[i-1]?.focus();
  };

  const handleOtpPaste=(e)=>{
    const digits=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if(digits.length===6){setOtp(digits.split(""));setTimeout(()=>otpRefs.current[5]?.focus(),0);}
    e.preventDefault();
  };

  const handleVerify=async()=>{
    if(otp.join("").length!==6)return;
    setAuthLoading(true);setAuthError("");
    try{
      await confirmationRef.current.confirm(otp.join(""));
      if(savedAnswers){
        if(savedAnswers.state){setSetupState(savedAnswers.state);setStateSearch(savedAnswers.state);}
        if(savedAnswers.who) setSetupCat(savedAnswers.who);
      }
      setStage("setup1");
    }catch(err){
      setAuthError("Invalid OTP. Please check and try again.");
    }finally{setAuthLoading(false);}
  };

  const handleSetup1Next=()=>{
    if(setupName.trim().length<2||!setupGender)return;
    setStage("setup2");
  };

  const handleSetup2Save=()=>{
    if(!setupState||!setupCat)return;
    setProfile({
      name:setupName.trim(),phone,gender:setupGender,
      state:setupState,occupation:setupCat,
      income:savedAnswers?.income||"1to3",
      house:savedAnswers?.house||"no",
      age:savedAnswers?.age||"18to35",
      area:savedAnswers?.area||"rural",
    });
    setStage("dashboard");
  };

  const handleEdit=()=>{
    setSetupName(profile?.name||"");setSetupGender(profile?.gender||"");
    setSetupState(profile?.state||"");setStateSearch(profile?.state||"");
    setSetupCat(profile?.occupation||"");
    setStage("setup1");
  };

  const handleSignOut=async()=>{
    await signOut(auth);
    setProfile(null);
    setPhone("");setOtp(["","","","","",""]);
    setSetupName("");setSetupGender("");setSetupState("");setStateSearch("");setSetupCat("");
    setStage("phone");
  };

  // Matched scheme count for dashboard
  const matchedCount=useMemo(()=>{
    if(!profile)return 0;
    const ans={who:profile.occupation,income:profile.income,house:profile.house,age:profile.age,area:profile.area,state:profile.state};
    return SCHEME_DB.filter(s=>s.match(ans)).length;
  },[profile]);

  const filteredStates=useMemo(()=>INDIA_STATES.filter(s=>s.toLowerCase().includes(stateSearch.toLowerCase())),[stateSearch]);
  const catIcon=(v)=>({farmer:"🌾",student:"📚",women:"👩",senior:"👴",business:"💼",general:"🧑"})[v]||"🧑";
  const catDisplayLabel=(v)=>pt.categories.find(c=>c.v===v)?.l||v;

  // ── STAGE: PHONE ─────────────────────────────────────────────────────────────
  if(stage==="phone") return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
      <TriHeader>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <div style={{width:52,height:52,borderRadius:16,background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
            <AshokaChakra size={30} color="#fff" spinning={false}/>
          </div>
          <div>
            <div style={{color:"#fff",fontSize:21,fontWeight:800,fontFamily:bf,lineHeight:1.1}}>{pt.signInTitle}</div>
            <div style={{color:"rgba(255,255,255,0.75)",fontSize:11.5,marginTop:3}}>🇮🇳 YojanaSetu</div>
          </div>
        </div>
        <div style={{color:"rgba(255,255,255,0.88)",fontSize:13,lineHeight:1.6,fontFamily:bf}}>{pt.signInSub}</div>
      </TriHeader>

      <Card dark={dark}>
        <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>📱 {pt.phoneLabel}</div>
        <div style={{display:"flex",alignItems:"center",border:`2px solid ${phone.length===10?"#138808":"#FF9933"}`,borderRadius:14,overflow:"hidden",marginBottom:18,transition:"border-color 0.2s"}}>
          <div style={{padding:"14px 12px",borderRight:"1.5px solid rgba(255,153,51,0.35)",background:"#FFF7ED",fontSize:14,fontWeight:700,color:"#CC6600",flexShrink:0}}>+91</div>
          <input type="tel" inputMode="numeric" maxLength={10} value={phone}
            onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
            placeholder={pt.phonePh}
            style={{flex:1,border:"none",outline:"none",fontSize:15,padding:"14px 14px",background:"transparent",fontFamily:bf,color:th.text,letterSpacing:1.5}}/>
          {phone.length===10&&<div style={{paddingRight:14,fontSize:18,color:"#138808",fontWeight:700}}>✓</div>}
        </div>
        <div onClick={!authLoading?handleGetOtp:undefined}
          style={{background:phone.length===10&&!authLoading?"linear-gradient(135deg,#FF9933,#FF8C00)":"#ddd",borderRadius:14,padding:"15px",textAlign:"center",fontSize:15,fontWeight:700,color:"#fff",cursor:phone.length===10&&!authLoading?"pointer":"default",fontFamily:bf,boxShadow:phone.length===10&&!authLoading?"0 6px 22px rgba(255,153,51,0.42)":"none",transition:"all 0.22s"}}>
          {authLoading?(isHindi?"भेज रहे हैं...":"Sending OTP…"):pt.getOtpBtn}
        </div>
        {authError&&<div style={{marginTop:10,fontSize:12,color:"#e53e3e",textAlign:"center",fontFamily:bf,padding:"8px 12px",background:"#FFF5F5",borderRadius:10,border:"1px solid #FED7D7"}}>{authError}</div>}
        <div id="recaptcha-container"/>
        <div style={{marginTop:16,textAlign:"center",fontSize:11,color:"#bbb",fontFamily:bf,lineHeight:1.6}}>
          {isHindi?"यह पूरी तरह सुरक्षित है। कोई पासवर्ड नहीं।":"Completely secure · No passwords needed"}
        </div>
      </Card>
    </div>
  );

  // ── STAGE: OTP ───────────────────────────────────────────────────────────────
  if(stage==="otp"){
    const otpFull=otp.join("").length===6;
    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
        <TriHeader>
          <div onClick={()=>setStage("phone")}
            style={{display:"inline-flex",alignItems:"center",gap:6,color:"rgba(255,255,255,0.82)",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:18,background:"rgba(255,255,255,0.14)",borderRadius:20,padding:"5px 13px",border:"1px solid rgba(255,255,255,0.22)"}}>
            ← {isHindi?"वापस":"Back"}
          </div>
          <div style={{color:"#fff",fontSize:21,fontWeight:800,fontFamily:bf,marginBottom:5}}>{pt.otpTitle}</div>
          <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,fontFamily:bf}}>{pt.otpSub(phone)}</div>
        </TriHeader>

        <Card dark={dark}>
          {/* 6-box OTP input */}
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:22}} onPaste={handleOtpPaste}>
            {otp.map((digit,i)=>(
              <input key={i} ref={el=>otpRefs.current[i]=el}
                type="tel" inputMode="numeric" maxLength={1} value={digit}
                onChange={e=>handleOtpChange(i,e.target.value)}
                onKeyDown={e=>handleOtpKey(i,e)}
                autoFocus={i===0}
                style={{width:44,height:54,textAlign:"center",fontSize:22,fontWeight:700,color:th.text,border:`2px solid ${digit?"#FF9933":th.border3}`,borderRadius:13,outline:"none",background:digit?th.optionActive:th.inputBg,transition:"all 0.15s",fontFamily:"monospace"}}/>
            ))}
          </div>

          <div onClick={!authLoading?handleVerify:undefined}
            style={{background:otpFull&&!authLoading?"linear-gradient(135deg,#003580,#1a56db)":"#ddd",borderRadius:14,padding:15,textAlign:"center",fontSize:15,fontWeight:700,color:"#fff",cursor:otpFull&&!authLoading?"pointer":"default",fontFamily:bf,boxShadow:otpFull&&!authLoading?"0 6px 22px rgba(0,53,128,0.36)":"none",transition:"all 0.22s",marginBottom:16}}>
            {authLoading?(isHindi?"जाँच रहे हैं...":"Verifying…"):pt.verifyBtn}
          </div>

          <div style={{textAlign:"center"}}>
            {timerOn
              ?<div style={{fontSize:12,color:"#aaa",fontFamily:bf}}>{pt.resendIn(timer)}</div>
              :<div onClick={()=>{startTimer();setOtp(["","","","","",""]);setTimeout(()=>otpRefs.current[0]?.focus(),0);}}
                style={{fontSize:13,fontWeight:700,color:"#FF8C00",cursor:"pointer",textDecoration:"underline",fontFamily:bf}}>{pt.resendBtn}</div>
            }
          </div>
          {authError&&<div style={{marginTop:12,fontSize:12,color:"#e53e3e",textAlign:"center",fontFamily:bf,padding:"8px 12px",background:"#FFF5F5",borderRadius:10,border:"1px solid #FED7D7"}}>{authError}</div>}
        </Card>
      </div>
    );
  }

  // ── STAGE: SETUP 1 — Name + Gender ──────────────────────────────────────────
  if(stage==="setup1"){
    const canNext=setupName.trim().length>=2&&!!setupGender;
    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
        <TriHeader bg="linear-gradient(135deg,#003580 0%,#1a56db 100%)">
          {/* Progress bar */}
          <div style={{display:"flex",gap:6,marginBottom:18}}>
            <div style={{height:4,flex:1,borderRadius:4,background:"#FF9933",boxShadow:"0 0 8px rgba(255,153,51,0.5)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"rgba(255,255,255,0.22)"}}/>
          </div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:10.5,fontWeight:700,letterSpacing:0.9,marginBottom:5,textTransform:"uppercase"}}>{pt.step1of2}</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:800,fontFamily:bf,marginBottom:3}}>{pt.step1Title}</div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:12,fontFamily:bf}}>{pt.fillOnce}</div>
        </TriHeader>

        <Card dark={dark}>
          {/* Name */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>👤 {pt.nameLabel}</div>
            <input value={setupName} onChange={e=>setSetupName(e.target.value)} placeholder={pt.namePh}
              style={{width:"100%",padding:"13px 16px",borderRadius:14,border:`2px solid ${setupName.trim().length>=2?"#138808":th.border3}`,fontSize:14,outline:"none",fontFamily:bf,background:th.inputBg,color:th.text,boxSizing:"border-box",transition:"border-color 0.2s"}}/>
          </div>

          {/* Gender */}
          <div style={{marginBottom:22}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>⚧ {pt.genderLabel}</div>
            <div style={{display:"flex",gap:8}}>
              {pt.genders.map(g=>{
                const a=setupGender===g.v;
                return(
                  <div key={g.v} onClick={()=>setSetupGender(g.v)}
                    style={{flex:1,padding:"12px 6px",borderRadius:13,border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,textAlign:"center",cursor:"pointer",fontSize:12,fontWeight:a?700:400,color:a?"#CC6600":th.textMid,fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 14px rgba(255,153,51,0.22)":"none"}}>
                    {g.l}
                  </div>
                );
              })}
            </div>
          </div>

          <div onClick={handleSetup1Next}
            style={{background:canNext?"linear-gradient(135deg,#FF9933,#FF8C00)":"#ddd",borderRadius:14,padding:15,textAlign:"center",fontSize:15,fontWeight:700,color:"#fff",cursor:canNext?"pointer":"default",fontFamily:bf,boxShadow:canNext?"0 6px 22px rgba(255,153,51,0.42)":"none",transition:"all 0.22s"}}>
            {pt.nextBtn}
          </div>
        </Card>
      </div>
    );
  }

  // ── STAGE: SETUP 2 — State + Category ────────────────────────────────────────
  if(stage==="setup2"){
    const canSave=!!setupState&&!!setupCat;
    const hasPrefill=!!(savedAnswers?.state||savedAnswers?.who);
    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
        <TriHeader bg="linear-gradient(135deg,#003580 0%,#1a56db 100%)">
          <div style={{display:"flex",gap:6,marginBottom:18}}>
            <div style={{height:4,flex:1,borderRadius:4,background:"#FF9933",boxShadow:"0 0 8px rgba(255,153,51,0.5)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"#FF9933",boxShadow:"0 0 8px rgba(255,153,51,0.5)"}}/>
          </div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:10.5,fontWeight:700,letterSpacing:0.9,marginBottom:5,textTransform:"uppercase"}}>{pt.step2of2}</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:800,fontFamily:bf,marginBottom:3}}>{pt.step2Title}</div>
          {hasPrefill&&<div style={{color:"rgba(255,220,100,0.92)",fontSize:11,fontFamily:bf,marginTop:4}}>✓ {pt.prefilled}</div>}
        </TriHeader>

        <Card dark={dark}>
          {/* State */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>📍 {pt.stateLabel}</div>
            <input value={stateSearch}
              onChange={e=>{setStateSearch(e.target.value);if(e.target.value!==setupState)setSetupState("");}}
              placeholder={pt.statePh}
              style={{width:"100%",padding:"12px 14px",borderRadius:13,border:`2px solid ${setupState?"#138808":"#FF9933"}`,fontSize:14,outline:"none",fontFamily:bf,boxSizing:"border-box",background:th.inputBg,color:th.text}}/>
            {!setupState&&(
              <div style={{background:th.card,borderRadius:13,border:`1.5px solid ${th.border}`,maxHeight:150,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.09)",marginTop:5}}>
                {(stateSearch?filteredStates:INDIA_STATES).slice(0,10).map(s=>(
                  <div key={s} onClick={()=>{setSetupState(s);setStateSearch(s);}}
                    style={{padding:"10px 14px",borderBottom:`1px solid ${th.divider}`,cursor:"pointer",fontSize:13,color:th.text,fontFamily:bf,background:th.card}}>
                    {s}
                  </div>
                ))}
                {stateSearch&&filteredStates.length===0&&<div style={{padding:12,textAlign:"center",color:"#aaa",fontSize:12}}>No state found</div>}
              </div>
            )}
            {setupState&&<div style={{fontSize:11.5,color:"#138808",fontWeight:700,fontFamily:bf,marginTop:5}}>✓ {setupState}</div>}
          </div>

          {/* Category */}
          <div style={{marginBottom:22}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>💼 {pt.catLabel}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {pt.categories.map(c=>{
                const a=setupCat===c.v;
                return(
                  <div key={c.v} onClick={()=>setSetupCat(c.v)}
                    style={{padding:"11px 10px",borderRadius:13,border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,cursor:"pointer",fontSize:12,fontWeight:a?700:400,color:a?"#CC6600":th.text,fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 14px rgba(255,153,51,0.22)":"none",textAlign:"center"}}>
                    {c.l}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{display:"flex",gap:8}}>
            <div onClick={()=>setStage("setup1")}
              style={{flex:1,padding:14,borderRadius:14,border:`1.5px solid ${th.border3}`,background:th.card,textAlign:"center",fontSize:13,fontWeight:600,color:th.textMid,cursor:"pointer",fontFamily:bf}}>
              {pt.backBtn}
            </div>
            <div onClick={handleSetup2Save}
              style={{flex:2,background:canSave?"linear-gradient(135deg,#138808,#16a34a)":"#ddd",borderRadius:14,padding:14,textAlign:"center",fontSize:14,fontWeight:700,color:"#fff",cursor:canSave?"pointer":"default",fontFamily:bf,boxShadow:canSave?"0 6px 22px rgba(19,136,8,0.38)":"none",transition:"all 0.22s"}}>
              {pt.saveBtn}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── STAGE: DASHBOARD ─────────────────────────────────────────────────────────
  const initials=(profile?.name||"U").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  const maskedPhone=profile?.phone?`+91 ${profile.phone.slice(0,5)} ••••••`:`+91 ${phone.slice(0,5)||"•••••"} ••••••`;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
      {/* Dashboard header */}
      <div style={{background:"linear-gradient(160deg,#003580 0%,#1a56db 100%)",padding:"52px 20px 28px",position:"relative",overflow:"hidden",flexShrink:0}}>
        <div style={{position:"absolute",right:-40,top:-40,width:190,height:190,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.07)",pointerEvents:"none"}}>
          <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",opacity:0.08,fontSize:80}}>☸</div>
        </div>

        {/* Avatar row */}
        <div style={{display:"flex",alignItems:"center",gap:15,marginBottom:18}}>
          <div style={{width:62,height:62,borderRadius:"50%",background:"linear-gradient(135deg,#FF9933,#FF8C00)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff",border:"3px solid rgba(255,255,255,0.38)",boxShadow:"0 4px 18px rgba(0,0,0,0.22)",flexShrink:0,letterSpacing:-1}}>
            {initials}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:"#fff",fontSize:18,fontWeight:800,fontFamily:bf,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile?.name}</div>
            <div style={{color:"rgba(255,255,255,0.68)",fontSize:12,marginTop:4,letterSpacing:0.4,fontFamily:"monospace"}}>{maskedPhone}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,background:"rgba(255,255,255,0.14)",borderRadius:13,padding:"11px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,0.18)"}}>
            <div style={{fontSize:22,fontWeight:800,color:"#fff",lineHeight:1}}>{matchedCount}</div>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,0.7)",marginTop:3,fontFamily:bf}}>{pt.schemesMatched}</div>
          </div>
          <div style={{flex:1.6,background:"rgba(255,255,255,0.14)",borderRadius:13,padding:"11px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,0.18)"}}>
            <div style={{fontSize:11.5,fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {profile?.state}</div>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,0.7)",marginTop:3,fontFamily:bf}}>{pt.stateLabel2}</div>
          </div>
          <div style={{flex:1.6,background:"rgba(255,255,255,0.14)",borderRadius:13,padding:"11px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,0.18)"}}>
            <div style={{fontSize:11.5,fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{catIcon(profile?.occupation)} {catDisplayLabel(profile?.occupation).split(" ")[0]}</div>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,0.7)",marginTop:3,fontFamily:bf}}>{pt.catLabel2}</div>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 16px 48px"}}>
        {/* View Matched Schemes CTA */}
        <div onClick={onViewChecker}
          style={{background:"linear-gradient(135deg,#138808,#16a34a)",borderRadius:18,padding:"17px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",boxShadow:"0 6px 22px rgba(19,136,8,0.32)",marginBottom:16}}>
          <div>
            <div style={{color:"#fff",fontSize:14,fontWeight:700,fontFamily:bf}}>{pt.viewSchemes}</div>
            <div style={{color:"rgba(255,255,255,0.78)",fontSize:11.5,marginTop:3,fontFamily:bf}}>{matchedCount} {isHindi?"योजनाएं":"schemes"} · {isHindi?"तुरंत देखें":"See instantly"}</div>
          </div>
          <div style={{width:38,height:38,background:"rgba(255,255,255,0.2)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#fff",border:"1.5px solid rgba(255,255,255,0.28)",flexShrink:0}}>→</div>
        </div>

        {/* Settings card */}
        <div style={{background:th.card,borderRadius:18,overflow:"hidden",border:`1.5px solid ${th.border}`,boxShadow:dark?"0 2px 14px rgba(0,0,0,0.25)":"0 2px 14px rgba(0,0,0,0.05)"}}>
          <div style={{padding:"13px 18px 11px",borderBottom:`1px solid ${th.divider}`}}>
            <div style={{fontSize:10.5,fontWeight:700,color:th.textSub,letterSpacing:0.9,textTransform:"uppercase",fontFamily:bf}}>{pt.settingsTitle}</div>
          </div>

          {/* Language */}
          <div style={{padding:"13px 18px",borderBottom:`1px solid ${th.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#EFF6FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🌐</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:th.text,fontFamily:bf}}>{pt.langLabel}</div>
                <div style={{fontSize:11,color:th.textSub,marginTop:1}}>{lang==="en"?"English":"हिंदी"}</div>
              </div>
            </div>
            <LangToggle lang={lang} onToggle={toggleLang}/>
          </div>

          {/* Dark Mode */}
          <div style={{padding:"13px 18px",borderBottom:`1px solid ${th.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:dark?"#1c1c3e":"#F0F0FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🌙</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:th.text,fontFamily:bf}}>{pt.darkLabel}</div>
                <div style={{fontSize:11,color:th.textSub,marginTop:1}}>{pt.darkSub(dark)}</div>
              </div>
            </div>
            <div onClick={toggleDark} style={{width:48,height:28,borderRadius:14,background:dark?"#003580":"#ddd",position:"relative",cursor:"pointer",transition:"background 0.25s",flexShrink:0}}>
              <div style={{position:"absolute",top:4,left:dark?"24px":"4px",width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.3)",transition:"left 0.25s"}}/>
            </div>
          </div>

          {/* Edit Profile */}
          <div onClick={handleEdit}
            style={{padding:"13px 18px",borderBottom:`1px solid ${th.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#FFF7ED",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>✏️</div>
              <div style={{fontSize:14,fontWeight:600,color:th.text,fontFamily:bf}}>{pt.editProfile}</div>
            </div>
            <div style={{color:"#ccc",fontSize:18}}>›</div>
          </div>

          {/* Sign Out */}
          <div onClick={handleSignOut}
            style={{padding:"13px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🚪</div>
              <div style={{fontSize:14,fontWeight:600,color:"#DC2626",fontFamily:bf}}>{pt.signOut}</div>
            </div>
            <div style={{color:"#DC2626",fontSize:18}}>›</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function YojanaSetu(){
  const [lang,setLang]=useState("en");
  const [dark,setDark]=useState(false);
  const [activeTab,setActiveTab]=useState("home");
  const [searchFocused,setSearchFocused]=useState(false);
  const [searchText,setSearchText]=useState("");
  const [loaded,setLoaded]=useState(false);
  const [langAnim,setLangAnim]=useState(false);
  const [showChecker,setShowChecker]=useState(false);
  const [selectedScheme,setSelectedScheme]=useState(null);   // SchemeDetailSheet
  const [selectedCategory,setSelectedCategory]=useState(null); // CategorySheet
  const [profile,setProfile]=useState(null);
  const toggleDark=()=>setDark(d=>!d);

  useEffect(()=>{const id=setTimeout(()=>setLoaded(true),100);return()=>clearTimeout(id);},[]);

  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=fontFamily(lang);
  const toggleLang=()=>{setLangAnim(true);setTimeout(()=>{setLang(l=>l==="en"?"hi":"en");setLangAnim(false);},120);};

  // Animated stat counters — raw targets: 3000, 28, 50 (formatted below)
  const [c0,c1,c2]=useCountUp(STAT_TARGETS,loaded,1400);
  const animatedStats=useMemo(()=>t.stats.map((s,i)=>{
    if(i===0) return{...s,number:c0>=3000?"3,000+":(c0>=1000?(Math.floor(c0/1000)+","+String(c0%1000).padStart(3,"0")):String(c0))};
    if(i===1) return{...s,number:String(c1)};
    if(i===2) return{...s,number:c2+"L+"};
    return s;
  }),[c0,c1,c2,t]);

  // Home page schemes — pulled from SCHEME_DB via helper (no duplicate data)
  const homeSchemes=useMemo(()=>getHomeSchemes(lang),[lang]);
  // Categories — pulled from schemesData.js
  const categories=useMemo(()=>CATEGORIES[lang],[lang]);
  // Scheme counts per category — computed once (filterKey is language-agnostic)
  const categoryCounts=useMemo(()=>{
    const counts={};
    CATEGORIES.en.forEach(cat=>{counts[cat.filterKey]=getSchemesForCategory(cat.filterKey).length;});
    return counts;
  },[]);

  const profileAnswers=useMemo(()=>profile?{who:profile.occupation,income:profile.income,house:profile.house,age:profile.age,area:profile.area,state:profile.state}:null,[profile]);

  const navItems=useMemo(()=>[
    {icon:"🏠",label:t.navHome,tab:"home"},
    {icon:"🔍",label:t.navSearch,tab:"search"},
    {icon:"📋",label:t.navSchemes,tab:"schemes"},
    {icon:"🤖",label:t.navAI,tab:"ai"},
    {icon:"👤",label:t.navProfile,tab:"profile"},
  ],[t]);

  return(
    <div className="app-root" style={{fontFamily:bf,background:th.appBg,maxWidth:420,margin:"0 auto",position:"relative",display:"flex",flexDirection:"column",overflowX:"hidden",boxShadow:"0 0 60px rgba(0,0,0,0.15)",opacity:langAnim?0.7:1,transition:"opacity 0.12s,background 0.3s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .fu{opacity:0;transform:translateY(20px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1);}
        .fu.show{opacity:1;transform:translateY(0);}
        .ch{transition:transform 0.2s;cursor:pointer;} .ch:active{transform:scale(0.97);}
        .sc:hover{transform:translateY(-2px);}
        .spin{animation:spin 20s linear infinite;}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{display:none;}
        .tb{font-size:10px;padding:2px 7px;border-radius:20px;font-weight:600;}
        .sb{transition:all 0.3s;} .sb.fc{box-shadow:0 0 0 3px rgba(255,153,51,0.25);}
        .s1{transition-delay:0.1s!important}.s2{transition-delay:0.2s!important}.s3{transition-delay:0.3s!important}
        .s4{transition-delay:0.4s!important}.s5{transition-delay:0.5s!important}.s6{transition-delay:0.6s!important}
        .c0{transition-delay:0.20s!important}.c1{transition-delay:0.28s!important}.c2{transition-delay:0.36s!important}
        .c3{transition-delay:0.44s!important}.c4{transition-delay:0.52s!important}.c5{transition-delay:0.60s!important}
        .c6{transition-delay:0.68s!important}.c7{transition-delay:0.76s!important}.c8{transition-delay:0.84s!important}
        .bn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 12px;cursor:pointer;border-radius:12px;transition:all 0.2s;flex:1;}
        .bn:active{transform:scale(0.93);}
        .cp{animation:cp 2.5s ease-in-out infinite;}
        @keyframes cp{0%,100%{box-shadow:0 6px 24px rgba(19,136,8,0.3)}50%{box-shadow:0 6px 32px rgba(19,136,8,0.55)}}
        .app-root{height:100vh;height:100dvh;}
        .bnav-wrap{flex-shrink:0;position:sticky;bottom:0;padding-bottom:max(20px,env(safe-area-inset-bottom,20px));}
        @keyframes fadeSlide{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      {/* ── HOME TAB ── */}
      {activeTab==="home"&&(
        <div style={{flex:1,overflowY:"auto"}}>
          {/* Header */}
          <div style={{background:"linear-gradient(135deg,#FF9933 0%,#FF8C00 40%,#003580 100%)",padding:"0 0 24px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",right:-40,top:-40,width:180,height:180,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.1)"}}>
              <div className="spin" style={{width:"100%",height:"100%",borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,opacity:0.12}}>☸</div>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"52px 20px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:42,height:42,background:"rgba(255,255,255,0.2)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid rgba(255,255,255,0.35)",fontSize:22}}>🏛️</div>
                <div>
                  <div style={{color:"#fff",fontSize:18,fontWeight:800,fontFamily:bf}}>{t.appName}</div>
                  <div style={{color:"rgba(255,255,255,0.75)",fontSize:10.5}}>🇮🇳 {t.appSub}</div>
                </div>
              </div>
              <LangToggle lang={lang} onToggle={toggleLang}/>
            </div>
            <div style={{padding:"0 20px 16px"}}>
              <div style={{color:"rgba(255,255,255,0.85)",fontSize:13,marginBottom:2}}>{t.greeting(profile?.name)}</div>
              <div style={{color:"#fff",fontSize:20,fontWeight:800,lineHeight:1.3,fontFamily:bf}}>{t.headline}</div>
              <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,marginTop:2}}>{t.subheadline}</div>
            </div>
            <div style={{padding:"0 20px"}}>
              <div className={`sb ${searchFocused?"fc":""}`}
                style={{background:th.card,borderRadius:14,display:"flex",alignItems:"center",gap:10,padding:"12px 16px",border:"2px solid rgba(255,255,255,0.4)"}}>
                <span style={{fontSize:18}}>🔍</span>
                <input value={searchText} onChange={e=>setSearchText(e.target.value)}
                  onFocus={()=>setSearchFocused(true)}
                  onBlur={()=>setSearchFocused(false)}
                  onKeyDown={e=>{if(e.key==="Enter"&&searchText.trim())setActiveTab("search");}}
                  placeholder={t.searchPlaceholder}
                  style={{border:"none",outline:"none",fontSize:14,flex:1,background:"transparent",color:th.text,fontFamily:bf}}/>
                <div onClick={()=>{if(searchText.trim())setActiveTab("search");}}
                  style={{background:"linear-gradient(135deg,#FF9933,#FF8C00)",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {t.searchBtn}
                </div>
              </div>
            </div>
          </div>

          {/* Stats — animated count-up on load */}
          <div className={`fu s1 ${loaded?"show":""}`}
            style={{background:th.card,margin:"0 16px",borderRadius:"0 0 18px 18px",padding:"14px 8px",display:"flex",boxShadow:dark?"0 4px 20px rgba(0,0,0,0.2)":"0 4px 20px rgba(0,0,0,0.07)",marginBottom:4}}>
            {animatedStats.map((s,i)=>(
              <div key={i} style={{flex:1,textAlign:"center",borderRight:i<2?`1px solid ${th.border}`:'none',padding:"0 8px"}}>
                <div style={{fontSize:20,fontWeight:800,color:i===0?"#FF9933":i===1?"#003580":"#138808",fontVariantNumeric:"tabular-nums",transition:"color 0.3s"}}>{s.number}</div>
                <div style={{fontSize:10,color:th.textSub,marginTop:2,fontFamily:bf}}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{padding:"14px 16px 100px"}}>
            {/* Eligibility CTA */}
            <div className={`fu s1 cp ${loaded?"show":""}`} onClick={()=>setShowChecker(true)}
              style={{background:"linear-gradient(135deg,#138808,#16a34a)",borderRadius:18,padding:18,marginBottom:16,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
              <div style={{width:52,height:52,background:"rgba(255,255,255,0.2)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,border:"1.5px solid rgba(255,255,255,0.3)"}}>🎯</div>
              <div style={{flex:1}}>
                <div style={{color:"#fff",fontSize:15,fontWeight:700,fontFamily:bf}}>{t.ctaTitle}</div>
                <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginTop:3}}>{t.ctaSub(!!profile)}</div>
              </div>
              <div style={{background:"rgba(255,255,255,0.25)",borderRadius:12,padding:"10px 14px",color:"#fff",fontSize:13,fontWeight:700,border:"1.5px solid rgba(255,255,255,0.4)",fontFamily:bf,flexShrink:0}}>{t.ctaBtn(!!profile)}</div>
            </div>

            {/* Categories — now CLICKABLE, opens CategorySheet */}
            <div style={{marginBottom:16}}>
              <div className={`fu s2 ${loaded?"show":""}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:15,fontWeight:800,color:th.text,fontFamily:bf}}>{t.categoriesTitle}</div>
                <div onClick={()=>setActiveTab("schemes")} style={{color:"#003580",fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.seeAll}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {categories.map((cat,i)=>{
                  const count=categoryCounts[cat.filterKey]||0;
                  return(
                    <div key={i} className={`fu ch c${i} ${loaded?"show":""}`}
                      onClick={()=>setSelectedCategory(cat)}
                      style={{background:cat.bg,borderRadius:14,padding:"13px 8px",textAlign:"center",border:`1.5px solid ${cat.color}20`,position:"relative"}}>
                      {/* Scheme count badge */}
                      <div style={{
                        position:"absolute",top:7,right:7,
                        background:cat.color,color:"#fff",
                        fontSize:9,fontWeight:800,
                        borderRadius:20,padding:"2px 6px",
                        minWidth:18,lineHeight:"14px",textAlign:"center",
                        boxShadow:`0 2px 6px ${cat.color}55`,
                        letterSpacing:0,
                      }}>{count}</div>
                      <div style={{fontSize:24,marginBottom:5}}>{cat.icon}</div>
                      <div style={{fontSize:11,fontWeight:700,color:cat.color,fontFamily:bf}}>{cat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Schemes — data from SCHEME_DB via getHomeSchemes() */}
            <div className={`fu s3 ${loaded?"show":""}`} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:th.text,fontFamily:bf}}>{t.schemesTitle}</div>
                  <div style={{fontSize:11,color:th.textSub}}>{t.schemesSub}</div>
                </div>
                <div onClick={()=>setActiveTab("schemes")} style={{color:"#003580",fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.seeAll}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {homeSchemes.map((s,i)=>(
                  <div key={i} className="ch sc" onClick={()=>setSelectedScheme(s.id)}
                    style={{background:th.card,borderRadius:16,padding:"13px 15px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 10px rgba(0,0,0,0.05)",border:`1.5px solid ${th.border}`}}>
                    <div style={{width:44,height:44,background:s.color+"14",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,border:`1.5px solid ${s.color}20`}}>{s.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:5,marginBottom:4}}>
                        <span style={{fontSize:9,fontWeight:700,background:"#EFF6FF",color:"#1D4ED8",borderRadius:6,padding:"1px 6px",border:"1px solid #BFDBFE"}}>🇮🇳 {isHindi?"केंद्रीय":"Central"}</span>
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:th.text,lineHeight:1.3,fontFamily:bf}}>{s.name}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                        <span className="tb" style={{background:s.color+"18",color:s.color}}>{s.tag}</span>
                        <span style={{fontSize:11,color:th.textSub,fontWeight:600}}>{s.benefit}</span>
                      </div>
                    </div>
                    <div style={{color:s.color,fontSize:18,fontWeight:700}}>›</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpline */}
            <div className={`fu s4 ${loaded?"show":""}`}
              style={{background:th.card,borderRadius:16,padding:15,display:"flex",alignItems:"center",gap:12,border:"1.5px solid #FF993328",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
              <div style={{fontSize:26}}>📞</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:bf}}>{t.helplineTitle}</div>
                <div style={{fontSize:11,color:th.textSub}}>{t.helplineSub}</div>
              </div>
              <div onClick={()=>{window.location.href="tel:1800111555";}}
                style={{background:"#FF9933",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:bf}}>{t.helplineBtn}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH TAB — fully working, searches all SCHEME_DB ── */}
      {activeTab==="search"&&(
        <SearchTab lang={lang} initialQuery={searchText} dark={dark}/>
      )}

      {/* ── SCHEMES TAB — all schemes with category filter pills ── */}
      {activeTab==="schemes"&&(
        <SchemesTab lang={lang} dark={dark}/>
      )}

      {/* ── AI TAB — powered by Groq ── */}
      {activeTab==="ai"&&(
        <AIChat lang={lang} dark={dark} profile={profile}/>
      )}

      {/* ── PROFILE TAB ── */}
      {activeTab==="profile"&&(
        <ProfileTab
          lang={lang}
          profile={profile}
          setProfile={setProfile}
          toggleLang={toggleLang}
          onViewChecker={()=>setShowChecker(true)}
          dark={dark}
          toggleDark={toggleDark}
        />
      )}

      {/* Bottom nav */}
      <div className="bnav-wrap" style={{background:th.navBg,borderTop:`1.5px solid ${th.navBorder}`,paddingTop:"8px",paddingLeft:"4px",paddingRight:"4px",display:"flex",boxShadow:dark?"0 -4px 20px rgba(0,0,0,0.25)":"0 -4px 20px rgba(0,0,0,0.07)",zIndex:100}}>
        {navItems.map(item=>{
          const active=activeTab===item.tab;
          return(
            <div key={item.tab} className="bn" onClick={()=>setActiveTab(item.tab)}
              style={{position:"relative",background:active?"#EFF6FF":"transparent",borderRadius:12,padding:"6px 8px 7px"}}>
              <div style={{fontSize:20,filter:active?"none":"grayscale(0.3)",transition:"filter 0.2s"}}>{item.icon}</div>
              <div style={{fontSize:9,fontWeight:active?800:500,color:active?"#003580":th.textSub,fontFamily:bf,transition:"color 0.2s"}}>{item.label}</div>
              {active&&<div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:20,height:3,borderRadius:"3px 3px 0 0",background:"#FF9933"}}/>}
            </div>
          );
        })}
      </div>

      {/* ── OVERLAYS ── */}
      {showChecker&&(
        <EligibilityChecker lang={lang} onClose={()=>setShowChecker(false)} prefilledAnswers={profileAnswers||undefined} dark={dark}/>
      )}
      {selectedScheme&&(
        <SchemeDetailSheet schemeId={selectedScheme} lang={lang} onClose={()=>setSelectedScheme(null)} dark={dark}/>
      )}
      {selectedCategory&&(
        <CategorySheet category={selectedCategory} lang={lang} onClose={()=>setSelectedCategory(null)} dark={dark}/>
      )}
    </div>
  );
}