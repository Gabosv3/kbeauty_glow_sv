import { useForm } from '@inertiajs/react';
import { AuthCard, authField, FieldError } from '@/components/store/auth-card';

export default function CustomerTwoFactor() {
    const form = useForm({ code: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/store/cuenta/verificacion', { onFinish: () => form.reset('code') });
    }

    return (
        <AuthCard
            title="Verificación en dos pasos"
            subtitle="Ingresa el código de tu aplicación de autenticación o un código de recuperación."
            footer={{ text: '¿Quieres empezar de nuevo?', label: 'Volver a iniciar sesión', href: '/store/cuenta/login' }}
        >
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="code" className="mb-1.5 block text-sm font-medium">Código</label>
                    <input id="code" required autoFocus autoComplete="one-time-code" value={form.data.code} onChange={(e) => form.setData('code', e.target.value)} className={authField} />
                    <FieldError message={form.errors.code} />
                </div>
                <button disabled={form.processing} className="w-full rounded-full bg-brand-text py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gold-dark disabled:opacity-60">
                    {form.processing ? 'Verificando…' : 'Verificar'}
                </button>
            </form>
        </AuthCard>
    );
}
