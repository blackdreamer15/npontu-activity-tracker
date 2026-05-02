import { useForm } from '@inertiajs/react';
import { Edit } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/atoms/input-error-inline';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ActivityUpdateDialogProps {
    activityId: number;
    activityTitle: string;
    trigger?: React.ReactNode;
}

export function ActivityUpdateDialog({
    activityId,
    activityTitle,
    trigger,
}: ActivityUpdateDialogProps) {
    const [open, setOpen] = useState(false);
    const today = new Date().toISOString().slice(0, 10);

    const { data, setData, post, processing, errors, reset } = useForm({
        status: 'pending' as 'done' | 'pending',
        remark: '',
        updated_for_date: today,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/activities/${activityId}/updates`, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                reset('remark', 'status');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-3.5 w-3.5" />
                        Record Update
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Record Update</DialogTitle>
                        <DialogDescription>
                            Add a status update for{' '}
                            <span className="font-semibold text-foreground">
                                {activityTitle}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                                value={data.status}
                                onValueChange={(value) =>
                                    setData(
                                        'status',
                                        value as 'done' | 'pending',
                                    )
                                }
                                disabled={processing}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <InputError message={errors.status} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="updated_for_date">Date *</Label>
                            <Input
                                id="updated_for_date"
                                type="date"
                                value={data.updated_for_date}
                                onChange={(e) =>
                                    setData('updated_for_date', e.target.value)
                                }
                                disabled={processing}
                            />
                            {errors.updated_for_date && (
                                <InputError message={errors.updated_for_date} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remark">Remark</Label>
                            <textarea
                                id="remark"
                                rows={3}
                                placeholder="Add a clear note for handover"
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.remark}
                                onChange={(e) =>
                                    setData('remark', e.target.value)
                                }
                                disabled={processing}
                            />
                            {errors.remark && (
                                <InputError message={errors.remark} />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto"
                        >
                            {processing ? 'Saving...' : 'Save Update'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
