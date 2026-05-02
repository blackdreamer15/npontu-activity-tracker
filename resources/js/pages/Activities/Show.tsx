import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/atoms/input-error-inline';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type ActivityUpdate = {
    id: number;
    status: 'done' | 'pending';
    remark?: string | null;
    updated_for_date: string;
    created_at: string;
    user: { id: number; name: string };
};

type Activity = {
    id: number;
    title: string;
    description?: string | null;
    is_active: boolean;
    created_at: string;
    createdBy?: { id: number; name: string };
    updates: ActivityUpdate[];
};

const today = new Date().toISOString().slice(0, 10);

export default function ActivityShow({ activity }: { activity: Activity }) {
    const activityForm = useForm({
        title: activity.title,
        description: activity.description ?? '',
        is_active: activity.is_active,
    });

    const updateForm = useForm({
        status: 'pending' as 'done' | 'pending',
        remark: '',
        updated_for_date: today,
    });

    const submitActivity = (e: FormEvent) => {
        e.preventDefault();
        activityForm.put(`/activities/${activity.id}`, {
            preserveScroll: true,
        });
    };

    const submitUpdate = (e: FormEvent) => {
        e.preventDefault();
        updateForm.post(`/activities/${activity.id}/updates`, {
            preserveScroll: true,
            onSuccess: () => updateForm.reset('remark', 'status'),
        });
    };

    const removeActivity = () => {
        if (
            !confirm('Delete this activity? This will also remove its updates.')
        ) {
            return;
        }

        router.delete(`/activities/${activity.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={activity.title} />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            <Link
                                href="/activities"
                                className="underline hover:text-foreground"
                            >
                                Activities
                            </Link>{' '}
                            / Manage
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {activity.title}
                        </h1>
                        {activity.description ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {activity.description}
                            </p>
                        ) : null}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/activities/history">
                                Daily History
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/reports/activities">Reports</Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={removeActivity}
                            size="sm"
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit activity</CardTitle>
                            <CardDescription>
                                Update the activity title, description, or
                                active state.
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
                                        className={
                                            activityForm.errors.title
                                                ? 'border-destructive'
                                                : ''
                                        }
                                        disabled={activityForm.processing}
                                    />
                                    {activityForm.errors.title && (
                                        <InputError
                                            message={activityForm.errors.title}
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        placeholder="Describe what this activity checks"
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        value={activityForm.data.description}
                                        onChange={(e) =>
                                            activityForm.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        disabled={activityForm.processing}
                                    />
                                    {activityForm.errors.description && (
                                        <InputError
                                            message={
                                                activityForm.errors.description
                                            }
                                        />
                                    )}
                                </div>

                                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium hover:opacity-80">
                                    <input
                                        type="checkbox"
                                        checked={activityForm.data.is_active}
                                        onChange={(e) =>
                                            activityForm.setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        disabled={activityForm.processing}
                                        className="cursor-pointer"
                                    />
                                    <span>Active</span>
                                </label>

                                <Button
                                    type="submit"
                                    disabled={activityForm.processing}
                                    className="w-full"
                                >
                                    {activityForm.processing
                                        ? 'Saving…'
                                        : 'Save changes'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Add activity update</CardTitle>
                            <CardDescription>
                                Record the current status, remark, and handover
                                date.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submitUpdate}>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={updateForm.data.status}
                                        onValueChange={(value) =>
                                            updateForm.setData(
                                                'status',
                                                value as 'done' | 'pending',
                                            )
                                        }
                                        disabled={updateForm.processing}
                                    >
                                        <SelectTrigger
                                            id="status"
                                            className={
                                                updateForm.errors.status
                                                    ? 'border-destructive'
                                                    : ''
                                            }
                                        >
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="done">
                                                Done
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {updateForm.errors.status && (
                                        <InputError
                                            message={updateForm.errors.status}
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="remark">Remark</Label>
                                    <textarea
                                        id="remark"
                                        rows={4}
                                        placeholder="Add a clear note for handover"
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        value={updateForm.data.remark}
                                        onChange={(e) =>
                                            updateForm.setData(
                                                'remark',
                                                e.target.value,
                                            )
                                        }
                                        disabled={updateForm.processing}
                                    />
                                    {updateForm.errors.remark && (
                                        <InputError
                                            message={updateForm.errors.remark}
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="updated_for_date">
                                        Updated for date *
                                    </Label>
                                    <Input
                                        id="updated_for_date"
                                        type="date"
                                        value={updateForm.data.updated_for_date}
                                        onChange={(e) =>
                                            updateForm.setData(
                                                'updated_for_date',
                                                e.target.value,
                                            )
                                        }
                                        className={
                                            updateForm.errors.updated_for_date
                                                ? 'border-destructive'
                                                : ''
                                        }
                                        disabled={updateForm.processing}
                                    />
                                    {updateForm.errors.updated_for_date && (
                                        <InputError
                                            message={
                                                updateForm.errors
                                                    .updated_for_date
                                            }
                                        />
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={updateForm.processing}
                                    className="w-full"
                                >
                                    {updateForm.processing
                                        ? 'Saving…'
                                        : 'Save update'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Update history</CardTitle>
                        <CardDescription>
                            All updates captured for this activity.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activity.updates.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No updates yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {activity.updates.map((update) => (
                                    <div
                                        key={update.id}
                                        className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-start md:justify-between"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        update.status === 'done'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {update.status}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Intl.DateTimeFormat(
                                                        'en-GB',
                                                        { dateStyle: 'medium' },
                                                    ).format(
                                                        new Date(
                                                            update.updated_for_date,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-sm">
                                                {update.remark || '—'}
                                            </p>
                                        </div>
                                        <div className="text-sm text-muted-foreground md:text-right">
                                            <p>{update.user.name}</p>
                                            <p>
                                                {new Intl.DateTimeFormat(
                                                    'en-GB',
                                                    {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    },
                                                ).format(
                                                    new Date(update.created_at),
                                                )}
                                            </p>
                                        </div>
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
