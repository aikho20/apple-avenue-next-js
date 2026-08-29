'use client'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form'
import { RegisterSchema } from '@/utils/validation/schemas/index'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button";
import { RegisterInitialValues } from '@/utils/validation/initialValues';
import FormError from '@/components/ui/from-error';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/store/action/authAction';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { CheckCircle } from 'lucide-react';
import { useToggle } from '@/hooks/useToggle';

interface RegisterFormProps {
    callbackUrl: string,
}

export default function MerchantRegistrationForm({ callbackUrl }: RegisterFormProps) {
    const [register, { isLoading, data }] = useRegisterMutation()
    const [value, toggle, setValue] = useToggle()
    const router = useRouter()
    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: RegisterInitialValues
    })

    const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
        const res = await register({ ...values, role: 'admin' }).unwrap()
        if (res?.message) {
            toggle()
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className={'space-y-4'}>
                    <FormField control={form.control} name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Business / Store Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder='Apple Avenue Authorized Reseller'
                                    />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>

                        )} />
                    <FormField control={form.control} name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder='john.doe@example.com'
                                        type={'email'} />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>

                        )} />
                    <FormField control={form.control} name='password'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type={'password'} />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>

                        )} />
                </div>
                {data?.error && (
                    <FormError message={data?.error} />
                )}

                <Button type='submit' className='w-full bg-[#111111] hover:bg-black' disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Seller Account'}</Button>
            </form>

            <AlertDialog open={value}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex flex-row space-x-5 items-center'><CheckCircle className='text-emerald-500' />Successfully created your account</AlertDialogTitle>
                        <AlertDialogDescription>
                            Congratulations — your Apple Avenue seller account has been created. Please sign in to continue to the Seller Center.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => toggle()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                setValue(false)
                                router.push('/auth/merchant-login')
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Form>
    );
}