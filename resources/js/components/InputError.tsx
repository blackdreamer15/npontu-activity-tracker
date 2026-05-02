import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export default function InputError({
    message,
    className = '',
}: ComponentPropsWithoutRef<'span'> & {
    message?: string;
}) {
    if (!message) {
        return null;
    }

    return (
        <span className={cn('text-sm font-medium text-destructive', className)}>
            {message}
        </span>
    );
}
