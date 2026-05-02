import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Search, Trash2, X, Settings2 } from 'lucide-react';
import React, { useCallback, useEffect, useState, Suspense } from 'react';
const ActivityUpdateDialog = React.lazy(() =>
    import('@/components/molecules/activity-update-dialog').then((m) => ({
        default: m.ActivityUpdateDialog,
    })),
);
const CreateActivityDialog = React.lazy(() =>
    import('@/components/molecules/create-activity-dialog').then((m) => ({
        default: m.CreateActivityDialog,
    })),
);
import { DeleteDialog } from '@/components/molecules/delete-dialog';
import Pagination from '@/components/pagination';
import StatusBadge from '@/components/status-badge';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import UserAvatar from '@/components/user-avatar';

type Activity = {
    id: number;
    title: string;
    description?: string | null;
    is_active: boolean;
    created_at: string;
    today_status: 'done' | 'pending';
    createdBy?: { id: number; name: string };
    latest_update?: {
        id: number;
        status: 'done' | 'pending';
        created_at: string;
        user: { id: number; name: string; role_title?: string | null };
    } | null;
};

interface IndexProps {
    activities: {
        data: Activity[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        lifecycle?: string;
        status?: string;
    };
}

export default function ActivitiesIndex({ activities, filters }: IndexProps) {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [lifecycleValue, setLifecycleValue] = useState(
        filters.lifecycle || 'all',
    );
    const [statusValue, setStatusValue] = useState(filters.status || 'all');

    const handleFilter = useCallback(
        (search: string, lifecycle: string, status: string) => {
            router.get(
                '/activities',
                {
                    search: search || undefined,
                    lifecycle: lifecycle === 'all' ? undefined : lifecycle,
                    status: status === 'all' ? undefined : status,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        },
        [],
    );

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== (filters.search || '')) {
                handleFilter(searchValue, lifecycleValue, statusValue);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [
        searchValue,
        lifecycleValue,
        statusValue,
        filters.search,
        handleFilter,
    ]);

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

    const clearFilters = () => {
        setSearchValue('');
        setLifecycleValue('all');
        setStatusValue('all');
        handleFilter('', 'all', 'all');
    };

    return (
        <>
            <Head title="Activities" />
            <div className="space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Activities
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Manage and track your company daily operations.
                        </p>
                    </div>
                    <Suspense fallback={<div className="h-9" />}>
                        <CreateActivityDialog />
                    </Suspense>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search activities..."
                                className="pr-9 pl-9"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                aria-label="Search activities"
                            />
                            {searchValue && (
                                <button
                                    type="button"
                                    onClick={() => setSearchValue('')}
                                    className="absolute top-2.5 right-2.5 hover:text-foreground"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        <Select
                            value={lifecycleValue}
                            onValueChange={(value) => {
                                setLifecycleValue(value);
                                handleFilter(searchValue, value, statusValue);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Lifecycle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All States</SelectItem>
                                <SelectItem value="active">
                                    Active Only
                                </SelectItem>
                                <SelectItem value="inactive">
                                    Inactive Only
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusValue}
                            onValueChange={(value) => {
                                setStatusValue(value);
                                handleFilter(
                                    searchValue,
                                    lifecycleValue,
                                    value,
                                );
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Today's Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Today: All</SelectItem>
                                <SelectItem value="done">
                                    Today: Done
                                </SelectItem>
                                <SelectItem value="pending">
                                    Today: Pending
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {(searchValue ||
                            lifecycleValue !== 'all' ||
                            statusValue !== 'all') && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-9 px-2 lg:px-3"
                                aria-label="Reset filters"
                            >
                                Reset
                                <X className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {activities.data.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-md border bg-card p-8 text-center shadow-sm">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <p className="text-lg font-medium text-foreground">
                                No activities match your criteria.
                            </p>
                            <p className="max-w-[300px] text-sm text-muted-foreground">
                                Try adjusting your filters or search terms to
                                find what you're looking for.
                            </p>
                            {(searchValue ||
                                lifecycleValue !== 'all' ||
                                statusValue !== 'all') && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={clearFilters}
                                >
                                    Clear all filters
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Mobile Grid Layout - Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:hidden">
                            {activities.data.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="space-y-4 rounded-lg border bg-card p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-foreground">
                                                {activity.title}
                                            </h3>
                                            {activity.description && (
                                                <p className="line-clamp-1 text-sm text-muted-foreground">
                                                    {activity.description}
                                                </p>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/activities/${activity.id}`}
                                                    >
                                                        Manage
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onSelect={(e) =>
                                                        e.preventDefault()
                                                    }
                                                >
                                                    <DeleteDialog
                                                        trigger={
                                                            <div className="flex w-full items-center">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </div>
                                                        }
                                                        onConfirm={() =>
                                                            router.delete(
                                                                `/activities/${activity.id}`,
                                                            )
                                                        }
                                                    />
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="flex flex-wrap gap-2 border-y border-border/50 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                State:
                                            </span>
                                            <StatusBadge
                                                status={
                                                    activity.is_active
                                                        ? 'active'
                                                        : 'inactive'
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                Today:
                                            </span>
                                            <StatusBadge
                                                status={activity.today_status}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        {activity.latest_update ? (
                                            <div className="flex items-center gap-2">
                                                <UserAvatar
                                                    name={
                                                        activity.latest_update
                                                            .user.name
                                                    }
                                                    className="h-6 w-6"
                                                />
                                                <span className="max-w-[120px] truncate text-xs text-muted-foreground">
                                                    {
                                                        activity.latest_update
                                                            .user.name
                                                    }
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic opacity-50">
                                                No updates
                                            </span>
                                        )}
                                        <Suspense
                                            fallback={
                                                <div className="h-8 w-8" />
                                            }
                                        >
                                            <ActivityUpdateDialog
                                                activityId={activity.id}
                                                activityTitle={activity.title}
                                            />
                                        </Suspense>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden overflow-hidden rounded-md border bg-card shadow-sm sm:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[30%]">
                                            Activity
                                        </TableHead>
                                        <TableHead>State</TableHead>
                                        <TableHead>Today's Status</TableHead>
                                        <TableHead>Last Updated By</TableHead>
                                        <TableHead>Last Updated On</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activities.data.map((activity) => (
                                        <TableRow key={activity.id}>
                                            <TableCell>
                                                <div className="font-medium text-foreground">
                                                    {activity.title}
                                                </div>
                                                {activity.description && (
                                                    <div
                                                        className="mt-1 line-clamp-1 max-w-[300px] text-xs text-muted-foreground"
                                                        title={
                                                            activity.description
                                                        }
                                                    >
                                                        {activity.description}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={
                                                        activity.is_active
                                                            ? 'active'
                                                            : 'inactive'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={
                                                        activity.today_status
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {activity.latest_update ? (
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar
                                                            name={
                                                                activity
                                                                    .latest_update
                                                                    .user.name
                                                            }
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-foreground">
                                                                {
                                                                    activity
                                                                        .latest_update
                                                                        .user
                                                                        .name
                                                                }
                                                            </span>
                                                            {activity
                                                                .latest_update
                                                                .user
                                                                .role_title && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {
                                                                        activity
                                                                            .latest_update
                                                                            .user
                                                                            .role_title
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic opacity-50">
                                                        Never updated
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {activity.latest_update ? (
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDateTime(
                                                            activity
                                                                .latest_update
                                                                .created_at,
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Suspense
                                                        fallback={
                                                            <div className="h-8 w-8" />
                                                        }
                                                    >
                                                        <ActivityUpdateDialog
                                                            activityId={
                                                                activity.id
                                                            }
                                                            activityTitle={
                                                                activity.title
                                                            }
                                                        />
                                                    </Suspense>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-[160px]"
                                                        >
                                                            <DropdownMenuLabel>
                                                                Actions
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/activities/${activity.id}`}
                                                                    className="flex w-full items-center"
                                                                >
                                                                    <Settings2 className="mr-2 h-4 w-4" />
                                                                    Manage
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onSelect={(e) =>
                                                                    e.preventDefault()
                                                                }
                                                            >
                                                                <DeleteDialog
                                                                    trigger={
                                                                        <div className="flex w-full items-center">
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </div>
                                                                    }
                                                                    onConfirm={() =>
                                                                        router.delete(
                                                                            `/activities/${activity.id}`,
                                                                        )
                                                                    }
                                                                />
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <Pagination
                            links={activities.links}
                            meta={{
                                current_page: activities.current_page,
                                last_page: activities.last_page,
                                from: activities.from,
                                to: activities.to,
                                total: activities.total,
                            }}
                        />
                    </>
                )}
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
