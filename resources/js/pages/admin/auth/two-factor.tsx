import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { admin } from '@/lib/admin-routes';

export default function AdminTwoFactor() {
    const form = useForm({ code: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/administrativo/verificacion', {
            onFinish: () => form.reset('code'),
        });
    }

    return (
        <>
            <Head title="Verificación en dos pasos" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-cream via-brand-cream-alt to-brand-rose/60 px-4">
                <div className="w-full max-w-sm space-y-6 rounded-3xl border border-brand-rose/60 bg-white p-8 shadow-xl shadow-brand-gold/15">
                    <div className="space-y-1 text-center">
                        <img src="/img/logo.png" alt="KBeauty Glow SV" className="mx-auto mb-2 h-14 w-14 object-contain" />
                        <h1 className="font-display text-2xl font-semibold tracking-tight">Verificación en dos pasos</h1>
                        <p className="text-sm text-muted-foreground">
                            Ingresa el código de 6 dígitos de tu aplicación de autenticación o un código de recuperación.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Código</Label>
                            <Input
                                id="code"
                                autoComplete="one-time-code"
                                autoFocus
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                                required
                            />
                            {form.errors.code && <p className="text-sm text-destructive">{form.errors.code}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={form.processing}>
                            {form.processing ? 'Verificando...' : 'Verificar'}
                        </Button>
                        <a href={admin.login} className="block text-center text-sm text-muted-foreground hover:underline">
                            Volver al inicio de sesión
                        </a>
                    </form>
                </div>
            </div>
        </>
    );
}
