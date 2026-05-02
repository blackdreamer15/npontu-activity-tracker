import { Link } from '@inertiajs/react';
import { BarChart3, Clock3, FolderGit2, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/atoms/app-logo';
import { NavFooter } from '@/components/organisms/nav-footer';
import { NavMain } from '@/components/organisms/nav-main';
import { NavUser } from '@/components/organisms/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Activities',
        href: '/activities',
        icon: FolderGit2,
    },
    {
        title: 'Daily History',
        href: '/activities/history',
        icon: Clock3,
    },
    {
        title: 'Reports',
        href: '/reports/activities',
        icon: BarChart3,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
