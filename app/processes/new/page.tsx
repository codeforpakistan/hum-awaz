'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MainNav } from '@/components/main-nav';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Footer } from '@/components/footer';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useLanguage } from '@/components/language-provider';
import { supabase } from '@/lib/supabase';
import { Vote, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { processFormSchema } from '@/lib/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useProcess } from '@/lib/mutations';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function NewProcessPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = useForm<z.infer<typeof processFormSchema>>({
    resolver: zodResolver(processFormSchema),
    defaultValues: {
      title: '',
      title_ur: '',
      description: '',
      description_ur: '',
      category: '',
      organization: '',
      end_date: '',
    },
  });
  const processMutation = useProcess();

  const [formData, setFormData] = useState({
    title: '',
    title_ur: '',
    description: '',
    description_ur: '',
    category: '',
    organization: '',
    end_date: '',
  });

  function onSubmit(values: z.infer<typeof processFormSchema>) {
    processMutation.mutate(values);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('processes')
        .insert({
          title: formData.title,
          title_ur: formData.title_ur || null,
          description: formData.description,
          description_ur: formData.description_ur || null,
          category: formData.category,
          organization: formData.organization || null,
          end_date: formData.end_date,
          status: 'active',
          created_by: user.id,
          is_approved: false,
        })
        .select()
        .single();

      if (error) {
        setError('Failed to create process');
        console.error('Error creating process:', error);
      } else {
        setSuccess(
          'Process created successfully! It will be publicly visible after review and approval.'
        );
        setTimeout(() => {
          router.push(`/processes/${data.id}`);
        }, 1000);
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center space-x-2">
                <Vote className="h-6 w-6 text-emerald-600" />
                <span className="font-bold text-xl">Hum Awaz</span>
              </Link>
              <MainNav />
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Button asChild variant="outline" size="sm">
                <Link href="/login">{t('common.login')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{t('common.register')}</Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You need to be logged in to create a new process
              </p>
              <div className="space-x-2">
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <Vote className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl">Hum Awaz</span>
            </Link>
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8 max-w-4xl">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/processes">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Processes
              </Link>
            </Button>

            <h1 className="text-3xl font-bold">
              Create New Democratic Process
            </h1>
            <p className="text-muted-foreground">
              Start a new consultation process to gather public input on
              important issues
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Process Details</CardTitle>
              <CardDescription>
                Provide information about the democratic process you want to
                create
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title (English) *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter process title in English"
                              {...field}
                              className="order-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="title_ur"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title (Urdu)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="عنوان اردو میں درج کریں"
                              {...field}
                              className="order-1"
                              dir="rtl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (English) *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the purpose and goals of this democratic process"
                              {...field}
                              className="order-1"
                              rows={5}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="description_ur"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Urdu)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="اس جمہوری عمل کے مقصد اور اہداف کو بیان کریں"
                              {...field}
                              className="order-1"
                              rows={5}
                              dir="rtl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="education">
                                Education
                              </SelectItem>
                              <SelectItem value="healthcare">
                                Healthcare
                              </SelectItem>
                              <SelectItem value="infrastructure">
                                Infrastructure
                              </SelectItem>
                              <SelectItem value="economy">Economy</SelectItem>
                              <SelectItem value="environment">
                                Environment
                              </SelectItem>
                              <SelectItem value="governance">
                                Governance
                              </SelectItem>
                              <SelectItem value="social">
                                Social Issues
                              </SelectItem>
                              <SelectItem value="technology">
                                Technology
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Ministry of Education, Local Government"
                              {...field}
                              className="order-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date *</FormLabel>
                          <FormControl>
                            <Input
                              id="end_date"
                              type="date"
                                                            {...field}

                              min={new Date().toISOString().split('T')[0]}
                            />
                          </FormControl>
                          <FormDescription>
                Select when this consultation process should end
              </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                </div>

                <div className="flex justify-end space-x-4">
                  <Button asChild variant="outline">
                    <Link href="/processes">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Process'}
                  </Button>
                </div>
              </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
