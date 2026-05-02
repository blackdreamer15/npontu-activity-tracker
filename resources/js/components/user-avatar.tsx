import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';

export default function UserAvatar({
    name,
    src,
    className,
}: {
    name: string;
    src?: string;
    className?: string;
}) {
    const getInitials = useInitials();
    const initials = getInitials(name);

    return (
        <Avatar className={cn('h-7 w-7', className)}>
            {src && <AvatarImage src={src} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
