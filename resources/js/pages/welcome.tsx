import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

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
                <header className="absolute top-0 flex w-full justify-end p-6">
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

                <main className="flex flex-col items-center justify-center px-4 text-center md:px-6">
                    <div className="mb-8 inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium">
                        Welcome to Shinkuro
                    </div>

                    <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        Track your daily activities{' '}
                        <br className="hidden sm:block" /> with ease.
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        A modern, clean, and intuitive platform to monitor your
                        daily updates, track completions, and manage team
                        activities efficiently.
                    </p>

                    <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                        {auth.user ? (
                            <Button
                                asChild
                                size="lg"
                                className="h-12 w-full px-8 sm:w-auto"
                            >
                                <Link href={dashboard()}>Go to Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-12 w-full px-8 sm:w-auto"
                                >
                                    <Link href={login()}>Log in</Link>
                                </Button>
                                {canRegister && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="h-12 w-full px-8 sm:w-auto"
                                    >
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
