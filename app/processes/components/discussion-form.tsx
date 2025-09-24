import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { discussionFormSchema } from '@/lib/forms';
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
import { useSubmitDiscussion } from '@/lib/mutations';
import { Textarea } from '@/components/ui/textarea';

export function DiscussionForm({
  proposal_id,
  process_id,
  is_comment = false,
}: {
  proposal_id?: number;
  process_id?: number;
  is_comment?: boolean;
}) {
  const discussionSubmitMutation = useSubmitDiscussion();

  const form = useForm<z.infer<typeof discussionFormSchema>>({
    resolver: zodResolver(discussionFormSchema),
    defaultValues: {
      comment: '',
    },
  });

  function onSubmit(values: z.infer<typeof discussionFormSchema>) {
    values.proposal_id = proposal_id;
    values.process_id = process_id;
    discussionSubmitMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <div className="">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Add to discussion</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Share your thoughts..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className=""
          disabled={discussionSubmitMutation.isPending || !form.formState.isDirty}
        >
          {discussionSubmitMutation.isPending
            ? 'Posting...'
            : is_comment
            ? 'Post'
            : 'Post Discussion'}
        </Button>
      </form>
    </Form>
  );
}
