const PDFDocument = require('pdfkit');

function addSectionTitle(doc, title) {
  doc.moveDown(0.5);
  doc.fontSize(13).fillColor('#1e293b').text(title, { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#334155');
}

function addKeyValue(doc, key, value) {
  doc.text(`${key}: ${value ?? '—'}`);
}

function streamPdf(res, filename, buildFn) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(res);
  buildFn(doc);
  doc.end();
}

function generateStudentReportPdf(res, data) {
  streamPdf(res, 'reporte-estudiante.pdf', (doc) => {
    doc.fontSize(18).fillColor('#312e81').text('Reporte de aprendizaje — Estudiante');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#64748b').text(`Generado: ${new Date().toLocaleString('es-PE')}`);
    doc.moveDown();

    const s = data.summary;
    const student = s?.student;
    if (student) {
      addSectionTitle(doc, 'Datos del estudiante');
      addKeyValue(doc, 'Nombre', `${student.nombres} ${student.apellidos}`);
      addKeyValue(doc, 'Correo', student.email);
    }

    addSectionTitle(doc, 'Resumen general');
    addKeyValue(doc, 'Actividades asignadas', s?.assigned);
    addKeyValue(doc, 'Completadas', s?.completed);
    addKeyValue(doc, 'En progreso', s?.inProgress);
    addKeyValue(doc, 'Vencidas', s?.overdue);
    addKeyValue(doc, 'Progreso promedio', s?.avgProgress != null ? `${s.avgProgress}%` : '—');
    addKeyValue(doc, 'Comprensión promedio', s?.avgComprehension != null ? `${s.avgComprehension}%` : '—');

    if (data.skills?.length) {
      addSectionTitle(doc, 'Mapa de habilidades lectoras');
      data.skills.forEach((sk) => {
        if (sk.percentage == null) return;
        doc.text(`• ${sk.label}: ${sk.percentage}% (${sk.levelLabel || '—'})`);
        if (sk.recommendation) doc.fontSize(9).fillColor('#64748b').text(`  ${sk.recommendation}`).fontSize(10).fillColor('#334155');
      });
    }

    if (data.recentActivities?.length) {
      addSectionTitle(doc, 'Actividades recientes');
      data.recentActivities.slice(0, 5).forEach((a) => {
        doc.text(`• ${a.titulo} (${a.area}) — ${a.score ?? '—'}%`);
      });
    }

    if (data.recommendations?.length) {
      addSectionTitle(doc, 'Recomendaciones personalizadas');
      data.recommendations.forEach((r) => doc.text(`• ${r}`));
    }

    doc.moveDown();
    doc.fontSize(8).fillColor('#94a3b8').text(
      'Evidencia de aprendizaje con IA — Tutor Virtual I.E.P. San Carlos'
    );
  });
}

function generateTeacherReportPdf(res, data) {
  streamPdf(res, 'reporte-grupo.pdf', (doc) => {
    doc.fontSize(18).fillColor('#312e81').text('Reporte del grupo — Docente');
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#64748b').text(`Generado: ${new Date().toLocaleString('es-PE')}`);
    doc.moveDown();

    const teacher = data.teacher;
    if (teacher) {
      addSectionTitle(doc, 'Docente');
      addKeyValue(doc, 'Nombre', `${teacher.nombres} ${teacher.apellidos}`);
    }

    const s = data.summary;
    addSectionTitle(doc, 'Resumen del grupo');
    addKeyValue(doc, 'Estudiantes', s?.totalStudents);
    addKeyValue(doc, 'Actividades asignadas', s?.activitiesAssigned);
    addKeyValue(doc, 'Entregas', s?.submitted);
    addKeyValue(doc, 'Pendientes', s?.pending);
    addKeyValue(doc, 'Vencidas', s?.overdue);
    addKeyValue(doc, 'Comprensión promedio', s?.avgComprehension != null ? `${s.avgComprehension}%` : '—');
    addKeyValue(doc, 'Participación', s?.participation != null ? `${s.participation}%` : '—');

    if (data.skills?.length) {
      addSectionTitle(doc, 'Habilidades lectoras del grupo');
      data.skills.forEach((sk) => {
        if (sk.percentage == null) return;
        doc.text(`• ${sk.label}: ${sk.percentage}% (${sk.levelLabel || '—'})`);
      });
    }

    const atRisk = (data.students || []).filter(
      (st) => st.status === 'requiere_acompanamiento' || st.status === 'sin_actividad'
    );
    if (atRisk.length) {
      addSectionTitle(doc, 'Estudiantes que requieren acompañamiento');
      atRisk.slice(0, 8).forEach((st) => {
        doc.text(`• ${st.nombres} ${st.apellidos} — ${st.statusLabel}`);
      });
    }

    if (data.difficulty?.length) {
      addSectionTitle(doc, 'Actividades con mayor dificultad');
      data.difficulty.slice(0, 5).forEach((a) => {
        doc.text(`• ${a.titulo}: promedio ${a.avgComprehension ?? '—'}%`);
      });
    }

    if (data.recommendations?.length) {
      addSectionTitle(doc, 'Recomendaciones pedagógicas');
      data.recommendations.forEach((r) => doc.text(`• ${r}`));
    }

    doc.moveDown();
    doc.fontSize(8).fillColor('#94a3b8').text(
      'Evidencia de aprendizaje con IA — Tutor Virtual I.E.P. San Carlos'
    );
  });
}

module.exports = { generateStudentReportPdf, generateTeacherReportPdf };
