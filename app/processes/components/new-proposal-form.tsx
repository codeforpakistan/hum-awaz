import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { proposalFormSchema } from '@/lib/forms';
import z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProposalCreate } from '@/lib/mutations';
import { Textarea } from '@/components/ui/textarea';

export function NewProposalForm({process_id}: {process_id: number}) {
  const proposalCreateMutation = useProposalCreate();

  const form = useForm<z.infer<typeof proposalFormSchema>>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      title: '',
      title_ur: '',
      description: '',
      description_ur: '',
    },
  });

  function onSubmit(values: z.infer<typeof proposalFormSchema>) {
    values.process_id = process_id;
    proposalCreateMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4">
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

          <Button
            type="submit"
            className="w-full"
            disabled={proposalCreateMutation.isPending}
          >
            {proposalCreateMutation.isPending
              ? "Submitting..."
              : "Submit Proposal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
