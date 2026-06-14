import { http, HttpResponse } from 'msw';

const API = 'http://localhost:3000';

export const handlers = [
  http.get(`${API}/api/student/activities`, () =>
    HttpResponse.json({
      activities: [
        {
          _id: 'a1',
          titulo: 'Lectura MSW',
          area: 'Comunicación',
          tema: 'Integración',
          progreso: 30,
          status: 'draft',
          displayStatus: 'en_progreso',
          actualizada: new Date().toISOString(),
        },
      ],
      groupedByArea: [],
      total: 1,
      filtered: 1,
    })
  ),
];
