/** Áreas curriculares — primaria (I.E.P. San Carlos) */
const CURRICULAR_AREAS = [
  'Comunicación',
  'Matemática',
  'Ciencia y Tecnología',
  'Personal Social',
  'Arte y Cultura',
  'Inglés',
  'Educación Religiosa',
  'Tutoría',
  'Otro',
];

const DEFAULT_AREA = 'Comunicación';

function isValidArea(area) {
  return CURRICULAR_AREAS.includes(area);
}

module.exports = { CURRICULAR_AREAS, DEFAULT_AREA, isValidArea };
