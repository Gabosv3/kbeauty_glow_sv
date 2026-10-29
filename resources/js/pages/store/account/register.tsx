import { useForm } from '@inertiajs/react';
import { AuthCard, authField, FieldError } from '@/components/store/auth-card';

export default function CustomerRegister() {
    const form = useForm({ name: '', email: '', phone: '', password: '', password_confirmation: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/store/cuenta/registro', { onFinish: () => form.reset('password', 'password_confirmation') });
    }

    const input = (id: keyof typeof form.data, label: string, type = 'text', autoComplete?: string) => (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
            <input id={id} type={type} required autoComplete={autoComplete} value={form.data[id]} onChange={(e) => form.setData(id, e.target.value)} className={authField} />
            <FieldError message={form.errors[id]} />
        </div>
    );

    return (
        <AuthCard
            title="Crea tu cuenta"
            subtitle="Guardamos tus datos de entrega y podrás ver tus pedidos."
            footer={{ text: '¿Ya tienes cuenta?', label: 'Inicia sesión', href: '/store/cuenta/login' }}
        >
            <form onSubmit={submit} className="space-y-4">
                {input('name', 'Nombre completo', 'text', 'name')}
                {input('email', 'Correo', 'email', 'email')}
                {input('phone', 'Teléfono / WhatsApp', 'tel', 'tel')}
                {input('password', 'Contraseña (mínimo 8)', 'password', 'new-password')}
                {input('password_confirmation', 'Confirmar contraseña', 'password', 'new-password')}
                <button disabled={form.processing} className="w-full rounded-full bg-brand-text py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-gold-dark disabled:opacity-60">
                    {form.processing ? 'Creando…' : 'Crear cuenta'}
                </button>
            </form>
        </AuthCard>
    );
}
