'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/components/language-provider';
import { Vote } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/lib/mutations';
import { useForm } from 'react-hook-form';
import { registerFormSchema } from '@/lib/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import z from 'zod';

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const registerMutation = useRegister();
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  function onSubmit(values: z.infer<typeof registerFormSchema>) {
      registerMutation.mutate(values);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 mb-8"
          >
            <Vote className="h-8 w-8 text-emerald-600" />
            <span className="font-bold text-2xl">Hum Awaz</span>
          </Link>
          <h2 className="text-3xl font-bold">{t('auth.signUp')}</h2>
          <p className="mt-2 text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link
              href="/login"
              className="text-emerald-600 hover:text-emerald-500"
            >
              {t('common.login')}
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.signUp')}</CardTitle>
            <CardDescription>
              Create your account to start participating in democratic processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.fullName')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                              className="order-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.email')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your email"
                                {...field}
                                className="order-1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-row justify-between align-middle items-center">
                              <FormLabel>{t('auth.password')}</FormLabel>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="Enter your password"
                                {...field}
                                type="password"
                                className="order-2"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="confirm_password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-row justify-between align-middle items-center">
                              <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="Enter your password again"
                                {...field}
                                type="password"
                                className="order-2"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending
                        ? t('common.loading')
                        : t('auth.signUp')}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
