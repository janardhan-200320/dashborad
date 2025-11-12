import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import {
  MessageCircle,
  Phone,
  Mail,
  Search,
  ChevronRight,
  ChevronDown,
  Book,
  Video,
  FileText,
  Zap,
  Send,
  User,
  Bot,
  ExternalLink,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  Headphones,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addNotification } from '@/components/NotificationDropdown';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  message: string;
  timestamp: Date;
}

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'chat' | 'contact'>('faq');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      message: 'Hello! 👋 I\'m here to help. You can ask me questions or connect with a live agent. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create a new booking page?',
      answer: 'Navigate to "Booking Pages" from the sidebar, click "Create New Page", fill in your service details, customize the appearance, and publish. Your customers will be able to book appointments through this page.',
      category: 'Getting Started',
    },
    {
      id: '2',
      question: 'How do I manage time slots?',
      answer: 'Click the clock icon next to notifications to access Time Slot Management. Here you can add, edit, delete, and activate/deactivate time slots. Changes will automatically reflect on your booking pages.',
      category: 'Time Management',
    },
    {
      id: '3',
      question: 'Can I customize the labels for my services?',
      answer: 'Yes! During onboarding or in settings, you can customize how you refer to Event Types (Sessions, Appointments, etc.) and Team Members (Staff, Therapists, etc.) to match your business terminology.',
      category: 'Customization',
    },
    {
      id: '4',
      question: 'How do I add team members?',
      answer: 'Go to Team Members section, click "Add New Member", enter their details including name, email, role, and availability schedule. They will receive login credentials to access their dashboard.',
      category: 'Team Management',
    },
    {
      id: '5',
      question: 'What payment methods are supported?',
      answer: 'We support multiple payment gateways including Razorpay, Stripe, PayPal, and manual payments. You can configure your preferred payment method in the Admin Center under Payment Settings.',
      category: 'Payments',
    },
    {
      id: '6',
      question: 'How do I track appointments?',
      answer: 'All appointments are visible in the Appointments section. You can filter by status (pending, confirmed, completed, cancelled), date range, and team member. Use the calendar view for a visual overview.',
      category: 'Appointments',
    },
    {
      id: '7',
      question: 'Can customers reschedule appointments?',
      answer: 'Yes, if you enable this feature in booking page settings. Customers will receive a link in their confirmation email to reschedule or cancel their appointment based on your cancellation policy.',
      category: 'Appointments',
    },
    {
      id: '8',
      question: 'How do I send automated reminders?',
      answer: 'Go to Workflows section and create automation rules. You can set up email/SMS reminders to be sent at specific intervals before appointments (24 hours, 1 hour, etc.).',
      category: 'Automation',
    },
  ];

  const quickActions = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Comprehensive guides and tutorials',
      action: () => window.open('https://docs.example.com', '_blank'),
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      action: () => window.open('https://youtube.com/@yourcompany', '_blank'),
    },
    {
      icon: FileText,
      title: 'Knowledge Base',
      description: 'Articles and best practices',
      action: () => setActiveTab('faq'),
    },
    {
      icon: Zap,
      title: 'Quick Start Guide',
      description: 'Get up and running in 5 minutes',
      action: () => alert('Opening Quick Start Guide...'),
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: messageInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageInput('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: getBotResponse(messageInput),
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('appointment') || msg.includes('booking')) {
      return 'To manage appointments, go to the Appointments section from the sidebar. You can view, filter, and manage all your bookings there. Would you like me to connect you with a live agent for detailed assistance?';
    } else if (msg.includes('time slot') || msg.includes('availability')) {
      return 'Click the clock icon ⏰ next to notifications to access Time Slot Management. You can add, edit, and manage your availability there. Need help with this? I can connect you to a live agent!';
    } else if (msg.includes('payment') || msg.includes('invoice')) {
      return 'For payment settings, navigate to Admin Center > Payment Configuration. We support Razorpay, Stripe, and PayPal. Would you like to speak with an agent about payment setup?';
    } else if (msg.includes('agent') || msg.includes('human') || msg.includes('support')) {
      return 'I\'ll connect you with a live agent right away! They typically respond within 2-3 minutes. Please hold on... 🔄';
    } else {
      return 'I understand you need help. You can browse our FAQ section, or I can connect you with a live support agent who can provide personalized assistance. What would you prefer?';
    }
  };

  const connectToAgent = () => {
    setIsAgentConnected(true);
    const agentMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'agent',
      message: '👋 Hi! I\'m Sarah from the support team. I\'ve reviewed your conversation and I\'m here to help. What specific issue can I assist you with?',
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, agentMessage]);

    // Simulate agent typing
    setTimeout(() => {
      setAgentTyping(true);
      setTimeout(() => {
        setAgentTyping(false);
      }, 2000);
    }, 5000);
  };

  const openWhatsApp = () => {
    const phoneNumber = '1234567890'; // Replace with your WhatsApp business number
    const message = encodeURIComponent('Hi, I need help with my Zervos account.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
            <p className="mt-1 text-slate-600">We're here to help you succeed</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const notificationTypes = [
                  {
                    title: 'New booking: Hair Styling',
                    body: 'John Doe booked Hair Styling at 2:00 PM',
                    category: 'bookings' as const,
                    path: '/dashboard/appointments',
                  },
                  {
                    title: 'Invoice paid',
                    body: 'Invoice INV-' + Date.now() + ' was paid (₹2,500)',
                    category: 'invoices' as const,
                    path: '/dashboard/invoices',
                  },
                  {
                    title: 'POS sale completed',
                    body: 'New sale of ₹1,850 recorded',
                    category: 'pos' as const,
                    path: '/dashboard/pos',
                  },
                  {
                    title: 'System update available',
                    body: 'New features and improvements are ready',
                    category: 'system' as const,
                  },
                ];
                const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
                addNotification(randomNotification);
              }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Bell className="h-5 w-5" />
              Test Notification
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openWhatsApp}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <MessageSquare className="h-5 w-5" />
              WhatsApp Support
            </motion.button>
          </div>
        </motion.div>

        {/* Support Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            { icon: Clock, label: 'Avg Response', value: '< 5 min', color: 'from-blue-400 to-blue-500' },
            { icon: Star, label: 'Satisfaction', value: '4.9/5', color: 'from-yellow-400 to-orange-500' },
            { icon: CheckCircle, label: 'Resolved', value: '98%', color: 'from-emerald-400 to-emerald-500' },
            { icon: Headphones, label: 'Agents Online', value: '12', color: 'from-purple-400 to-purple-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-0 bg-white p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  onClick={action.action}
                  className="group cursor-pointer border-0 bg-white p-6 shadow-lg transition-all hover:shadow-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <action.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{action.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-6 flex gap-2">
            {[
              { id: 'faq', label: 'FAQ', icon: FileText },
              { id: 'chat', label: 'Live Chat', icon: MessageCircle },
              { id: 'contact', label: 'Contact Us', icon: Phone },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 shadow hover:shadow-md'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="border-0 bg-white p-6 shadow-lg">
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search for answers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 text-lg"
                      />
                    </div>
                  </div>

                  {categories.map((category) => {
                    const categoryFAQs = filteredFAQs.filter((faq) => faq.category === category);
                    if (categoryFAQs.length === 0) return null;

                    return (
                      <div key={category} className="mb-6">
                        <h3 className="mb-3 text-lg font-semibold text-slate-900">{category}</h3>
                        <div className="space-y-3">
                          {categoryFAQs.map((faq) => (
                            <motion.div
                              key={faq.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                            >
                              <button
                                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-100"
                              >
                                <span className="font-medium text-slate-900">{faq.question}</span>
                                {expandedFAQ === faq.id ? (
                                  <ChevronDown className="h-5 w-5 text-slate-600" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-slate-600" />
                                )}
                              </button>
                              <AnimatePresence>
                                {expandedFAQ === faq.id && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="border-t border-slate-200 bg-white p-4 text-slate-700">
                                      {faq.answer}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {filteredFAQs.length === 0 && (
                    <div className="py-12 text-center">
                      <AlertCircle className="mx-auto h-16 w-16 text-slate-300" />
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">No results found</h3>
                      <p className="mt-2 text-slate-600">
                        Try different keywords or contact our support team
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Live Chat Tab */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="border-0 bg-white shadow-lg">
                  <div className="flex h-[600px] flex-col">
                    {/* Chat Header */}
                    <div className="border-b border-slate-200 bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-white p-2">
                            {isAgentConnected ? (
                              <User className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Bot className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {isAgentConnected ? 'Sarah - Support Agent' : 'AI Assistant'}
                            </h3>
                            <p className="text-sm text-blue-100">
                              {isAgentConnected ? '🟢 Online' : 'Always available'}
                            </p>
                          </div>
                        </div>
                        {!isAgentConnected && (
                          <Button
                            onClick={connectToAgent}
                            variant="outline"
                            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                          >
                            Connect to Agent
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              msg.sender === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : msg.sender === 'agent'
                                ? 'bg-emerald-100 text-slate-900'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            {msg.sender !== 'user' && (
                              <div className="mb-1 flex items-center gap-2">
                                {msg.sender === 'agent' ? (
                                  <User className="h-4 w-4" />
                                ) : (
                                  <Bot className="h-4 w-4" />
                                )}
                                <span className="text-xs font-semibold">
                                  {msg.sender === 'agent' ? 'Sarah' : 'AI Bot'}
                                </span>
                              </div>
                            )}
                            <p className="text-sm">{msg.message}</p>
                            <p
                              className={`mt-1 text-xs ${
                                msg.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
                              }`}
                            >
                              {msg.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {agentTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-slate-600"
                        >
                          <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-sm">Sarah is typing...</span>
                        </motion.div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="border-t border-slate-200 p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Contact Us Tab */}
            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Contact Form */}
                  <Card className="border-0 bg-white p-6 shadow-lg">
                    <h3 className="mb-4 text-xl font-semibold text-slate-900">Send us a message</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Name</label>
                        <Input placeholder="Your name" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <Input type="email" placeholder="your@email.com" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Subject</label>
                        <Input placeholder="How can we help?" className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Message</label>
                        <Textarea
                          placeholder="Tell us more about your issue..."
                          rows={5}
                          className="mt-1"
                        />
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        Send Message
                      </Button>
                    </div>
                  </Card>

                  {/* Contact Methods */}
                  <div className="space-y-4">
                    <Card className="border-0 bg-gradient-to-br from-blue-500 to-purple-500 p-6 text-white shadow-lg">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-full bg-white/20 p-3">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">WhatsApp Support</h3>
                          <p className="text-sm text-blue-100">Instant messaging support</p>
                        </div>
                      </div>
                      <p className="mb-4 text-blue-50">
                        Get quick answers via WhatsApp. Our team is available 24/7.
                      </p>
                      <Button
                        onClick={openWhatsApp}
                        className="w-full border-2 border-white bg-white text-blue-600 hover:bg-blue-50"
                      >
                        Open WhatsApp
                      </Button>
                    </Card>

                    <Card className="border-0 bg-white p-6 shadow-lg">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-3">
                          <Phone className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">Phone Support</h3>
                          <p className="text-sm text-slate-600">Mon-Fri, 9am-6pm EST</p>
                        </div>
                      </div>
                      <p className="mb-2 text-2xl font-bold text-slate-900">+1 (555) 123-4567</p>
                      <p className="text-sm text-slate-600">Average wait time: 2 minutes</p>
                    </Card>

                    <Card className="border-0 bg-white p-6 shadow-lg">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-purple-50 p-3">
                          <Mail className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">Email Support</h3>
                          <p className="text-sm text-slate-600">We'll respond within 24 hours</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900">support@zervos.com</p>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default HelpSupport;
