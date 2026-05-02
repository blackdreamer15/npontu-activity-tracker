import { Badge } from '@/components/ui/badge';

type Status = 'done' | 'pending' | 'active' | 'inactive';

export default function StatusBadge({ status }: { status: Status }) {
    switch (status) {
        case 'done':
            return (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50">
                    Done
                </Badge>
            );
        case 'pending':
            return (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50">
                    Pending
                </Badge>
            );
        case 'active':
            return (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                    Active
                </Badge>
            );
        case 'inactive':
            return <Badge variant="secondary">Inactive</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
