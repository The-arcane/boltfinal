import { useState, useEffect } from 'react';
import { supabase } from './supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  has_attachment?: boolean;
  attachment_url?: string;
  attachment_type?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        has_attachment: msg.has_attachment,
        attachment_url: msg.attachment_url,
        attachment_type: msg.attachment_type
      })));
    };

    loadMessages();
  }, []);

  const uploadAttachment = async (file: File) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${session.session.user.id}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('chat_attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('chat_attachments')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      type: file.type
    };
  };

  const sendMessage = async (userMessage: string, attachment?: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('You must be logged in to send messages');
      }

      let attachmentData = null;
      if (attachment) {
        attachmentData = await uploadAttachment(attachment);
      }

      // Save user message to Supabase
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: session.session.user.id,
          role: 'user',
          content: userMessage,
          has_attachment: !!attachmentData,
          attachment_url: attachmentData?.url,
          attachment_type: attachmentData?.type
        });

      if (insertError) throw insertError;

      // Prepare prompt with attachment context if present
      let prompt = userMessage;
      if (attachmentData) {
        prompt = `[User has shared a ${attachmentData.type} file] ${userMessage}`;
      }

      // Call local Llama API
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2',
          prompt,
          system: "You are a helpful AI assistant. Provide clear and concise responses.",
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const assistantMessage = data.response;

      // Save assistant message to Supabase
      const { error: assistantError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: session.session.user.id,
          role: 'assistant',
          content: assistantMessage
        });

      if (assistantError) throw assistantError;

      setMessages(prev => [
        ...prev,
        { 
          role: 'user', 
          content: userMessage,
          has_attachment: !!attachmentData,
          attachment_url: attachmentData?.url,
          attachment_type: attachmentData?.type
        },
        { role: 'assistant', content: assistantMessage }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage
  };
}