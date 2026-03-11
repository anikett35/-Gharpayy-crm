import { useState } from 'react';
import { useConversationMessages, useSendMessage, useMessageTemplates } from '@/hooks/useConversationThreads';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Zap, Sparkles, Loader2, Copy } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  leadId: string | null;
  leadName: string;
  leadBudget?: string;
  leadLocation?: string;
  leadStatus?: string;
}

const ConversationChat = ({ leadId, leadName, leadBudget, leadLocation, leadStatus }: Props) => {
  const { data: messages, isLoading } = useConversationMessages(leadId);
  const sendMessage = useSendMessage();
  const { data: templates } = useMessageTemplates();
  const [text, setText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || !leadId) return;
    await sendMessage.mutateAsync({ lead_id: leadId, message: text.trim() });
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSuggestReply = async () => {
    setAiLoading(true);
    setAiSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke('ai-suggest-reply', {
        body: {
          messages: messages?.slice(-5),
          leadName,
          leadBudget: leadBudget || '',
          leadLocation: leadLocation || '',
          leadStatus: leadStatus || 'new',
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiSuggestions(data.suggestions || []);
    } catch (e: any) {
      toast.error(e.message || 'AI suggestion failed');
    } finally {
      setAiLoading(false);
    }
  };

  if (!leadId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-display font-semibold text-sm text-foreground">{leadName}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>}
        {messages?.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No messages yet</p>}
        {messages?.map(m => (
          <div key={m.id} className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
              m.direction === 'outbound'
                ? 'bg-accent text-accent-foreground rounded-br-md'
                : 'bg-secondary text-foreground rounded-bl-md'
            }`}>
              <p className="text-xs leading-relaxed">{m.message}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] opacity-70">{format(new Date(m.created_at), 'h:mm a')}</span>
                <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-current/20">{m.channel}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="border-t border-border px-3 py-2 space-y-1.5">
          <p className="text-[10px] font-medium text-accent flex items-center gap-1"><Sparkles size={10} /> AI Suggestions</p>
          {aiSuggestions.map((s: any, i: number) => (
            <button
              key={i}
              className="w-full text-left p-2 rounded-lg bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors group"
              onClick={() => { setText(s.message); setAiSuggestions([]); }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-medium text-accent">{s.label}</span>
                <Copy size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-foreground mt-0.5 line-clamp-2">{s.message}</p>
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          {/* Template picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 shrink-0 rounded-xl">
                <Zap size={14} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[240px] p-1 max-h-[200px] overflow-y-auto">
              <p className="text-[10px] font-medium text-muted-foreground px-2 py-1">Quick Replies</p>
              {templates?.length === 0 && <p className="text-[10px] text-muted-foreground px-2 py-3 text-center">No templates yet</p>}
              {templates?.map(t => (
                <button key={t.id} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-secondary text-xs transition-colors" onClick={() => setText(t.body)}>
                  <p className="font-medium text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t.body}</p>
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* AI suggest */}
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 shrink-0 rounded-xl" onClick={handleSuggestReply} disabled={aiLoading}>
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          </Button>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none bg-secondary rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Button size="sm" className="h-9 w-9 p-0 shrink-0 rounded-xl" onClick={handleSend} disabled={!text.trim() || sendMessage.isPending}>
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationChat;
