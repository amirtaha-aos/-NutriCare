import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI } from '../services/api';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Plus,
  Loader,
  Clock,
  Sparkles,
  Heart,
  Apple,
  Stethoscope,
  Scale,
  Mic,
  Paperclip,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const messageVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

const Chat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      const res = await chatAPI.getSessions();
      setSessions(res.data.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const startNewChat = async () => {
    setLoading(true);
    try {
      const res = await chatAPI.start('Nutrition Consultation');
      const newSession = {
        sessionId: res.data.data.sessionId,
        chatId: res.data.data.chatId,
        topic: 'Nutrition Consultation',
        createdAt: new Date()
      };
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);

      setTimeout(() => {
        setMessages([{
          role: 'assistant',
          content: "Hello! I'm your AI Nutrition Assistant. I'm here to help you with:\n\n• Personalized meal planning and diet advice\n• Accurate calorie and macro counting\n• Lab test result interpretation\n• Answers to all your nutrition questions\n\nWhat would you like to discuss today?",
          timestamp: new Date()
        }]);
      }, 500);
    } catch (error) {
      toast.error('Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (session) => {
    setCurrentSession(session);
    setLoading(true);
    try {
      const res = await chatAPI.getHistory(session.sessionId);
      setMessages(res.data.data.messages || []);
    } catch (error) {
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentSession) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await chatAPI.sendMessage(currentSession.sessionId, input);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const quickQuestions = [
    { icon: <Scale className="w-4 h-4" />, text: 'How can I lose weight healthily?', color: 'emerald' },
    { icon: <Apple className="w-4 h-4" />, text: 'What are good protein sources?', color: 'orange' },
    { icon: <Heart className="w-4 h-4" />, text: 'Foods to lower cholesterol?', color: 'red' },
    { icon: <Stethoscope className="w-4 h-4" />, text: 'Explain my lab results', color: 'blue' },
  ];

  return (
    <motion.div
      className="h-[calc(100vh-120px)] flex gap-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Sessions Sidebar */}
      <motion.div
        className="hidden md:flex w-80 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-col"
        variants={itemVariants}
      >
        <div className="p-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
          <motion.button
            onClick={startNewChat}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white py-3.5 rounded-xl hover:bg-white/30 transition disabled:opacity-50 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            New Conversation
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 opacity-50" />
              </div>
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {sessions.map((session, i) => (
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => loadSession(session)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${
                      currentSession?.sessionId === session.sessionId
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-sm'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        currentSession?.sessionId === session.sessionId
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">
                          {session.topic}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
            <Zap className="w-5 h-5 text-violet-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">AI Powered</p>
              <p className="text-xs text-gray-500">Advanced nutrition insights</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        variants={itemVariants}
      >
        {!currentSession ? (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
            <motion.div
              className="text-center max-w-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Animated Bot Icon */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                <motion.div
                  className="absolute inset-0 bg-emerald-200 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-4 bg-emerald-100 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-300"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Bot className="w-14 h-14 text-white" />
                  </motion.div>
                </div>
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </motion.div>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-4">AI Nutrition Assistant</h2>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                Get personalized nutrition advice, meal planning help, and answers to all your health questions
              </p>

              <motion.button
                onClick={startNewChat}
                disabled={loading}
                className="px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl font-medium flex items-center gap-3 mx-auto shadow-xl shadow-emerald-200"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Start Conversation
                  </>
                )}
              </motion.button>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-4 mt-12">
                <FeatureCard
                  icon={<Apple className="w-5 h-5" />}
                  title="Meal Planning"
                  description="Personalized diet advice"
                  color="orange"
                />
                <FeatureCard
                  icon={<Scale className="w-5 h-5" />}
                  title="Weight Goals"
                  description="Track your progress"
                  color="emerald"
                />
                <FeatureCard
                  icon={<Heart className="w-5 h-5" />}
                  title="Health Tips"
                  description="Improve your wellness"
                  color="rose"
                />
                <FeatureCard
                  icon={<Stethoscope className="w-5 h-5" />}
                  title="Lab Analysis"
                  description="Understand your results"
                  color="blue"
                />
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
              <div className="flex items-center gap-4">
                <motion.div
                  className="relative"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot className="w-7 h-7" />
                  </div>
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl">AI Nutrition Assistant</h3>
                  <p className="text-sm text-emerald-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online and ready to help
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </motion.div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full mx-auto mb-3"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-gray-400">Loading messages...</p>
                  </motion.div>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <motion.div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200'
                              : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {msg.role === 'user' ? (
                            <User className="w-5 h-5" />
                          ) : (
                            <Bot className="w-5 h-5" />
                          )}
                        </motion.div>
                        <motion.div
                          className={`max-w-[75%] rounded-3xl p-5 shadow-sm ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-lg'
                              : 'bg-white text-gray-800 rounded-tl-lg border border-gray-100'
                          }`}
                          whileHover={{ scale: 1.01 }}
                        >
                          <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-3 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {sending && (
                    <motion.div
                      className="flex gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="bg-white rounded-3xl rounded-tl-lg p-5 shadow-sm border border-gray-100">
                        <div className="flex gap-2">
                          <motion.div
                            className="w-3 h-3 bg-emerald-400 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                          <motion.div
                            className="w-3 h-3 bg-teal-400 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                          />
                          <motion.div
                            className="w-3 h-3 bg-cyan-400 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Quick Questions */}
            <AnimatePresence>
              {messages.length <= 1 && (
                <motion.div
                  className="px-6 pb-4 bg-gradient-to-t from-white to-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Quick questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, i) => (
                      <motion.button
                        key={i}
                        onClick={() => setInput(q.text)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-full text-sm transition-all border border-gray-100 hover:border-emerald-200"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {q.icon}
                        {q.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-5 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about nutrition..."
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all pr-24"
                    disabled={sending}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <motion.button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Paperclip className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Mic className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="p-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-6 h-6" />
                </motion.button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => {
  const colorClasses = {
    orange: 'from-orange-100 to-amber-100 text-orange-600 border-orange-200',
    emerald: 'from-emerald-100 to-teal-100 text-emerald-600 border-emerald-200',
    rose: 'from-rose-100 to-pink-100 text-rose-600 border-rose-200',
    blue: 'from-blue-100 to-indigo-100 text-blue-600 border-blue-200'
  };

  return (
    <motion.div
      className={`flex items-center gap-3 p-4 bg-gradient-to-br ${colorClasses[color]} rounded-2xl border`}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="text-left">
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </motion.div>
  );
};

export default Chat;
