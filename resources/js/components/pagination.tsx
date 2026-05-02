import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    meta?: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    className?: string;
}

export default function Pagination({
    links,
    meta,
    className,
}: PaginationProps) {
    const hasMultiplePages = links.length > 3;
    const hasResults = meta && meta.total > 0;

    if (!hasResults && !hasMultiplePages) {
        return null;
    }

    return (
        <nav
            role="navigation"
            aria-label="pagination"
            className={cn(
                'flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between',
                className,
            )}
        >
            <div className="order-2 sm:order-1">
                {meta && meta.total > 0 && (
                    <p className="text-sm text-muted-foreground">
                        Showing{' '}
                        <span className="font-medium">{meta.from || 0}</span> to{' '}
                        <span className="font-medium">{meta.to || 0}</span> of{' '}
                        <span className="font-medium">{meta.total}</span>{' '}
                        results
                    </p>
                )}
            </div>

            {hasMultiplePages && (
                <div className="order-1 flex items-center gap-1 sm:order-2">
                    {links.map((link, index) => {
                        const isPrev = link.label.includes('Previous');
                        const isNext = link.label.includes('Next');
                        const label = isPrev ? (
                            <ChevronLeft className="h-4 w-4" />
                        ) : isNext ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            link.label
                        );

                        if (!link.url) {
                            return (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size={isPrev || isNext ? 'default' : 'icon'}
                                    disabled
                                    className={cn(
                                        'h-9 w-9 p-0',
                                        (isPrev || isNext) && 'w-auto px-4',
                                    )}
                                >
                                    {label}
                                </Button>
                            );
                        }

                        if (link.label === '...') {
                            return (
                                <div
                                    key={index}
                                    className="flex h-9 w-9 items-center justify-center"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </div>
                            );
                        }

                        return (
                            <Button
                                key={index}
                                asChild
                                variant={link.active ? 'outline' : 'ghost'}
                                size={isPrev || isNext ? 'default' : 'icon'}
                                className={cn(
                                    'h-9 w-9 p-0',
                                    (isPrev || isNext) && 'w-auto px-4',
                                    link.active &&
                                        'pointer-events-none bg-accent text-accent-foreground',
                                )}
                            >
                                <Link
                                    href={link.url}
                                    preserveScroll
                                    preserveState
                                >
                                    {label}
                                </Link>
                            </Button>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}
