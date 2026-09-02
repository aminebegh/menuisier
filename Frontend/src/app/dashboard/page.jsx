'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpRight, ClipboardList, Euro, Package, Plus, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { getDashboard } from '../../services/dashboardService';

const money = (value) => {
  const amount = Number(value || 0);
  const formatted = Number.isFinite(amount)
    ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)
    : '0';

  return `${formatted.replace(/\s/g, '.')} DA`;
};
const statusClass = (status) => status === 'Livré' ? 'badge-success' : status === 'Fabrication' ? 'badge-warning' : 'badge';
const formatLongDate = () => {
  const text = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return text.charAt(0).toUpperCase() + text.slice(1);
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { getDashboard().then((response) => setData(response.data)).catch(() => setError('Impossible de charger les indicateurs.')); }, []);

  return (
    <>
      <section className="page-heading">
        <div><span className="eyebrow">{formatLongDate()}</span><h1>Bonjour, Hadj Beghernaout</h1><p className="subtitle">Voici l’activité de votre atelier pour ce mois-ci.</p></div>
        <Link href="/commandes/nouvelle" className="button button-primary"><Plus size={17} /> Nouvelle commande</Link>
      </section>
      {error && <div className="notice notice-error">{error}</div>}
      <section className="metric-grid">
        <Metric icon={<Euro size={17} />} label="Chiffre d’affaires" value={money(data?.chiffreAffairesMois)} note="Sur le mois en cours" />
        <Metric icon={<ReceiptText size={17} />} label="Acomptes reçus" value={money(data?.totalAcomptesMois)} note="Encaissements initiaux" />
        <Metric icon={<ClipboardList size={17} />} label="Commandes en cours" value={data?.commandesEnCours ?? '—'} note="À suivre aujourd’hui" />
        <Metric icon={<Package size={17} />} label="Livraisons en retard" value={data?.nombreLivraisonsEnRetard ?? '—'} note="Action à prévoir" alert />
      </section>
      <section className="content-grid">
        <div className="panel"><div className="panel-heading"><div><h2>Dernières commandes</h2><p>Les commandes les plus récemment créées.</p></div><Link href="/commandes" className="text-link">Voir tout <ArrowUpRight size={14} /></Link></div><div className="table-wrap"><table><thead><tr><th>Référence</th><th>Client</th><th>Total</th><th>Reste dû</th><th>Statut</th></tr></thead><tbody>{data?.dernieresCommandes?.length ? data.dernieresCommandes.map((order) => <tr key={order._id}><td><strong>{order.reference}</strong></td><td>{order.client?.nom || 'Client'}</td><td>{money(order.prixTotalTTC)}</td><td>{money(order.resteAPayer)}</td><td><span className={statusClass(order.statut)}>{order.statut}</span></td></tr>) : <tr><td colSpan="5" className="empty-state">Aucune commande récente.</td></tr>}</tbody></table></div></div>
        <div className="panel"><div className="panel-heading"><div><h2>À surveiller</h2><p>Livraisons dont la date est dépassée.</p></div><AlertTriangle size={18} color="var(--danger)" /></div><div className="alert-list">{data?.livraisonsEnRetard?.length ? data.livraisonsEnRetard.map((order) => <div className="alert-item" key={order._id}><AlertTriangle size={15} /><div><strong>{order.reference}</strong><span>{order.client?.nom || 'Client'} · livraison prévue le {new Date(order.dateLivraison).toLocaleDateString('fr-FR')}</span></div></div>) : <div className="empty-state">Aucun retard à signaler.</div>}</div></div>
      </section>
    </>
  );
}

function Metric({ icon, label, value, note, alert }) { return <div className="metric-card"><div className="metric-top"><span>{label}</span><span className={alert ? 'metric-icon metric-alert' : 'metric-icon'}>{icon}</span></div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></div>; }
