import React from 'react';
import { Bot, User, File } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    has_attachment?: boolean;
    attachment_url?: string;
    attachment_type?: string;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Check if attachment is an image or unsupported
  const isImage = message.attachment_type?.startsWith('image/');
  const isUnsupported = message.attachment_type && !isImage;

  // Function to render the attachment
  const renderAttachment = () => {
    if (!message.has_attachment || !message.attachment_url) return null;

    if (isUnsupported) {
      return (
        <div className="mt-2 text-red-500">Unsupported file type</div>
      );
    }

    return (
      <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
        {isImage ? (
          <img
            src={message.attachment_url}
            alt={message.content || 'Attachment'}
            className="max-w-full h-auto max-h-[300px] object-contain"
          />
        ) : (
          <a
            href={message.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            aria-label="View attachment"
          >
            <File className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">View Attachment</span>
          </a>
        )}
      </div>
    );
  };

  // Conditional classes for user and assistant
  const userClasses = isUser
    ? 'bg-blue-500 text-white shadow-blue-500/25'
    : 'bg-white text-gray-800 shadow-gray-200/50';

  const avatarClasses = isUser
    ? 'bg-blue-500 shadow-blue-500/25'
    : 'bg-gray-600 shadow-gray-600/25';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}>
      {/* Label for assistant */}
      {!isUser && (
        <div className="text-sm text-blue-600 font-semibold mb-1 pl-14">
          🩺 HealthBot
        </div>
      )}

      <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${avatarClasses} shadow-lg`}
        >
          {isUser ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
        </div>

        {/* Message bubble with markdown */}
        <div
          className={`relative max-w-[80%] rounded-2xl px-6 py-4 ${userClasses} shadow-lg`}
        >
          <div
            className={`absolute top-4 ${isUser ? 'right-full mr-2' : 'left-full ml-2'}`}
          />

          {/* Render markdown content if not empty */}
          {message.content.trim() !== '' && (
            <ReactMarkdown
              className={`prose prose-sm max-w-full ${isUser ? 'prose-invert' : 'prose-blue'} prose-headings:text-blue-600 prose-strong:text-blue-700 prose-p:my-1 prose-li:my-1`}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {renderAttachment()}
        </div>
      </div>
    </div>
  );
}
