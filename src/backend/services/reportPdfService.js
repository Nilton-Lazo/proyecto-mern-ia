const PDFDocument = require('pdfkit');

const INSTITUTION = {
  name: 'Institución Educativa Privada San Carlos',
  system: 'Tutor Virtual de Lectura Crítica con Inteligencia Artificial',
  subtitle: 'Evidencia de aprendizaje y trazabilidad pedagógica',
};

const COLORS = {
  primary: '#1e3a5f',
  accent: '#312e81',
  text: '#1e293b',
  muted: '#64748b',
  light: '#94a3b8',
  border: '#cbd5e1',
  headerBg: '#f1f5f9',
};

function fmtPct(value) {
  if (value == null || Number.isNaN(value)) return 'Sin datos';
  return `${value}%`;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function fmtDateTime(d = new Date()) {
  return new Date(d).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncate(text, max = 90) {
  if (!text) return '—';
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function streamPdf(res, filename, buildFn) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const doc = new PDFDocument({ margin: 48, size: 'A4', bufferPages: true });
  doc.pipe(res);
  buildFn(doc);
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    drawPageFooter(doc, i + 1, range.count);
  }
  doc.end();
}

function drawPageFooter(doc, pageNum, totalPages) {
  const y = doc.page.height - 36;
  doc.save();
  doc.strokeColor(COLORS.border).lineWidth(0.5)
    .moveTo(48, y - 8).lineTo(doc.page.width - 48, y - 8).stroke();
  doc.fontSize(7).fillColor(COLORS.light);
  doc.text(
    `${INSTITUTION.system} · ${INSTITUTION.subtitle}`,
    48,
    y,
    { width: doc.page.width - 130, align: 'left' }
  );
  doc.text(`Pág. ${pageNum} de ${totalPages}`, doc.page.width - 100, y, { width: 52, align: 'right' });
  doc.restore();
}

function drawInstitutionalHeader(doc, title, subtitle) {
  doc.rect(48, 48, doc.page.width - 96, 72).fill(COLORS.headerBg);
  doc.fillColor(COLORS.primary).fontSize(11).font('Helvetica-Bold')
    .text(INSTITUTION.name, 60, 58, { width: doc.page.width - 120 });
  doc.fillColor(COLORS.accent).fontSize(9).font('Helvetica')
    .text(INSTITUTION.system, 60, 74);
  doc.fillColor(COLORS.muted).fontSize(8)
    .text(INSTITUTION.subtitle, 60, 88);

  doc.moveDown(3.2);
  doc.fillColor(COLORS.primary).fontSize(16).font('Helvetica-Bold').text(title);
  if (subtitle) {
    doc.moveDown(0.2);
    doc.fillColor(COLORS.muted).fontSize(10).font('Helvetica').text(subtitle);
  }
  doc.moveDown(0.3);
  doc.fillColor(COLORS.light).fontSize(8).text(`Documento generado: ${fmtDateTime()}`);
  doc.moveDown(0.8);
}

function drawSectionTitle(doc, title, number) {
  const label = number != null ? `${number}. ${title}` : title;
  doc.moveDown(0.6);
  doc.fillColor(COLORS.primary).fontSize(11).font('Helvetica-Bold').text(label);
  doc.moveDown(0.15);
  doc.strokeColor(COLORS.border).lineWidth(0.8)
    .moveTo(48, doc.y).lineTo(doc.page.width - 48, doc.y).stroke();
  doc.moveDown(0.35);
  doc.fillColor(COLORS.text).fontSize(9).font('Helvetica');
}

function drawKeyValueGrid(doc, rows, cols = 2) {
  const colWidth = (doc.page.width - 96) / cols;
  const startX = 48;
  let x = startX;
  let y = doc.y;
  const rowHeight = 16;

  rows.forEach((row, i) => {
    if (i > 0 && i % cols === 0) {
      y += rowHeight;
      x = startX;
    }
    doc.fillColor(COLORS.muted).fontSize(8).text(`${row.key}:`, x, y, { width: colWidth - 8, continued: false });
    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica-Bold')
      .text(String(row.value ?? '—'), x, y + 10, { width: colWidth - 8 });
    doc.font('Helvetica');
    x += colWidth;
  });
  doc.y = y + rowHeight + 6;
}

function ensureSpace(doc, needed = 80) {
  if (doc.y + needed > doc.page.height - 60) doc.addPage();
}

function drawTable(doc, headers, rows, colWidths) {
  ensureSpace(doc, 40 + rows.length * 14);
  const startX = 48;
  let y = doc.y;
  const rowH = 14;

  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill(COLORS.headerBg);
  let x = startX;
  headers.forEach((h, i) => {
    doc.fillColor(COLORS.primary).fontSize(7).font('Helvetica-Bold')
      .text(h, x + 3, y + 3, { width: colWidths[i] - 6, lineBreak: false });
    x += colWidths[i];
  });
  y += rowH;
  doc.font('Helvetica');

  rows.forEach((row, ri) => {
    ensureSpace(doc, rowH + 10);
    if (ri % 2 === 1) {
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill('#fafafa');
    }
    x = startX;
    row.forEach((cell, ci) => {
      doc.fillColor(COLORS.text).fontSize(7.5)
        .text(String(cell ?? '—'), x + 3, y + 3, { width: colWidths[ci] - 6, lineBreak: false });
      x += colWidths[ci];
    });
    y += rowH;
  });
  doc.y = y + 6;
}

function drawBulletList(doc, items, indent = 12) {
  items.forEach((item) => {
    ensureSpace(doc, 20);
    doc.fillColor(COLORS.text).fontSize(9)
      .text(`• ${item}`, 48 + indent, doc.y, { width: doc.page.width - 96 - indent });
    doc.moveDown(0.15);
  });
}

function drawMethodologyNote(doc) {
  drawSectionTitle(doc, 'Metodología y trazabilidad');
  const text = [
    'Este reporte consolida evidencias de aprendizaje generadas por el Tutor Virtual de Lectura Crítica.',
    'Las respuestas son evaluadas por IA según cinco habilidades lectoras: comprensión literal, inferencial, pensamiento crítico, vocabulario e idea principal.',
    'Los indicadores de comprensión y progreso se calculan a partir de entregas reales, retroalimentación automática y mapas de habilidades.',
    'Documento apto para seguimiento pedagógico, reuniones de aula y evidencia de mejora continua (ICACIT).',
  ];
  text.forEach((p) => {
    ensureSpace(doc, 30);
    doc.fillColor(COLORS.muted).fontSize(8).text(p, { align: 'justify', lineGap: 2 });
    doc.moveDown(0.3);
  });
}

function generateStudentReportPdf(res, data) {
  streamPdf(res, 'reporte-estudiante.pdf', (doc) => {
    drawInstitutionalHeader(doc, 'Informe individual de aprendizaje', 'Reporte del estudiante');

    const s = data.summary;
    const student = s?.student;
    if (student) {
      drawSectionTitle(doc, 'Identificación del estudiante', 1);
      drawKeyValueGrid(doc, [
        { key: 'Nombre completo', value: `${student.nombres} ${student.apellidos}` },
        { key: 'Correo institucional', value: student.email },
      ]);
    }

    drawSectionTitle(doc, 'Resumen de desempeño', 2);
    drawKeyValueGrid(doc, [
      { key: 'Actividades asignadas', value: s?.assigned },
      { key: 'Completadas', value: s?.completed },
      { key: 'En progreso', value: s?.inProgress },
      { key: 'Vencidas', value: s?.overdue },
      { key: 'Progreso promedio', value: fmtPct(s?.avgProgress) },
      { key: 'Comprensión promedio', value: fmtPct(s?.avgComprehension) },
    ]);

    if (data.skills?.length) {
      drawSectionTitle(doc, 'Mapa de habilidades lectoras', 3);
      drawTable(
        doc,
        ['Habilidad', 'Nivel', 'Resultado', 'Recomendación'],
        data.skills
          .filter((sk) => sk.percentage != null)
          .map((sk) => [
            sk.label,
            sk.levelLabel || '—',
            fmtPct(sk.percentage),
            truncate(sk.recommendation, 55),
          ]),
        [110, 70, 55, doc.page.width - 96 - 235]
      );
    }

    if (data.recentActivities?.length) {
      drawSectionTitle(doc, 'Actividades recientes evaluadas', 4);
      drawTable(
        doc,
        ['Actividad', 'Área', 'Comprensión', 'Fortaleza', 'Mejorar'],
        data.recentActivities.slice(0, 8).map((a) => [
          truncate(a.titulo, 28),
          truncate(a.area, 14),
          a.score != null ? `${a.score}%` : 'Sin nota',
          truncate(a.strongestSkill, 16),
          truncate(a.weakestSkill, 16),
        ]),
        [120, 75, 55, 80, 80]
      );
    }

    if (data.recommendations?.length) {
      drawSectionTitle(doc, 'Recomendaciones personalizadas', 5);
      drawBulletList(doc, data.recommendations);
    }

    drawMethodologyNote(doc);
  });
}

function generateTeacherReportPdf(res, data) {
  const isIndividual = !!data.selectedStudent;
  const filename = isIndividual
    ? `informe-${(data.selectedStudent.nombres || 'estudiante').toLowerCase().replace(/\s+/g, '-')}.pdf`
    : 'reporte-grupo-docente.pdf';

  streamPdf(res, filename, (doc) => {
    const studentName = isIndividual
      ? `${data.selectedStudent.nombres} ${data.selectedStudent.apellidos}`
      : null;

    drawInstitutionalHeader(
      doc,
      isIndividual ? 'Informe individual de seguimiento' : 'Informe pedagógico del grupo',
      isIndividual
        ? `Estudiante: ${studentName}`
        : 'Análisis grupal de avance, habilidades lectoras y evidencias con IA'
    );

    const teacher = data.teacher;
    if (teacher) {
      drawSectionTitle(doc, 'Responsable del reporte', 1);
      drawKeyValueGrid(doc, [
        { key: 'Docente', value: `${teacher.nombres} ${teacher.apellidos}` },
        { key: 'Correo', value: teacher.email || '—' },
        { key: 'Alcance', value: isIndividual ? 'Estudiante individual' : 'Grupo completo' },
        { key: 'Filtros aplicados', value: data.filterLabel || 'Todo el periodo · Todas las áreas' },
      ]);
    }

    const s = data.summary;
    drawSectionTitle(doc, isIndividual ? 'Resumen del estudiante' : 'Resumen ejecutivo del grupo', 2);
    drawKeyValueGrid(doc, [
      { key: isIndividual ? 'Actividades del estudiante' : 'Estudiantes', value: isIndividual ? s?.totalAssignments ?? s?.submitted : s?.totalStudents },
      { key: 'Actividades creadas', value: s?.activitiesAssigned },
      { key: 'Entregas completadas', value: s?.submitted },
      { key: 'Pendientes', value: s?.pending },
      { key: 'Vencidas', value: s?.overdue },
      { key: 'Comprensión promedio', value: fmtPct(s?.avgComprehension) },
      { key: 'Participación', value: s?.participation != null ? `${s.participation}%` : '—' },
      { key: 'Requieren acompañamiento', value: s?.studentsAtRisk ?? 0 },
    ]);

    if (data.alerts?.length) {
      drawSectionTitle(doc, 'Alertas pedagógicas', 3);
      drawBulletList(doc, data.alerts.map((a) => a.message));
    }

    if (data.skills?.length) {
      drawSectionTitle(doc, 'Mapa de habilidades lectoras', 4);
      drawTable(
        doc,
        ['Habilidad', 'Nivel', 'Promedio', 'Recomendación pedagógica'],
        data.skills
          .filter((sk) => sk.percentage != null)
          .map((sk) => [
            sk.label,
            sk.levelLabel || '—',
            fmtPct(sk.percentage),
            truncate(sk.recommendation, 50),
          ]),
        [105, 65, 50, doc.page.width - 96 - 220]
      );
    }

    if (!isIndividual && data.students?.length) {
      drawSectionTitle(doc, 'Seguimiento de estudiantes', 5);
      drawTable(
        doc,
        ['Estudiante', 'Entregas', 'Progreso', 'Comprensión', 'Habilidad débil', 'Estado'],
        data.students.map((st) => [
          truncate(`${st.nombres} ${st.apellidos}`, 22),
          `${st.completed}/${st.total}`,
          `${st.avgProgress}%`,
          st.avgComprehension != null ? `${st.avgComprehension}%` : '—',
          truncate(st.weakestSkill, 14),
          st.statusLabel,
        ]),
        [95, 45, 48, 55, 75, 90]
      );
    }

    if (isIndividual && data.students?.length === 1) {
      const st = data.students[0];
      drawSectionTitle(doc, 'Detalle del estudiante', 5);
      drawKeyValueGrid(doc, [
        { key: 'Entregas completadas', value: `${st.completed}/${st.total}` },
        { key: 'Progreso promedio', value: `${st.avgProgress}%` },
        { key: 'Comprensión promedio', value: fmtPct(st.avgComprehension) },
        { key: 'Habilidad más baja', value: st.weakestSkill || '—' },
        { key: 'Estado pedagógico', value: st.statusLabel },
        { key: 'Correo', value: st.email || '—' },
      ]);
    }

    if (data.areas?.length) {
      drawSectionTitle(doc, 'Desempeño por área y tema', 6);
      drawTable(
        doc,
        ['Área', 'Tema', 'Asignadas', 'Promedio', 'Entregadas', 'Pend.', 'Venc.', 'Habilidad débil'],
        data.areas.slice(0, 12).map((a) => [
          truncate(a.area, 14),
          truncate(a.topic, 16),
          a.assigned,
          fmtPct(a.avgComprehension),
          a.submitted,
          a.pending,
          a.overdue,
          truncate(a.weakestSkill, 12),
        ]),
        [62, 72, 42, 48, 48, 35, 35, 68]
      );
    }

    if (data.difficulty?.length) {
      drawSectionTitle(doc, 'Actividades con mayor dificultad', 7);
      drawTable(
        doc,
        ['Actividad', 'Área', 'Promedio', 'Parciales', 'Incorrectas', 'Sin entregar', 'Nivel'],
        data.difficulty.slice(0, 10).map((a) => [
          truncate(a.titulo, 24),
          truncate(a.area, 12),
          a.avgComprehension != null ? `${a.avgComprehension}%` : 'Sin evaluar',
          a.partialAnswers,
          a.incorrectAnswers,
          a.notSubmitted,
          a.difficulty === 'alta' ? 'Alta' : a.difficulty === 'media' ? 'Media' : 'Baja',
        ]),
        [115, 58, 52, 42, 52, 52, 38]
      );
    }

    if (data.recentAnswers?.length) {
      drawSectionTitle(doc, 'Evidencias de aprendizaje evaluadas por IA', 8);
      data.recentAnswers.slice(0, 6).forEach((ans, i) => {
        ensureSpace(doc, 70);
        doc.fillColor(COLORS.primary).fontSize(8).font('Helvetica-Bold')
          .text(`${i + 1}. ${truncate(ans.activityTitle, 40)} — ${ans.studentName || 'Estudiante'}`);
        doc.font('Helvetica').fillColor(COLORS.muted).fontSize(7.5)
          .text(`Pregunta: ${truncate(ans.question, 100)}`);
        doc.fillColor(COLORS.text)
          .text(`Respuesta: ${truncate(ans.answer, 100)}`);
        doc.fillColor(COLORS.accent)
          .text(`Evaluación IA: ${ans.evaluation === 'correcta' ? 'Correcta' : ans.evaluation === 'parcial' ? 'Parcial' : ans.evaluation === 'incorrecta' ? 'Incorrecta' : 'Sin evaluar'}`);
        if (ans.feedback) {
          doc.fillColor(COLORS.muted).text(`Retroalimentación: ${truncate(ans.feedback, 120)}`);
        }
        doc.moveDown(0.4);
      });
    }

    if (data.recommendations?.length) {
      drawSectionTitle(doc, 'Recomendaciones pedagógicas', 9);
      drawBulletList(doc, data.recommendations);
    }

    drawMethodologyNote(doc);

    doc.moveDown(0.5);
    ensureSpace(doc, 40);
    doc.rect(48, doc.y, doc.page.width - 96, 36).fill('#eef2ff');
    doc.fillColor(COLORS.accent).fontSize(8).font('Helvetica-Bold')
      .text('Certificación ICACIT — Valor del sistema', 56, doc.y + 8, { width: doc.page.width - 112 });
    doc.font('Helvetica').fillColor(COLORS.text).fontSize(7.5)
      .text(
        'Este informe demuestra trazabilidad del aprendizaje, evaluación automatizada con retroalimentación formativa, ' +
        'seguimiento por habilidades lectoras y apoyo a decisiones pedagógicas basadas en evidencia.',
        56,
        doc.y + 20,
        { width: doc.page.width - 112, lineGap: 1 }
      );
  });
}

module.exports = { generateStudentReportPdf, generateTeacherReportPdf };
