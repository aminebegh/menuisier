'use client';
import { useEffect, useState } from 'react';
import { Plus, WalletCards } from 'lucide-react';
import { createDepense, getDepenses } from '../../services/depenseService';

export default function DepensesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ nomArticle: '', montant: '', categorie: '', fournisseur: '' });
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const response = await getDepenses();
      setItems(response.data);
    } catch {
      setMessage('Impossible de charger les achats.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await createDepense({
        ...form,
        montant: Number(form.montant),
      });

      setForm({ nomArticle: '', montant: '', categorie: '', fournisseur: '' });
      setMessage('Achat enregistré.');
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Enregistrement impossible.');
    }
  };

  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">Matières premières</span>
          <h1>Achats & matériaux</h1>
          <p className="subtitle">Suivez les achats de l’atelier, rattachés ou non à une commande.</p>
        </div>
      </section>

      <section className="content-grid">
        <form className="panel" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <h2>Nouvel achat</h2>
              <p>Seuls l’article et le prix sont obligatoires.</p>
            </div>
            <WalletCards size={18} color="var(--cocoa)" />
          </div>

          <div className="form-grid">
            <Field label="Nom de l’article" name="nomArticle" value={form.nomArticle} onChange={(e) => setForm({ ...form, nomArticle: e.target.value })} required />
            <Field label="Prix" name="montant" type="number" min="0" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} required />
            <Field label="Catégorie" name="categorie" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
            <Field label="Fournisseur" name="fournisseur" value={form.fournisseur} onChange={(e) => setForm({ ...form, fournisseur: e.target.value })} />

            <div className="field field-full">
              <button className="button button-primary" type="submit">
                <Plus size={16} /> Enregistrer l’achat
              </button>
            </div>
          </div>

          {message && <p className="subtitle">{message}</p>}
        </form>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Historique</h2>
              <p>{items.length} achat(s) enregistré(s).</p>
            </div>
          </div>

          <div className="alert-list">
            {items.slice(0, 8).map((item) => (
              <div className="stat-line" key={item._id}>
                <span>
                  {item.nomArticle}
                  <small>{item.categorie ? ` · ${item.categorie}` : ''}</small>
                </span>
                <strong>{new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(item.montant || 0)).replace(/\s/g, '.')} DA</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, value, onChange, type = 'text', ...props }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} {...props} />
    </div>
  );
}
