import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import Pagination from '@/components/pagination';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface ReportsProps {
    start: string;
    end: string;
    updates: {
        data: UpdateRow[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    done_count: number;
    pending_count: number;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function ActivitiesReports({
    start,
    end,
    updates,
    done_count,
    pending_count,
    filters,
}: ReportsProps) {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [statusValue, setStatusValue] = useState(filters.status || 'all');

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: parseISO(start),
        to: parseISO(end),
    });

    const handleFilter = useCallback(
        (
            search: string,
            status: string,
            fromDate: Date | undefined,
            toDate: Date | undefined,
        ) => {
            router.get(
                '/reports/activities',
                {
                    start: fromDate
                        ? format(fromDate, 'yyyy-MM-dd')
                        : undefined,
                    end: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
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

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== (filters.search || '')) {
                handleFilter(
                    searchValue,
                    statusValue,
                    dateRange?.from,
                    dateRange?.to,
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, statusValue, dateRange, filters.search, handleFilter]);

    const clearFilters = () => {
        setSearchValue('');
        setStatusValue('all');
        setDateRange({ from: parseISO(start), to: parseISO(end) });
        handleFilter('', 'all', parseISO(start), parseISO(end));
    };

    return (
        <>
            <Head title="Activity Reports" />
            <div className="space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Activity Reports
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Deep analysis of activity history and performance.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Updates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {updates.total}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Done
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600">
                                {done_count}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">
                                {pending_count}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search reports..."
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

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'w-full justify-start text-left font-normal sm:w-[280px]',
                                        !dateRange && 'text-muted-foreground',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(
                                                    dateRange.from,
                                                    'LLL dd, y',
                                                )}{' '}
                                                -{' '}
                                                {format(
                                                    dateRange.to,
                                                    'LLL dd, y',
                                                )}
                                            </>
                                        ) : (
                                            format(dateRange.from, 'LLL dd, y')
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={(range) => {
                                        setDateRange(range);
                                        if (range?.from && range?.to) {
                                            handleFilter(
                                                searchValue,
                                                statusValue,
                                                range.from,
                                                range.to,
                                            );
                                        }
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>

                        <Select
                            value={statusValue}
                            onValueChange={(value) => {
                                setStatusValue(value);
                                handleFilter(
                                    searchValue,
                                    value,
                                    dateRange?.from,
                                    dateRange?.to,
                                );
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
                        <p className="text-lg font-medium text-foreground">
                            No reports match your criteria.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your date range or filters.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:hidden">
                            {updates.data.map((update) => (
                                <div
                                    key={update.id}
                                    className="space-y-3 rounded-lg border bg-card p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="text-xs text-muted-foreground">
                                                {format(
                                                    parseISO(
                                                        update.updated_for_date,
                                                    ),
                                                    'MMM dd, yyyy',
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-foreground">
                                                {update.activity.title}
                                            </h3>
                                            <StatusBadge
                                                status={update.status}
                                            />
                                        </div>
                                    </div>
                                    {update.remark && (
                                        <div className="rounded bg-muted/30 p-2 text-sm text-muted-foreground italic">
                                            "{update.remark}"
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 border-t border-border/50 pt-1">
                                        <UserAvatar
                                            name={update.user.name}
                                            className="h-6 w-6"
                                        />
                                        <span className="text-xs font-medium text-foreground">
                                            {update.user.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden overflow-hidden rounded-md border bg-card shadow-sm sm:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Activity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[30%]">
                                            Remark
                                        </TableHead>
                                        <TableHead>Updated By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {updates.data.map((update) => (
                                        <TableRow key={update.id}>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(
                                                    parseISO(
                                                        update.updated_for_date,
                                                    ),
                                                    'MMM dd, yyyy',
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground">
                                                {update.activity.title}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={update.status}
                                                />
                                            </TableCell>
                                            <TableCell className="line-clamp-2 text-sm text-muted-foreground">
                                                {update.remark || '-'}
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

ActivitiesReports.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: '/reports/activities',
        },
    ],
};
