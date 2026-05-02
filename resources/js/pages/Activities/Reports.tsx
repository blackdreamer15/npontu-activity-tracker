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

export default function ActivitiesReports({
    start,
    end,
    updates,
}: {
    start: string;
    end: string;
    updates: UpdateRow[];
}) {
    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const startValue = String(formData.get('start') ?? '');
        const endValue = String(formData.get('end') ?? '');

        router.get(
            '/reports/activities',
            {
                start: startValue,
                end: endValue,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const doneCount = updates.filter(
        (update) => update.status === 'done',
    ).length;
    const pendingCount = updates.filter(
        (update) => update.status === 'pending',
    ).length;

    return (
        <>
            <Head title="Activity Reports" />
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Activity Reports
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Filter activity history by custom date ranges.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Date range</CardTitle>
                        <CardDescription>
                            Choose the period you want to analyze.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="flex flex-wrap items-end gap-3"
                            onSubmit={submit}
                        >
                            <div className="space-y-2">
                                <Label htmlFor="start">Start date</Label>
                                <Input
                                    id="start"
                                    name="start"
                                    type="date"
                                    defaultValue={start}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">End date</Label>
                                <Input
                                    id="end"
                                    name="end"
                                    type="date"
                                    defaultValue={end}
                                />
                            </div>
                            <Button type="submit">Run report</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total updates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {updates.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {doneCount}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">
                                {pendingCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Report data</CardTitle>
                        <CardDescription>
                            Showing updates from {start} to {end}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {updates.length === 0 ? (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    No updates found for this date range.
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Try adjusting your date range.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {updates.map((update) => (
                                    <div
                                        key={update.id}
                                        className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-start md:justify-between"
                                    >
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="font-semibold text-foreground">
                                                {update.activity.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {update.user.name} on{' '}
                                                {update.updated_for_date}
                                            </p>
                                            {update.remark && (
                                                <p className="mt-2 text-sm text-foreground">
                                                    {update.remark}
                                                </p>
                                            )}
                                        </div>
                                        <Badge
                                            variant={
                                                update.status === 'done'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="whitespace-nowrap"
                                        >
                                            {update.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ActivitiesReports.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: '/reports/activities',
        },
    ],
};
