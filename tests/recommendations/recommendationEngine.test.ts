import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Recommendations Engine & Preference Heuristics Suite', () => {
  // Simple deterministic recommendation heuristic matching Prompt 03 specifications
  interface RecommendationInput {
    favoriteCategories: string[];
    userJournals: { mainCategory: string; tags: string[]; overallRating: number }[];
    candidatePlaces: { id: string; name: string; category: string; tags: string[]; ratingAverage?: number }[];
  }

  const scoreAndRecommend = (input: RecommendationInput) => {
    const { favoriteCategories, userJournals, candidatePlaces } = input;

    // Build user taste profile weights
    const categoryWeights = new Map<string, number>();
    for (const cat of favoriteCategories) {
      categoryWeights.set(cat.toLowerCase(), 2.0);
    }
    for (const j of userJournals) {
      if (j.overallRating >= 4.0) {
        const current = categoryWeights.get(j.mainCategory.toLowerCase()) || 1.0;
        categoryWeights.set(j.mainCategory.toLowerCase(), current + 0.5);
      }
    }

    // Score candidates
    return candidatePlaces
      .map((place) => {
        let score = (place.ratingAverage || 4.0) * 0.5;
        const placeCat = place.category.toLowerCase();

        for (const [cat, weight] of categoryWeights.entries()) {
          if (placeCat.includes(cat) || place.tags.some((t) => t.toLowerCase().includes(cat))) {
            score += weight;
          }
        }

        return {
          ...place,
          recommendationScore: Math.round(score * 10) / 10,
          explanation: `Direkomendasikan karena cocok dengan minat ${place.category} kamu.`,
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  };

  test('Heuristic scores and ranks coffee places higher for coffee lovers', () => {
    const input: RecommendationInput = {
      favoriteCategories: ['Coffee', 'Cafe'],
      userJournals: [
        { mainCategory: 'drinks', tags: ['SpecialtyCoffee'], overallRating: 4.8 },
      ],
      candidatePlaces: [
        { id: 'p1', name: 'Giyanti Coffee Roastery', category: 'Coffee & Cafe', tags: ['Coffee', 'Roastery'], ratingAverage: 4.8 },
        { id: 'p2', name: 'Burger Joint', category: 'Fast Food', tags: ['Burger'], ratingAverage: 4.2 },
      ],
    };

    const ranked = scoreAndRecommend(input);
    assert.equal(ranked.length, 2);
    assert.equal(ranked[0].id, 'p1');
    assert.ok(ranked[0].recommendationScore > ranked[1].recommendationScore);
    assert.ok(ranked[0].explanation.includes('Coffee & Cafe'));
  });

  test('Gracefully handles empty user journals and provides fallback ranking', () => {
    const input: RecommendationInput = {
      favoriteCategories: [],
      userJournals: [],
      candidatePlaces: [
        { id: 'p1', name: 'Sawo Kecik', category: 'Restoran', tags: ['Heritage'], ratingAverage: 4.7 },
        { id: 'p2', name: 'Kopi Kenangan', category: 'Cafe', tags: ['Kopi'], ratingAverage: 4.3 },
      ],
    };

    const ranked = scoreAndRecommend(input);
    assert.equal(ranked.length, 2);
    // When no preferences exist, highest base rating is ranked first
    assert.equal(ranked[0].id, 'p1');
  });
});
