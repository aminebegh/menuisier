'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { getCommandes } from '../../services/commandeService';

const money = (value) => {
  const amount = Number(value || 0);
  const formatted = Number.isFinite(amount)
    ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)
    : '0';

  return `${formatted.replace(/\s/g, '.')} DA`;
};

export default function CommandesPage() {
  const [orders, setOrders] = useState([]); const [search, setSearch] = useState(''); const [error, setError] = useState('');
  useEffect(() => { getCommandes().then((response) => setOrders(response.data)).catch(() => setError('Impossible de charger les commandes.')); }, []);
  const filtered = orders.filter((order) => `${order.reference} ${order.client?.nom || ''}`.toLowerCase().includes(search.toLowerCase()));
  return <><section className="page-heading"><div><span className="eyebrow">Suivi de production</span><h1>Commandes</h1><p className="subtitle">Retrouvez vos projets et l’avancement de chaque réalisation.</p></div><Link href="/commandes/nouvelle" className="button button-primary"><Plus size={17} /> Nouvelle commande</Link></section>{error && <div className="notice notice-error">{error}</div>}<div className="panel"><div className="toolbar"><div className="search-wrap"><Search size={15} /><input className="search-input" placeholder="Rechercher un client ou une référence" value={search} onChange={(event) => setSearch(event.target.value)} /></div><span className="subtitle">{filtered.length} commande(s)</span></div><div className="table-wrap"><table><thead><tr><th>Client</th><th>Description</th><th>Total</th><th>Reste dû</th><th>Statut</th><th>Action</th></tr></thead><tbody>{filtered.map((order) => <tr key={order._id}><td>{order.client?.nom}</td><td>{order.description}</td><td>{money(order.prixTotalTTC)}</td><td>{money(order.resteAPayer)}</td><td><span className="badge">{order.statut}</span></td><td><Link className="button button-secondary" href={`/commandes/${order._id}`}>Voir plus</Link></td></tr>)}</tbody></table>{!filtered.length && <div className="empty-state">Aucune commande trouvée.</div>}</div></div></>;
}
