const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const analyzeTrades = async (req, res) => {
  const { trades } = req.body;

  if (!trades || !Array.isArray(trades) || trades.length === 0) {
    return res.status(400).json({ error: 'Trade data is required.' });
  }

  const prompt = `
    You are a data analyst for a trading journal. Analyze the provided trade data and return ONLY a valid JSON object with no additional text, explanations, or markdown formatting.

    Return exactly this JSON structure (replace placeholder values with actual analysis):
    {
      "performanceSummary": "A one-paragraph summary of the overall trading performance based on the data provided.",
      "confidenceLevel": 7,
      "keyMetrics": [
        { "metric": "Total Net P&L", "value": "₹X,XXX.XX", "sentiment": "positive" },
        { "metric": "Win Rate", "value": "XX.X%", "sentiment": "positive" },
        { "metric": "Profit Factor", "value": "X.XX", "sentiment": "positive" },
        { "metric": "Average Winning Trade", "value": "₹X,XXX.XX", "sentiment": "neutral" },
        { "metric": "Average Losing Trade", "value": "₹X,XXX.XX", "sentiment": "neutral" }
      ],
      "strengths": [
        "First key strength based on the data",
        "Second key strength based on the data"
      ],
      "weaknesses": [
        "First area for improvement based on the data", 
        "Second area for improvement based on the data"
      ],
      "actionableAdvice": [
        "First piece of actionable advice based on the analysis",
        "Second piece of actionable advice based on the analysis"
      ]
    }

    Calculate all metrics from this trade data:
    ${JSON.stringify(trades, null, 2)}

    Remember: Return ONLY the JSON object, no other text.
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash", // Updated model
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    let jsonString = response.text();

    // Extract valid JSON
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = jsonString.substring(startIndex, endIndex + 1);
    } else {
      throw new Error('No valid JSON found in response');
    }

    const analysisData = JSON.parse(jsonString);

    if (!analysisData.performanceSummary || !analysisData.keyMetrics) {
      throw new Error('Invalid analysis data structure');
    }

    res.status(200).json({ analysis: analysisData });

  } catch (error) {
    console.error('Full error:', error);
    res.status(500).json({ error: error.message, details: JSON.stringify(error) });
  }
};

const testAIConnection = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-2.5-flash" // Updated model
    });

    const testPrompt = 'Respond with exactly this JSON: {"status": "success", "message": "API connection working"}';

    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ 
      success: true, 
      message: 'Google AI Studio API connection successful!',
      response: text,
      model: 'models/gemini-2.5-flash'
    });

  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      errorDetails: JSON.stringify(error)
    });
  }
};

module.exports = {
  analyzeTrades,
  testAIConnection,
};
