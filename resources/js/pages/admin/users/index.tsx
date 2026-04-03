import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { admin } from '@/lib/admin-routes';

type Member = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
};

type Props = {
    members: Member[];
};

const roleColors: Record<string, string> = {
    owner: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    member: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const roleLabels: Record<string, string> = {
    owner: 'Propietario',
    admin: 'Administrador',
    member: 'Miembro',
};

export default function UsersIndex({ members }: Props) {
    return (
        <>
            <Head title="Usuarios" />
            <div className="space-y-6 p-6">
                <Heading
                    title="Usuarios"
                    description="Miembros del equipo con acceso al sistema."
                    variant="small"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                        <Card key={member.id}>
                            <CardContent className="flex items-center gap-4 pt-6">
                                <Avatar className="size-12">
                                    <AvatarImage src={member.avatar ?? undefined} alt={member.name} />
                                    <AvatarFallback>
                                        {member.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{member.name}</p>
                                    <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                                    <span
                                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[member.role] ?? roleColors.member}`}
                                    >
                                        {roleLabels[member.role] ?? member.role}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {members.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                        <Users className="size-10" />
                        <p>No hay usuarios en este equipo.</p>
                    </div>
                )}
            </div>
        </>
    );
}

UsersIndex.layout = () => ({
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Usuarios', href: admin.users.index },
    ],
});
