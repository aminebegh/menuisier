'use client';

import { useContext, useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../../services/authService';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const submit = async (event) => { event.preventDefault(); setError(''); try { const response = await login(form); signIn(response.data.token); router.push('/dashboard'); } catch { setError('E-mail ou mot de passe incorrect.'); } };
  return <main className="login-page"><div className="login-aside"><span className="eyebrow">Atelier Bois & Ligne</span><h1>Le travail du bois, avec clarté.</h1><p>Un espace simple pour suivre vos commandes, vos matériaux et votre activité.</p></div><form className="login-form" onSubmit={submit}><div className="login-icon"><LockKeyhole size={20} /></div><span className="eyebrow">Espace artisan</span><h2>Ravi de vous revoir</h2><p className="subtitle">Connectez-vous à votre atelier.</p><div className="field"><label htmlFor="email">E-mail</label><input id="email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div><div className="field"><label htmlFor="password">Mot de passe</label><input id="password" type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></div>{error && <div className="notice notice-error">{error}</div>}<button className="button button-primary" type="submit">Se connecter <ArrowRight size={16} /></button></form></main>;
}
'use client';

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
