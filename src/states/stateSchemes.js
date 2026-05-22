// ═══════════════════════════════════════════════════════════════════════════════
// stateSchemes.js  —  Index: imports ALL state files & merges into one array
//
// ✅ TO ADD SCHEMES TO AN EXISTING STATE:
//    Just open that state's file (e.g. states/bihar.js) and add your scheme.
//    No changes needed here.
//
// ✅ TO ADD A BRAND NEW STATE:
//    1. Create states/your_state.js  (copy any existing file as template)
//    2. Add one import line below
//    3. Add one spread line inside STATE_SCHEMES
// ═══════════════════════════════════════════════════════════════════════════════

// ── Existing states (have schemes) ───────────────────────────────────────────
import { UTTAR_PRADESH_SCHEMES }    from "./uttar_pradesh.js";
import { MAHARASHTRA_SCHEMES }      from "./maharashtra.js";
import { BIHAR_SCHEMES }            from "./bihar.js";
import { GUJARAT_SCHEMES }          from "./gujarat.js";
import { RAJASTHAN_SCHEMES }        from "./rajasthan.js";
import { TAMIL_NADU_SCHEMES }       from "./tamil_nadu.js";
import { DELHI_SCHEMES }            from "./delhi.js";
import { KARNATAKA_SCHEMES }        from "./karnataka.js";
import { MADHYA_PRADESH_SCHEMES }   from "./madhya_pradesh.js";
import { HARYANA_SCHEMES }          from "./haryana.js";
import { KERALA_SCHEMES }           from "./kerala.js";
import { TELANGANA_SCHEMES }        from "./telangana.js";
import { WEST_BENGAL_SCHEMES }      from "./west_bengal.js";
import { ODISHA_SCHEMES }           from "./odisha.js";
import { PUNJAB_SCHEMES }           from "./punjab.js";
import { JHARKHAND_SCHEMES }        from "./jharkhand.js";
import { ASSAM_SCHEMES }            from "./assam.js";
import { HIMACHAL_PRADESH_SCHEMES } from "./himachal_pradesh.js";
import { CHHATTISGARH_SCHEMES }     from "./chhattisgarh.js";
import { UTTARAKHAND_SCHEMES }      from "./uttarakhand.js";

// ── New states (ready for schemes to be added) ────────────────────────────────
import { ANDHRA_PRADESH_SCHEMES }   from "./andhra_pradesh.js";
import { ARUNACHAL_PRADESH_SCHEMES } from "./arunachal_pradesh.js";
import { GOA_SCHEMES }              from "./goa.js";
import { MANIPUR_SCHEMES }          from "./manipur.js";
import { MEGHALAYA_SCHEMES }        from "./meghalaya.js";
import { MIZORAM_SCHEMES }          from "./mizoram.js";
import { NAGALAND_SCHEMES }         from "./nagaland.js";
import { SIKKIM_SCHEMES }           from "./sikkim.js";
import { TRIPURA_SCHEMES }          from "./tripura.js";
import { JAMMU_KASHMIR_SCHEMES }    from "./jammu_kashmir.js";
import { LADAKH_SCHEMES }           from "./ladakh.js";
import { PUDUCHERRY_SCHEMES }       from "./puducherry.js";
import { CHANDIGARH_SCHEMES }       from "./chandigarh.js";
import { ANDAMAN_NICOBAR_SCHEMES }  from "./andaman_nicobar.js";

export const STATE_SCHEMES = [
  // ── States with schemes ──
  ...UTTAR_PRADESH_SCHEMES,
  ...MAHARASHTRA_SCHEMES,
  ...BIHAR_SCHEMES,
  ...GUJARAT_SCHEMES,
  ...RAJASTHAN_SCHEMES,
  ...TAMIL_NADU_SCHEMES,
  ...DELHI_SCHEMES,
  ...KARNATAKA_SCHEMES,
  ...MADHYA_PRADESH_SCHEMES,
  ...HARYANA_SCHEMES,
  ...KERALA_SCHEMES,
  ...TELANGANA_SCHEMES,
  ...WEST_BENGAL_SCHEMES,
  ...ODISHA_SCHEMES,
  ...PUNJAB_SCHEMES,
  ...JHARKHAND_SCHEMES,
  ...ASSAM_SCHEMES,
  ...HIMACHAL_PRADESH_SCHEMES,
  ...CHHATTISGARH_SCHEMES,
  ...UTTARAKHAND_SCHEMES,

  // ── New states (empty — add schemes to their files) ──
  ...ANDHRA_PRADESH_SCHEMES,
  ...ARUNACHAL_PRADESH_SCHEMES,
  ...GOA_SCHEMES,
  ...MANIPUR_SCHEMES,
  ...MEGHALAYA_SCHEMES,
  ...MIZORAM_SCHEMES,
  ...NAGALAND_SCHEMES,
  ...SIKKIM_SCHEMES,
  ...TRIPURA_SCHEMES,
  ...JAMMU_KASHMIR_SCHEMES,
  ...LADAKH_SCHEMES,
  ...PUDUCHERRY_SCHEMES,
  ...CHANDIGARH_SCHEMES,
  ...ANDAMAN_NICOBAR_SCHEMES,
];
