import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { Search, X, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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
    updates: UpdateRow[];
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
                        <h1 className="text-3xl font-bold tracking-tight">
                            Daily History
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Audit activity updates for a specific day.
                        </p>
                    </div>
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

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'w-full justify-start text-left font-normal sm:w-[220px]',
                                        !selectedDate &&
                                            'text-muted-foreground',
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
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(day) => {
                                        if (day) {
                                            setSelectedDate(day);
                                            handleFilter(
                                                searchValue,
                                                statusValue,
                                                day,
                                            );
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

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
                                <TableHead>Updated On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {updates.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
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
                                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                                            {format(
                                                parseISO(update.created_at),
                                                'h:mm a',
                                            )}
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
