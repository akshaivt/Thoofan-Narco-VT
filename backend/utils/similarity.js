const Complaint = require('../models/Complaint');

/**
 * Calculates Cosine Similarity between two text strings using a Bag-of-Words approach.
 * 
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} Score from 0 to 100
 */
function calculateTextSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;

  const tokenize = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  };

  const tokens1 = tokenize(str1);
  const tokens2 = tokenize(str2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const freqMap1 = {};
  const freqMap2 = {};
  const uniqueWords = new Set([...tokens1, ...tokens2]);

  tokens1.forEach(w => freqMap1[w] = (freqMap1[w] || 0) + 1);
  tokens2.forEach(w => freqMap2[w] = (freqMap2[w] || 0) + 1);

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  uniqueWords.forEach(word => {
    const val1 = freqMap1[word] || 0;
    const val2 = freqMap2[word] || 0;
    dotProduct += val1 * val2;
    mag1 += val1 * val1;
    mag2 += val2 * val2;
  });

  if (mag1 === 0 || mag2 === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
  return Math.round(similarity * 100);
}

/**
 * Compare new complaint with previous listings in the same district and date range.
 * 
 * @param {object} newComplaintData 
 * @returns {Promise<number>} Duplicate similarity score (0 - 100)
 */
const checkDuplicateScore = async (newComplaintData) => {
  try {
    const { district, place, incidentDate, description, _id } = newComplaintData;
    
    if (!district || !description) return 0;

    // Filter window: within +/- 10 days of incident date
    const targetDate = new Date(incidentDate);
    const dateStart = new Date(targetDate);
    dateStart.setDate(dateStart.getDate() - 10);
    const dateEnd = new Date(targetDate);
    dateEnd.setDate(dateEnd.getDate() + 10);

    // Fetch matching candidates in the same district
    const query = {
      district,
      incidentDate: { $gte: dateStart, $lte: dateEnd }
    };

    // If updating an existing complaint, exclude itself
    if (_id) {
      query._id = { $ne: _id };
    }

    const candidates = await Complaint.find(query);

    let maxScore = 0;

    for (const candidate of candidates) {
      // Calculate baseline text similarity on description
      let score = calculateTextSimilarity(description, candidate.description);

      // Exact place matches boost similarity
      if (place && candidate.place && place.toLowerCase().trim() === candidate.place.toLowerCase().trim()) {
        score = Math.min(100, score + 20); // +20% boost, capped at 100
      }

      if (score > maxScore) {
        maxScore = score;
      }
    }

    return maxScore;
  } catch (error) {
    console.error('[DuplicateDetector] Failed to calculate score:', error);
    return 0;
  }
};

module.exports = {
  calculateTextSimilarity,
  checkDuplicateScore
};
