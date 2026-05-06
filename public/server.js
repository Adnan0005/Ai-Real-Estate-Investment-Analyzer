require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── POST /api/chat ───────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const systemPrompt = `You are an expert real estate investment advisor with 20+ years of experience in Indian real estate markets (Delhi, Mumbai, Bangalore, Noida, Hyderabad, Pune, Chennai, etc.).

Your role:
- Provide practical, data-driven real estate investment advice
- Give clear Buy / Avoid / Hold / Watch recommendations
- Explain risks and opportunities clearly
- Reference Indian market conditions, RERA regulations, and local trends
- Be concise but comprehensive
- Always include a final recommendation in bold

Format your responses with:
- Clear sections using emoji headers
- Bullet points for key metrics
- A bold final recommendation

Never give generic advice. Always be specific to the user's situation.`;

  const userContent = `User Query: ${message}
${context?.roi ? `ROI: ${context.roi}%` : ""}
${context?.rentalYield ? `Rental Yield: ${context.rentalYield}%` : ""}
${context?.riskLevel ? `Risk Level: ${context.riskLevel}` : ""}
${context?.propertyPrice ? `Property Price: ₹${context.propertyPrice}` : ""}
${context?.monthlyRent ? `Monthly Rent: ₹${context.monthlyRent}` : ""}
${context?.location ? `Location: ${context.location}` : ""}
${context?.dealScore ? `Deal Score: ${context.dealScore}/100` : ""}`;

  try {
    // Use Anthropic API (free via claude.ai context) or fallback to OpenRouter
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
    
    let response;
    
    // Try OpenRouter first (free models available)
    if (apiKey) {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": req.headers.origin || "http://localhost:3000",
          "X-Title": "AI Real Estate Analyzer"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "API error");
      }

      const aiMessage = data.choices?.[0]?.message?.content;
      if (!aiMessage) throw new Error("No response from AI");
      
      return res.json({ response: aiMessage, model: "llama-3-8b (OpenRouter)" });
    } else {
      // Fallback: rule-based smart response when no API key
      const smartResponse = generateSmartResponse(message, context);
      return res.json({ response: smartResponse, model: "Smart Analyzer (no API key)" });
    }

  } catch (err) {
    console.error("AI API Error:", err.message);
    // Fallback to rule-based response
    const fallback = generateSmartResponse(message, context);
    return res.json({ response: fallback, model: "Smart Analyzer (fallback)" });
  }
});

// ─── Smart Fallback Response Generator ───────────────────────────────────────
function generateSmartResponse(message, context) {
  const msg = message.toLowerCase();
  const roi = parseFloat(context?.roi) || 0;
  const risk = context?.riskLevel || "unknown";
  const score = parseFloat(context?.dealScore) || 0;
  const location = context?.location || "";

  let response = "";

  if (msg.includes("buy") || msg.includes("invest") || msg.includes("should i")) {
    if (roi > 8 && score > 65) {
      response = `## 🟢 Investment Analysis\n\n**Strong Buy Signal Detected!**\n\n- ✅ ROI of ${roi.toFixed(2)}% is above market average (6-7%)\n- ✅ Deal Score ${score}/100 indicates a solid opportunity\n- ✅ Risk profile: ${risk}\n\n**📊 Key Metrics:**\n- Your rental yield outperforms FD rates (6.5%)\n- Property likely to appreciate given strong fundamentals\n\n**🎯 Final Recommendation: BUY** – This deal shows strong fundamentals. Ensure legal due diligence (RERA check, title verification) before proceeding.`;
    } else if (roi > 5) {
      response = `## 🟡 Investment Analysis\n\n**Moderate Opportunity**\n\n- ⚠️ ROI of ${roi.toFixed(2)}% is near market average\n- Deal Score: ${score}/100\n- Risk Level: ${risk}\n\n**📊 Key Metrics:**\n- Returns are modest but stable\n- Consider negotiating price down by 5-10%\n- Compare with other properties in the area\n\n**🎯 Final Recommendation: HOLD/NEGOTIATE** – Decent deal but room for better terms. Try to negotiate or explore comparable properties.`;
    } else {
      response = `## 🔴 Investment Analysis\n\n**Caution Advised**\n\n- ❌ ROI of ${roi.toFixed(2)}% is below safe threshold (5%)\n- Deal Score: ${score}/100\n- Risk Level: ${risk}\n\n**📊 Key Risks:**\n- Low rental return may not cover EMI\n- Opportunity cost vs mutual funds is negative\n- Overpriced relative to rental income\n\n**🎯 Final Recommendation: AVOID** – This deal doesn't justify the capital. Consider REITs or other locations with better yield.`;
    }
  } else if (msg.includes("emi") || msg.includes("loan")) {
    response = `## 🏦 Loan & EMI Guidance\n\n**Key Rules for Home Loans:**\n\n- ✅ EMI should not exceed 40% of monthly income\n- ✅ Maintain 20-30% down payment to reduce interest burden\n- ✅ Compare SBI (8.5%), HDFC (8.75%), ICICI (8.75%) rates\n\n**💡 Tips:**\n- Floating rate loans better when RBI likely to cut rates\n- Prepay when possible – even ₹10K extra/month saves lakhs\n- Check for processing fees and prepayment penalties\n\n**🎯 Recommendation:** Use our EMI Calculator above to model your exact numbers before approaching a bank.`;
  } else if (msg.includes("risk")) {
    response = `## ⚠️ Risk Assessment\n\n**Common Real Estate Risks in India:**\n\n**Legal Risks:**\n- Title disputes (always do title search)\n- Unapproved construction (verify RERA)\n- Encumbrances on property\n\n**Market Risks:**\n- ${location ? `${location} market` : "Local market"} liquidity risk\n- Interest rate fluctuations\n- Rental demand changes\n\n**Financial Risks:**\n- Cash flow gap if property stays vacant\n- Maintenance costs (budget 1-1.5% of value/year)\n\n**🎯 Mitigation:** Always get legal verification, RERA check, and keep 6-month EMI reserve.`;
  } else {
    response = `## 💡 Real Estate Investment Insights\n\n**General Market Overview (2024-25):**\n\n- 🏙️ Top performing cities: Bengaluru, Hyderabad, Pune\n- 📈 Average residential appreciation: 8-12% in tier-1 cities\n- 💰 Ideal rental yield target: 3-5% (gross), 2-3% (net)\n\n**Investment Checklist:**\n- [ ] RERA registration verified\n- [ ] Title clear (no disputes)\n- [ ] Builder reputation checked\n- [ ] Rental demand in area assessed\n- [ ] Infrastructure development nearby\n\n**🎯 Pro Tip:** Use our Property Analyzer to input your specific deal numbers for a personalized recommendation. The AI works best with actual property data.`;
  }

  return response;
}

// ─── POST /api/report ────────────────────────────────────────────────────────
app.post("/api/report", async (req, res) => {
  const { propertyData } = req.body;

  if (!propertyData) {
    return res.status(400).json({ error: "Property data is required" });
  }

  const prompt = `Generate a professional real estate investment report for this property:

Property Price: ₹${propertyData.price}
Monthly Rent: ₹${propertyData.rent}
Annual Growth Rate: ${propertyData.growth}%
ROI: ${propertyData.roi}%
Rental Yield: ${propertyData.rentalYield}%
Break-even Period: ${propertyData.breakeven} years
Deal Score: ${propertyData.score}/100
Risk Level: ${propertyData.riskLevel}
Location: ${propertyData.location || "Not specified"}

Generate a structured report with:
1. Executive Summary
2. Financial Analysis
3. Risk Assessment
4. Market Context
5. Final Recommendation (Buy/Hold/Avoid)

Be specific, practical, and data-driven. Format with clear sections and bullet points.`;

  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
    
    if (apiKey) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": req.headers.origin || "http://localhost:3000",
          "X-Title": "AI Real Estate Analyzer"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1200,
          temperature: 0.6
        })
      });

      const data = await response.json();
      const report = data.choices?.[0]?.message?.content;
      if (!report) throw new Error("No report generated");
      return res.json({ report });
    } else {
      // Fallback report
      const report = generateFallbackReport(propertyData);
      return res.json({ report });
    }
  } catch (err) {
    console.error("Report generation error:", err.message);
    const report = generateFallbackReport(propertyData);
    return res.json({ report });
  }
});

function generateFallbackReport(d) {
  const rec = d.score >= 65 ? "BUY" : d.score >= 45 ? "HOLD" : "AVOID";
  const recColor = rec === "BUY" ? "positive" : rec === "HOLD" ? "neutral" : "negative";

  return `# 📊 Investment Analysis Report

## 1. Executive Summary
This property at ₹${Number(d.price).toLocaleString("en-IN")} with monthly rental of ₹${Number(d.rent).toLocaleString("en-IN")} has been analyzed using our financial models. The deal scores **${d.score}/100** and is classified as **${d.riskLevel} risk**.

## 2. Financial Analysis
- **Annual Rental Income:** ₹${(d.rent * 12).toLocaleString("en-IN")}
- **ROI / Rental Yield:** ${d.roi}%
- **Break-even Period:** ${d.breakeven} years
- **Annual Appreciation (est.):** ${d.growth}%
- **Total Expected Return (5yr):** ${(parseFloat(d.roi) + parseFloat(d.growth)).toFixed(2)}% per annum

## 3. Risk Assessment
- **Rental Yield Risk:** ${parseFloat(d.roi) < 3 ? "⚠️ High – Below safe threshold" : parseFloat(d.roi) < 5 ? "🟡 Moderate – Near average" : "✅ Low – Good yield"}
- **Price-to-Rent Ratio:** ${(d.price / (d.rent * 12)).toFixed(1)}x ${(d.price / (d.rent * 12)) > 25 ? "(overpriced)" : "(fair value)"}
- **Growth Risk:** ${parseFloat(d.growth) < 5 ? "⚠️ Low growth area" : "✅ Healthy appreciation expected"}

## 4. Market Context
- Indian real estate historically returns 8-12% CAGR in tier-1 cities
- RERA has improved buyer protection significantly since 2017
- Current RBI repo rate affects home loan EMIs directly
- ${d.location ? `${d.location} shows ${d.growth}% expected growth` : "Location analysis unavailable"}

## 5. Final Recommendation

**🎯 ${rec}** – Based on a Deal Score of ${d.score}/100 and ${d.riskLevel} risk profile, this investment ${rec === "BUY" ? "presents a strong opportunity with good fundamentals." : rec === "HOLD" ? "is average – negotiate better terms or await market correction." : "does not justify capital allocation at this price point."}

---
*Report generated by AI Real Estate Analyzer | For informational purposes only*`;
}

// ─── Serve Frontend ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Real Estate Analyzer running at http://localhost:${PORT}\n`);
});
