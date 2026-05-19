import { useState, useEffect, useRef } from "react";

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
import {
  INDIA_STATES,
  SCHEME_DB,
  CATEGORIES,
  getHomeSchemes,
  getSchemesForCategory,
} from "./schemesData.js";

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
function SchemeCard({scheme,lang,expanded,onToggle}){
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=isHindi?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif";
  const isNational=scheme.scope==="national";
  return(
    <div style={{background:"#fff",borderRadius:18,marginBottom:10,border:`1.5px solid ${scheme.color}28`,boxShadow:"0 2px 12px rgba(0,0,0,0.05)",overflow:"hidden"}}>
      <div onClick={onToggle} style={{padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}}>
        <div style={{width:46,height:46,background:scheme.color+"15",borderRadius:13,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1.5px solid ${scheme.color}22`,marginTop:2}}>{scheme.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:5}}>
            <span style={{fontSize:9,fontWeight:700,background:isNational?"#EFF6FF":"#FEF9C3",color:isNational?"#1D4ED8":"#854D0E",borderRadius:6,padding:"2px 7px",border:`1px solid ${isNational?"#BFDBFE":"#FEF08A"}`}}>
              {isNational?t.centralLabel:t.stateLabel(scheme.state)}
            </span>
            <span style={{fontSize:9,fontWeight:700,background:scheme.color+"18",color:scheme.color,borderRadius:6,padding:"2px 7px"}}>{scheme.tag[lang]}</span>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:"#1a1a1a",lineHeight:1.35,fontFamily:bf,marginBottom:4}}>{scheme.name[lang]}</div>
          <div style={{fontSize:12,color:scheme.color,fontWeight:600}}>{scheme.benefit[lang]}</div>
          <div style={{fontSize:10,color:"#aaa",marginTop:3,fontFamily:bf}}>{scheme.ministry[lang]}</div>
        </div>
        <div style={{fontSize:16,color:scheme.color,fontWeight:700,transform:expanded?"rotate(90deg)":"rotate(0)",transition:"transform 0.25s",marginTop:2,flexShrink:0}}>›</div>
      </div>
      {expanded&&(
        <div style={{borderTop:`1px solid ${scheme.color}18`,background:scheme.color+"06"}}>
          <div style={{padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#888",letterSpacing:0.6,marginBottom:8,textTransform:"uppercase"}}>📄 {t.docsLabel}</div>
            {scheme.docs[lang].map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:i<scheme.docs[lang].length-1?"1px solid #f0f0f0":"none",fontFamily:bf}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:scheme.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{color:scheme.color,fontSize:10,fontWeight:800}}>✓</span>
                </div>
                <span style={{fontSize:12,color:"#333"}}>{d}</span>
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
function CategorySheet({category,lang,onClose}){
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=isHindi?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif";
  const [visible,setVisible]=useState(false);
  const [expandedId,setExpandedId]=useState(null);

  useEffect(()=>{setTimeout(()=>setVisible(true),30);},[]);

  // Get schemes for this category from SCHEME_DB
  const schemes=getSchemesForCategory(category.filterKey);
  const nationalSchemes=schemes.filter(s=>s.scope==="national");
  const stateSchemes=schemes.filter(s=>s.scope==="state");

  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:"#f5f5f0",borderRadius:"24px 24px 0 0",maxHeight:"90vh",display:"flex",flexDirection:"column",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)",fontFamily:bf}}>

        {/* Sheet Header */}
        <div style={{background:"#fff",borderRadius:"24px 24px 0 0",padding:"12px 20px 16px",flexShrink:0,borderBottom:"1px solid #f0f0f0"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <div style={{width:40,height:4,background:"#e0e0e0",borderRadius:2}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,background:category.bg,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1.5px solid ${category.color}30`,flexShrink:0}}>
              {category.icon}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:800,color:"#1a1a1a",fontFamily:bf}}>{category.label} {t.catSchemes}</div>
              <div style={{fontSize:12,color:"#888",marginTop:1}}>{schemes.length} {isHindi?"योजनाएं मिलीं":"schemes found"}</div>
            </div>
            <div onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:"#666"}}>✕</div>
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
                <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #BFDBFE"}}>
                  🇮🇳 {t.centralSchemes} ({nationalSchemes.length})
                </span>
                <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
              </div>
              {nationalSchemes.map(s=>(
                <SchemeCard key={s.id} scheme={s} lang={lang}
                  expanded={expandedId===s.id}
                  onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
              ))}
            </>
          )}

          {/* State schemes */}
          {stateSchemes.length>0&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 10px"}}>
                <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#854D0E",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #FEF08A"}}>
                  📍 {t.stateSchemes} ({stateSchemes.length})
                </span>
                <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
              </div>
              {stateSchemes.map(s=>(
                <SchemeCard key={s.id} scheme={s} lang={lang}
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
function SchemeDetailSheet({schemeId,lang,onClose}){
  // Looks up full scheme data from SCHEME_DB by id
  const scheme=SCHEME_DB.find(s=>s.id===schemeId);
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=isHindi?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif";
  const [visible,setVisible]=useState(false);
  useEffect(()=>{setTimeout(()=>setVisible(true),30);},[]);
  if(!scheme)return null;
  const applyUrl=scheme.applyType==="online"?`https://${scheme.apply.en}`:null;
  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:"#fff",borderRadius:"24px 24px 0 0",maxHeight:"85vh",overflowY:"auto",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)",fontFamily:bf}}>
        <div style={{display:"flex",justifyContent:"center",paddingTop:12}}>
          <div style={{width:40,height:4,background:"#e0e0e0",borderRadius:2}}/>
        </div>
        <div style={{background:`linear-gradient(135deg,${scheme.color}15,${scheme.color}05)`,margin:16,borderRadius:20,padding:20,border:`1.5px solid ${scheme.color}22`,position:"relative"}}>
          <div onClick={onClose} style={{position:"absolute",top:12,right:12,width:30,height:30,borderRadius:"50%",background:"rgba(0,0,0,0.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:"#666"}}>✕</div>
          <div style={{fontSize:40,marginBottom:10}}>{scheme.icon}</div>
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontWeight:700,background:scheme.scope==="national"?"#EFF6FF":"#FEF9C3",color:scheme.scope==="national"?"#1D4ED8":"#854D0E",borderRadius:8,padding:"3px 8px"}}>
              {scheme.scope==="national"?t.centralLabel:t.stateLabel(scheme.state)}
            </span>
            <span style={{fontSize:10,fontWeight:700,background:scheme.color+"18",color:scheme.color,borderRadius:8,padding:"3px 8px"}}>{scheme.tag[lang]}</span>
          </div>
          <div style={{fontSize:17,fontWeight:800,color:"#1a1a1a",marginBottom:8,paddingRight:36,fontFamily:bf}}>{scheme.name[lang]}</div>
          <div style={{display:"inline-flex",background:scheme.color,borderRadius:20,padding:"5px 14px",marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{scheme.benefit[lang]}</span>
          </div>
          {scheme.annual>0&&<div style={{fontSize:12,color:"#555"}}>📅 Annual: <strong style={{color:scheme.color}}>₹{scheme.annual.toLocaleString("en-IN")}</strong></div>}
          <div style={{fontSize:11,color:"#999",marginTop:4}}>{scheme.ministry[lang]}</div>
        </div>
        <div style={{padding:"0 16px 36px"}}>
          <div style={{background:"#f8f9fa",borderRadius:16,padding:16,marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#888",letterSpacing:0.6,marginBottom:10,textTransform:"uppercase"}}>📄 {t.docsLabel}</div>
            {scheme.docs[lang].map((doc,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<scheme.docs[lang].length-1?"1px solid #eee":"none"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:scheme.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{color:scheme.color,fontSize:11,fontWeight:800}}>✓</span>
                </div>
                <span style={{fontSize:13,color:"#333",fontFamily:bf}}>{doc}</span>
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
function SearchTab({lang,initialQuery=""}){
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=isHindi?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif";
  const [query,setQuery]=useState(initialQuery);
  const [expandedId,setExpandedId]=useState(null);

  const results=query.trim().length>0
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
    : SCHEME_DB; // show all when empty

  const national=results.filter(s=>s.scope==="national");
  const state=results.filter(s=>s.scope==="state");

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      {/* Search bar */}
      <div style={{background:"#fff",padding:"16px 16px 12px",borderBottom:"1px solid #f0f0f0",position:"sticky",top:0,zIndex:10}}>
        <div style={{background:"#f5f5f0",borderRadius:14,display:"flex",alignItems:"center",gap:10,padding:"12px 16px",border:"2px solid #FF993340"}}>
          <span style={{fontSize:18}}>🔍</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.searchPlaceholder} autoFocus
            style={{border:"none",outline:"none",fontSize:14,flex:1,background:"transparent",color:"#1a1a1a",fontFamily:bf}}/>
          {query&&<span onClick={()=>setQuery("")} style={{cursor:"pointer",color:"#aaa",fontSize:18}}>✕</span>}
        </div>
        <div style={{fontSize:12,color:"#888",marginTop:8,paddingLeft:2}}>
          {results.length} {isHindi?"योजनाएं":"schemes"} · {national.length} {isHindi?"केंद्रीय":"Central"} · {state.length} {isHindi?"राज्य":"State"}
        </div>
      </div>

      {/* Results */}
      <div style={{padding:"12px 16px 80px"}}>
        {national.length>0&&(
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #BFDBFE"}}>
                🇮🇳 {t.centralSchemes} ({national.length})
              </span>
              <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
            </div>
            {national.map(s=>(
              <SchemeCard key={s.id} scheme={s} lang={lang}
                expanded={expandedId===s.id}
                onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
            ))}
          </>
        )}
        {state.length>0&&(
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 10px"}}>
              <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#854D0E",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #FEF08A"}}>
                📍 {t.stateSchemes} ({state.length})
              </span>
              <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
            </div>
            {state.map(s=>(
              <SchemeCard key={s.id} scheme={s} lang={lang}
                expanded={expandedId===s.id}
                onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
            ))}
          </>
        )}
        {results.length===0&&(
          <div style={{textAlign:"center",padding:"50px 20px",color:"#aaa"}}>
            <div style={{fontSize:44,marginBottom:12}}>🔍</div>
            <div style={{fontSize:15,fontWeight:700,color:"#333",fontFamily:bf}}>{t.noMatchTitle}</div>
            <div style={{fontSize:13,marginTop:6}}>{t.noMatchSub}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ALL SCHEMES TAB ───────────────────────────────────────────────────────────
// Shows all 22 schemes grouped by category
function SchemesTab({lang}){
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=isHindi?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif";
  const [expandedId,setExpandedId]=useState(null);
  const [filter,setFilter]=useState("all");
  const cats=CATEGORIES[lang];

  const filtered=filter==="all"
    ? SCHEME_DB
    : getSchemesForCategory(filter);

  const national=filtered.filter(s=>s.scope==="national");
  const state=filtered.filter(s=>s.scope==="state");

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      {/* Header */}
      <div style={{background:"#fff",padding:"16px 16px 0",position:"sticky",top:0,zIndex:10,borderBottom:"1px solid #f0f0f0"}}>
        <div style={{fontSize:17,fontWeight:800,color:"#1a1a1a",fontFamily:bf,marginBottom:10}}>{t.allSchemes||"All Schemes"}</div>
        {/* Filter pills */}
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:12}}>
          <div onClick={()=>{setFilter("all");setExpandedId(null);}} style={{flexShrink:0,padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700,background:filter==="all"?"#003580":"#f5f5f0",color:filter==="all"?"#fff":"#555",cursor:"pointer",border:`1.5px solid ${filter==="all"?"#003580":"#e0e0e0"}`}}>
            {isHindi?"सभी":"All"} ({SCHEME_DB.length})
          </div>
          {cats.map(cat=>(
            <div key={cat.filterKey} onClick={()=>{setFilter(cat.filterKey);setExpandedId(null);}}
              style={{flexShrink:0,padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700,background:filter===cat.filterKey?cat.color:"#f5f5f0",color:filter===cat.filterKey?"#fff":"#555",cursor:"pointer",border:`1.5px solid ${filter===cat.filterKey?cat.color:"#e0e0e0"}`}}>
              {cat.icon} {cat.label}
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{padding:"12px 16px 80px"}}>
        {national.length>0&&(
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #BFDBFE"}}>
                🇮🇳 {t.centralSchemes} ({national.length})
              </span>
              <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
            </div>
            {national.map(s=>(
              <SchemeCard key={s.id} scheme={s} lang={lang}
                expanded={expandedId===s.id}
                onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
            ))}
          </>
        )}
        {state.length>0&&(
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 10px"}}>
              <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#854D0E",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #FEF08A"}}>
                📍 {t.stateSchemes} ({state.length})
              </span>
              <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
            </div>
            {state.map(s=>(
              <SchemeCard key={s.id} scheme={s} lang={lang}
                expanded={expandedId===s.id}
                onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>
            ))}
          </>
        )}
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:"#aaa"}}>
            <div style={{fontSize:44,marginBottom:12}}>🔍</div>
            <div style={{fontSize:14,fontWeight:600,fontFamily:bf}}>{t.noMatchTitle}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ELIGIBILITY CHECKER ───────────────────────────────────────────────────────
function EligibilityChecker({lang,onClose,prefilledAnswers}){
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=isHindi?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif";
  const TOTAL=t.questions.length;

  const [step,setStep]=useState(prefilledAnswers?TOTAL:0);
  const [answers,setAnswers]=useState(prefilledAnswers||{});
  const [selected,setSelected]=useState(null);
  const [stateSearch,setStateSearch]=useState(prefilledAnswers?.state||"");
  const [visible,setVisible]=useState(false);
  const [animKey,setAnimKey]=useState(0);
  const [expandedId,setExpandedId]=useState(null);

  // Filter SCHEME_DB using match() functions — single source of truth
  const initResults=(ans)=>SCHEME_DB.filter(s=>s.match(ans));
  const [results,setResults]=useState(prefilledAnswers?initResults(prefilledAnswers):[]);

  useEffect(()=>{setTimeout(()=>setVisible(true),30);},[]);

  const q=step<TOTAL?t.questions[step]:null;
  const isStateQ=q?.type==="state";
  const activeVal=isStateQ?(stateSearch&&INDIA_STATES.includes(stateSearch)?stateSearch:null):(selected||(q?answers[q.id]:null));
  const canProceed=!!activeVal;
  const progress=step>=TOTAL?100:Math.round(((step+1)/TOTAL)*100);
  const filteredStates=INDIA_STATES.filter(s=>s.toLowerCase().includes(stateSearch.toLowerCase()));
  const totalAnnual=results.reduce((s,r)=>s+(r.annual||0),0);
  const nationalResults=results.filter(r=>r.scope==="national");
  const stateResults=results.filter(r=>r.scope==="state");

  const goNext=()=>{
    if(!canProceed)return;
    const newAnswers={...answers,[q.id]:activeVal};
    setAnswers(newAnswers);setSelected(null);setAnimKey(k=>k+1);
    if(step===TOTAL-1){setResults(initResults(newAnswers));setStep(TOTAL);}
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
  const retake=()=>{setStep(0);setAnswers({});setSelected(null);setStateSearch("");setResults([]);setExpandedId(null);setAnimKey(k=>k+1);};

  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:"#f5f5f0",borderRadius:"24px 24px 0 0",maxHeight:"93vh",overflowY:"auto",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)",fontFamily:bf}}>

        {/* Sheet top */}
        <div style={{background:"#fff",borderRadius:"24px 24px 0 0",padding:"12px 20px 16px",position:"sticky",top:0,zIndex:10,borderBottom:"1px solid #f0f0f0"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <div style={{width:40,height:4,background:"#e0e0e0",borderRadius:2}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:17,fontWeight:800,color:"#1a1a1a"}}>{t.checkerTitle}</div>
              <div style={{fontSize:12,color:"#999",marginTop:1}}>{step<TOTAL?t.stepOf(step+1,TOTAL):t.checkerSub}</div>
            </div>
            <div onClick={onClose} style={{width:32,height:32,borderRadius:"50%",background:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:"#666"}}>✕</div>
          </div>
          {step<TOTAL&&(
            <div style={{marginTop:12}}>
              <div style={{height:5,background:"#f0f0f0",borderRadius:10,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:10,background:"linear-gradient(90deg,#FF9933,#138808)",width:`${progress}%`,transition:"width 0.4s"}}/>
              </div>
              <div style={{display:"flex",gap:4,marginTop:8}}>
                {t.questions.map((_,i)=>(
                  <div key={i} style={{height:5,flex:1,borderRadius:10,background:i<step?"#138808":i===step?"#FF9933":"#e8e8e8",transition:"background 0.3s"}}/>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Question step */}
        {step<TOTAL&&q&&(
          <div key={animKey} style={{padding:"20px 20px 32px",animation:"fadeSlide 0.3s ease"}}>
            <style>{`@keyframes fadeSlide{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}`}</style>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:42,marginBottom:10}}>{q.icon}</div>
              <div style={{fontSize:17,fontWeight:800,color:"#1a1a1a",lineHeight:1.3,fontFamily:bf}}>{q.q}</div>
              <div style={{fontSize:12,color:"#aaa",marginTop:5}}>{q.hint}</div>
            </div>

            {isStateQ?(
              <div>
                <input value={stateSearch} onChange={e=>setStateSearch(e.target.value)} placeholder={t.searchStatePh}
                  style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"2px solid #FF9933",fontSize:14,outline:"none",fontFamily:bf,marginBottom:8,boxSizing:"border-box",background:"#fff"}}/>
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #f0f0f0",maxHeight:220,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
                  {(stateSearch?filteredStates:INDIA_STATES).map(state=>{
                    const sel=stateSearch===state;
                    return(
                      <div key={state} onClick={()=>setStateSearch(state)}
                        style={{padding:"12px 16px",borderBottom:"1px solid #f5f5f5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",background:sel?"#FFF7ED":"#fff",transition:"background 0.15s"}}>
                        <span style={{fontSize:14,fontWeight:sel?700:400,color:sel?"#CC6600":"#333",fontFamily:bf}}>{state}</span>
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
                      style={{padding:"13px 16px",borderRadius:13,border:`2px solid ${active?"#FF9933":"#f0f0f0"}`,background:active?"#FFF7ED":"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.18s",boxShadow:active?"0 4px 14px rgba(255,153,51,0.18)":"none"}}>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${active?"#FF9933":"#ddd"}`,background:active?"#FF9933":"#fff",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {active&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}
                      </div>
                      <span style={{fontSize:13,fontWeight:active?700:400,color:active?"#CC6600":"#333",fontFamily:bf}}>{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{display:"flex",gap:10,marginTop:24}}>
              <div onClick={goBack} style={{flex:1,padding:14,borderRadius:14,border:"1.5px solid #e0e0e0",background:"#fff",textAlign:"center",fontSize:14,fontWeight:600,color:"#666",cursor:"pointer",fontFamily:bf}}>{t.backBtn}</div>
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
                      <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
                      <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #BFDBFE"}}>🇮🇳 {t.centralSchemes} ({nationalResults.length})</span>
                      <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
                    </div>
                    {nationalResults.map(s=><SchemeCard key={s.id} scheme={s} lang={lang} expanded={expandedId===s.id} onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>)}
                  </>
                )}
                {stateResults.length>0&&(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 10px"}}>
                      <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
                      <span style={{fontSize:11,fontWeight:700,color:"#854D0E",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #FEF08A"}}>📍 {t.stateSchemes} ({stateResults.length})</span>
                      <div style={{height:1,flex:1,background:"#e8e8e8"}}/>
                    </div>
                    {stateResults.map(s=><SchemeCard key={s.id} scheme={s} lang={lang} expanded={expandedId===s.id} onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}/>)}
                  </>
                )}
              </>
            ):(
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:52,marginBottom:16}}>🔍</div>
                <div style={{fontSize:17,fontWeight:800,color:"#1a1a1a",marginBottom:8,fontFamily:bf}}>{t.noMatchTitle}</div>
                <div style={{fontSize:13,color:"#888",lineHeight:1.6,fontFamily:bf}}>{t.noMatchSub}</div>
              </div>
            )}
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <div onClick={retake} style={{flex:1,padding:14,borderRadius:14,border:"1.5px solid #FF9933",background:"#fff",textAlign:"center",fontSize:13,fontWeight:700,color:"#FF8C00",cursor:"pointer",fontFamily:bf}}>{t.retakeBtn}</div>
              <div onClick={onClose} style={{flex:1,padding:14,borderRadius:14,background:"linear-gradient(135deg,#003580,#1a56db)",textAlign:"center",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:bf}}>{t.doneBtn}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function YojanaSetu(){
  const [lang,setLang]=useState("en");
  const [activeTab,setActiveTab]=useState("home");
  const [searchFocused,setSearchFocused]=useState(false);
  const [searchText,setSearchText]=useState("");
  const [loaded,setLoaded]=useState(false);
  const [langAnim,setLangAnim]=useState(false);
  const [showChecker,setShowChecker]=useState(false);
  const [selectedScheme,setSelectedScheme]=useState(null);   // SchemeDetailSheet
  const [selectedCategory,setSelectedCategory]=useState(null); // CategorySheet
  const [profile,setProfile]=useState(null);

  useEffect(()=>{setTimeout(()=>setLoaded(true),100);},[]);

  // Animated stat counters — raw targets: 3000, 28, 50 (formatted below)
  const [c0,c1,c2]=useCountUp([3000,28,50],loaded,1400);
  const animatedStats=(t)=>t.stats.map((s,i)=>{
    if(i===0) return{...s,number:c0>=3000?"3,000+":(c0>=1000?(Math.floor(c0/1000)+","+String(c0%1000).padStart(3,"0")):String(c0))};
    if(i===1) return{...s,number:String(c1)};
    if(i===2) return{...s,number:c2+"L+"};
    return s;
  });

  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=isHindi?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif";
  const toggleLang=()=>{setLangAnim(true);setTimeout(()=>{setLang(l=>l==="en"?"hi":"en");setLangAnim(false);},120);};

  // Home page schemes — pulled from SCHEME_DB via helper (no duplicate data)
  const homeSchemes=getHomeSchemes(lang);
  // Categories — pulled from schemesData.js
  const categories=CATEGORIES[lang];

  const profileAnswers=profile?{who:profile.occupation,income:profile.income,house:profile.house,age:profile.age,area:profile.area,state:profile.state}:null;

  const navItems=[
    {icon:"🏠",label:t.navHome,tab:"home"},
    {icon:"🔍",label:t.navSearch,tab:"search"},
    {icon:"📋",label:t.navSchemes,tab:"schemes"},
    {icon:"🤖",label:t.navAI,tab:"ai"},
    {icon:"👤",label:t.navProfile,tab:"profile"},
  ];

  return(
    <div className="app-root" style={{fontFamily:bf,background:"#f5f5f0",maxWidth:420,margin:"0 auto",position:"relative",display:"flex",flexDirection:"column",overflowX:"hidden",boxShadow:"0 0 60px rgba(0,0,0,0.15)",opacity:langAnim?0.7:1,transition:"opacity 0.12s"}}>
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
              <div style={{display:"flex",gap:8}}>
                <LangToggle lang={lang} onToggle={toggleLang}/>
                <div style={{width:34,height:34,background:"rgba(255,255,255,0.18)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,border:"1px solid rgba(255,255,255,0.25)"}}>🔔</div>
              </div>
            </div>
            <div style={{padding:"0 20px 16px"}}>
              <div style={{color:"rgba(255,255,255,0.85)",fontSize:13,marginBottom:2}}>{t.greeting(profile?.name)}</div>
              <div style={{color:"#fff",fontSize:20,fontWeight:800,lineHeight:1.3,fontFamily:bf}}>{t.headline}</div>
              <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,marginTop:2}}>{t.subheadline}</div>
            </div>
            <div style={{padding:"0 20px"}}>
              <div className={`sb ${searchFocused?"fc":""}`}
                style={{background:"#fff",borderRadius:14,display:"flex",alignItems:"center",gap:10,padding:"12px 16px",border:"2px solid rgba(255,255,255,0.4)"}}>
                <span style={{fontSize:18}}>🔍</span>
                <input value={searchText} onChange={e=>setSearchText(e.target.value)}
                  onFocus={()=>setSearchFocused(true)}
                  onBlur={()=>setSearchFocused(false)}
                  onKeyDown={e=>{if(e.key==="Enter"&&searchText.trim())setActiveTab("search");}}
                  placeholder={t.searchPlaceholder}
                  style={{border:"none",outline:"none",fontSize:14,flex:1,background:"transparent",color:"#1a1a1a",fontFamily:bf}}/>
                <div onClick={()=>{if(searchText.trim())setActiveTab("search");}}
                  style={{background:"linear-gradient(135deg,#FF9933,#FF8C00)",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {t.searchBtn}
                </div>
              </div>
            </div>
          </div>

          {/* Stats — animated count-up on load */}
          <div className={`fu s1 ${loaded?"show":""}`}
            style={{background:"#fff",margin:"0 16px",borderRadius:"0 0 18px 18px",padding:"14px 8px",display:"flex",boxShadow:"0 4px 20px rgba(0,0,0,0.07)",marginBottom:4}}>
            {animatedStats(t).map((s,i)=>(
              <div key={i} style={{flex:1,textAlign:"center",borderRight:i<2?"1px solid #f0f0f0":"none",padding:"0 8px"}}>
                <div style={{fontSize:20,fontWeight:800,color:i===0?"#FF9933":i===1?"#003580":"#138808",fontVariantNumeric:"tabular-nums",transition:"color 0.3s"}}>{s.number}</div>
                <div style={{fontSize:10,color:"#888",marginTop:2,fontFamily:bf}}>{s.label}</div>
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
                <div style={{fontSize:15,fontWeight:800,color:"#1a1a1a",fontFamily:bf}}>{t.categoriesTitle}</div>
                <div onClick={()=>setActiveTab("schemes")} style={{color:"#003580",fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.seeAll}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {categories.map((cat,i)=>(
                  <div key={i} className={`fu ch c${i} ${loaded?"show":""}`}
                    onClick={()=>setSelectedCategory(cat)}
                    style={{background:cat.bg,borderRadius:14,padding:"13px 8px",textAlign:"center",border:`1.5px solid ${cat.color}20`}}>
                    <div style={{fontSize:24,marginBottom:5}}>{cat.icon}</div>
                    <div style={{fontSize:11,fontWeight:700,color:cat.color,fontFamily:bf}}>{cat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Schemes — data from SCHEME_DB via getHomeSchemes() */}
            <div className={`fu s3 ${loaded?"show":""}`} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:"#1a1a1a",fontFamily:bf}}>{t.schemesTitle}</div>
                  <div style={{fontSize:11,color:"#888"}}>{t.schemesSub}</div>
                </div>
                <div onClick={()=>setActiveTab("schemes")} style={{color:"#003580",fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.seeAll}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {homeSchemes.map((s,i)=>(
                  <div key={i} className="ch sc" onClick={()=>setSelectedScheme(s.id)}
                    style={{background:"#fff",borderRadius:16,padding:"13px 15px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 10px rgba(0,0,0,0.05)",border:"1.5px solid #f0f0f0"}}>
                    <div style={{width:44,height:44,background:s.color+"14",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,border:`1.5px solid ${s.color}20`}}>{s.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:5,marginBottom:4}}>
                        <span style={{fontSize:9,fontWeight:700,background:"#EFF6FF",color:"#1D4ED8",borderRadius:6,padding:"1px 6px",border:"1px solid #BFDBFE"}}>🇮🇳 {isHindi?"केंद्रीय":"Central"}</span>
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:"#1a1a1a",lineHeight:1.3,fontFamily:bf}}>{s.name}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                        <span className="tb" style={{background:s.color+"18",color:s.color}}>{s.tag}</span>
                        <span style={{fontSize:11,color:"#666",fontWeight:600}}>{s.benefit}</span>
                      </div>
                    </div>
                    <div style={{color:s.color,fontSize:18,fontWeight:700}}>›</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpline */}
            <div className={`fu s4 ${loaded?"show":""}`}
              style={{background:"#fff",borderRadius:16,padding:15,display:"flex",alignItems:"center",gap:12,border:"1.5px solid #FF993328",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
              <div style={{fontSize:26}}>📞</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1a1a1a",fontFamily:bf}}>{t.helplineTitle}</div>
                <div style={{fontSize:11,color:"#666"}}>{t.helplineSub}</div>
              </div>
              <div onClick={()=>{window.location.href="tel:1800111555";}}
                style={{background:"#FF9933",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:bf}}>{t.helplineBtn}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH TAB — fully working, searches all SCHEME_DB ── */}
      {activeTab==="search"&&(
        <SearchTab lang={lang} initialQuery={searchText}/>
      )}

      {/* ── SCHEMES TAB — all schemes with category filter pills ── */}
      {activeTab==="schemes"&&(
        <SchemesTab lang={lang}/>
      )}

      {/* ── AI TAB — coming soon with context ── */}
      {activeTab==="ai"&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:"32px 28px",background:"#f5f5f0"}}>
          <div style={{width:80,height:80,background:"linear-gradient(135deg,#003580,#1a56db)",borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,marginBottom:20,boxShadow:"0 8px 28px rgba(0,53,128,0.25)"}}>🤖</div>
          <div style={{fontSize:20,fontWeight:800,color:"#1a1a1a",fontFamily:bf,textAlign:"center",marginBottom:8}}>{isHindi?"AI सहायक आ रहा है":"AI Assistant Coming Soon"}</div>
          <div style={{fontSize:13,color:"#666",textAlign:"center",lineHeight:1.65,fontFamily:bf,marginBottom:24}}>
            {isHindi
              ?"हिंदी या अंग्रेज़ी में सवाल पूछें — कोई भी योजना समझें, पात्रता जानें, और आवेदन में मदद पाएं।"
              :"Ask anything in Hindi or English — understand any scheme, check eligibility, and get step-by-step help applying."}
          </div>
          <div style={{width:"100%",maxWidth:300,display:"flex",flexDirection:"column",gap:10}}>
            {(isHindi?["📋 किसी भी योजना को समझाएं","✅ मेरी पात्रता बताएं","📝 आवेदन में मदद करें","🔍 मेरे लिए योजना खोजें"]:["📋 Explain any scheme in simple terms","✅ Tell me if I qualify","📝 Walk me through applying","🔍 Find schemes just for me"]).map((f,i)=>(
              <div key={i} style={{background:"#fff",borderRadius:12,padding:"11px 14px",fontSize:13,color:"#444",fontFamily:bf,border:"1.5px solid #e8e8e8",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>{f}</div>
            ))}
          </div>
          <div style={{marginTop:20,background:"#EFF6FF",borderRadius:10,padding:"8px 16px",fontSize:11,color:"#1D4ED8",fontWeight:600,border:"1px solid #BFDBFE"}}>
            {isHindi?"🔔 जल्द उपलब्ध होगा":"🔔 Launching very soon"}
          </div>
        </div>
      )}

      {/* ── PROFILE TAB — coming soon with context ── */}
      {activeTab==="profile"&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:"32px 28px",background:"#f5f5f0"}}>
          <div style={{width:80,height:80,background:"linear-gradient(135deg,#138808,#16a34a)",borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,marginBottom:20,boxShadow:"0 8px 28px rgba(19,136,8,0.25)"}}>👤</div>
          <div style={{fontSize:20,fontWeight:800,color:"#1a1a1a",fontFamily:bf,textAlign:"center",marginBottom:8}}>{isHindi?"प्रोफाइल आ रहा है":"Profile Coming Soon"}</div>
          <div style={{fontSize:13,color:"#666",textAlign:"center",lineHeight:1.65,fontFamily:bf,marginBottom:24}}>
            {isHindi
              ?"एक बार भरें — हर जगह काम आएगा। योजनाएं अपने आप मिलेंगी, दस्तावेज़ सहेजें, और आवेदन ट्रैक करें।"
              :"Fill once, use everywhere. Auto-match schemes to your profile, save documents, and track your applications."}
          </div>
          <div style={{width:"100%",maxWidth:300,display:"flex",flexDirection:"column",gap:10}}>
            {(isHindi?["🎯 योजनाएं अपने आप मिलेंगी","📁 दस्तावेज़ सुरक्षित रखें","📊 आवेदन ट्रैक करें","🔔 नई योजनाओं की सूचना"]:["🎯 Auto-matched schemes for you","📁 Store documents securely","📊 Track your applications","🔔 Get notified of new schemes"]).map((f,i)=>(
              <div key={i} style={{background:"#fff",borderRadius:12,padding:"11px 14px",fontSize:13,color:"#444",fontFamily:bf,border:"1.5px solid #e8e8e8",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>{f}</div>
            ))}
          </div>
          <div style={{marginTop:20,background:"#F0FDF4",borderRadius:10,padding:"8px 16px",fontSize:11,color:"#166534",fontWeight:600,border:"1px solid #BBF7D0"}}>
            {isHindi?"🔔 जल्द उपलब्ध होगा":"🔔 Launching very soon"}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="bnav-wrap" style={{background:"#fff",borderTop:"1.5px solid #f0f0f0",padding:"8px 4px 0",display:"flex",boxShadow:"0 -4px 20px rgba(0,0,0,0.07)",zIndex:100,position:"relative"}}>
        {navItems.map(item=>{
          const active=activeTab===item.tab;
          return(
            <div key={item.tab} className="bn" onClick={()=>setActiveTab(item.tab)}
              style={{position:"relative",background:active?"#EFF6FF":"transparent",borderRadius:12,padding:"6px 8px 7px"}}>
              <div style={{fontSize:20,filter:active?"none":"grayscale(0.3)",transition:"filter 0.2s"}}>{item.icon}</div>
              <div style={{fontSize:9,fontWeight:active?800:500,color:active?"#003580":"#999",fontFamily:bf,transition:"color 0.2s"}}>{item.label}</div>
              {active&&<div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:20,height:3,borderRadius:"3px 3px 0 0",background:"#FF9933"}}/>}
            </div>
          );
        })}
      </div>

      {/* ── OVERLAYS ── */}
      {showChecker&&(
        <EligibilityChecker lang={lang} onClose={()=>setShowChecker(false)} prefilledAnswers={profileAnswers||undefined}/>
      )}
      {selectedScheme&&(
        <SchemeDetailSheet schemeId={selectedScheme} lang={lang} onClose={()=>setSelectedScheme(null)}/>
      )}
      {selectedCategory&&(
        <CategorySheet category={selectedCategory} lang={lang} onClose={()=>setSelectedCategory(null)}/>
      )}
    </div>
  );
}
