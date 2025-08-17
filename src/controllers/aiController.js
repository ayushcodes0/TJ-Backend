// src/controllers/aiController.js


const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const analyzeTrades = async (req, res) => {
  const { trades } = req.body;

  if (!trades || !Array.isArray(trades) || trades.length === 0) {
    return res.status(400).json({ error: 'Trade data is required.' });
  }

  // --- THE NEW, JSON-FOCUSED PROMPT ---
  const prompt = `
    You are a data analyst for a trading journal. Your task is to analyze the provided trade data and return a single, valid JSON object. 
    Do NOT include any text, notes, or markdown formatting outside of the JSON structure.

    The JSON object must have the following structure:
    {
      "performanceSummary": "A one-paragraph summary of the overall trading performance.",
      "confidenceLevel": A number between 0 and 10 representing the average confidence level from the psychology data,
      "keyMetrics": [
        { "metric": "Total Net P&L", "value": "A formatted string like '₹X,XXX.XX'", "sentiment": "positive" or "negative" },
        { "metric": "Win Rate", "value": "XX.X%", "sentiment": "positive", "neutral" or "negative" },
        { "metric": "Profit Factor", "value": "X.XX", "sentiment": "positive", "neutral" or "negative" },
        { "metric": "Average Winning Trade", "value": "₹X,XXX.XX", "sentiment": "neutral" },
        { "metric": "Average Losing Trade", "value": "₹X,XXX.XX", "sentiment": "neutral" }
      ],
      "strengths": [
        "A string describing the first key strength.",
        "A string describing the second key strength."
      ],
      "weaknesses": [
        "A string describing the first area for improvement.",
        "A string describing the second area for improvement."
      ],
      "actionableAdvice": [
        "A string with the first piece of actionable advice.",
        "A string with the second piece of actionable advice."
      ]
    }

    Base your analysis on this data:
    ${JSON.stringify(trades, null, 2)}
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    
    let jsonString = response.text();

    // --- FALLBACK MECHANISM ---
    // Find the first '{' and the last '}' to extract the JSON object
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = jsonString.substring(startIndex, endIndex + 1);
    }
    
    const analysisData = JSON.parse(jsonString);
    res.status(200).json({ analysis: analysisData });

  } catch (error) {
    console.error('Error processing AI request:', error);
    // Let's provide a more descriptive error to the frontend
    if (error instanceof SyntaxError) {
      res.status(500).json({ error: 'AI returned malformed data. Could not parse the analysis.' });
    } else {
      res.status(500).json({ error: 'An error occurred while communicating with the AI service.' });
    }
  }
};

const testAIConnection = async (req, res) => {
    // ... (no changes needed for the test controller)
};

module.exports = {
  analyzeTrades,
  testAIConnection,
};
