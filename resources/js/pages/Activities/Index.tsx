import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/InputError';

type Activity = {
    id: number;
    title: string;
    description?: string | null;
    is_active: boolean;
    updates: Array<{
        id: number;
        status: 'done' | 'pending';
        remark?: string | null;
        updated_for_date: string;
        user: { id: number; name: string };
    }>;
};

export default function ActivitiesIndex({ activities }: { activities: Activity[] }) {
    const form = useForm({
        title: '',
        description: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/activities', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const getStatusColor = (status: 'done' | 'pending') => {
        return status === 'done' ? 'default' : 'secondary';
    };

    return (
        <>
            <Head title="Activities" />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Create and manage the support activities your team tracks daily.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/activities/history">Daily History</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/reports/activities">Reports</Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Add new activity</CardTitle>
                        <CardDescription>Keep the activity names short, clear, and operational.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={submit}>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="Activity name"
                                    className={form.errors.title ? 'border-destructive' : ''}
                                    disabled={form.processing}
                                />
                                {form.errors.title && <InputError message={form.errors.title} />}
                            </div>

                            <div className="space-y-2 md:col-span-1">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="What this activity measures"
                                    className={form.errors.description ? 'border-destructive' : ''}
                                    disabled={form.processing}
                                />
                                {form.errors.description && <InputError message={form.errors.description} />}
                            </div>

                            <div className="flex items-end">
                                <Button type="submit" disabled={form.processing} className="w-full md:w-auto">
                                    {form.processing ? 'Creating…' : 'Create activity'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    {activities.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">No activities have been created yet.</p>
                                    <p className="text-xs text-muted-foreground mt-1">Create your first activity above to get started.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        activities.map((activity) => (
                            <Card key={activity.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <CardTitle className="text-lg">{activity.title}</CardTitle>
                                        <Badge variant={activity.is_active ? 'default' : 'secondary'}>
                                            {activity.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    {activity.description && <CardDescription>{activity.description}</CardDescription>}
                                </CardHeader>
                                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">Latest update</p>
                                        {activity.updates[0] ? (
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getStatusColor(activity.updates[0].status)} className="text-xs">
                                                    {activity.updates[0].status}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground">by {activity.updates[0].user.name}</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">No updates yet</p>
                                        )}
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/activities/${activity.id}`}>Manage</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

ActivitiesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Activities',
            href: '/activities',
        },
    ],
};
