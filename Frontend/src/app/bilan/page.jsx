'use client';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { getBilan } from '../../services/dashboardService';
import { generateBilanPdf } from '../../utils/pdfGenerator';

const money = (value) => {
  const amount = Number(value || 0);
  const formatted = Number.isFinite(amount)
    ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)
    : '0';

  return `${formatted.replace(/\s/g, '.')} DA`;
};

export default function BilanPage() {
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(new Date().getFullYear());

  const loadBilan = async (params = {}) => {
    const response = await getBilan(params);
    setData(response.data);
  };

  useEffect(() => {
    loadBilan({ periode: month });
  }, [month]);

  const exportMonthPdf = async () => {
    const response = await getBilan({ periode: month });
    generateBilanPdf(response.data, `Mensuel ${month}`);
    window.alert('PDF du bilan mensuel généré.');
  };

  const exportYearPdf = async () => {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    const response = await getBilan({ debut: start, fin: end });
    generateBilanPdf(response.data, `Annuel ${year}`);
    window.alert('PDF du bilan annuel généré.');
  };

  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">Lecture financière</span>
          <h1>Bilan financier</h1>
          <p className="subtitle">Une vue nette des ventes, achats et marges de l’atelier.</p>
        </div>
      </section>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Exports PDF</h2>
            <p>Téléchargez le bilan mensuel ou annuel.</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="month">Mois</label>
            <input id="month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="year">Année</label>
            <input id="year" type="number" min="2020" step="1" value={year} onChange={(event) => setYear(Number(event.target.value))} />
          </div>
          <div className="field field-full form-actions">
            <button className="button button-primary" type="button" onClick={exportMonthPdf}><Download size={15} /> PDF mensuel</button>
            <button className="button button-secondary" type="button" onClick={exportYearPdf}><Download size={15} /> PDF annuel</button>
          </div>
        </div>
      </div>

      <section className="metric-grid">
        <Metric label="Ventes" value={data?.totalVentes} />
        <Metric label="Achats matériaux" value={data?.totalDepenses} />
        <Metric label="Marge globale" value={data?.margeGlobale} />
      </section>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Marge par commande</h2>
            <p>Prix total TTC moins les dépenses rattachées.</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Vente</th>
              <th>Dépenses</th>
              <th>Marge</th>
            </tr>
          </thead>
          <tbody>
            {data?.margeParCommande?.map((row) => (
              <tr key={row.commandeId}>
                <td>{row.reference}</td>
                <td>{row.prixTotalTTC} DA</td>
                <td>{row.depenses} DA</td>
                <td><strong>{row.marge} DA</strong></td>
              </tr>
            ))}
          </tbody>
        </table>

        {!data && <div className="empty-state">Chargement du bilan...</div>}
      </div>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-top"><span>{label}</span></div>
      <div className="metric-value">{money(value)}</div>
      <div className="metric-note">Période courante</div>
    </div>
  );
}
