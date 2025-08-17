// src/controllers/aiController.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google AI client with the API key from your .env file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const analyzeTrades = async (req, res) => {
  const { trades } = req.body;

  if (!trades || !Array.isArray(trades) || trades.length === 0) {
    return res.status(400).json({ error: 'Trade data is required and must be a non-empty array.' });
  }

  // --- THIS IS THE MODIFIED PROMPT ---
  const prompt = `
    You are an expert trading coach and performance analyst for a trading journal application. 
    Your tone should be insightful, constructive, and highly data-driven. Analyze the following trading data and provide a detailed summary.

    **Your analysis must include the following sections, precisely in this order, using Markdown for all formatting:**

    ### 1. Overall Performance Summary
    A brief paragraph summarizing the key results, referencing the specific metrics calculated below.

    ### 2. Quantitative Performance Metrics
    Generate a Markdown table with the following metrics. The table must have two columns: "Metric" and "Value".
    - Total Net P&L (Profit/Loss)
    - Win Rate (%)
    - Loss Rate (%)
    - Average P&L per Trade
    - Average Winning Trade
    - Average Losing Trade
    - Profit Factor (Total Profit from Winners / Absolute Total Loss from Losers)

    ### 3. Best & Worst Trades
    Generate a Markdown table identifying the single best and single worst trade by P&L amount. The table must have four columns: "Category", "Symbol", "P&L", "Strategy".

    ### 4. Key Strengths & Winning Patterns
    Based on the data and tables above, identify the top 2-3 most profitable patterns or strengths. Be specific and use data to back up your claims. For example:
    - "Your 'Breakout' strategy on NIFTY was particularly effective, netting a total of ₹X across Y trades."

    ### 5. Areas for Improvement & Costly Mistakes
    Based on the data and tables above, identify the top 2-3 recurring mistakes that are hurting performance. Be specific and use data. For example:
    - "Holding losing 'Scalping' trades resulted in an average loss of ₹Y, which is significantly higher than your average winning trade."
    - "Your win rate on 'Short' direction trades is only Z%, suggesting a potential weakness in that area."

    ### 6. Actionable Advice
    Provide 2-3 concrete, actionable steps the trader can take to improve, directly referencing the analysis above. For example:
    - "Recommendation 1: Given your high Profit Factor with the 'Breakout' strategy, consider allocating more capital to these specific setups."
    - "Recommendation 2: Implement a stricter stop-loss on all 'Scalping' trades to reduce the impact of your 'Average Losing Trade' metric."

    **Trader's Data to Analyze:**
    ${JSON.stringify(trades, null, 2)}
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const analysisResult = response.text();

    res.status(200).json({ analysis: analysisResult });

  } catch (error) {
    console.error('Error communicating with Google AI API:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the trades.' });
  }
};

const testAIConnection = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Hello! Please confirm you are working by responding with only the following text: 'AI connection successful.'";
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    res.status(200).json({ message: "Test successful", response: text });
  } catch (error) {
    console.error('AI Test Connection Error:', error);
    res.status(500).json({ message: "Test failed", error: error.message });
  }
};

module.exports = {
  analyzeTrades,
  testAIConnection,
};
