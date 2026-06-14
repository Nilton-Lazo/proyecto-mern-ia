const SKILL_TYPES = ['literal', 'inferential', 'critical', 'vocabulary', 'main_idea'];

const SKILL_LABELS = {
  literal: 'Comprensión literal',
  inferential: 'Comprensión inferencial',
  critical: 'Pensamiento crítico',
  vocabulary: 'Vocabulario',
  main_idea: 'Idea principal',
};

const SKILL_RECOMMENDATIONS = {
  literal: 'Refuerza la lectura detallada y la ubicación de datos explícitos en el texto.',
  inferential: 'Practica identificar ideas implícitas y relaciones entre párrafos.',
  critical: 'Analiza argumentos, opiniones y posibles sesgos del autor.',
  vocabulary: 'Amplía tu vocabulario contextualizando palabras en la lectura.',
  main_idea: 'Resume cada párrafo con una oración propia antes de responder.',
};

/** Calcula porcentaje 0-100 por habilidad lectora según isCorrect de cada respuesta */
function computeSkillScores(questions = [], questionAnswers = []) {
  const scores = {};
  SKILL_TYPES.forEach((s) => { scores[s] = null; });

  const bySkill = {};
  questions.forEach((q, i) => {
    const skill = SKILL_TYPES.includes(q.type) ? q.type : 'literal';
    if (!bySkill[skill]) bySkill[skill] = [];
    bySkill[skill].push(i);
  });

  Object.entries(bySkill).forEach(([skill, indices]) => {
    let total = 0;
    let earned = 0;
    indices.forEach((i) => {
      const ans = questionAnswers[i];
      if (!ans?.answer?.trim()) return;
      total++;
      const ic = ans.isCorrect;
      if (ic === 'correcta') earned += 100;
      else if (ic === 'parcial') earned += 55;
      else earned += 15;
    });
    scores[skill] = total > 0 ? Math.round(earned / total) : null;
  });

  return scores;
}

/** Promedia skillScores de múltiples submissions entregadas */
function aggregateSkillScores(submissions = []) {
  const sums = {};
  const counts = {};
  SKILL_TYPES.forEach((s) => { sums[s] = 0; counts[s] = 0; });

  submissions.forEach((sub) => {
    const ss = sub.skillScores || {};
    SKILL_TYPES.forEach((s) => {
      if (ss[s] != null && !Number.isNaN(ss[s])) {
        sums[s] += ss[s];
        counts[s]++;
      }
    });
  });

  const result = {};
  SKILL_TYPES.forEach((s) => {
    result[s] = counts[s] > 0 ? Math.round(sums[s] / counts[s]) : null;
  });
  return result;
}

function getSkillRecommendations(skillScores = {}) {
  const recs = [];
  SKILL_TYPES.forEach((s) => {
    const v = skillScores[s];
    if (v == null) return;
    if (v >= 75) {
      recs.push({ skill: s, label: SKILL_LABELS[s], level: 'alto', message: `Buen dominio de ${SKILL_LABELS[s].toLowerCase()}.` });
    } else if (v >= 50) {
      recs.push({ skill: s, label: SKILL_LABELS[s], level: 'medio', message: SKILL_RECOMMENDATIONS[s] });
    } else {
      recs.push({ skill: s, label: SKILL_LABELS[s], level: 'bajo', message: `Refuerza ${SKILL_LABELS[s].toLowerCase()}: ${SKILL_RECOMMENDATIONS[s]}` });
    }
  });
  return recs;
}

module.exports = {
  SKILL_TYPES,
  SKILL_LABELS,
  SKILL_RECOMMENDATIONS,
  computeSkillScores,
  aggregateSkillScores,
  getSkillRecommendations,
};
