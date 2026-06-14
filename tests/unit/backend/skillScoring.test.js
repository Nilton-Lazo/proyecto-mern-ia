const {
  computeSkillScores,
  aggregateSkillScores,
  getSkillRecommendations,
} = require('../../../src/backend/utils/skillScoring');

describe('skillScoring', () => {
  test('computeSkillScores agrupa por habilidad', () => {
    const questions = [
      { type: 'literal', questionText: 'Q1' },
      { type: 'literal', questionText: 'Q2' },
      { type: 'inferential', questionText: 'Q3' },
    ];
    const answers = [
      { answer: 'a', isCorrect: 'correcta' },
      { answer: 'b', isCorrect: 'incorrecta' },
      { answer: 'c', isCorrect: 'parcial' },
    ];
    const scores = computeSkillScores(questions, answers);
    expect(scores.literal).toBe(58); // (100+15)/2
    expect(scores.inferential).toBe(55);
  });

  test('aggregateSkillScores promedia submissions', () => {
    const agg = aggregateSkillScores([
      { skillScores: { literal: 80, inferential: 40 } },
      { skillScores: { literal: 60, inferential: 60 } },
    ]);
    expect(agg.literal).toBe(70);
    expect(agg.inferential).toBe(50);
  });

  test('getSkillRecommendations devuelve mensajes por nivel', () => {
    const recs = getSkillRecommendations({ literal: 90, inferential: 40 });
    expect(recs.some((r) => r.skill === 'literal' && r.level === 'alto')).toBe(true);
    expect(recs.some((r) => r.skill === 'inferential' && r.level === 'bajo')).toBe(true);
  });
});
