import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { admin } from '@/lib/admin-routes';

type Props = {
    errors?: {
        email?: string;
        password?: string;
    };
};

export default function AdminLogin({ errors }: Props) {
    const form = useForm({
        email: '',
        password: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(admin.login, {
            onFinish: () => form.reset('password'),
        });
    }

    return (
        <>
            <Head title="Acceso Administrativo" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-cream via-brand-cream-alt to-brand-rose/60 px-4">
                <div className="w-full max-w-sm space-y-6 rounded-3xl border border-brand-rose/60 bg-white p-8 shadow-xl shadow-brand-gold/15">
                    <div className="space-y-1 text-center">
                        <img src="/img/logo.png" alt="KBeauty Glow SV" className="mx-auto mb-2 h-14 w-14 object-contain" />
                        <h1 className="font-display text-2xl font-semibold tracking-tight">Área Administrativa</h1>
                        <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                required
                            />
                            {(form.errors.email || errors?.email) && (
                                <p className="text-sm text-destructive">{form.errors.email ?? errors?.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                required
                            />
                            {(form.errors.password || errors?.password) && (
                                <p className="text-sm text-destructive">{form.errors.password ?? errors?.password}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={form.processing}>
                            {form.processing ? 'Ingresando...' : 'Ingresar'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
