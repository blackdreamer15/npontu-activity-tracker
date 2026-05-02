import { AppContent } from '@/components/organisms/app-content';
import { AppHeader } from '@/components/organisms/app-header';
import { AppShell } from '@/components/organisms/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent variant="header">{children}</AppContent>
        </AppShell>
    );
}
