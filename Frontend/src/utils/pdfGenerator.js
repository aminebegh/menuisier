import jsPDF from 'jspdf';

const money = (value) => {
  const amount = Number(value || 0);
  const formatted = Number.isFinite(amount)
    ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)
    : '0';

  return `${formatted.replace(/\s/g, '.')} DA`;
};

const drawInvoiceHeader = (pdf, title, subtitle) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(242, 235, 225);
  pdf.rect(0, 0, pageWidth, 32, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(25, 25, 25);
  pdf.text(title, 20, 20);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text(subtitle, 20, 28);
};

const drawInfoLine = (pdf, leftLabel, leftValue, rightLabel, rightValue, y) => {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(`${leftLabel} : ${leftValue}`, 20, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text(`${rightLabel} : ${rightValue}`, 110, y);
};

export const generateCommandePdf = (commande) => {
  const pdf = new jsPDF();
  const client = commande.client || {};

  drawInvoiceHeader(pdf, 'Menuiserie Hadj Beghernaout', 'Commande / devis');

  drawInfoLine(pdf, 'Référence', commande.reference || '—', 'Date', new Date(commande.dateLancement || Date.now()).toLocaleDateString('fr-FR'), 48);
  drawInfoLine(pdf, 'Statut', commande.statut || '—', '', '', 58);

  const clientY = 72;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Client', 20, clientY);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  let currentY = clientY + 8;
  pdf.text(`Nom : ${client.nom || '—'}`, 20, currentY);
  currentY += 8;
  pdf.text(`Téléphone : ${client.telephone || '—'}`, 20, currentY);
  currentY += 8;
  pdf.text(`Email : ${client.email || '—'}`, 20, currentY);
  currentY += 8;
  pdf.text(`Adresse : ${client.adresse || '—'}`, 20, currentY);

  const descriptionY = currentY + 16;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Description du projet', 20, descriptionY);

  pdf.setFont('helvetica', 'normal');
  const descriptionLines = pdf.splitTextToSize(commande.description || '—', 165);
  pdf.text(descriptionLines, 20, descriptionY + 8);

  const summaryY = descriptionY + 20 + descriptionLines.length * 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Récapitulatif', 20, summaryY);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  let summaryCurrentY = summaryY + 8;
  pdf.text(`Prix total TTC : ${money(commande.prixTotalTTC)}`, 20, summaryCurrentY);
  summaryCurrentY += 8;
  pdf.text(`Acompte reçu : ${money(commande.acompteRecu)}`, 20, summaryCurrentY);
  summaryCurrentY += 8;
  pdf.text(`Total payé : ${money(commande.totalPaiements || 0)}`, 20, summaryCurrentY);
  summaryCurrentY += 8;
  pdf.text(`Reste à payer : ${money(commande.resteAPayer || 0)}`, 20, summaryCurrentY);

  if (commande.paiements?.length) {
    const paymentY = summaryCurrentY + 18;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Paiements enregistrés', 20, paymentY);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    commande.paiements.forEach((paiement, index) => {
      const y = paymentY + 8 + index * 8;
      pdf.text(`- ${new Date(paiement.date).toLocaleDateString('fr-FR')} : ${money(paiement.montant)} (${paiement.mode || '—'})`, 20, y);
    });
  }

  const finalY = pdf.internal.pageSize.getHeight() - 28;
  pdf.setDrawColor(182, 151, 123);
  pdf.line(20, finalY, 190, finalY);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10);
  pdf.text('Signature et cachet', 20, finalY + 8);

  pdf.save(`commande-${commande.reference || 'document'}.pdf`);
};

export const generateBilanPdf = (data, label) => {
  const pdf = new jsPDF();

  drawInvoiceHeader(pdf, `Bilan ${label}`, 'Synthèse financière');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(`Période : ${data?.periode?.debut ? new Date(data.periode.debut).toLocaleDateString('fr-FR') : '—'} - ${data?.periode?.fin ? new Date(data.periode.fin).toLocaleDateString('fr-FR') : '—'}`, 20, 48);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Synthèse', 20, 60);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  let currentY = 68;
  pdf.text(`Ventes : ${money(data?.totalVentes)}`, 20, currentY);
  currentY += 8;
  pdf.text(`Achats : ${money(data?.totalDepenses)}`, 20, currentY);
  currentY += 8;
  pdf.text(`Marge globale : ${money(data?.margeGlobale)}`, 20, currentY);
  currentY += 8;
  pdf.text(`Nombre de commandes : ${data?.nombreCommandes ?? 0}`, 20, currentY);

  const rows = data?.margeParCommande || [];
  const detailY = currentY + 18;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Détail par commande', 20, detailY);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  rows.forEach((row, index) => {
    const y = detailY + 8 + index * 8;
    pdf.text(`${row.reference || '—'} : vente ${money(row.prixTotalTTC)} • marge ${money(row.marge)}`, 20, y);
  });

  pdf.save(`bilan-${label.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

