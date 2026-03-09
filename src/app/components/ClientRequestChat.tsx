import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  Brain,
  Building2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TestTube2
} from 'lucide-react';

import { useRequests } from '../store/requestStore';
import { createTitleFromMessage, detectDepartmentFromText, detectPriorityFromText } from '../utils/helpers';

interface Message {
  id: number;
  type: 'user' | 'system' | 'ai-classification';
  content?: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: 'document' | 'image';
    size: string;
  };
  classification?: {
    category: string;
    department: string;
    priority: 'High' | 'Medium' | 'Low';
    status: string;
  };
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: 'system',
    content: "Salom! Men sizning AI yordamchingizman. So'rovlaringiz asosida tegishli bo'limga yo'naltirilgan hujjatlar yaratiladi.",
    timestamp: '10:30 AM',
  },
];

export function ClientRequestChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addRequest } = useRequests();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const department = detectDepartmentFromText(userMessage.content ?? '');
    const priority = detectPriorityFromText(userMessage.content ?? '');

    addRequest({
      title: createTitleFromMessage(userMessage.content ?? ''),
      message: userMessage.content ?? '',
      department,
      priority,
    });

    // Simulate AI processing and show classification card
    setTimeout(() => {
      const aiClassification: Message = {
        id: messages.length + 2,
        type: 'ai-classification',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        classification: {
          category: 'Hujjat so‘rovi',
          department: 'Bo‘lim: ' + department.toUpperCase(),
          priority: priority === 'high' ? 'High' : priority === 'low' ? 'Low' : 'Medium',
          status: 'Inboxga yuborildi',
        },
      };

      setMessages(prev => [...prev, aiClassification]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' : 'document';
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: 'Uploaded a document',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      attachment: {
        name: file.name,
        type: fileType,
        size: fileSize,
      },
    };

    setMessages([...messages, userMessage]);
    setIsTyping(true);

    const description = `${fileType === 'image' ? 'Rasm' : 'Hujjat'} yuklandi: ${file.name}`;
    const department = detectDepartmentFromText(file.name);
    const priority = detectPriorityFromText(file.name);

    addRequest({
      title: createTitleFromMessage(file.name),
      message: description,
      department,
      priority,
    });

    // Simulate AI processing and show classification card
    setTimeout(() => {
      const aiClassification: Message = {
        id: messages.length + 2,
        type: 'ai-classification',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        classification: {
          category: 'Fayl asosida hujjat',
          department: 'Bo‘lim: ' + department.toUpperCase(),
          priority: priority === 'high' ? 'High' : priority === 'low' ? 'Low' : 'Medium',
          status: 'Inboxga yuborildi',
        },
      };

      setMessages(prev => [...prev, aiClassification]);
      setIsTyping(false);
    }, 2000);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                AI Request Assistant
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-sm text-muted-foreground">Online • Test Mode</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-lg border border-amber-200">
              <TestTube2 className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">MVP Test Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Mode Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <TestTube2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            <span className="font-bold">Test Mode:</span> All requests are currently routed to Finance Department for MVP testing and validation.
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id}>
            {/* User Message */}
            {message.type === 'user' && (
              <div className="flex justify-end">
                <div className="max-w-2xl">
                  <div className="flex items-start gap-3 justify-end">
                    <div className="flex-1">
                      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl rounded-tr-md px-5 py-3 shadow-md">
                        {message.attachment ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">{message.content}</p>
                            <div className="bg-white/15 backdrop-blur rounded-lg p-3 flex items-center gap-3 border border-white/20">
                              {message.attachment.type === 'image' ? (
                                <ImageIcon className="w-8 h-8 text-white/90" />
                              ) : (
                                <FileText className="w-8 h-8 text-white/90" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {message.attachment.name}
                                </p>
                                <p className="text-xs text-white/70">
                                  {message.attachment.size}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 text-right">
                        {message.timestamp}
                      </p>
                    </div>
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Message */}
            {message.type === 'system' && (
              <div className="flex justify-start">
                <div className="max-w-2xl">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-card border border-border rounded-2xl rounded-tl-md px-5 py-3 shadow-sm">
                        <p className="text-sm text-card-foreground leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Classification Card */}
            {message.type === 'ai-classification' && message.classification && (
              <div className="flex justify-start">
                <div className="max-w-3xl w-full">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md relative">
                      <Brain className="w-5 h-5 text-white" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      {/* AI Processing Card */}
                      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 border-2 border-purple-200 rounded-xl p-5 shadow-lg">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-card-foreground">
                              AI Processing Complete
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-lg border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs font-semibold text-green-700">Processed</span>
                          </div>
                        </div>

                        {/* Routing Information Grid */}
                        <div className="space-y-3 mb-4">
                          {/* Detected Category */}
                          <div className="bg-white rounded-lg p-3 border border-purple-200 shadow-sm">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                              Detected Category
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="text-base font-bold text-purple-700">
                                {message.classification.category}
                              </span>
                            </div>
                          </div>

                          {/* Assigned Department */}
                          <div className="bg-white rounded-lg p-3 border border-cyan-200 shadow-sm">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                              Assigned Department
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-cyan-600" />
                              </div>
                              <span className="text-base font-bold text-cyan-700">
                                {message.classification.department}
                              </span>
                            </div>
                          </div>

                          {/* Priority & Status Row */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* Priority */}
                            <div className="bg-white rounded-lg p-3 border border-amber-200 shadow-sm">
                              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                                Priority
                              </label>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-bold border ${getPriorityColor(message.classification.priority)}`}>
                                <AlertCircle className="w-3.5 h-3.5" />
                                {message.classification.priority}
                              </span>
                            </div>

                            {/* Status */}
                            <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                                Status
                              </label>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-bold text-green-700">
                                  {message.classification.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Routing Direction Indicator */}
                        <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-cyan-100 rounded-lg p-3 border border-purple-200">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-sm">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs font-bold text-purple-700">Client Request</span>
                            </div>
                            
                            <ArrowRight className="w-6 h-6 text-purple-600 animate-pulse" strokeWidth={3} />
                            
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center shadow-sm">
                                <Building2 className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs font-bold text-cyan-700">Finance Department</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-md px-5 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-card border-t border-border px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* Input Container */}
          <div className="flex items-end gap-3">
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl transition-all hover:shadow-md flex-shrink-0"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />

            {/* Text Input */}
            <div className="flex-1 bg-muted rounded-xl border border-border focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write your request or upload a document..."
                className="w-full bg-transparent px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                rows={1}
                style={{ maxHeight: '120px', minHeight: '44px' }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-muted-foreground mt-3 text-center">
            <span className="font-semibold">Test Mode Active:</span> All messages will be routed to Finance Department
          </p>
        </div>
      </div>
    </div>
  );
}
