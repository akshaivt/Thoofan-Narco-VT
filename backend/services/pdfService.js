const PDFDocument = require('pdfkit');

/**
 * Builds a professional PDF report for a complaint and pipes it to the response stream.
 * 
 * @param {object} complaint 
 * @param {object} res write stream (express response)
 */
const buildComplaintPDF = (complaint, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Pipe to response stream
  doc.pipe(res);

  // 1. Header Banner
  doc.fillColor('#0B2545')
     .fontSize(22)
     .font('Helvetica-Bold')
     .text('NARCOVT', { align: 'center' });
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#B5893D')
     .text('AI-POWERED CONFIDENTIAL DRUG REPORTING CONSOLE', { align: 'center', characterSpacing: 1.5 });
     
  doc.moveDown(1.5);

  // Draw separator line
  doc.strokeColor('#e2e8f0')
     .lineWidth(1)
     .moveTo(50, doc.y)
     .lineTo(562, doc.y)
     .stroke();
     
  doc.moveDown(1.5);

  // 2. Incident Summary Metadata Block
  doc.fillColor('#0B2545')
     .fontSize(14)
     .font('Helvetica-Bold')
     .text('Intel File Report Summary');
     
  doc.moveDown(0.5);

  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(`Complaint ID: `, { continued: true }).font('Helvetica-Bold').text(complaint.complaintId);
  doc.font('Helvetica').text(`Current Status: `, { continued: true }).font('Helvetica-Bold').fillColor(
    complaint.status === 'Resolved' ? '#059669' :
    complaint.status === 'Under Investigation' ? '#d97706' : '#dc2626'
  ).text(complaint.status).fillColor('#334155').font('Helvetica');
  doc.text(`Case Priority: `, { continued: true }).font('Helvetica-Bold').text(complaint.priority);
  doc.font('Helvetica').text(`Incident Date & Time: `, { continued: true }).font('Helvetica-Bold').text(
    `${new Date(complaint.incidentDate).toLocaleDateString()} at ${complaint.incidentTime}`
  );
  doc.font('Helvetica').text(`Date Filed: `, { continued: true }).font('Helvetica-Bold').text(
    new Date(complaint.createdAt).toLocaleString()
  );
  doc.font('Helvetica').text(`AI Risk Rating: `, { continued: true }).font('Helvetica-Bold').fillColor(
    complaint.riskLevel === 'Critical' || complaint.riskLevel === 'High' ? '#dc2626' : '#334155'
  ).text(complaint.riskLevel || 'Medium').fillColor('#334155');

  doc.moveDown(1.5);

  // 3. Location specifications
  doc.fillColor('#0B2545')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Geographic Coordinates & Details');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(`District: ${complaint.district}`);
  doc.text(`Place Name: ${complaint.place}`);
  doc.text(`Full Address: ${complaint.address}`);
  if (complaint.latitude && complaint.longitude) {
    doc.text(`GPS Coordinates: Lat ${complaint.latitude}, Lng ${complaint.longitude}`);
  }
  if (complaint.nearestPoliceStation) {
    doc.text(`Nearest Police Station: ${complaint.nearestPoliceStation}`);
  }

  doc.moveDown(1.5);

  // 4. Incident Description
  doc.fillColor('#0B2545')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Report Details & Incident Description');
  doc.moveDown(0.5);
  doc.fontSize(10)
     .font('Helvetica-Oblique')
     .fillColor('#475569')
     .text(complaint.description, { leading: 14 });

  doc.moveDown(1.5);

  // 5. AI automated analysis summary
  doc.fillColor('#0B2545')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('AI Automated Intelligence Analysis');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(`AI Categorization: `, { continued: true }).font('Helvetica-Bold').text(complaint.aiCategory || 'N/A');
  doc.font('Helvetica').text(`Fuzzy Duplicate Score: `, { continued: true }).font('Helvetica-Bold').text(
    complaint.duplicateScore !== null ? `${complaint.duplicateScore}% Similarity` : '0%'
  );
  doc.font('Helvetica').text('AI Generated Summary:', { underline: true });
  doc.fontSize(9.5).font('Helvetica-Oblique').fillColor('#475569').text(
    complaint.aiSummary || 'Analysis summary not compiled.', { leading: 13 }
  );

  doc.moveDown(1.5);

  // 6. Timeline Case History
  doc.fillColor('#0B2545')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Audit Timeline Checkpoints');
  doc.moveDown(0.5);
  doc.fontSize(9).font('Helvetica').fillColor('#334155');

  if (complaint.timeline && complaint.timeline.length > 0) {
    complaint.timeline.forEach((item, index) => {
      doc.text(`${index + 1}. [${new Date(item.updatedAt).toLocaleString()}] Status: ${item.status}`);
    });
  } else {
    doc.text('No status updates recorded.');
  }

  doc.moveDown(1.5);

  // 7. Official Case Notes logs
  doc.fillColor('#0B2545')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Official Investigation Logs & Updates');
  doc.moveDown(0.5);
  doc.fontSize(9.5).font('Helvetica').fillColor('#334155');

  if (complaint.notes && complaint.notes.length > 0) {
    complaint.notes.forEach((noteObj, index) => {
      doc.text(`${index + 1}. [${new Date(noteObj.createdAt).toLocaleDateString()}] Note: "${noteObj.note}"`);
    });
  } else {
    doc.text('No official notes logged in the central file.');
  }

  // Footer page label
  doc.fontSize(8)
     .fillColor('#94a3b8')
     .text('CONFIDENTIAL GOVERNMENT REPORT - FOR SECURITY AUDIT ONLY', 50, 720, { align: 'center' });

  doc.end();
};

module.exports = {
  buildComplaintPDF
};
