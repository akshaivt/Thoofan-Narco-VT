const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load API Key from environment variables
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY' && apiKey !== 'placeholder') {
  console.log('[GeminiService] Initialized with API Key.');
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.log('[GeminiService] API Key missing/placeholder. Falling back to local AI simulator.');
}

/**
 * Perform intelligence analysis on drug complaints using Gemini 1.5 Flash.
 * Falls back to simulation if credentials are empty or API errors occur.
 * 
 * @param {string} description 
 * @param {string} activityType 
 * @returns {Promise<{aiSummary: string, aiCategory: string, aiPriority: string, riskLevel: string, aiSuggestions: string}>}
 */
const analyzeComplaintText = async (description, activityType) => {
  if (!genAI) {
    return generateSimulatedAnalysis(description, activityType);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert drug enforcement intelligence officer. 
      Analyze the following confidential citizen report and extract critical operational intelligence.
      
      Suspected Activity Type: "${activityType}"
      Reporter Description: "${description}"
      
      You MUST respond with a strictly formatted JSON object matching the following structure (do not include markdown block headers or preambles, output raw JSON only):
      {
        "aiSummary": "A concise, single-paragraph summary of the report description highlighting suspects, vehicles, or operations.",
        "aiCategory": "Drug Trafficking / Retail Dealing / Manufacturing Lab / Illegal Cultivation / Consumption Den / Other",
        "aiPriority": "Low / Medium / High",
        "riskLevel": "Low / Medium / High / Critical",
        "aiSuggestions": "Tactical action items and recommendations for responding units."
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return {
      aiSummary: data.aiSummary || 'Summary not generated.',
      aiCategory: data.aiCategory || 'Other',
      aiPriority: data.aiPriority || 'Medium',
      riskLevel: data.riskLevel || 'Medium',
      aiSuggestions: data.aiSuggestions || 'Dispatch patrol units for location reconnaissance.'
    };
  } catch (error) {
    console.error('[GeminiService] API failure, generating fallback metrics:', error);
    return generateSimulatedAnalysis(description, activityType);
  }
};

/**
 * Simulated keywords-based AI fallback analyzer.
 */
function generateSimulatedAnalysis(description, activityType) {
  const descLower = description.toLowerCase();
  
  let aiCategory = 'Other';
  let aiPriority = 'Medium';
  let riskLevel = 'Medium';
  let aiSuggestions = 'Verify the coordinates and dispatch local beat officers for surveillance.';

  if (descLower.includes('lab') || descLower.includes('factory') || descLower.includes('cook') || descLower.includes('manufactur')) {
    aiCategory = 'Manufacturing Lab';
    aiPriority = 'High';
    riskLevel = 'Critical';
    aiSuggestions = 'Warning: Active chemical laboratory suspected. Deploy specialized tactical narcotics team with chemical suits. Evacuate or monitor the surrounding radius.';
  } else if (descLower.includes('cultivat') || descLower.includes('farm') || descLower.includes('grow') || descLower.includes('plant') || descLower.includes('weed')) {
    aiCategory = 'Illegal Cultivation';
    aiPriority = 'Medium';
    riskLevel = 'Medium';
    aiSuggestions = 'Coordinate with aerial/drone surveillance to maps out fields. Schedule localized ground operations.';
  } else if (descLower.includes('smuggl') || descLower.includes('border') || descLower.includes('truck') || descLower.includes('shipment') || descLower.includes('traffick')) {
    aiCategory = 'Drug Trafficking';
    aiPriority = 'High';
    riskLevel = 'High';
    aiSuggestions = 'Flag vehicle descriptions. Share plates with highway checkpoints and notify customs units.';
  } else if (descLower.includes('deal') || descLower.includes('sell') || descLower.includes('buyer') || descLower.includes('dealer')) {
    aiCategory = 'Retail Dealing';
    aiPriority = 'Medium';
    riskLevel = 'High';
    aiSuggestions = 'Set up static surveillance to document dealer exchanges. Log buyer license plates for intelligence files.';
  } else if (descLower.includes('smoke') || descLower.includes('consume') || descLower.includes('den') || descLower.includes('use') || descLower.includes('inject')) {
    aiCategory = 'Consumption Den';
    aiPriority = 'Low';
    riskLevel = 'Low';
    aiSuggestions = 'Increase routine neighborhood patrols. Share coordinates with local social services outreach teams.';
  }

  const aiSummary = `AI Summary: Incident report regarding suspected ${activityType || 'narcotic'} operations. Description notes: "${description.length > 90 ? description.slice(0, 90) + '...' : description}"`;

  return {
    aiSummary,
    aiCategory,
    aiPriority,
    riskLevel,
    aiSuggestions
  };
}

module.exports = {
  analyzeComplaintText
};
