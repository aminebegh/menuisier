'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createCommande, getCommandes } from '../../../services/commandeService';

export default function NouvelleCommandePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    reference: 'CMD-0001',
    description: '',
    prixTotalTTC: '',
    acompteRecu: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadNextReference = async () => {
      try {
        const response = await getCommandes();
        const commandes = response.data || [];
        const lastCommande = [...commandes].sort((a, b) => new Date(b.createdAt || b.dateLancement) - new Date(a.createdAt || a.dateLancement))[0];

        if (!lastCommande?.reference) return;

        const match = lastCommande.reference.match(/(\d+)/);
        const nextNumber = match ? Number(match[1]) + 1 : 1;
        setForm((current) => ({ ...current, reference: `CMD-${String(nextNumber).padStart(4, '0')}` }));
      } catch {
        setForm((current) => ({ ...current, reference: 'CMD-0001' }));
      }
    };

    loadNextReference();
  }, []);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await createCommande({
        reference: form.reference,
        description: form.description,
        prixTotalTTC: Number(form.prixTotalTTC),
        acompteRecu: Number(form.acompteRecu || 0),
        client: {
          nom: form.nom,
          telephone: form.telephone,
          email: form.email,
          adresse: form.adresse,
        },
      });

      window.alert('Commande créée avec succès.');
      router.push('/commandes');
    } catch (error) {
      const text = error.response?.data?.message || 'La création a échoué.';
      setMessage(text);
      window.alert(text);
    }
  };

  return (
    <>
      <section className="page-heading">
        <div>
          <Link href="/commandes" className="text-link"><ArrowLeft size={14} /> Commandes</Link>
          <h1>Nouvelle commande</h1>
          <p className="subtitle">Le client et sa commande sont enregistrés ensemble.</p>
        </div>
      </section>

      <form className="panel" onSubmit={submit}>
        <div className="panel-heading">
          <div>
            <h2>Informations du client</h2>
            <p>Un client est toujours rattaché à une commande.</p>
          </div>
        </div>

        <div className="form-grid">
          <Field label="Nom" name="nom" value={form.nom} onChange={update} required />
          <Field label="Téléphone" name="telephone" value={form.telephone} onChange={update} required />
          <Field label="E-mail" name="email" type="email" value={form.email} onChange={update} />
          <Field label="Adresse" name="adresse" value={form.adresse} onChange={update} />

          <div className="field field-full">
            <label htmlFor="description">Description du projet</label>
            <textarea id="description" name="description" rows="3" value={form.description} onChange={update} required />
          </div>

          <Field label="Référence" name="reference" value={form.reference} onChange={update} readOnly />
          <Field label="Prix total TTC" name="prixTotalTTC" type="number" min="0" value={form.prixTotalTTC} onChange={update} required />
          <Field label="Acompte reçu" name="acompteRecu" type="number" min="0" value={form.acompteRecu} onChange={update} />

          <div className="field field-full form-actions">
            <button className="button button-primary" type="submit"><Save size={16} /> Enregistrer la commande</button>
            {message && <span className="subtitle">{message}</span>}
          </div>
        </div>
      </form>
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
