import { Head, Link } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import StatusBadge from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import UserAvatar from '@/components/user-avatar';

type DashboardProps = {
    metrics: {
        totalActivities: number;
        activeActivities: number;
        todayUpdates: number;
        todayCompleted: number;
    };
    todayUpdates: Array<{
        id: number;
        activity: { id: number; title: string };
        user: { id: number; name: string };
        status: 'done' | 'pending';
        remark?: string | null;
        created_at: string;
    }>;
    charts: {
        dailyVolume: Array<{ date: string; updates: number }>;
        completionTrend: Array<{ date: string; completed: number }>;
        statusBreakdown: Array<{ name: string; value: number; fill: string }>;
        activityBreakdown: Array<{
            name: string;
            done: number;
            pending: number;
        }>;
    };
};

export default function Dashboard({
    metrics,
    todayUpdates,
    charts,
}: DashboardProps) {
    const todayPending = metrics.todayUpdates - metrics.todayCompleted;
    const completionRate =
        metrics.todayUpdates > 0
            ? Math.round((metrics.todayCompleted / metrics.todayUpdates) * 100)
            : 0;

    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-6 p-4">
                {/* Welcome & Quick Actions */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Welcome back! Here's your activity overview.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild size="sm">
                            <Link href="/activities">Create Activity</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/activities/history">
                                Daily History
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/reports/activities">Reports</Link>
                        </Button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Activities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {metrics.totalActivities}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {metrics.activeActivities} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Today's Updates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {metrics.todayUpdates}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {metrics.todayCompleted} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Completion Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {completionRate}%
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {todayPending} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Status Ratio
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <Badge className="bg-green-600">
                                    {charts.statusBreakdown[0]?.value || 0}
                                </Badge>
                                <Badge variant="secondary">
                                    {charts.statusBreakdown[1]?.value || 0}
                                </Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Done / Pending
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Daily Volume Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Activity Volume</CardTitle>
                            <CardDescription>
                                Updates recorded per day (last 7 days)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={charts.dailyVolume}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="updates" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Completion Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Completion Trend</CardTitle>
                            <CardDescription>
                                Percentage of completed updates (last 7 days)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={charts.completionTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip
                                        formatter={(value) => `${value}%`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Status Breakdown Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Distribution</CardTitle>
                            <CardDescription>
                                All-time done vs pending updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={charts.statusBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) =>
                                            `${name}: ${value}`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {charts.statusBreakdown.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.fill}
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Activity Breakdown Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Completion</CardTitle>
                            <CardDescription>
                                Done vs pending by activity (top 5)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={450}>
                                <BarChart
                                    data={charts.activityBreakdown}
                                    layout="vertical"
                                    margin={{ left: 20, right: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={150}
                                        tickFormatter={(value) =>
                                            value.length > 20
                                                ? `${value.substring(0, 20)}...`
                                                : value
                                        }
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                    />
                                    <Bar
                                        dataKey="done"
                                        fill="#10b981"
                                        radius={[0, 4, 4, 0]}
                                    />
                                    <Bar
                                        dataKey="pending"
                                        fill="#f59e0b"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Updates Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Today's Updates</CardTitle>
                            <CardDescription>
                                Latest activity updates from today
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/activities/history">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {todayUpdates.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-muted-foreground">
                                    No updates recorded yet today.
                                </p>
                                <Button asChild size="sm" className="mt-3">
                                    <Link href="/activities">
                                        Record First Update
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Activity</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="max-w-[200px]">
                                                Remark
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {todayUpdates.map((update) => (
                                            <TableRow key={update.id}>
                                                <TableCell className="font-medium">
                                                    {update.activity.title}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <UserAvatar
                                                            name={
                                                                update.user.name
                                                            }
                                                            className="h-6 w-6"
                                                        />
                                                        <span className="text-sm">
                                                            {update.user.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {new Intl.DateTimeFormat(
                                                        'en-GB',
                                                        {
                                                            timeStyle: 'short',
                                                        },
                                                    ).format(
                                                        new Date(
                                                            update.created_at,
                                                        ),
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        status={update.status}
                                                    />
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate text-sm">
                                                    {update.remark || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
