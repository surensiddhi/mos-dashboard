/* =====================================================================
   MOS Dashboard — Interpretation rules (board-friendly verdicts & actions)
   ---------------------------------------------------------------------
   This file turns the dashboard numbers into plain-language meaning for
   board members. The dashboard reads it; you never edit index.html for this.

   TWO PARTS, clearly separated:
     PART 1 · THRESHOLDS  — the numbers that decide good / caution / concern.
                            Edit these if your business norms differ.
     PART 2 · WORDINGS    — the sentences shown. Edit the text if you wish.

   To change behaviour: edit the numbers in PART 1.
   To change phrasing:  edit the strings in PART 2.
   Then re-upload only this file (interpret.js) to GitHub.

   Remove the <script src="interpret.js"> line in index.html to disable
   the whole feature — nothing else breaks.
   ===================================================================== */

/* =====================================================================
   PART 1 · THRESHOLDS  — edit these numbers if needed
   Levels are evaluated as: concern (worst) → caution → otherwise good.
   ===================================================================== */
window.MOS_RULES = {
  dso:          { caution: 75,  concern: 120 },   // days sales outstanding (collection)
  dio:          { caution: 120, concern: 240 },   // days inventory outstanding (stock held)
  dpo:          { low: 20 },                        // paying suppliers very fast (cash drain) if below
  currentRatio: { concern: 1.0, caution: 1.2 },    // liquidity: below concern = cannot cover short-term
  quickRatio:   { concern: 0.7, caution: 1.0 },    // liquidity excluding stock
  debtEquity:   { caution: 2.0, concern: 3.0 },    // leverage
  netMarginPct: { concern: 0,   caution: 5 },      // profitability (%)
  grossMarginPct:{ caution: 20 },                   // gross margin floor (%)
  invOver90Pct: { caution: 40, concern: 60 },      // % of inventory older than 90 days
  arOver90Pct:  { caution: 25, concern: 40 },      // % of receivables overdue 90+
  salesGapPct:  { behind: 15, severe: 30 }         // points behind year-elapsed pace
};

/* =====================================================================
   PART 2 · WORDINGS
   {x} placeholders are filled with live values by the dashboard.
   Keep them simple and professional. Edit freely.
   ===================================================================== */
window.MOS_TEXT = {
  /* ----- Executive summary lines (chosen by data each period) ----- */
  summary: {
    profitLoss_good:   "The period was profitable, with a net margin of {netMargin}%.",
    profitLoss_thin:   "The period was marginally profitable ({netMargin}% net margin); cost control would strengthen it.",
    profitLoss_loss:   "The period was loss-making (net margin {netMargin}%) despite a {grossMargin}% gross margin, pointing to operating cost rather than pricing.",
    collections_good:  "Collections are sound, with receivables turning in about {dso} days.",
    collections_slow:  "Collections are slow at about {dso} days, with {arOver90}% of receivables overdue beyond 90 days.",
    inventory_good:    "Inventory is moving at a reasonable pace ({dio} days on hand).",
    inventory_slow:    "Cash is tied in slow-moving stock — {invOver90}% of inventory is over 90 days old (about {dio} days on hand).",
    liquidity_good:    "Short-term liquidity is adequate (current ratio {currentRatio}).",
    liquidity_tight:   "Short-term liquidity is tight (current ratio {currentRatio}); obligations may be hard to cover from current assets.",
    sales_ontrack:     "Sales are on track at {achievement}% of the annual target, with {yearPct}% of the year elapsed.",
    sales_behind:      "Sales are behind pace — {achievement}% of the annual target reached with {yearPct}% of the year gone."
  },

  /* ----- Per-section verdict + action ----- */
  receivables: {
    good:    { verdict: "Healthy. Receivables are being collected in about {dso} days.", action: null },
    caution: { verdict: "Watch. Collection is lengthening (about {dso} days); {arOver90}% is overdue beyond 90 days.",
               action: "Tighten follow-up on the oldest balances and review credit terms for repeat late payers." },
    concern: { verdict: "Concern. Collection is slow (about {dso} days) and {arOver90}% of receivables are overdue beyond 90 days.",
               action: "Prioritise recovery of 90+ day balances, consider holding further credit to persistent late payers, and review provisioning for doubtful debts." }
  },
  inventory: {
    good:    { verdict: "Healthy. Stock is turning at about {dio} days on hand.", action: null },
    caution: { verdict: "Watch. Stock is held about {dio} days; {invOver90}% is over 90 days old.",
               action: "Review purchasing on slower categories and begin moving aged items before they stall further." },
    concern: { verdict: "Concern. Stock sits about {dio} days on average and {invOver90}% is over 90 days old, locking up cash.",
               action: "Review items aged over 180 days for clearance, discounting or write-down, and tighten purchasing on slow-moving categories." }
  },
  liquidity: {
    good:    { verdict: "Healthy. Current ratio of {currentRatio} indicates short-term obligations are covered.", action: null },
    caution: { verdict: "Watch. Current ratio of {currentRatio} leaves a thin margin over short-term obligations.",
               action: "Monitor upcoming payables against expected collections to avoid a cash squeeze." },
    concern: { verdict: "Concern. Current ratio of {currentRatio} is below 1 — current assets may not cover short-term liabilities.",
               action: "Prepare a short-term cash plan: accelerate collections, stage supplier payments, and review short-term financing." }
  },
  profitability: {
    good:    { verdict: "Healthy. Net margin of {netMargin}% on a {grossMargin}% gross margin.", action: null },
    caution: { verdict: "Watch. Net margin is thin at {netMargin}% despite a {grossMargin}% gross margin.",
               action: "Review operating expenses and finance costs against gross profit to protect the bottom line." },
    concern: { verdict: "Concern. The period was loss-making ({netMargin}% net margin) despite a {grossMargin}% gross margin.",
               action: "The gap is operating cost, not pricing — review overheads, finance costs and discretionary spend." }
  },
  sales: {
    good:    { verdict: "On track. {achievement}% of the annual target reached with {yearPct}% of the year elapsed.", action: null },
    caution: { verdict: "Behind pace. {achievement}% of the annual target reached with {yearPct}% of the year gone.",
               action: "Focus on the lowest-achieving product groups and confirm the remaining targets are realistic." },
    concern: { verdict: "Well behind. Only {achievement}% of the annual target reached with {yearPct}% of the year gone.",
               action: "A material shortfall is likely; concentrate effort on the largest gaps and reassess targets and sales capacity." }
  }
};

/* =====================================================================
   PART 3 · LOGIC  (you normally don't need to edit below this line)
   Produces window.MOS_interpret(metrics) → {summary:[...], sections:{...}}
   ===================================================================== */
window.MOS_interpret = function(m){
  var R = window.MOS_RULES, T = window.MOS_TEXT;
  function fill(s, vals){ return s==null?null : s.replace(/\{(\w+)\}/g, function(_,k){ return (vals[k]!==undefined&&vals[k]!==null)?vals[k]:'—'; }); }
  function pick(metricLevel, group, vals){ var g=T[group][metricLevel]; return { level:metricLevel, verdict:fill(g.verdict,vals), action:fill(g.action,vals) }; }

  // levels
  function lvlHigh(v, t){ if(v>=t.concern) return 'concern'; if(v>=t.caution) return 'caution'; return 'good'; }   // higher = worse
  function lvlLowGood(v, t){ if(v<t.concern) return 'concern'; if(v<t.caution) return 'caution'; return 'good'; }   // lower = worse

  var vals = {
    dso: Math.round(m.dso), dio: Math.round(m.dio), dpo: Math.round(m.dpo),
    currentRatio: (m.currentRatio||0).toFixed(2), quickRatio:(m.quickRatio||0).toFixed(2),
    debtEquity:(m.debtEquity||0).toFixed(2),
    netMargin: (m.netMarginPct||0).toFixed(1), grossMargin:(m.grossMarginPct||0).toFixed(1),
    invOver90: Math.round(m.invOver90Pct||0), arOver90: Math.round(m.arOver90Pct||0),
    achievement: Math.round(m.achievementPct||0), yearPct: Math.round(m.yearPct||0)
  };

  // section levels
  var dsoL = lvlHigh(m.dso, R.dso);
  var arL  = (m.arOver90Pct>=R.arOver90Pct.concern)?'concern':(m.arOver90Pct>=R.arOver90Pct.caution?'caution':'good');
  var recvL = (dsoL==='concern'||arL==='concern')?'concern':((dsoL==='caution'||arL==='caution')?'caution':'good');

  var dioL = lvlHigh(m.dio, R.dio);
  var invL2= (m.invOver90Pct>=R.invOver90Pct.concern)?'concern':(m.invOver90Pct>=R.invOver90Pct.caution?'caution':'good');
  var invL = (dioL==='concern'||invL2==='concern')?'concern':((dioL==='caution'||invL2==='caution')?'caution':'good');

  var liqL = lvlLowGood(m.currentRatio, R.currentRatio);
  var profL= (m.netMarginPct<R.netMarginPct.concern)?'concern':(m.netMarginPct<R.netMarginPct.caution?'caution':'good');

  var salesL='good';
  if(m.hasSales){
    var gap = m.yearPct - m.achievementPct;
    salesL = (gap>=R.salesGapPct.severe)?'concern':(gap>=R.salesGapPct.behind?'caution':'good');
  }

  var sections = {
    receivables: pick(recvL,'receivables',vals),
    inventory:   m.hasInv? pick(invL,'inventory',vals) : null,
    liquidity:   pick(liqL,'liquidity',vals),
    profitability: pick(profL,'profitability',vals),
    sales:       m.hasSales? pick(salesL,'sales',vals) : null
  };

  // executive summary: pick the most relevant line per theme
  var S=T.summary, summary=[];
  summary.push({lvl:profL, text: fill(profL==='good'?S.profitLoss_good:(profL==='caution'?S.profitLoss_thin:S.profitLoss_loss), vals)});
  summary.push({lvl:recvL, text: fill(recvL==='good'?S.collections_good:S.collections_slow, vals)});
  if(m.hasInv) summary.push({lvl:invL, text: fill(invL==='good'?S.inventory_good:S.inventory_slow, vals)});
  summary.push({lvl:liqL, text: fill(liqL==='good'?S.liquidity_good:S.liquidity_tight, vals)});
  if(m.hasSales) summary.push({lvl:salesL, text: fill(salesL==='good'?S.sales_ontrack:S.sales_behind, vals)});

  return { summary: summary, sections: sections };
};
