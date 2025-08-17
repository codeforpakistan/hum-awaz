import { useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon,
} from 'react-share';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clipboard, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShareButtonProps {
  url: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'outline' | 'minimal';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ShareButton({
  url,
  title = '',
  description = '',
  variant = 'default',
  size = 'default',
  className,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shareData = {
    url,
    title,
    summary: description,
    body: description,
  };

  const shareButtons = [
    {
      Component: FacebookShareButton,
      Icon: FacebookIcon,
      label: 'Facebook',
      props: { url: shareData.url, quote: shareData.title },
    },
    {
      Component: TwitterShareButton,
      Icon: TwitterIcon,
      label: 'Twitter',
      props: { url: shareData.url, title: shareData.title },
    },
    {
      Component: LinkedinShareButton,
      Icon: LinkedinIcon,
      label: 'LinkedIn',
      props: {
        url: shareData.url,
        title: shareData.title,
        summary: shareData.summary,
      },
    },
    {
      Component: WhatsappShareButton,
      Icon: WhatsappIcon,
      label: 'WhatsApp',
      props: { url: shareData.url, title: shareData.title },
    },
    {
      Component: EmailShareButton,
      Icon: EmailIcon,
      label: 'Email',
      props: {
        url: shareData.url,
        subject: shareData.title,
        body: shareData.body,
      },
    },
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === 'minimal' ? 'ghost' : variant}
          size={size}
          className={cn(
            'gap-2',
            'transition-all duration-200',
            variant === 'minimal' && ['h-auto hover:bg-muted/50', 'px-4 py-2'],
            variant === 'outline' && 'border-border hover:bg-muted/50',
            variant === 'default' && 'hover:shadow-md',
            className
          )}
        >
          <Share2 className={cn('h-4 w-4')} />
          {variant !== 'minimal' && <span className="text-sm">Share</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-6">
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-foreground">
            Share this content
          </h4>

          <div className="grid grid-cols-5 gap-3">
            {shareButtons.map(({ Component, Icon, label, props }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Component
                  {...props}
                  onShareWindowClose={() => setIsOpen(false)}
                  className="transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
                >
                  <Icon size={40} round />
                </Component>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard');
                setIsOpen(false);
              }}
              className="w-full justify-start gap-2 hover:bg-muted/50"
            >
              <Clipboard className="h-4 w-4" />
              Copy link
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
