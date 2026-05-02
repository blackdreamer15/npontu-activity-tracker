import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Search, Settings2, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ActivityUpdateDialog } from '@/components/molecules/activity-update-dialog';
import { CreateActivityDialog } from '@/components/molecules/create-activity-dialog';
import StatusBadge from '@/components/status-badge';
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
    activities: Activity[];
    filters: {
        search?: string;
        lifecycle?: string;
        status?: string;
    };
}

export default function ActivitiesIndex({ activities, filters }: IndexProps) {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [lifecycleValue, setLifecycleValue] = useState(filters.lifecycle || 'all');
    const [statusValue, setStatusValue] = useState(filters.status || 'all');

    const handleFilter = useCallback((search: string, lifecycle: string, status: string) => {
        router.get(
            '/activities',
            { 
                search: search || undefined, 
                lifecycle: lifecycle === 'all' ? undefined : lifecycle,
                status: status === 'all' ? undefined : status 
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            }
        );
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== (filters.search || '')) {
                handleFilter(searchValue, lifecycleValue, statusValue);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, lifecycleValue, statusValue, filters.search, handleFilter]);

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
                        <h1 className="text-3xl font-bold tracking-tight">
                            Activities
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Manage and track your company daily operations.
                        </p>
                    </div>
                    <CreateActivityDialog />
                </div>

                {/* Integrated Dual-Filter Toolbar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search activities..."
                                className="pl-9 pr-9"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                aria-label="Search activities"
                            />
                            {searchValue && (
                                <button
                                    type="button"
                                    onClick={() => setSearchValue('')}
                                    className="absolute right-2.5 top-2.5 hover:text-foreground"
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
                                <SelectItem value="active">Active Only</SelectItem>
                                <SelectItem value="inactive">Inactive Only</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusValue}
                            onValueChange={(value) => {
                                setStatusValue(value);
                                handleFilter(searchValue, lifecycleValue, value);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Today's Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Today: All</SelectItem>
                                <SelectItem value="done">Today: Done</SelectItem>
                                <SelectItem value="pending">Today: Pending</SelectItem>
                            </SelectContent>
                        </Select>

                        {(searchValue || lifecycleValue !== 'all' || statusValue !== 'all') && (
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

                <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%]">Activity</TableHead>
                                <TableHead>Activity State</TableHead>
                                <TableHead>Today's Status</TableHead>
                                <TableHead>Last Updated By</TableHead>
                                <TableHead>Last Updated On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-1">
                                            <p>No activities match your criteria.</p>
                                            {(searchValue || lifecycleValue !== 'all' || statusValue !== 'all') && (
                                                <Button 
                                                    variant="link" 
                                                    onClick={clearFilters}
                                                >
                                                    Clear all filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                activities.map((activity) => (
                                    <TableRow key={activity.id}>
                                        <TableCell>
                                            <div className="font-medium text-foreground">
                                                {activity.title}
                                            </div>
                                            {activity.description && (
                                                <div className="mt-1 text-sm text-muted-foreground line-clamp-1">
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
                                            <StatusBadge status={activity.today_status} />
                                        </TableCell>
                                        <TableCell>
                                            {activity.latest_update ? (
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar name={activity.latest_update.user.name} />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-foreground">
                                                            {activity.latest_update.user.name}
                                                        </span>
                                                        {activity.latest_update.user.role_title && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {activity.latest_update.user.role_title}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic opacity-50">Never updated</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {activity.latest_update ? (
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDateTime(activity.latest_update.created_at)}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <ActivityUpdateDialog 
                                                    activityId={activity.id} 
                                                    activityTitle={activity.title} 
                                                />
                                                
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/activities/${activity.id}`} className="flex w-full items-center">
                                                                <Settings2 className="mr-2 h-4 w-4" />
                                                                Manage
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            variant="destructive"
                                                            onSelect={() => {
                                                                if (confirm('Are you sure you want to delete this activity and all its history?')) {
                                                                    router.delete(`/activities/${activity.id}`, { preserveScroll: true });
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
