import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState, FormEvent } from 'react';
import axios from 'axios'
import { Loader } from 'lucide-react';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

export default function Component() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading,setLoading]=useState<boolean>(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log(message);
    // return;
    
    if (!message) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', content: message },
    ]);

    setMessage('');

    const encodedMessages = encodeURIComponent(JSON.stringify([
        ...messages,
        { type: 'user', content: message }
    ]));

    try {
        setLoading(true)
      const response = await axios.get(`http://localhost:5000/ask-me?role=user&question=${message}&msg=${encodedMessages}`)
      const data = response.data;

      console.log('Data from OpenAI : ' , data);
      

      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', content: data },
      ]);
    } catch (error) {
      console.error('Error fetching response:', error);
    }finally{
        setLoading(false)
    }
  };



  console.log(messages);
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>GPT</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-medium">ChatGPT</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoveHorizontalIcon className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HandHelpingIcon className="w-4 h-4 mr-2" />
              Help
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 ${
                msg.type === 'bot' ? '' : 'justify-end'
              }`}
            >
              {msg.type === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>YOU</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`${
                  msg.type === 'bot' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                } rounded-lg p-4 max-w-[80%]`}
              >
                <p>{msg.content}</p>
              </div>
              {msg.type === 'bot' && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>GPT</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-background border-t border-muted p-4">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            placeholder="Message ChatGPT..."
            name="message"
            id="message"
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16"
          />
{    loading ? (<Loader className='absolute w-8 h-8 top-3 right-3 text-black animate-spin' />)    :(<Button type="submit" size="icon" className="absolute w-8 h-8 top-3 right-3" disabled={!message}>
            <ArrowUpIcon className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>)}
        </form>
      </div>
    </div>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

function HandHelpingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14" />
      <path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
      <path d="m2 13 6 6" />
    </svg>
  );
}

function LogOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function MoveHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 8 22 12 18 16" />
      <polyline points="6 8 2 12 6 16" />
      <line x1="2" x2="22" y1="12" y2="12" />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 0-.73 2.73l.12.21a2 2 0 0 1 0 1.92l-.12.21a2 2 0 0 0 .73 2.73l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 0 .73-2.73l-.12-.21a2 2 0 0 1 0-1.92l.12-.21a2 2 0 0 0-.73-2.73l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
