import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

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
    updates: UpdateRow[];
    filters: {
        search?: string;
        status?: string;
    };
}

export default function ActivitiesReports({
    start,
    end,
    updates,
    filters,
}: ReportsProps) {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [statusValue, setStatusValue] = useState(filters.status || 'all');

    // Convert strings to Date objects for the calendar
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

    // Debounced search
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

    const doneCount = updates.filter(
        (update) => update.status === 'done',
    ).length;
    const pendingCount = updates.filter(
        (update) => update.status === 'pending',
    ).length;

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
                        <h1 className="text-3xl font-bold tracking-tight">
                            Activity Reports
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Deep analysis of activity history and performance.
                        </p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Updates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {updates.length}
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
                                {doneCount}
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
                                {pendingCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Integrated Premium Toolbar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by activity or remark..."
                                className="pr-9 pl-9"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                aria-label="Search reports"
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

                        {/* Premium Date Range Picker */}
                        <div className="grid w-full gap-2 sm:w-auto">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={'outline'}
                                        className={cn(
                                            'w-full justify-start text-left font-normal sm:w-[280px]',
                                            !dateRange &&
                                                'text-muted-foreground',
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
                                                format(
                                                    dateRange.from,
                                                    'LLL dd, y',
                                                )
                                            )
                                        ) : (
                                            <span>Pick a date</span>
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
                        </div>

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

                <div className="overflow-hidden rounded-md border bg-card shadow-sm">
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
                            {updates.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-1">
                                            <p>
                                                No activity updates match your
                                                criteria.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                updates.map((update) => (
                                    <TableRow key={update.id}>
                                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
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
                                        <TableCell className="text-sm text-muted-foreground">
                                            {update.remark || (
                                                <span className="italic opacity-50">
                                                    No remark
                                                </span>
                                            )}
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
                                                    {update.user.role_title && (
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
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
