import { Head, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UpdateRow = {
    id: number;
    status: 'done' | 'pending';
    remark?: string | null;
    updated_for_date: string;
    created_at: string;
    activity: { id: number; title: string };
    user: { id: number; name: string };
};

export default function ActivitiesHistory({
    date,
    updates,
}: {
    date: string;
    updates: UpdateRow[];
}) {
    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const selectedDate = String(formData.get('date') ?? date);

        router.get(
            '/activities/history',
            { date: selectedDate },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const formatDateTime = (dateString: string) => {
        return new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(dateString));
    };

    return (
        <>
            <Head title="Daily History" />
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Daily History
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        See everything updated for a specific day.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter by date</CardTitle>
                        <CardDescription>
                            Choose the day you want to review.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="flex flex-wrap items-end gap-3"
                            onSubmit={submit}
                        >
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    defaultValue={date}
                                />
                            </div>
                            <Button type="submit">View history</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    {updates.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No updates found for this date.
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Try selecting a different date.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {updates.map((update) => (
                                <Card
                                    key={update.id}
                                    className="transition-shadow hover:shadow-md"
                                >
                                    <div className="p-6">
                                        <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-foreground">
                                                    {update.activity.title}
                                                </h3>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {update.user.name} •{' '}
                                                    {formatDateTime(
                                                        update.created_at,
                                                    )}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    update.status === 'done'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {update.status}
                                            </Badge>
                                        </div>
                                        {update.remark && (
                                            <p className="mt-2 rounded bg-muted p-3 text-sm text-foreground">
                                                {update.remark}
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ActivitiesHistory.layout = {
    breadcrumbs: [
        {
            title: 'Activities',
            href: '/activities',
        },
        {
            title: 'Daily History',
            href: '/activities/history',
        },
    ],
};
