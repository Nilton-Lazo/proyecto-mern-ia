export const CURRICULAR_AREAS = [
  'Comunicación',
  'Matemática',
  'Ciencia y Tecnología',
  'Personal Social',
  'Arte y Cultura',
  'Inglés',
  'Educación Religiosa',
  'Tutoría',
  'Otro',
] as const;

export type CurricularArea = (typeof CURRICULAR_AREAS)[number];

export const DEFAULT_AREA: CurricularArea = 'Comunicación';

export const AREA_FILTER_ALL = 'todas';
