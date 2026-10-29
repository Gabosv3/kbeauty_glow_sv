import { useForm } from '@inertiajs/react';
import { AuthCard, authField, FieldError } from '@/components/store/auth-card';

export default function CustomerLogin() {
    const form = useForm({ email: '', password: '', remember: false });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/store/cuenta/login', { onFinish: () => form.reset('password') });
    }

    return (
        <AuthCard
            title="Inicia sesión"
            subtitle="Revisa tus pedidos y compra más rápido."
            footer={{ text: '¿Aún no tienes cuenta?', label: 'Regístrate', href: '/store/cuenta/registro' }}
        >
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Correo</label>
                    <input id="email" type="email" required autoFocus autoComplete="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className={authField} />
                    <FieldError message={form.errors.email} />
                </div>
                <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Contraseña</label>
                    <input id="password" type="password" required autoComplete="current-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} className={authField} />
                    <FieldError message={form.errors.password} />
                </div>
                <label className="flex items-center gap-2 text-sm text-brand-text/70">
                    <input type="checkbox" checked={form.data.remember} onChange={(e) => form.setData('remember', e.target.checked)} />
                    Mantener sesión iniciada
                </label>
                <button disabled={form.processing} className="w-full rounded-full bg-brand-text py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gold-dark disabled:opacity-60">
                    {form.processing ? 'Entrando…' : 'Entrar'}
                </button>
            </form>
        </AuthCard>
    );
}
