import { Head, useForm } from '@inertiajs/react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    enabled: boolean;
    setup: { secret: string; url: string } | null;
    recoveryCodes: string[] | null;
    remainingCodes: number;
};

const base = '/settings/security/two-factor';

function Qr({ url }: Readonly<{ url: string }>) {
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        QRCode.toDataURL(url, { margin: 1, width: 192 }).then((data) => {
            if (active) {
setSrc(data);
}
        });

        return () => {
            active = false;
        };
    }, [url]);

    return src ? <img src={src} alt="Código QR para la aplicación de autenticación" className="size-48 rounded-lg border bg-white" /> : null;
}

function PasswordForm({ method, url, label, variant }: Readonly<{ method: 'post' | 'delete'; url: string; label: string; variant: 'default' | 'destructive' | 'outline' }>) {
    const form = useForm({ password: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const options = { preserveScroll: true, onFinish: () => form.reset('password') };

        if (method === 'delete') {
form.delete(url, options);
} else {
form.post(url, options);
}
    }

    return (
        <form onSubmit={submit} className="space-y-2">
            <Label htmlFor={`password-${method}`}>Confirma tu contraseña para {label.toLowerCase()}</Label>
            <div className="flex gap-2">
                <Input
                    id={`password-${method}`}
                    type="password"
                    autoComplete="current-password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    required
                />
                <Button type="submit" variant={variant} disabled={form.processing}>
                    {label}
                </Button>
            </div>
            {form.errors.password && <p className="text-sm text-destructive">{form.errors.password}</p>}
        </form>
    );
}

export default function Security({ enabled, setup, recoveryCodes, remainingCodes }: Props) {
    const enableForm = useForm({});
    const confirmForm = useForm({ code: '' });

    return (
        <>
            <Head title="Seguridad y 2FA" />
            <h1 className="sr-only">Seguridad y 2FA</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Autenticación en dos pasos"
                    description="Protege tu cuenta pidiendo un código de tu aplicación de autenticación al iniciar sesión."
                />

                {recoveryCodes && (
                    <div className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950">
                        <p className="text-sm font-medium">
                            Guarda estos códigos de recuperación en un lugar seguro. Solo se muestran una vez y cada uno sirve para un solo ingreso.
                        </p>
                        <ul className="grid grid-cols-2 gap-1 font-mono text-sm">
                            {recoveryCodes.map((code) => (
                                <li key={code}>{code}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!enabled && !setup && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">La autenticación en dos pasos está desactivada.</p>
                        <Button onClick={() => enableForm.post(base, { preserveScroll: true })} disabled={enableForm.processing}>
                            Activar 2FA
                        </Button>
                    </div>
                )}

                {!enabled && setup && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Escanea el código QR con Google Authenticator, Authy u otra aplicación compatible y escribe el código de 6 dígitos que genere.
                        </p>
                        <Qr url={setup.url} />
                        <p className="text-sm">
                            ¿No puedes escanearlo? Ingresa esta clave manualmente:{' '}
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono break-all">{setup.secret}</code>
                        </p>
                        <p className="text-sm">
                            <a href={setup.url} className="text-primary underline">
                                Abrir en la aplicación (otpauth://)
                            </a>
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                confirmForm.post(`${base}/confirm`, { preserveScroll: true, onFinish: () => confirmForm.reset('code') });
                            }}
                            className="space-y-2"
                        >
                            <Label htmlFor="code">Código de verificación</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="code"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={confirmForm.data.code}
                                    onChange={(e) => confirmForm.setData('code', e.target.value)}
                                    required
                                />
                                <Button type="submit" disabled={confirmForm.processing}>
                                    Confirmar
                                </Button>
                            </div>
                            {confirmForm.errors.code && <p className="text-sm text-destructive">{confirmForm.errors.code}</p>}
                        </form>
                    </div>
                )}

                {enabled && (
                    <div className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                            La autenticación en dos pasos está activa. Te quedan {remainingCodes} códigos de recuperación.
                        </p>
                        <PasswordForm method="post" url={`${base}/recovery-codes`} label="Regenerar códigos" variant="outline" />
                        <PasswordForm method="delete" url={base} label="Desactivar 2FA" variant="destructive" />
                    </div>
                )}
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Seguridad y 2FA',
            href: '/settings/security',
        },
    ],
};
