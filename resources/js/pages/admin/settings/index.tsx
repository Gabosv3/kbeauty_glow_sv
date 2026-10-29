import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { admin } from '@/lib/admin-routes';

type Settings = {
    whatsapp: string;
    email: string;
    city: string;
    free_shipping_from: number;
    shipping_cost: number;
    instagram: string;
    tiktok: string;
    facebook: string;
};

type Form = Record<keyof Settings, string>;

export default function SettingsIndex({ settings }: Readonly<{ settings: Settings }>) {
    const form = useForm<Form>({
        whatsapp: settings.whatsapp,
        email: settings.email,
        city: settings.city,
        free_shipping_from: String(settings.free_shipping_from),
        shipping_cost: String(settings.shipping_cost),
        instagram: settings.instagram,
        tiktok: settings.tiktok,
        facebook: settings.facebook,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(admin.settings.update, { preserveScroll: true });
    }

    const field = (key: keyof Form, label: string, props: React.ComponentProps<typeof Input> = {}, hint?: string) => (
        <div className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input id={key} value={form.data[key]} onChange={(e) => form.setData(key, e.target.value)} {...props} />
            {hint && !form.errors[key] && <p className="text-xs text-muted-foreground">{hint}</p>}
            {form.errors[key] && <p className="text-sm text-destructive">{form.errors[key]}</p>}
        </div>
    );

    return (
        <>
            <Head title="Ajustes de la tienda" />
            <form onSubmit={submit} className="max-w-2xl space-y-8 p-6">
                <Heading title="Ajustes de la tienda" description="Datos que se muestran en la tienda y se usan al calcular el envío." variant="small" />

                <section className="space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contacto</h2>
                    {field('whatsapp', 'WhatsApp', { inputMode: 'numeric' }, 'Solo dígitos con código de país. Ej: 50360330849')}
                    {field('email', 'Correo', { type: 'email' })}
                    {field('city', 'Ubicación')}
                </section>

                <section className="space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Envío</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {field('free_shipping_from', 'Envío gratis desde ($)', { type: 'number', min: 0, step: '0.01' })}
                        {field('shipping_cost', 'Costo de envío ($)', { type: 'number', min: 0, step: '0.01' })}
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Redes sociales</h2>
                    {field('instagram', 'Instagram', { type: 'url', placeholder: 'https://instagram.com/…' })}
                    {field('tiktok', 'TikTok', { type: 'url', placeholder: 'https://tiktok.com/@…' })}
                    {field('facebook', 'Facebook', { type: 'url', placeholder: 'https://facebook.com/…' })}
                </section>

                <Button type="submit" disabled={form.processing}>
                    {form.processing ? 'Guardando…' : 'Guardar ajustes'}
                </Button>
            </form>
        </>
    );
}
