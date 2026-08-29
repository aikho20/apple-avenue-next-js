'use client'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form'
import { LoginSchema, ProfileUpdateSchema } from '@/utils/validation/schemas/index'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button";
import { ProfileUpdateInitialValues } from '@/utils/validation/initialValues';
import { useToast } from '@/hooks/use-toast';
import { useUpdateProfileMutation } from '@/store/action/accountAction';

export default function ProfileUpdateForm() {
    const { toast } = useToast()
    const [updateProfile, { isLoading }] = useUpdateProfileMutation()
    const form = useForm<z.infer<typeof ProfileUpdateSchema>>({
        resolver: zodResolver(ProfileUpdateSchema),
        defaultValues: ProfileUpdateInitialValues
    })

    const onSubmit = async (values: z.infer<typeof ProfileUpdateSchema>) => {
        const res = await updateProfile({ name: values.name }).unwrap()
        if (res?.message) {
            toast({
                description: res.message
            })
            form.reset()
        } else {
            toast({
                variant: 'destructive',
                description: res.error
            })
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 w-full'>
                <div className={'space-y-4'}>
                    <FormField control={form.control} name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Full Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>

                        )} />
                </div>
                <Button type='submit' className='rounded-full' disabled={isLoading}>{isLoading ? 'Saving..' : 'Save'}</Button>
            </form>
        </Form >

    );
}