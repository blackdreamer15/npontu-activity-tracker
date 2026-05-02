import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export default function UserAvatar({
    name,
    src,
}: {
    name: string;
    src?: string;
}) {
    const getInitials = useInitials();
    const initials = getInitials(name);

    return (
        <Avatar className="h-7 w-7">
            {src && <AvatarImage src={src} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
