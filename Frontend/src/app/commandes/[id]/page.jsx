'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, CreditCard, Download, Pencil, Save, Trash2 } from 'lucide-react';
import { addPaiement, deleteCommande, getCommande, updateCommande, updateStatut } from '../../../services/commandeService';
import { generateCommandePdf } from '../../../utils/pdfGenerator';

const statusOptions = ['Devis', 'Commande', 'Fabrication', 'En cours', 'Livré', 'Annulée'];

export default function CommandeDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Virement');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  const load = async () => {
    try {
      const response = await getCommande(orderId);
      const nextOrder = response.data;
      setOrder(nextOrder);
      setStatus(nextOrder.statut);
      setDraft({
        reference: nextOrder.reference || '',
        description: nextOrder.description || '',
        prixTotalTTC: nextOrder.prixTotalTTC || 0,
        acompteRecu: nextOrder.acompteRecu || 0,
        dateLancement: nextOrder.dateLancement ? new Date(nextOrder.dateLancement).toISOString().slice(0, 10) : '',
        dateLivraison: nextOrder.dateLivraison ? new Date(nextOrder.dateLivraison).toISOString().slice(0, 10) : '',
        client: {
          nom: nextOrder.client?.nom || '',
          telephone: nextOrder.client?.telephone || '',
          email: nextOrder.client?.email || '',
          adresse: nextOrder.client?.adresse || '',
        },
      });
    } catch {
      setMessage('Commande introuvable.');
    }
  };

  useEffect(() => {
    if (!orderId) return;
    load();
  }, [orderId]);

  const pay = async (event) => {
    event.preventDefault();
    try {
      await addPaiement(orderId, { montant: Number(amount), mode, date: new Date().toISOString() });
      setAmount('');
      setMessage('Paiement enregistré.');
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Paiement impossible.');
    }
  };

  const changeStatus = async (event) => {
    try {
      await updateStatut(orderId, event.target.value);
      setMessage('Statut mis à jour.');
      setStatus(event.target.value);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Changement impossible.');
    }
  };

  const saveChanges = async () => {
    try {
      await updateCommande(orderId, {
        ...draft,
        prixTotalTTC: Number(draft.prixTotalTTC),
        acompteRecu: Number(draft.acompteRecu || 0),
      });
      setMessage('Commande mise à jour.');
      setIsEditing(false);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Modification impossible.');
    }
  };

  const removeCommande = async () => {
    const confirmed = window.confirm('Voulez-vous vraiment supprimer cette commande ?');
    if (!confirmed) return;

    try {
      await deleteCommande(orderId);
      window.alert('Commande supprimée avec succès.');
      router.replace('/commandes');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Suppression impossible.');
    }
  };

  const exportPdf = () => {
    if (!order) return;
    generateCommandePdf(order);
    window.alert('PDF de la commande généré.');
  };

  if (!order || !draft) return <div className="empty-state">{message || 'Chargement...'}</div>;

  return (
    <>
      <section className="page-heading">
        <div>
          <Link href="/commandes" className="text-link"><ArrowLeft size={14} /> Commandes</Link>
          <span className="eyebrow">Fiche projet</span>
          <h1>{order.reference}</h1>
          <p className="subtitle">{order.client?.nom} · {order.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="button button-secondary" type="button" onClick={exportPdf}><Download size={15} /> PDF</button>
          <button className="button button-secondary" type="button" onClick={() => setIsEditing((prev) => !prev)}><Pencil size={15} /> Modifier</button>
          <button className="button button-danger" type="button" onClick={removeCommande}><Trash2 size={15} /> Supprimer</button>
        </div>
      </section>

      <section className="metric-grid">
        <Metric label="Prix total TTC" value={order.prixTotalTTC} />
        <Metric label="Total payé" value={order.totalPaiements} />
        <Metric label="Reste à payer" value={order.resteAPayer} />
      </section>

      {isEditing && (
        <div className="panel">
          <div className="panel-heading">
            <div><h2>Modifier la commande</h2><p>Retrouvez la commande et ses informations de référence.</p></div>
          </div>
          <div className="form-grid">
            <Field label="Référence" value={draft.reference} onChange={(event) => setDraft({ ...draft, reference: event.target.value })} />
            <Field label="Date de lancement" type="date" value={draft.dateLancement} onChange={(event) => setDraft({ ...draft, dateLancement: event.target.value })} />
            <Field label="Date de livraison" type="date" value={draft.dateLivraison} onChange={(event) => setDraft({ ...draft, dateLivraison: event.target.value })} />
            <Field label="Prix total TTC" type="number" value={draft.prixTotalTTC} onChange={(event) => setDraft({ ...draft, prixTotalTTC: event.target.value })} />
            <Field label="Acompte reçu" type="number" value={draft.acompteRecu} onChange={(event) => setDraft({ ...draft, acompteRecu: event.target.value })} />
            <Field label="Nom du client" value={draft.client.nom} onChange={(event) => setDraft({ ...draft, client: { ...draft.client, nom: event.target.value } })} />
            <Field label="Téléphone" value={draft.client.telephone} onChange={(event) => setDraft({ ...draft, client: { ...draft.client, telephone: event.target.value } })} />
            <Field label="Email" type="email" value={draft.client.email} onChange={(event) => setDraft({ ...draft, client: { ...draft.client, email: event.target.value } })} />
            <Field label="Adresse" value={draft.client.adresse} onChange={(event) => setDraft({ ...draft, client: { ...draft.client, adresse: event.target.value } })} />
            <div className="field field-full">
              <label htmlFor="description">Description</label>
              <textarea id="description" value={draft.description} rows="3" onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            </div>
            <div className="field field-full form-actions">
              <button className="button button-primary" type="button" onClick={saveChanges}><Save size={16} /> Enregistrer les modifications</button>
            </div>
          </div>
        </div>
      )}

      <section className="content-grid">
        <form className="panel" onSubmit={pay}>
          <div className="panel-heading">
            <div>
              <h2>Ajouter un paiement complémentaire</h2>
              <p>Le solde est recalculé immédiatement.</p>
            </div>
            <CreditCard size={18} color="var(--cocoa)" />
          </div>

          <div className="field">
            <label htmlFor="amount">Montant du paiement</label>
            <input id="amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="mode">Mode de paiement</label>
            <select id="mode" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option>Virement</option>
              <option>Espèces</option>
              <option>Carte bancaire</option>
              <option>Chèque</option>
            </select>
          </div>

          <button className="button button-primary" type="submit"><Check size={16} /> Enregistrer</button>
          {message && <p className="subtitle">{message}</p>}
        </form>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Cycle de vie</h2>
              <p>Une livraison nécessite un solde à zéro.</p>
            </div>
          </div>
          <div className="field">
            <label htmlFor="status">Statut actuel</label>
            <select id="status" value={status} onChange={changeStatus}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="history-list">
            {order.historiqueStatuts?.map((item) => (
              <div className="stat-line" key={item._id || `${item.statut}-${item.date}`}>
                <span>{item.statut}</span>
                <strong>{new Date(item.date).toLocaleDateString('fr-FR')}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value || ''} onChange={onChange} />
    </div>
  );
}

const money = (value) => {
  const amount = Number(value || 0);
  const formatted = Number.isFinite(amount)
    ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)
    : '0';

  return `${formatted.replace(/\s/g, '.')} DA`;
};

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-top"><span>{label}</span></div>
      <div className="metric-value">{money(value)}</div>
    </div>
  );
}
