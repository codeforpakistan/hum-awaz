import { z } from "zod";



export const loginFormSchema = z.object({
  email: z.string().email().min(1, "Email is required"),
  password: z.string().min(1, "User is required"),
});
export type LoginFormTypes = z.infer<typeof loginFormSchema>;


export const registerFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email().min(1, "Email is required"),
  password: z.string().min(6, "Password must have a minimum of 6 characters"),
  confirm_password: z.string().min(6, "Confirm password must have a minimum of 6 characters"),
}).refine(
    (data) => {
      return data.password === data.confirm_password;
    },
    {
      message:
        "Entered passwords do not match. Please check and try again.",
      path: ["confirm_password"],
    }
  );
export type RegisterFormTypes = z.infer<typeof registerFormSchema>;

export const processFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  title_ur: z.string(),
  description: z.string().min(1, "Description is required"),
  description_ur: z.string(),
  category: z.string().min(1, "Category is required"),
  organization: z.string(),
  end_date: z.string().min(1, "End date is required"),
})
export type ProcessFormTypes = z.infer<typeof processFormSchema>;

export const proposalFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  title_ur: z.string(),
  description: z.string().min(1, "Description is required"),
  description_ur: z.string(),
  process_id: z.number().optional(),
})
export type ProposalFormTypes = z.infer<typeof proposalFormSchema>;

export const discussionFormSchema = z.object({
  comment: z.string().min(1, "Comment is required"),
  proposal_id: z.number().optional(),
  process_id: z.number().optional(),
})
export type DiscussionFormTypes = z.infer<typeof discussionFormSchema>;
