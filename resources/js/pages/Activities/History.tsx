import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Search, X, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Pagination from '@/components/pagination';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
import { cn } from '@/lib/utils';

type UpdateRow = {
    id: number;
    status: 'done' | 'pending';
    remark?: string | null;
    updated_for_date: string;
    created_at: string;
    activity: { id: number; title: string };
    user: { id: number; name: string; role_title?: string | null };
};

interface HistoryProps {
    date: string;
    updates: {
        data: UpdateRow[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function ActivitiesHistory({
    date,
    updates,
    filters,
}: HistoryProps) {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [statusValue, setStatusValue] = useState(filters.status || 'all');
    const [selectedDate, setSelectedDate] = useState<Date>(parseISO(date));

    const handleFilter = useCallback(
        (search: string, status: string, dateParam: Date) => {
            router.get(
                '/activities/history',
                {
                    date: format(dateParam, 'yyyy-MM-dd'),
                    search: search || undefined,
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
                handleFilter(searchValue, statusValue, selectedDate);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, statusValue, selectedDate, filters.search, handleFilter]);

    const formatDateTime = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(new Date(dateString));
    };

    const clearFilters = () => {
        setSearchValue('');
        setStatusValue('all');
        handleFilter('', 'all', selectedDate);
    };

    return (
        <>
            <Head title="Daily History" />
            <div className="space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Daily History
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Review all activity updates for a specific day.
                        </p>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn(
                                    'w-full justify-start text-left font-normal sm:w-[240px]',
                                    !selectedDate && 'text-muted-foreground',
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? (
                                    format(selectedDate, 'PPP')
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (date) {
                                        setSelectedDate(date);
                                        handleFilter(
                                            searchValue,
                                            statusValue,
                                            date,
                                        );
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search updates..."
                                className="pr-9 pl-9"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            {searchValue && (
                                <button
                                    type="button"
                                    onClick={() => setSearchValue('')}
                                    className="absolute top-2.5 right-2.5 hover:text-foreground"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        <Select
                            value={statusValue}
                            onValueChange={(value) => {
                                setStatusValue(value);
                                handleFilter(searchValue, value, selectedDate);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>

                        {(searchValue || statusValue !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-9 px-2 lg:px-3"
                            >
                                Reset
                                <X className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {updates.data.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-md border bg-card p-8 text-center shadow-sm">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <p className="text-lg font-medium text-foreground">
                                No updates found for this date.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Try selecting a different date or clearing your
                                filters.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Mobile List View */}
                        <div className="grid grid-cols-1 gap-4 sm:hidden">
                            {updates.data.map((update) => (
                                <div
                                    key={update.id}
                                    className="space-y-3 rounded-lg border bg-card p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-foreground">
                                                {update.activity.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge
                                                    status={update.status}
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDateTime(
                                                        update.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {update.remark && (
                                        <div className="rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">
                                            {update.remark}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-1">
                                        <UserAvatar
                                            name={update.user.name}
                                            className="h-6 w-6"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-foreground">
                                                {update.user.name}
                                            </span>
                                            {update.user.role_title && (
                                                <span className="text-[10px] leading-none text-muted-foreground">
                                                    {update.user.role_title}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden overflow-hidden rounded-md border bg-card shadow-sm sm:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[30%]">
                                            Activity
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Remark</TableHead>
                                        <TableHead>Logged At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {updates.data.map((update) => (
                                        <TableRow key={update.id}>
                                            <TableCell className="font-medium text-foreground">
                                                {update.activity.title}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={update.status}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar
                                                        name={update.user.name}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-foreground">
                                                            {update.user.name}
                                                        </span>
                                                        {update.user
                                                            .role_title && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {
                                                                    update.user
                                                                        .role_title
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <span className="line-clamp-2 text-sm text-muted-foreground">
                                                    {update.remark || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDateTime(
                                                        update.created_at,
                                                    )}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

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
                    </>
                )}
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
