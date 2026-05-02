import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Button } from '@/components/ui/button';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
                <header className="absolute top-0 w-full p-6 flex justify-end">
                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Button asChild variant="ghost">
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost">
                                    <Link href={login()}>Log in</Link>
                                </Button>
                                {canRegister && (
                                    <Button asChild variant="outline">
                                        <Link href={register()}>Register</Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <main className="flex flex-col items-center justify-center text-center px-4 md:px-6">
                    <div className="mb-8 inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium">
                        Welcome to Shinkuro
                    </div>
                    
                    <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        Track your daily activities <br className="hidden sm:block" /> with ease.
                    </h1>
                    
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        A modern, clean, and intuitive platform to monitor your daily updates, track completions, and manage team activities efficiently.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {auth.user ? (
                            <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8">
                                <Link href={dashboard()}>
                                    Go to Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8">
                                    <Link href={login()}>
                                        Log in
                                    </Link>
                                </Button>
                                {canRegister && (
                                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8">
                                        <Link href={register()}>
                                            Create an Account
                                        </Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

