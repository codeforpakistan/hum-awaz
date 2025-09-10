import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { DiscussionFormTypes, LoginFormTypes, ProcessFormTypes, ProposalFormTypes, RegisterFormTypes } from './forms';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: LoginFormTypes) => {
      const response = await axiosInstance.post('auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens in localStorage
      if (data.tokens) {
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
      }

      // Store user data if needed
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      toast.success('Login successful', {
        description: 'Welcome back!',
        duration: 5000,
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error('Login failed', {
        description: errorMessage,
        duration: 5000,
      });
    },
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: RegisterFormTypes) => {
      const response = await axiosInstance.post(`auth/register`, data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Registration successful:', data);
      toast.success('Registeration successful');
      router.push('/login');
    },
    onError: (error: any) => {
      if (error.response?.data) {
        const errorData = error.response?.data;
        console.log('Registration error:', errorData.error);
        toast.error('Registration failed', {
          description: errorData.error,
          duration: 5000,
        });
      } else {
        toast.error('Registration failed', {
          description: 'An error occurred during registration.',
          duration: 5000,
        });
      }
    },
  });
}

export function useProcess() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: ProcessFormTypes) => {
      const response = await axiosInstance.post(`processes`, data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Process created successfully:', data);
      toast.success('Process created successfully');
      router.push('/processes');
    },
    onError: (error: any) => {
      if (error.response?.data) {
        const errorData = error.response?.data;
        console.log('Process creation error:', errorData.error);
        toast.error('Process creation failed', {
          description: errorData.error,
          duration: 5000,
        });
      } else {
        toast.error('Process creation failed', {
          description: 'An error occurred during process creation.',
          duration: 5000,
        });
      }
    },
  });
}

export function useProposalCreate() {
  return useMutation({
    mutationFn: async (data: ProposalFormTypes) => {
      const response = await axiosInstance.post(`proposals`, data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Proposal creation successful:', data);
      toast.success('Proposal creation successful');
    },
    onError: (error: any) => {
      if (error.response?.data) {
        const errorData = error.response?.data;
        console.log('Proposal creation error:', errorData.error);
        toast.error('Proposal creation failed', {
          description: errorData.error,
          duration: 5000,
        });
      } else {
        toast.error('Proposal creation failed', {
          description: 'An error occurred during creating a proposal.',
          duration: 5000,
        });
      }
    },
  });
}

export function useCastVote() {
  return useMutation({
    mutationFn: async (data: {proposalId: string, voteType: 'support' | 'oppose' | 'neutral'}) => {
      const response = await axiosInstance.post(`vote`, data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Vote cast successful:', data);
      toast.success('Vote cast successful');
    },
    onError: (error: any) => {
      if (error.response?.data) {
        const errorData = error.response?.data;
        console.log('Vote cast error:', errorData.error);
        toast.error('Vote cast failed', {
          description: errorData.error,
          duration: 5000,
        });
      } else {
        toast.error('Vote cast failed', {
          description: 'An error occurred during casting a vote.',
          duration: 5000,
        });
      }
    },
  });
}

export function useSubmitDiscussion() {
  return useMutation({
    mutationFn: async (data: DiscussionFormTypes) => {
      const response = await axiosInstance.post(`discussions`, data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Discussion creation successful:', data);
      toast.success('Discussion creation successful');
    },
    onError: (error: any) => {
      if (error.response?.data) {
        const errorData = error.response?.data;
        console.log('Discussion creation error:', errorData.error);
        toast.error('Discussion creation failed', {
          description: errorData.error,
          duration: 5000,
        });
      } else {
        toast.error('Discussion creation failed', {
          description: 'An error occurred during posting a discussion.',
          duration: 5000,
        });
      }
    },
  });
}

export function useSubmitComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DiscussionFormTypes) => {
      const response = await axiosInstance.post(`comments`, data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Comment successful:', data);
      queryClient.refetchQueries({ queryKey: ["process", {"process_id": data.process_id}], type: "active" });
      toast.success('Comment successful');
    },
    onError: (error: any) => {
      if (error.response?.data) {
        const errorData = error.response?.data;
        console.log('Comment error:', errorData.error);
        toast.error('Comment failed', {
          description: errorData.error,
          duration: 5000,
        });
      } else {
        toast.error('Comment failed', {
          description: 'An error occurred during posting a comment.',
          duration: 5000,
        });
      }
    },
  });
}
