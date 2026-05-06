/* ═══════════════════════════════════════════════════
   PROPIQ — AI REAL ESTATE ANALYZER
   app.js — Complete Frontend Logic
═══════════════════════════════════════════════════ */

'use strict';

// ─── STATE ───────────────────────────────────────────────────────────────────
const state = {
  lastAnalysis: null,
  compareProperties: [],
  chatHistory: [],
  aiQueryHistory: []
};

// ─── AREA DATA ───────────────────────────────────────────────────────────────
const AREA_DATA = {
  "Delhi":       { growth: 8,    demand: "high",   avgPrice: 95,  rental: 3.2, metro: true,  rera: "Developed", suggestion: "Stable market with good connectivity. Best for long-term hold." },
  "Noida":       { growth: 10,   demand: "high",   avgPrice: 65,  rental: 3.8, metro: true,  rera: "Active",    suggestion: "Excellent ROI potential. IT corridor drives rental demand strongly." },
  "Gurgaon":     { growth: 9,    demand: "high",   avgPrice: 120, rental: 3.1, metro: true,  rera: "Active",    suggestion: "Premium market. High entry cost but strong capital appreciation." },
  "Bengaluru":   { growth: 11,   demand: "high",   avgPrice: 85,  rental: 4.1, metro: true,  rera: "Strict",    suggestion: "Top-performing IT city. Best rental yields in India currently." },
  "Hyderabad":   { growth: 10.5, demand: "high",   avgPrice: 70,  rental: 3.9, metro: true,  rera: "Active",    suggestion: "Fastest growing tech hub. Excellent value vs Bengaluru." },
  "Pune":        { growth: 9.5,  demand: "high",   avgPrice: 72,  rental: 3.7, metro: true,  rera: "Active",    suggestion: "Strong IT + education demand. Good rental market in Hinjewadi area." },
  "Mumbai":      { growth: 6.5,  demand: "medium", avgPrice: 200, rental: 2.4, metro: true,  rera: "Strict",    suggestion: "High barrier to entry. Consider MMR periphery for better yields." },
  "Chennai":     { growth: 7.5,  demand: "medium", avgPrice: 60,  rental: 3.3, metro: true,  rera: "Active",    suggestion: "Stable market. Manufacturing + IT mix creates steady demand." },
  "Kolkata":     { growth: 6,    demand: "medium", avgPrice: 45,  rental: 3.0, metro: true,  rera: "Growing",   suggestion: "Affordable entry point. East Kolkata emerging as growth corridor." },
  "Ahmedabad":   { growth: 8.5,  demand: "medium", avgPrice: 48,  rental: 3.5, metro: true,  rera: "Active",    suggestion: "GIFT City driving demand. Good value proposition for investors." },
  "Jaipur":      { growth: 7,    demand: "medium", avgPrice: 42,  rental: 3.2, metro: false, rera: "Growing",   suggestion: "Tourism + IT growth. Smart city projects boosting appreciation." },
  "Lucknow":     { growth: 7,    demand: "medium", avgPrice: 40,  rental: 3.0, metro: false, rera: "Growing",   suggestion: "State capital with admin + commercial demand. Steady growth." },
  "Chandigarh":  { growth: 6.5,  demand: "medium", avgPrice: 65,  rental: 2.8, metro: false, rera: "Active",    suggestion: "Planned city with premium lifestyle. Limited new supply favors holders." },
  "Surat":       { growth: 8,    demand: "medium", avgPrice: 45,  rental: 3.6, metro: false, rera: "Growing",   suggestion: "Diamond + textile economy. High rental demand from working population." },
  "Bhubaneswar": { growth: 8,    demand: "low",    avgPrice: 38,  rental: 3.4, metro: false, rera: "Growing",   suggestion: "Emerging IT hub. Lower entry cost with higher growth potential." },
  "Coimbatore":  { growth: 7.5,  demand: "low",    avgPrice: 40,  rental: 3.5, metro: false, rera: "Active",    suggestion: "Manufacturing + textile base. Good for first-time investors." },
  "Indore":      { growth: 8.5,  demand: "medium", avgPrice: 42,  rental: 3.8, metro: false, rera: "Growing",   suggestion: "Cleanest city + smart city status. Rapid commercial development." },
  "Kochi":       { growth: 7,    demand: "medium", avgPrice: 58,  rental: 3.0, metro: true,  rera: "Active",    suggestion: "IT + tourism driven. Waterfront properties command premium." }
};

const TIPS = [
  '"Rental yield above 5% is considered strong in Indian metro markets."',
  '"Always check RERA registration before investing in any under-construction project."',
  '"Price-to-rent ratio below 20x indicates a buyers market — good for investors."',
  '"Keep 6 months of EMI as emergency reserve before buying investment property."',
  '"Appreciate the difference: residential yields 2-4%, commercial 6-9%."',
  '"Location within a city matters more than the city itself — check micro-markets."'
];

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  initNavigation();
  initCompareSection();
  renderAreaGrid(AREA_DATA);
  initTipRotator();
  initSlider();
  initPropTypeSelector();
  renderSavedReports();
  updateDashboard();
});

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: ['Dashboard', 'Your real estate investment intelligence hub'],
  analyzer:  ['Property Analyzer', 'Calculate ROI, yield, and investment score'],
  emi:       ['EMI Calculator', 'Plan your loan and monthly cash flow'],
  compare:   ['Compare Properties', 'Side-by-side investment comparison'],
  areas:     ['Area Insights', 'Market data for top Indian cities'],
  report:    ['AI Report Generator', 'Get AI-powered investment analysis'],
  'ai-direct': ['Ask AI', 'Direct AI consultation for any real estate query']
};

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const section = item.dataset.section;
      goToSection(section);
      // Close sidebar on mobile
      if (window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('open');
      }
    });
  });

  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

function goToSection(id) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  const navItem = document.querySelector(`.nav-item[data-section="${id}"]`);
  const section = document.getElementById(`section-${id}`);

  if (navItem) navItem.classList.add('active');
  if (section) section.classList.add('active');

  const [title, subtitle] = PAGE_TITLES[id] || ['PropIQ', ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = subtitle;
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function saveToStorage() {
  localStorage.setItem('propiq_state', JSON.stringify(state));
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('propiq_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lastAnalysis) state.lastAnalysis = parsed.lastAnalysis;
      if (parsed.compareProperties) state.compareProperties = parsed.compareProperties;
      if (parsed.aiQueryHistory) state.aiQueryHistory = parsed.aiQueryHistory;
    }
  } catch (e) { console.warn('Storage load failed', e); }
}

function updateDashboard() {
  const la = state.lastAnalysis;
  if (!la) return;

  document.getElementById('dash-roi').textContent = la.roi ? la.roi + '%' : '—';
  document.getElementById('dash-score').textContent = la.score || '—';
  document.getElementById('dash-risk').textContent = la.riskLevel || '—';
  document.getElementById('dash-emi').textContent = la.emi ? '₹' + formatNum(la.emi) : '—';

  // Activity
  const activity = JSON.parse(localStorage.getItem('propiq_activity') || '[]');
  const actEl = document.getElementById('recentActivity');
  if (activity.length === 0) {
    actEl.innerHTML = '<p class="empty-state">No analyses yet. Start by analyzing a property!</p>';
  } else {
    actEl.innerHTML = activity.slice(-5).reverse().map(a => `
      <div class="activity-item">
        <div class="activity-item-left">
          <span>🏠</span>
          <span>${a.desc}</span>
        </div>
        <span class="activity-time">${a.time}</span>
      </div>
    `).join('');
  }

  // AI history
  const histEl = document.getElementById('aiHistory');
  if (state.aiQueryHistory.length > 0) {
    histEl.innerHTML = state.aiQueryHistory.slice(-6).reverse().map(q => `
      <div class="history-item" onclick="fillAIInput('${q.q.replace(/'/g, "\\'")}')">
        <div class="history-q">${q.q.length > 80 ? q.q.slice(0, 80) + '...' : q.q}</div>
        <div class="history-time">${q.time}</div>
      </div>
    `).join('');
  }
}

function logActivity(desc) {
  const activity = JSON.parse(localStorage.getItem('propiq_activity') || '[]');
  activity.push({ desc, time: new Date().toLocaleTimeString() });
  if (activity.length > 20) activity.shift();
  localStorage.setItem('propiq_activity', JSON.stringify(activity));
}

// ─── PROPERTY ANALYZER ───────────────────────────────────────────────────────
function analyzeProperty() {
  const price = parseFloat(document.getElementById('propPrice').value);
  const rent = parseFloat(document.getElementById('propRent').value);
  const growth = parseFloat(document.getElementById('propGrowth').value);
  const location = document.getElementById('propLocation').value;

  if (!price || !rent || !growth) {
    showToast('⚠️ Please fill in all required fields');
    return;
  }
  if (price <= 0 || rent <= 0 || growth < 0) {
    showToast('⚠️ Please enter valid positive values');
    return;
  }

  const annualRent = rent * 12;
  const roi = ((annualRent / price) * 100).toFixed(2);
  const rentalYield = roi;
  const breakeven = (price / annualRent).toFixed(1);
  const score = calculateDealScore(parseFloat(roi), growth);
  const riskLevel = getRiskLevel(parseFloat(roi), price, rent, growth);
  const risks = getRiskWarnings(parseFloat(roi), price, rent, growth);

  // Store
  state.lastAnalysis = { price, rent, growth, location, roi, rentalYield, breakeven, score, riskLevel, annualRent };
  saveToStorage();
  logActivity(`₹${formatNum(price)} property — ROI ${roi}%`);

  // Render
  document.getElementById('resultsPlaceholder').classList.add('hidden');
  document.getElementById('resultsContent').classList.remove('hidden');

  document.getElementById('res-roi').textContent = roi + '%';
  document.getElementById('res-yield').textContent = rentalYield + '%';
  document.getElementById('res-breakeven').textContent = breakeven + ' yrs';
  document.getElementById('res-annual').textContent = '₹' + formatNum(annualRent);

  animateScore(score);
  renderRisks(risks);
  updateDashboard();
  showToast('✅ Analysis complete!');
}

function calculateDealScore(roi, growth) {
  let score = 0;
  // ROI scoring (max 40)
  if (roi >= 6) score += 40;
  else if (roi >= 4) score += 25;
  else if (roi >= 2.5) score += 15;
  else score += 5;
  // Growth scoring (max 35)
  if (growth >= 10) score += 35;
  else if (growth >= 7) score += 25;
  else if (growth >= 5) score += 15;
  else score += 5;
  // Combined bonus (max 25)
  const combined = roi + growth;
  if (combined >= 16) score += 25;
  else if (combined >= 12) score += 18;
  else if (combined >= 9) score += 10;
  else score += 3;
  return Math.min(100, Math.round(score));
}

function getRiskLevel(roi, price, rent, growth) {
  const warnings = getRiskWarnings(roi, price, rent, growth);
  const dangerCount = warnings.filter(w => w.type === 'danger').length;
  if (dangerCount >= 2) return 'High';
  if (dangerCount === 1 || warnings.length >= 2) return 'Medium';
  return 'Low';
}

function getRiskWarnings(roi, price, rent, growth) {
  const warnings = [];
  const priceToRent = price / (rent * 12);

  if (roi < 2.5) warnings.push({ type: 'danger', msg: '⚠️ Very low rental return — high risk investment. Consider renegotiating price.' });
  else if (roi < 3.5) warnings.push({ type: 'warn', msg: '⚠️ Below-average rental yield. Acceptable only if location appreciation is high.' });
  else warnings.push({ type: 'ok', msg: '✅ Rental yield is at or above market average. Good sign.' });

  if (priceToRent > 30) warnings.push({ type: 'danger', msg: `⚠️ Price-to-Rent ratio is ${priceToRent.toFixed(1)}x — significantly overpriced relative to rent.` });
  else if (priceToRent > 22) warnings.push({ type: 'warn', msg: `⚠️ Price-to-Rent ratio is ${priceToRent.toFixed(1)}x — slightly above ideal range (15-20x).` });
  else warnings.push({ type: 'ok', msg: `✅ Price-to-Rent ratio of ${priceToRent.toFixed(1)}x is within healthy range.` });

  if (growth < 5) warnings.push({ type: 'warn', msg: '⚠️ Low growth expectation. Capital appreciation may be slow.' });
  else if (growth >= 10) warnings.push({ type: 'ok', msg: '✅ Strong expected growth rate. Good for long-term wealth creation.' });

  if (rent * 12 < price * 0.05 && growth < 8) {
    warnings.push({ type: 'danger', msg: '⚠️ Combined ROI + Growth is below 8%. Better returns possible in index funds.' });
  }

  return warnings;
}

function animateScore(score) {
  const circle = document.getElementById('scoreArc');
  const numEl = document.getElementById('scoreNumber');
  const badgeEl = document.getElementById('scoreBadge');
  const circumference = 314;

  let label, badgeClass, strokeColor;
  if (score >= 65) { label = '🟢 Good Deal'; badgeClass = 'good'; strokeColor = '#22c55e'; }
  else if (score >= 45) { label = '🟡 Moderate'; badgeClass = 'moderate'; strokeColor = '#eab308'; }
  else { label = '🔴 Risky'; badgeClass = 'risky'; strokeColor = '#ef4444'; }

  circle.style.stroke = strokeColor;
  badgeEl.textContent = label;
  badgeEl.className = `score-badge ${badgeClass}`;

  let current = 0;
  const target = score;
  const step = target / 40;
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    const offset = circumference - (current / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    numEl.textContent = Math.round(current);
    if (current >= target) clearInterval(interval);
  }, 20);
}

function renderRisks(warnings) {
  const box = document.getElementById('riskBox');
  box.innerHTML = warnings.map(w => `
    <div class="risk-warning ${w.type}">${w.msg}</div>
  `).join('');
}

function addToCompare() {
  if (!state.lastAnalysis) { showToast('Analyze a property first'); return; }
  if (state.compareProperties.length >= 3) { showToast('Maximum 3 properties for comparison'); return; }

  const prop = {
    id: Date.now(),
    name: `Property ${state.compareProperties.length + 1}`,
    ...state.lastAnalysis
  };
  state.compareProperties.push(prop);
  saveToStorage();
  renderCompareInputs();
  showToast(`✅ Added to comparison (${state.compareProperties.length}/3)`);
}

function askAboutDeal() {
  if (!state.lastAnalysis) return;
  const la = state.lastAnalysis;
  const msg = `I'm analyzing a property worth ₹${formatNum(la.price)} in ${la.location || 'an Indian city'} with monthly rent of ₹${formatNum(la.rent)} and expected ${la.growth}% annual growth. ROI is ${la.roi}%, Deal Score is ${la.score}/100 and Risk Level is ${la.riskLevel}. Should I invest?`;
  goToSection('ai-direct');
  document.getElementById('aiDirectInput').value = msg;
  document.getElementById('includeLastAnalysis').checked = true;
}

// ─── EMI CALCULATOR ───────────────────────────────────────────────────────────
function initSlider() {
  const slider = document.getElementById('loanYearsSlider');
  const yearsInput = document.getElementById('loanYears');
  const sliderVal = document.getElementById('sliderVal');

  slider.addEventListener('input', () => {
    yearsInput.value = slider.value;
    sliderVal.textContent = slider.value + ' yrs';
  });

  yearsInput.addEventListener('input', () => {
    const v = Math.min(30, Math.max(5, parseInt(yearsInput.value) || 20));
    slider.value = v;
    sliderVal.textContent = v + ' yrs';
  });
}

function calculateEMI() {
  const P = parseFloat(document.getElementById('loanAmount').value);
  const annualRate = parseFloat(document.getElementById('loanRate').value);
  const years = parseFloat(document.getElementById('loanYears').value);
  const rent = parseFloat(document.getElementById('emiRent').value) || 0;

  if (!P || !annualRate || !years) { showToast('⚠️ Please fill loan amount, rate and duration'); return; }

  const r = (annualRate / 100) / 12;
  const n = years * 12;
  const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  const totalInterest = total - P;
  const cashflow = rent - emi;

  state.lastAnalysis = { ...state.lastAnalysis, emi: Math.round(emi) };
  saveToStorage();

  document.getElementById('emiPlaceholder').classList.add('hidden');
  document.getElementById('emiResults').classList.remove('hidden');

  document.getElementById('emiAmount').textContent = '₹' + formatNum(Math.round(emi));
  document.getElementById('emiTotal').textContent = '₹' + formatNum(Math.round(total));
  document.getElementById('emiInterest').textContent = '₹' + formatNum(Math.round(totalInterest));
  document.getElementById('emiCashflow').textContent = (cashflow >= 0 ? '+' : '') + '₹' + formatNum(Math.round(cashflow));
  document.getElementById('emiCashflow').style.color = cashflow >= 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('emiPct').textContent = ((totalInterest / total) * 100).toFixed(1) + '%';

  // Donut
  const circumference = 283;
  const principalPct = P / total;
  const principalOffset = circumference - principalPct * circumference;
  const interestOffset = circumference - (1 - principalPct) * circumference;
  document.getElementById('donutPrincipal').style.strokeDashoffset = principalOffset;
  document.getElementById('donutInterest').style.strokeDashoffset = interestOffset;
  document.getElementById('donutInterest').style.strokeDasharray = `${(1 - principalPct) * circumference} ${circumference}`;

  logActivity(`EMI: ₹${formatNum(Math.round(emi))}/mo for ₹${formatNum(P)} loan`);
  updateDashboard();
  showToast('✅ EMI calculated!');
}

function toggleAmortization() {
  const table = document.getElementById('amortTable');
  table.classList.toggle('hidden');
  if (!table.classList.contains('hidden') && !table.innerHTML.trim()) {
    generateAmortTable();
  }
}

function generateAmortTable() {
  const P = parseFloat(document.getElementById('loanAmount').value);
  const annualRate = parseFloat(document.getElementById('loanRate').value);
  const years = parseFloat(document.getElementById('loanYears').value);
  const r = (annualRate / 100) / 12;
  const n = years * 12;
  const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  let balance = P;
  let rows = '<table class="amort-table"><thead><tr><th>Year</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>';

  for (let y = 1; y <= Math.min(years, 10); y++) {
    let yearPrincipal = 0, yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      const interest = balance * r;
      const principal = emi - interest;
      yearInterest += interest;
      yearPrincipal += principal;
      balance -= principal;
    }
    rows += `<tr><td>Yr ${y}</td><td>₹${formatNum(Math.round(yearPrincipal))}</td><td>₹${formatNum(Math.round(yearInterest))}</td><td>₹${formatNum(Math.round(Math.max(0, balance)))}</td></tr>`;
  }
  if (years > 10) rows += `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);font-style:italic">Showing first 10 years of ${years}</td></tr>`;
  rows += '</tbody></table>';
  document.getElementById('amortTable').innerHTML = rows;
}

// ─── COMPARE TOOL ─────────────────────────────────────────────────────────────
function initCompareSection() {
  if (state.compareProperties.length > 0) renderCompareInputs();
  else addCompareProperty(); // Start with 2 empty
  addCompareProperty();
}

function addCompareProperty() {
  if (state.compareProperties.length >= 3) { showToast('Max 3 properties allowed'); return; }

  const prop = {
    id: Date.now(),
    name: `Property ${state.compareProperties.length + 1}`,
    price: '', rent: '', growth: '', location: ''
  };
  state.compareProperties.push(prop);
  renderCompareInputs();
}

function removeCompareProperty(id) {
  state.compareProperties = state.compareProperties.filter(p => p.id !== id);
  // Re-number
  state.compareProperties.forEach((p, i) => { if (!p.price) p.name = `Property ${i + 1}`; });
  renderCompareInputs();
  document.getElementById('compareResults').classList.add('hidden');
}

function renderCompareInputs() {
  const container = document.getElementById('compareInputs');
  const addBtn = document.getElementById('addPropBtn');

  container.innerHTML = state.compareProperties.map((prop, idx) => `
    <div class="compare-card-input" id="ci-${prop.id}">
      ${state.compareProperties.length > 1 ? `<button class="remove-prop" onclick="removeCompareProperty(${prop.id})">✕</button>` : ''}
      <h4>🏠 Property ${idx + 1}</h4>
      <div class="form-group">
        <label>Name / Label</label>
        <input type="text" class="inp" value="${prop.name || ''}" placeholder="e.g. Noida Sector 62"
          onchange="updateCompareProp(${prop.id}, 'name', this.value)" />
      </div>
      <div class="form-group">
        <label>Price (₹)</label>
        <input type="number" class="inp" value="${prop.price || ''}" placeholder="e.g. 5000000"
          onchange="updateCompareProp(${prop.id}, 'price', this.value)" />
      </div>
      <div class="form-group">
        <label>Monthly Rent (₹)</label>
        <input type="number" class="inp" value="${prop.rent || ''}" placeholder="e.g. 22000"
          onchange="updateCompareProp(${prop.id}, 'rent', this.value)" />
      </div>
      <div class="form-group">
        <label>Expected Growth (%)</label>
        <input type="number" class="inp" value="${prop.growth || ''}" placeholder="e.g. 9"
          onchange="updateCompareProp(${prop.id}, 'growth', this.value)" />
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" class="inp" value="${prop.location || ''}" placeholder="e.g. Bengaluru"
          onchange="updateCompareProp(${prop.id}, 'location', this.value)" />
      </div>
    </div>
  `).join('');

  addBtn.style.display = state.compareProperties.length >= 3 ? 'none' : 'inline-flex';
}

function updateCompareProp(id, field, value) {
  const prop = state.compareProperties.find(p => p.id === id);
  if (prop) prop[field] = value;
  saveToStorage();
}

function runComparison() {
  const props = state.compareProperties;
  if (props.length < 2) { showToast('Add at least 2 properties to compare'); return; }

  // Validate
  for (const p of props) {
    if (!p.price || !p.rent || !p.growth) {
      showToast(`⚠️ Please fill all fields for ${p.name}`);
      return;
    }
  }

  // Calculate
  const analyzed = props.map(p => {
    const price = parseFloat(p.price);
    const rent = parseFloat(p.rent);
    const growth = parseFloat(p.growth);
    const annualRent = rent * 12;
    const roi = ((annualRent / price) * 100).toFixed(2);
    const breakeven = (price / annualRent).toFixed(1);
    const score = calculateDealScore(parseFloat(roi), growth);
    const riskLevel = getRiskLevel(parseFloat(roi), price, rent, growth);
    return { ...p, price, rent, growth, roi, breakeven, score, riskLevel, annualRent };
  });

  const best = analyzed.reduce((a, b) => b.score > a.score ? b : a);

  const resultsEl = document.getElementById('compareResults');
  resultsEl.classList.remove('hidden');

  const headers = analyzed.map((p, i) => {
    const isBest = p.id === best.id;
    return `<th class="${isBest ? 'best-col' : ''}">${p.name || `Prop ${i + 1}`}${isBest ? '<span class="winner-badge">🏆 Best</span>' : ''}</th>`;
  }).join('');

  const rows = [
    ['Location', p => p.location || '—'],
    ['Property Price', p => '₹' + formatNum(p.price)],
    ['Monthly Rent', p => '₹' + formatNum(p.rent)],
    ['Annual Income', p => '₹' + formatNum(p.annualRent)],
    ['ROI / Yield', p => p.roi + '%'],
    ['Expected Growth', p => p.growth + '%'],
    ['Break-even', p => p.breakeven + ' yrs'],
    ['Deal Score', p => p.score + '/100'],
    ['Risk Level', p => p.riskLevel],
  ].map(([label, fn]) => {
    const cells = analyzed.map(p => `<td class="${p.id === best.id ? 'best-col' : ''}">${fn(p)}</td>`).join('');
    return `<tr><td><strong>${label}</strong></td>${cells}</tr>`;
  }).join('');

  resultsEl.innerHTML = `
    <h3 style="margin-bottom:14px;font-family:'Syne',sans-serif">📊 Comparison Results</h3>
    <div style="overflow-x:auto">
      <table class="compare-table">
        <thead><tr><th>Metric</th>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="risk-warning ok" style="margin-top:16px">
      🏆 <strong>${best.name || 'Best Property'}</strong> wins with a Deal Score of <strong>${best.score}/100</strong> and ${best.roi}% ROI.
    </div>
  `;
  showToast('✅ Comparison complete!');
}

function clearComparison() {
  state.compareProperties = [];
  saveToStorage();
  document.getElementById('compareResults').classList.add('hidden');
  addCompareProperty();
  addCompareProperty();
}

// ─── AREA INSIGHTS ────────────────────────────────────────────────────────────
function renderAreaGrid(data) {
  const grid = document.getElementById('areaGrid');
  grid.innerHTML = Object.entries(data).map(([city, info]) => {
    const growthPct = Math.min(100, (info.growth / 12) * 100);
    const scoreEst = calculateDealScore(info.rental, info.growth);
    return `
      <div class="area-card" data-demand="${info.demand}" data-city="${city.toLowerCase()}">
        <div class="area-card-header">
          <span class="area-name">${city}</span>
          <span class="demand-badge ${info.demand}">${info.demand === 'high' ? '🔥' : info.demand === 'medium' ? '📊' : '📉'} ${info.demand.charAt(0).toUpperCase() + info.demand.slice(1)}</span>
        </div>
        <div class="area-growth-bar">
          <div class="area-growth-fill" style="width:${growthPct}%"></div>
        </div>
        <div class="area-stats">
          <div class="area-stat-row"><span>Annual Growth</span><span style="color:var(--accent)">${info.growth}%</span></div>
          <div class="area-stat-row"><span>Avg Price/sqft</span><span>₹${(info.avgPrice * 100).toLocaleString()}</span></div>
          <div class="area-stat-row"><span>Avg Rental Yield</span><span>${info.rental}%</span></div>
          <div class="area-stat-row"><span>Metro City</span><span>${info.metro ? '✅ Yes' : '❌ No'}</span></div>
          <div class="area-stat-row"><span>RERA Status</span><span>${info.rera}</span></div>
          <div class="area-stat-row"><span>Deal Score (est.)</span><span style="color:${scoreEst >= 65 ? 'var(--green)' : scoreEst >= 45 ? 'var(--yellow)' : 'var(--red)'}">${scoreEst}/100</span></div>
        </div>
        <div class="area-suggestion">💡 ${info.suggestion}</div>
      </div>
    `;
  }).join('');
}

function filterAreas(query) {
  document.querySelectorAll('.area-card').forEach(card => {
    const city = card.dataset.city || '';
    card.style.display = city.includes(query.toLowerCase()) ? 'block' : 'none';
  });
}

function filterByDemand(demand, btn) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.area-card').forEach(card => {
    card.style.display = demand === 'all' || card.dataset.demand === demand ? 'block' : 'none';
  });
}

// ─── AI REPORT ────────────────────────────────────────────────────────────────
async function generateReport() {
  // Called from analyzer results
  if (!state.lastAnalysis) { showToast('Analyze a property first'); return; }
  goToSection('report');
  // Pre-fill
  const la = state.lastAnalysis;
  document.getElementById('rpPrice').value = la.price || '';
  document.getElementById('rpRent').value = la.rent || '';
  document.getElementById('rpGrowth').value = la.growth || '';
  if (la.location) {
    const sel = document.getElementById('rpLocation');
    [...sel.options].forEach(o => { if (o.value === la.location) o.selected = true; });
  }
  await generateStandaloneReport();
}

async function generateStandaloneReport() {
  const price = parseFloat(document.getElementById('rpPrice').value);
  const rent = parseFloat(document.getElementById('rpRent').value);
  const growth = parseFloat(document.getElementById('rpGrowth').value);
  const location = document.getElementById('rpLocation').value;

  if (!price || !rent || !growth) { showToast('⚠️ Fill all fields for report generation'); return; }

  const annualRent = rent * 12;
  const roi = ((annualRent / price) * 100).toFixed(2);
  const breakeven = (price / annualRent).toFixed(1);
  const score = calculateDealScore(parseFloat(roi), growth);
  const riskLevel = getRiskLevel(parseFloat(roi), price, rent, growth);

  const propertyData = { price, rent, growth, location, roi, rentalYield: roi, breakeven, score, riskLevel, annualRent };

  const btn = document.getElementById('reportBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Generating...';

  document.getElementById('reportPlaceholder').classList.add('hidden');
  document.getElementById('reportContent').classList.remove('hidden');
  document.getElementById('reportContent').innerHTML = '<div style="text-align:center;padding:40px"><div class="loading-spinner" style="margin:0 auto"></div><p style="color:var(--text-muted);margin-top:16px;font-size:13px">AI is analyzing your property...</p></div>';

  try {
    const response = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyData })
    });
    const data = await response.json();

    const formatted = markdownToHTML(data.report || 'Report generation failed.');
    document.getElementById('reportContent').innerHTML = formatted;

    // Save report
    const reports = JSON.parse(localStorage.getItem('propiq_reports') || '[]');
    reports.unshift({
      id: Date.now(),
      summary: `₹${formatNum(price)} | ROI ${roi}% | Score ${score}`,
      content: data.report,
      time: new Date().toLocaleDateString()
    });
    if (reports.length > 10) reports.pop();
    localStorage.setItem('propiq_reports', JSON.stringify(reports));
    renderSavedReports();

    showToast('✅ Report generated!');
  } catch (err) {
    document.getElementById('reportContent').innerHTML = '<p style="color:var(--red)">Error generating report. Check server connection.</p>';
    showToast('❌ Report generation failed');
  }

  btn.disabled = false;
  btn.textContent = '🤖 Generate AI Report';
}

function renderSavedReports() {
  const reports = JSON.parse(localStorage.getItem('propiq_reports') || '[]');
  const el = document.getElementById('savedReportsList');
  if (reports.length === 0) {
    el.innerHTML = '<p class="empty-state" style="font-size:12px">No saved reports yet</p>';
    return;
  }
  el.innerHTML = reports.slice(0, 5).map(r => `
    <div class="saved-report-item" onclick="loadSavedReport(${r.id})">
      <span>${r.summary}</span>
      <small>${r.time}</small>
    </div>
  `).join('');
}

function loadSavedReport(id) {
  const reports = JSON.parse(localStorage.getItem('propiq_reports') || '[]');
  const report = reports.find(r => r.id === id);
  if (!report) return;
  document.getElementById('reportPlaceholder').classList.add('hidden');
  document.getElementById('reportContent').classList.remove('hidden');
  document.getElementById('reportContent').innerHTML = markdownToHTML(report.content);
}

function copyReport() {
  const content = document.getElementById('reportContent').innerText;
  navigator.clipboard.writeText(content).then(() => showToast('📋 Report copied!'));
}

// ─── AI DIRECT ────────────────────────────────────────────────────────────────
function fillAIInput(text) {
  document.getElementById('aiDirectInput').value = text;
  document.getElementById('aiDirectInput').focus();
}

async function sendAIDirect() {
  const input = document.getElementById('aiDirectInput').value.trim();
  if (!input) { showToast('Please enter a question'); return; }

  const includeContext = document.getElementById('includeLastAnalysis').checked;
  const context = includeContext ? state.lastAnalysis : null;

  const btn = document.getElementById('aiDirectBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Thinking...';

  document.getElementById('aiDirectResponse').classList.remove('hidden');
  document.getElementById('aiDirectResponseText').innerHTML = '<div style="text-align:center;padding:20px"><div class="loading-spinner" style="margin:0 auto"></div></div>';
  document.getElementById('aiModelBadge').textContent = 'Loading...';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, context })
    });
    const data = await res.json();

    document.getElementById('aiDirectResponseText').innerHTML = markdownToHTML(data.response || 'No response received.');
    document.getElementById('aiModelBadge').textContent = data.model || 'AI';

    // Save to history
    state.aiQueryHistory.push({ q: input, time: new Date().toLocaleTimeString() });
    if (state.aiQueryHistory.length > 20) state.aiQueryHistory.shift();
    saveToStorage();
    updateDashboard();
    showToast('✅ AI responded!');
  } catch (err) {
    document.getElementById('aiDirectResponseText').innerHTML = '<p style="color:var(--red)">Connection error. Is the server running?</p>';
    showToast('❌ AI request failed');
  }

  btn.disabled = false;
  btn.textContent = 'Send to AI →';
}

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('chatWindow').classList.toggle('open', chatOpen);
  document.getElementById('chatNotif').style.display = 'none';
  if (chatOpen) document.getElementById('chatInput').focus();
}

async function sendChat() {
  const inp = document.getElementById('chatInput');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';

  appendChatMsg('user', msg);
  showTyping();

  try {
    const context = state.lastAnalysis || {};
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, context })
    });
    const data = await res.json();
    removeTyping();
    appendChatMsg('bot', data.response || 'Sorry, I could not process that.');
  } catch (err) {
    removeTyping();
    appendChatMsg('bot', '❌ Connection error. Please check that the server is running on port 3000.');
  }
}

function sendQuickReply(msg) {
  document.getElementById('chatInput').value = msg;
  sendChat();
  // Remove quick replies after first use
  const qr = document.querySelector('.chat-quick-replies');
  if (qr) qr.remove();
}

function appendChatMsg(role, text) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `<div class="msg-bubble">${markdownToHTML(text)}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="chat-typing"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

// ─── PROP TYPE SELECTOR ───────────────────────────────────────────────────────
function initPropTypeSelector() {
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ─── TIP ROTATOR ─────────────────────────────────────────────────────────────
function initTipRotator() {
  let current = 0;
  setInterval(() => {
    current = (current + 1) % TIPS.length;
    document.querySelector('.tip-text').textContent = TIPS[current];
    document.querySelectorAll('.tip-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current % 4);
    });
  }, 4000);
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function formatNum(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return (n / 100000).toFixed(2) + ' L';
  return Number(n).toLocaleString('en-IN');
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function markdownToHTML(md) {
  if (!md) return '';
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
