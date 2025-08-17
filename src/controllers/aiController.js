
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google AI client with the API key from your .env file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Controller to analyze a user's trading data.
 * Expects an array of trade objects in the request body.
 */
const analyzeTrades = async (req, res) => {
  const { trades } = req.body;

  // Basic validation to ensure trades data is present
  if (!trades || !Array.isArray(trades) || trades.length === 0) {
    return res.status(400).json({ error: 'Trade data is required and must be a non-empty array.' });
  }

  // This is the core prompt that instructs the AI. You can refine this over time.
  const prompt = `
    You are an expert trading coach and performance analyst for a trading journal application. 
    Your tone should be insightful, constructive, and professional. Analyze the following trading data and provide a concise summary.

    **Your analysis must include the following sections, using Markdown for formatting:**
    
    ### 1. Overall Performance Summary
    A brief paragraph summarizing the key results, including overall profitability and win rate. Start with an encouraging but realistic overview.

    ### 2. Key Strengths & Winning Patterns
    Identify the top 2-3 most profitable patterns or strengths. Be specific about what works. For example:
    - "Your strategy of taking long positions on NIFTY after a morning consolidation shows a high win rate."
    - "You excel at managing risk on BANKNIFTY trades with a risk-to-reward ratio greater than 1:2."

    ### 3. Areas for Improvement & Costly Mistakes
    Identify the top 2-3 recurring mistakes that are hurting performance. Be direct but constructive. For example:
    - "A pattern of 'revenge trading' after a loss is noticeable, leading to larger subsequent losses."
    - "Holding onto losing option trades for too long, especially on expiry days, is a significant drain on profits."

    ### 4. Actionable Advice
    Provide 2-3 concrete, actionable steps the trader can take to improve their performance based on your analysis. For example:
    - "Recommendation 1: Implement a strict 'cool-down' period of 1 hour after two consecutive losing trades."
    - "Recommendation 2: Focus more capital on your high-performing NIFTY setup and reduce position size on speculative option buys."

    **Trader's Data to Analyze:**
    ${JSON.stringify(trades, null, 2)}
  `;

  try {
    // Select the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content based on the prompt
    const result = await model.generateContent(prompt);
    const response = result.response;
    const analysisResult = response.text();

    res.status(200).json({ analysis: analysisResult });

  } catch (error) {
    console.error('Error communicating with Google AI API:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the trades.' });
  }
};

/**
 * Controller for a simple test to verify the AI connection.
 * Uses a hardcoded prompt.
 */
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
