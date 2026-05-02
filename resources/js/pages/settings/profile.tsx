import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/atoms/heading';
import InputError from '@/components/atoms/input-error-inline';
import DeleteUser from '@/components/organisms/delete-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile information"
                    description="Update your name and email address"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                    aria-label="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                    aria-label="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <div className="mt-4 grid gap-4 border-t pt-6 md:grid-cols-2">
                                <div className="col-span-full">
                                    <h3 className="text-lg font-medium text-foreground">
                                        Bio Details
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Required for activity tracking compliance.
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="staff_id">Staff ID</Label>
                                    <Input
                                        id="staff_id"
                                        className="mt-1 block w-full"
                                        defaultValue={(auth.user.staff_id as string) || ''}
                                        name="staff_id"
                                        placeholder="e.g. EMP-001"
                                        aria-label="Staff ID"
                                    />
                                    <InputError className="mt-2" message={errors.staff_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        className="mt-1 block w-full"
                                        defaultValue={(auth.user.phone as string) || ''}
                                        name="phone"
                                        placeholder="e.g. +1 234 567 8900"
                                        aria-label="Phone Number"
                                    />
                                    <InputError className="mt-2" message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        className="mt-1 block w-full"
                                        defaultValue={(auth.user.department as string) || ''}
                                        name="department"
                                        placeholder="e.g. Application Support"
                                        aria-label="Department"
                                    />
                                    <InputError className="mt-2" message={errors.department} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role_title">Role Title</Label>
                                    <Input
                                        id="role_title"
                                        className="mt-1 block w-full"
                                        defaultValue={(auth.user.role_title as string) || ''}
                                        name="role_title"
                                        placeholder="e.g. Support Engineer"
                                        aria-label="Role Title"
                                    />
                                    <InputError className="mt-2" message={errors.role_title} />
                                </div>
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                type="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to resend the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
