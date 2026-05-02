import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import React, { Suspense } from 'react';
import InputError from '@/components/atoms/input-error-inline';
import { DeleteDialog } from '@/components/molecules/delete-dialog';
const ActivityUpdateDialog = React.lazy(() =>
    import('@/components/molecules/activity-update-dialog').then((m) => ({
        default: m.ActivityUpdateDialog,
    })),
);
import Pagination from '@/components/pagination';
import StatusBadge from '@/components/status-badge';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import UserAvatar from '@/components/user-avatar';

type ActivityUpdate = {
    id: number;
    status: 'done' | 'pending';
    remark?: string | null;
    updated_for_date: string;
    created_at: string;
    user: { id: number; name: string; role_title?: string | null };
};

type PaginatedData<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
};

type Activity = {
    id: number;
    title: string;
    description?: string | null;
    is_active: boolean;
    created_at: string;
    createdBy?: { id: number; name: string };
};

export default function ActivityShow({
    activity,
    updates,
}: {
    activity: Activity;
    updates: PaginatedData<ActivityUpdate>;
}) {
    const activityForm = useForm({
        title: activity.title,
        description: activity.description ?? '',
        is_active: activity.is_active,
    });

    const submitActivity = (e: FormEvent) => {
        e.preventDefault();
        activityForm.put(`/activities/${activity.id}`, {
            preserveScroll: true,
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(new Date(dateString));
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(dateString));
    };

    return (
        <>
            <Head title={activity.title} />
            <div className="space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {activity.title}
                        </h1>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content: History Table */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-md border bg-card shadow-sm">
                            <div className="flex items-center justify-between border-b px-6 py-4">
                                <div>
                                    <h3 className="leading-none font-semibold tracking-tight">
                                        Update History
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Historical records for this activity.
                                    </p>
                                </div>
                                <Suspense fallback={<div className="h-9" />}>
                                    <ActivityUpdateDialog
                                        activityId={activity.id}
                                        activityTitle={activity.title}
                                        trigger={
                                            <Button size="sm">
                                                Add New Update
                                            </Button>
                                        }
                                    />
                                </Suspense>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Target Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[40%]">
                                            Remark
                                        </TableHead>
                                        <TableHead>Updated By</TableHead>
                                        <TableHead>Updated On</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {updates.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-32 text-center text-muted-foreground"
                                            >
                                                No updates yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        updates.data.map((update) => (
                                            <TableRow key={update.id}>
                                                <TableCell className="text-sm font-medium text-foreground">
                                                    {formatDate(
                                                        update.updated_for_date,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        status={update.status}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {update.remark || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar
                                                            name={
                                                                update.user.name
                                                            }
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-foreground">
                                                                {
                                                                    update.user
                                                                        .name
                                                                }
                                                            </span>
                                                            {update.user
                                                                .role_title && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {
                                                                        update
                                                                            .user
                                                                            .role_title
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDateTime(
                                                        update.created_at,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            <div className="border-t px-6">
                                <Pagination
                                    links={updates.links}
                                    meta={{
                                        current_page: updates.current_page,
                                        last_page: updates.last_page,
                                        from: updates.from,
                                        to: updates.to,
                                        total: updates.total,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Admin Tasks */}
                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Activity Details
                                </CardTitle>
                                <CardDescription>
                                    Modify basic activity information.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    className="space-y-4"
                                    onSubmit={submitActivity}
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={activityForm.data.title}
                                            onChange={(e) =>
                                                activityForm.setData(
                                                    'title',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter activity title"
                                            disabled={activityForm.processing}
                                        />
                                        {activityForm.errors.title && (
                                            <InputError
                                                message={
                                                    activityForm.errors.title
                                                }
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            placeholder="Describe this activity"
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={
                                                activityForm.data.description
                                            }
                                            onChange={(e) =>
                                                activityForm.setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            disabled={activityForm.processing}
                                            aria-label="Activity description"
                                        />
                                        {activityForm.errors.description && (
                                            <InputError
                                                message={
                                                    activityForm.errors
                                                        .description
                                                }
                                            />
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={
                                                activityForm.data.is_active
                                            }
                                            onChange={(e) =>
                                                activityForm.setData(
                                                    'is_active',
                                                    e.target.checked,
                                                )
                                            }
                                            disabled={activityForm.processing}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            aria-label="Is active"
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="cursor-pointer"
                                        >
                                            Active
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={activityForm.processing}
                                        className="w-full"
                                    >
                                        {activityForm.processing
                                            ? 'Saving…'
                                            : 'Update Activity'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg text-destructive">
                                    Danger Zone
                                </CardTitle>
                                <CardDescription>
                                    Irreversible administrative actions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DeleteDialog
                                    title="Delete Activity?"
                                    description="This will permanently remove this activity and all its history. This action cannot be undone."
                                    trigger={
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            className="w-full gap-2"
                                            aria-label="Delete activity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Activity
                                        </Button>
                                    }
                                    onConfirm={() =>
                                        router.delete(
                                            `/activities/${activity.id}`,
                                        )
                                    }
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

ActivityShow.layout = {
    breadcrumbs: [
        {
            title: 'Activities',
            href: '/activities',
        },
        {
            title: 'Manage',
            href: '#',
        },
    ],
};
