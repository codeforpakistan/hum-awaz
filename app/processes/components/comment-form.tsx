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
import { useSubmitComment } from '@/lib/mutations';
import { Textarea } from '@/components/ui/textarea';

export function CommentForm({
  proposal_id,
}: {
  proposal_id: number;
}) {
  const commentSubmitMutation = useSubmitComment();

  const form = useForm<z.infer<typeof discussionFormSchema>>({
    resolver: zodResolver(discussionFormSchema),
    defaultValues: {
      comment: '',
    },
  });

  function onSubmit(values: z.infer<typeof discussionFormSchema>) {
    values.proposal_id = proposal_id;
    commentSubmitMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex gap-2 mt-4 items-start w-full">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem  className="flex-1 w-full">
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Add a comment..."
                    rows={4}
                    className='w-full'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <Button
          type="submit"
          className=""
          disabled={commentSubmitMutation.isPending || !form.formState.isDirty}
          >
          {commentSubmitMutation.isPending
            ? 'Posting...'
            : 'Post'}
        </Button>
            </div>
      </form>
    </Form>
  );
}
