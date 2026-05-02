import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Shinkuro';

// Set timezone cookie for the backend to pick up
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

if (!document.cookie.includes('timezone=')) {
    document.cookie = `timezone=${timezone}; path=/; max-age=31536000; SameSite=Lax`;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: false });
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Page not found: ./pages/${name}.tsx`);
        }

        return (page() as Promise<any>).then((module) => {
            const pageComponent = module.default;

            // Layout Resolution Strategy:
            // 1. If page has a function/array layout, use it (standard Inertia).
            // 2. If page has an object (e.g. { breadcrumbs: [] }), use it as metadata and wrap in AppLayout.
            // 3. If page has nothing, wrap in AppLayout.

            const isCustomLayout =
                typeof pageComponent.layout === 'function' ||
                Array.isArray(pageComponent.layout);

            if (!isCustomLayout) {
                const metadata = pageComponent.layout || {}; // This is where breadcrumbs usually live

                pageComponent.layout = (page: any) => {
                    const props = { ...metadata, children: page };

                    switch (true) {
                        case name === 'welcome':
                            return page;
                        case name.startsWith('auth/'):
                            return <AuthLayout {...props} />;
                        case name.startsWith('settings/'):
                            return (
                                <AppLayout {...props}>
                                    <SettingsLayout>{page}</SettingsLayout>
                                </AppLayout>
                            );
                        default:
                            return <AppLayout {...props} />;
                    }
                };
            }

            return pageComponent;
        });
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
