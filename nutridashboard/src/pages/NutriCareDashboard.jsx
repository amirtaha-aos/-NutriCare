import { useState, useEffect, useRef } from 'react';
import {
  Camera, Pill, Apple, Activity, FileText,
  Send, Upload, X, Loader,
  Scale, Ruler, Target, Heart, AlertTriangle,
  Plus, Trash2, Sparkles, Brain,
  TrendingUp, Home, Moon, Sun,
  Zap, BarChart3, Bell, ChevronRight,
  Salad, Dumbbell, Clock, ArrowRight,
  Utensils, Droplets, Flame, Award
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5001/api';
const api = axios.create({ baseURL: API_URL });

export default function NutriCareDashboard() {
  const [showSplash, setShowSplash] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [showDashboard, setShowDashboard] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Splash Typewriter Effect
  useEffect(() => {
    const text = "Your AI-Powered Nutrition Assistant";
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setTypewriterText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setShowSplash(false);
          setTimeout(() => setShowDashboard(true), 300);
        }, 800);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'from-violet-500 to-purple-500' },
    { id: 'chat', label: 'AI Chat', icon: Brain, color: 'from-pink-500 to-rose-500' },
    { id: 'food', label: 'Food Scanner', icon: Camera, color: 'from-orange-500 to-amber-500' },
    { id: 'lab', label: 'Lab Analysis', icon: FileText, color: 'from-cyan-500 to-blue-500' },
    { id: 'drugs', label: 'Drug Check', icon: Pill, color: 'from-fuchsia-500 to-pink-500' },
    { id: 'meal', label: 'Meal Plan', icon: Apple, color: 'from-emerald-500 to-teal-500' },
    { id: 'health', label: 'Health', icon: Activity, color: 'from-red-500 to-orange-500' },
  ];

  // Splash Screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#0a0a1a] flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-900/30 via-transparent to-emerald-900/30" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-500/15 rounded-full blur-[80px] animate-pulse-slow" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          {/* Logo Animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 animate-ping-slow" />
            </div>
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-bounce-slow">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white tracking-wider mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              NutriCare
            </span>
          </h1>

          <p className="text-xl text-emerald-300/80 mb-8 h-8 font-light">
            {typewriterText}<span className="animate-blink">|</span>
          </p>

          <div className="flex justify-center gap-4">
            {[Salad, Heart, Dumbbell, Brain].map((Icon, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-bounce-icon"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <Icon className={`w-6 h-6 ${['text-emerald-400', 'text-rose-400', 'text-cyan-400', 'text-violet-400'][i]}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!showDashboard) return null;

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-[#0a0a1a]' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {darkMode && (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.15),transparent_50%)]" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
            <div className="absolute bottom-0 left-1/2 w-full h-full bg-[radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.1),transparent_50%)]" />
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </>
        )}
      </div>

      {/* Main Container */}
      <div className="relative flex gap-6 p-6 min-h-screen">
        {/* Sidebar */}
        <aside className={`w-72 flex-shrink-0 ${darkMode ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white/80 border-slate-200'} backdrop-blur-xl rounded-3xl border p-5 h-fit sticky top-6 transition-all duration-300`}>
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8 p-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>NutriCare</h1>
              <p className={`text-xs ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>AI Nutrition</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                  ${activeTab === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : `${darkMode ? 'hover:bg-white/[0.05] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`
                  }`}
              >
                {activeTab === item.id && (
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                )}
                <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-white/20'
                    : `${darkMode ? 'bg-white/[0.05] group-hover:bg-white/[0.1]' : 'bg-slate-100 group-hover:bg-slate-200'}`
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="relative z-10 font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <ChevronRight className="w-5 h-5 ml-auto relative z-10 animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          {/* Theme Toggle */}
          <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-white/[0.05]' : 'border-slate-200'}`}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                darkMode ? 'hover:bg-white/[0.05] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-amber-500/10' : 'bg-slate-100'}`}>
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </div>
              <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* Status Card */}
          <div className={`mt-6 p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
              <span className={`text-sm font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>AI Status</span>
            </div>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ready to analyze your nutrition data</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {/* Header */}
          <header className={`${darkMode ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white/80 border-slate-200'} backdrop-blur-xl rounded-3xl border p-6 flex items-center justify-between`}>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-30" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
                  {navItems.find(n => n.id === activeTab)?.icon && (
                    <div className="w-7 h-7 text-white">
                      {(() => {
                        const Icon = navItems.find(n => n.id === activeTab)?.icon;
                        return Icon ? <Icon className="w-7 h-7" /> : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Welcome back! Let's check your nutrition today.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className={`relative p-3 rounded-2xl transition-all duration-300 ${darkMode ? 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              </button>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/30`}>
                U
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="animate-fadeIn">
            {activeTab === 'dashboard' && <DashboardHome darkMode={darkMode} setActiveTab={setActiveTab} />}
            {activeTab === 'chat' && <ChatSection darkMode={darkMode} />}
            {activeTab === 'food' && <FoodScannerSection darkMode={darkMode} />}
            {activeTab === 'lab' && <LabAnalysisSection darkMode={darkMode} />}
            {activeTab === 'drugs' && <DrugCheckSection darkMode={darkMode} />}
            {activeTab === 'meal' && <MealPlanSection darkMode={darkMode} />}
            {activeTab === 'health' && <HealthCheckSection darkMode={darkMode} />}
          </div>
        </main>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-icon {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        .animate-float-particle { animation: float-particle 15s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-bounce-icon { animation: bounce-icon 2s ease-in-out infinite; }
        .animate-blink { animation: blink 1s step-end infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
      `}</style>
    </div>
  );
}

// ==================== DASHBOARD HOME ====================
function DashboardHome({ darkMode, setActiveTab }) {
  const cardBase = darkMode
    ? 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1]'
    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-lg';

  const stats = [
    { label: 'Daily Calories', value: '1,850', unit: 'kcal', icon: Flame, color: 'from-orange-500 to-rose-500', bg: 'bg-orange-500/10' },
    { label: 'Water Intake', value: '6', unit: 'glasses', icon: Droplets, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
    { label: 'Health Score', value: '85', unit: 'pts', icon: Heart, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-500/10' },
    { label: 'Protein', value: '120', unit: 'g', icon: Dumbbell, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10' },
  ];

  const quickActions = [
    { label: 'AI Chat', desc: 'Ask nutrition questions', icon: Brain, color: 'from-violet-500 to-purple-600', tab: 'chat' },
    { label: 'Scan Food', desc: 'Analyze your meal', icon: Camera, color: 'from-orange-500 to-amber-500', tab: 'food' },
    { label: 'Lab Analysis', desc: 'Check health markers', icon: FileText, color: 'from-cyan-500 to-blue-500', tab: 'lab' },
    { label: 'Meal Plan', desc: 'Weekly schedule', icon: Utensils, color: 'from-emerald-500 to-teal-500', tab: 'meal' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="text-sm text-white/90 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Good Morning
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back!</h1>
            <p className="text-emerald-100 text-lg mb-6">Track your health and nutrition goals with AI.</p>
            <button
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-3 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl transition-all duration-300 group"
            >
              <Brain className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Ask AI Assistant</span>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center">
              <Award className="w-10 h-10 text-amber-300 mb-2" />
              <span className="text-2xl font-bold text-white">12</span>
              <span className="text-xs text-white/70">Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`${cardBase} backdrop-blur-xl rounded-3xl border p-6 transition-all duration-300 cursor-pointer group animate-slideUp`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className={`px-2 py-1 rounded-lg ${stat.bg}`}>
                <TrendingUp className={`w-4 h-4 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ color: 'currentColor' }} />
              </div>
            </div>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-1`}>{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stat.value}</span>
              <span className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Quick Actions</h2>
        <div className="grid grid-cols-4 gap-5">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(action.tab)}
              className={`${cardBase} backdrop-blur-xl rounded-3xl border p-6 text-left transition-all duration-300 group animate-slideUp`}
              style={{ animationDelay: `${i * 100 + 400}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                <action.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className={`font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{action.label}</h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className={`${cardBase} backdrop-blur-xl rounded-3xl border p-6`}>
          <h3 className={`font-bold text-lg mb-5 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-violet-500/10' : 'bg-violet-50'} flex items-center justify-center`}>
              <BarChart3 className="w-5 h-5 text-violet-500" />
            </div>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { icon: Camera, text: 'Analyzed lunch - 650 kcal', time: '2h ago', color: 'from-orange-500 to-amber-500' },
              { icon: Brain, text: 'Asked about protein intake', time: '4h ago', color: 'from-violet-500 to-purple-500' },
              { icon: Activity, text: 'Updated health metrics', time: 'Yesterday', color: 'from-rose-500 to-pink-500' },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${darkMode ? 'bg-white/[0.02] hover:bg-white/[0.05]' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{item.text}</p>
                  <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className={`${cardBase} backdrop-blur-xl rounded-3xl border p-6`}>
          <h3 className={`font-bold text-lg mb-5 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'} flex items-center justify-center`}>
              <Sparkles className="w-5 h-5 text-emerald-500" />
            </div>
            AI Insights
          </h3>
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-sm font-medium text-emerald-500">Nutrition Tip</p>
              </div>
              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Great progress! Add more leafy greens to boost your fiber intake today.
              </p>
            </div>
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <p className="text-sm font-medium text-amber-500">Hydration</p>
              </div>
              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                You need 2 more glasses of water to reach your daily goal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CHAT SECTION ====================
function ChatSection({ darkMode }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI nutrition assistant powered by advanced AI. Ask me anything about nutrition, calories, diet plans, or health. I'm here to help you achieve your wellness goals! 🥗" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const cardBase = darkMode ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white/80 border-slate-200';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      toast.error('Failed to connect to AI');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${cardBase} backdrop-blur-xl rounded-3xl border h-[calc(100vh-180px)] flex flex-col`}>
      {/* Header */}
      <div className={`px-6 py-5 border-b ${darkMode ? 'border-white/[0.05]' : 'border-slate-200'} flex items-center gap-4`}>
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur opacity-40" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>AI Nutritionist</h2>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Powered by Gemini AI</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-emerald-400 font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[75%] ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl rounded-br-lg shadow-lg shadow-violet-500/20'
                : `${darkMode ? 'bg-white/[0.05] border border-white/[0.1]' : 'bg-slate-100 border border-slate-200'} rounded-3xl rounded-bl-lg`
            } px-5 py-4`}>
              <p className={`leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fadeIn">
            <div className={`${darkMode ? 'bg-white/[0.05] border border-white/[0.1]' : 'bg-slate-100'} rounded-3xl rounded-bl-lg px-5 py-4`}>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" />
                <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className={`p-5 border-t ${darkMode ? 'border-white/[0.05]' : 'border-slate-200'}`}>
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about nutrition..."
            className={`flex-1 ${darkMode ? 'bg-white/[0.05] border-white/[0.1] text-white placeholder-slate-500' : 'bg-slate-100 border-slate-200 text-slate-800'} border rounded-2xl px-5 py-4 focus:outline-none focus:border-violet-500/50 transition-all`}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-medium hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-40 transition-all duration-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== FOOD SCANNER ====================
function FoodScannerSection({ darkMode }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const cardBase = darkMode ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white/80 border-slate-200';

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setImage(e.target.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFood = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/analyze-food', { image });
      setResult(res.data.data);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error('Failed to analyze food');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setImage(null); setPreview(null); setResult(null); };

  return (
    <div className={`${cardBase} backdrop-blur-xl rounded-3xl border p-8`}>
      <div className="text-center mb-8">
        <div className="relative inline-block mb-5">
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-30" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
            <Camera className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>AI Food Scanner</h2>
        <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Upload a photo to get instant nutritional analysis</p>
      </div>

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed ${darkMode ? 'border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5' : 'border-slate-200 hover:border-orange-400'} rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 group`}
        >
          <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl ${darkMode ? 'bg-white/[0.05]' : 'bg-slate-100'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Upload className={`w-10 h-10 ${darkMode ? 'text-slate-500' : 'text-slate-400'} group-hover:text-orange-500 transition-colors`} />
          </div>
          <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Click or drag to upload food image</p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Supports JPG, PNG up to 10MB</p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`relative rounded-3xl overflow-hidden ${darkMode ? 'bg-black/20' : 'bg-slate-100'}`}>
            <img src={preview} alt="Food" className="w-full max-h-80 object-contain" />
            <button onClick={reset} className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-sm text-white rounded-xl hover:bg-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!result && (
            <button onClick={analyzeFood} disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 transition-all duration-300">
              {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              {loading ? 'Analyzing with AI...' : 'Analyze with AI'}
            </button>
          )}

          {result && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Calories', value: result.totalCalories, unit: 'kcal', color: 'from-orange-500 to-rose-500' },
                  { label: 'Protein', value: result.protein, unit: 'g', color: 'from-emerald-500 to-teal-500' },
                  { label: 'Carbs', value: result.carbs, unit: 'g', color: 'from-blue-500 to-cyan-500' },
                  { label: 'Fat', value: result.fat, unit: 'g', color: 'from-amber-500 to-yellow-500' },
                ].map((item, i) => (
                  <div key={i} className={`bg-gradient-to-br ${item.color} p-5 rounded-2xl text-white text-center shadow-lg`}>
                    <p className="text-sm opacity-80 mb-1">{item.label}</p>
                    <p className="text-3xl font-bold">{item.value ?? '-'}</p>
                    <p className="text-xs opacity-70">{item.unit}</p>
                  </div>
                ))}
              </div>
              {result.rawAnalysis && (
                <div className={`${darkMode ? 'bg-white/[0.05] border-white/[0.1]' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-5`}>
                  <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'} whitespace-pre-wrap`}>{result.rawAnalysis}</p>
                </div>
              )}
              <button onClick={reset} className={`w-full py-4 ${darkMode ? 'bg-white/[0.05] hover:bg-white/[0.1]' : 'bg-slate-100 hover:bg-slate-200'} rounded-2xl transition-all font-medium ${darkMode ? 'text-white' : 'text-slate-700'}`}>
                Scan Another Food
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== LAB ANALYSIS ====================
function LabAnalysisSection({ darkMode }) {
  const [manualData, setManualData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const cardBase = darkMode ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white/80 border-slate-200';

  const analyze = async () => {
    if (!manualData.trim()) { toast.error('Please enter lab values'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/analyze-lab', { manualData });
      setResult(res.data.analysis);
      toast.success('Analysis complete!');
    } catch (err) { toast.error('Failed to analyze'); }
    finally { setLoading(false); }
  };

  return (
    <div className={`${cardBase} backdrop-blur-xl rounded-3xl border p-8`}>
      <div className="text-center mb-8">
        <div className="relative inline-block mb-5">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-30" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
            <FileText className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Lab Test Analyzer</h2>
        <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter your lab results for AI health insights</p>
      </div>

      {!result ? (
        <>
          <textarea
            value={manualData}
            onChange={(e) => setManualData(e.target.value)}
            placeholder={`Enter your lab values, for example:\n\nGlucose: 95 mg/dL\nHemoglobin: 14 g/dL\nCholesterol: 180 mg/dL\nTriglycerides: 120 mg/dL`}
            className={`w-full h-56 ${darkMode ? 'bg-white/[0.05] border-white/[0.1] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-5 focus:outline-none focus:border-cyan-500/50 resize-none mb-6 text-lg`}
          />
          <button onClick={analyze} disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 transition-all duration-300">
            {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Brain className="w-6 h-6" />}
            {loading ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </>
      ) : (
        <div className="space-y-5 animate-fadeIn">
          <div className={`${darkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'} border rounded-2xl p-5 flex items-start gap-4`}>
            <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5" />
            <p className="text-amber-500">For informational purposes only. Always consult a healthcare professional for medical advice.</p>
          </div>
          <div className={`${darkMode ? 'bg-white/[0.05] border-white/[0.1]' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-6`}>
            <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'} whitespace-pre-wrap`}>{result}</p>
          </div>
          <button onClick={() => setResult(null)} className={`w-full py-4 ${darkMode ? 'bg-white/[0.05] hover:bg-white/[0.1]' : 'bg-slate-100 hover:bg-slate-200'} rounded-2xl transition-all font-medium ${darkMode ? 'text-white' : 'text-slate-700'}`}>
            Analyze Another Test
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== DRUG CHECK ====================
function DrugCheckSection({ darkMode }) {
  const [drugs, setDrugs] = useState([{ name: '', dose: '', frequency: '' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const cardBase = darkMode ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white/80 border-slate-200';
  const inputClass = darkMode ? 'bg-white/[0.05] border-white/[0.1] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200';

  const addDrug = () => setDrugs([...drugs, { name: '', dose: '', frequency: '' }]);
  const updateDrug = (i, field, value) => { const d = [...drugs]; d[i][field] = value; setDrugs(d); };
  const removeDrug = (i) => setDrugs(drugs.filter((_, idx) => idx !== i));

  const analyze = async () => {
    const valid = drugs.filter(d => d.name.trim());
    if (!valid.length) { toast.error('Enter at least one medication'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/analyze-drugs', { drugs: valid });
      setResult(res.data.analysis);
      toast.success('Analysis complete!');
    } catch (err) { toast.error('Failed to analyze'); }
    finally { setLoading(false); }
  };

  return (
    <div className={`${cardBase} backdrop-blur-xl rounded-3xl border p-8`}>
      <div className="text-center mb-8">
        <div className="relative inline-block mb-5">
          <div className="absolute -inset-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-3xl blur opacity-30" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
            <Pill className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Drug Interaction Checker</h2>
        <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Check for interactions and get nutrition advice</p>
      </div>

      {!result ? (
        <>
          <div className="space-y-4 mb-5">
            {drugs.map((drug, i) => (
              <div key={i} className="flex gap-3 items-center animate-fadeIn">
                <input value={drug.name} onChange={(e) => updateDrug(i, 'name', e.target.value)} placeholder="Drug name" className={`flex-1 ${inputClass} border rounded-xl px-4 py-4 focus:outline-none text-lg`} />
                <input value={drug.dose} onChange={(e) => updateDrug(i, 'dose', e.target.value)} placeholder="Dose" className={`w-28 ${inputClass} border rounded-xl px-4 py-4 focus:outline-none`} />
                <input value={drug.frequency} onChange={(e) => updateDrug(i, 'frequency', e.target.value)} placeholder="Frequency" className={`w-36 ${inputClass} border rounded-xl px-4 py-4 focus:outline-none`} />
                {drugs.length > 1 && <button onClick={() => removeDrug(i)} className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>}
              </div>
            ))}
          </div>
          <button onClick={addDrug} className={`w-full py-4 border-2 border-dashed ${darkMode ? 'border-white/10 text-slate-400 hover:border-fuchsia-500/50 hover:text-fuchsia-400' : 'border-slate-200 text-slate-500'} rounded-2xl mb-6 transition-all duration-300`}>
            <Plus className="w-5 h-5 inline mr-2" /> Add Medication
          </button>
          <button onClick={analyze} disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all duration-300">
            {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Brain className="w-6 h-6" />}
            {loading ? 'Checking...' : 'Check Interactions'}
          </button>
        </>
      ) : (
        <div className="space-y-5 animate-fadeIn">
          <div className={`${darkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'} border rounded-2xl p-5 flex items-start gap-4`}>
            <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5" />
            <p className="text-amber-500">Always consult a doctor or pharmacist for medical advice.</p>
          </div>
          <div className={`${darkMode ? 'bg-white/[0.05] border-white/[0.1]' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-6`}>
            <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'} whitespace-pre-wrap`}>{result}</p>
          </div>
          <button onClick={() => { setResult(null); setDrugs([{ name: '', dose: '', frequency: '' }]); }} className={`w-full py-4 ${darkMode ? 'bg-white/[0.05] hover:bg-white/[0.1]' : 'bg-slate-100 hover:bg-slate-200'} rounded-2xl transition-all font-medium ${darkMode ? 'text-white' : 'text-slate-700'}`}>
            Check Other Medications
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== MEAL PLAN ====================
function MealPlanSection({ darkMode }) {
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: 'male', goal: 'maintain', activityLevel: 'moderate' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const cardBase = darkMode ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white/80 border-slate-200';
  const inputClass = darkMode ? 'bg-white/[0.05] border-white/[0.1] text-white' : 'bg-slate-50 border-slate-200';

  const generate = async () => {
    if (!form.weight || !form.height || !form.age) { toast.error('Please enter weight, height, and age'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/meal-plan', { ...form, weight: parseFloat(form.weight), height: parseFloat(form.height), age: parseInt(form.age), allergies: [], preferences: [], conditions: [] });
      setResult(res.data.data);
      toast.success('Meal plan created!');
    } catch (err) { toast.error('Failed to create plan'); }
    finally { setLoading(false); }
  };

  return (
    <div className={`${cardBase} backdrop-blur-xl rounded-3xl border p-8`}>
      <div className="text-center mb-8">
        <div className="relative inline-block mb-5">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-30" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
            <Apple className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>AI Meal Planner</h2>
        <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Get a personalized 7-day meal plan</p>
      </div>

      {!result ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <input type="number" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} placeholder="Weight (kg)" className={`${inputClass} border rounded-xl px-4 py-4 focus:outline-none text-lg`} />
            <input type="number" value={form.height} onChange={(e) => setForm({...form, height: e.target.value})} placeholder="Height (cm)" className={`${inputClass} border rounded-xl px-4 py-4 focus:outline-none text-lg`} />
            <input type="number" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} placeholder="Age" className={`${inputClass} border rounded-xl px-4 py-4 focus:outline-none text-lg`} />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} className={`${inputClass} border rounded-xl px-4 py-4 focus:outline-none`}>
              <option value="male">Male</option><option value="female">Female</option>
            </select>
            <select value={form.goal} onChange={(e) => setForm({...form, goal: e.target.value})} className={`${inputClass} border rounded-xl px-4 py-4 focus:outline-none`}>
              <option value="weight_loss">Lose Weight</option><option value="maintain">Maintain</option><option value="weight_gain">Gain Weight</option>
            </select>
            <select value={form.activityLevel} onChange={(e) => setForm({...form, activityLevel: e.target.value})} className={`${inputClass} border rounded-xl px-4 py-4 focus:outline-none`}>
              <option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option>
            </select>
          </div>
          <button onClick={generate} disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all duration-300">
            {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            {loading ? 'Generating...' : 'Generate Meal Plan'}
          </button>
        </>
      ) : (
        <div className="space-y-5 animate-fadeIn">
          {result.dailyCalories && (
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Daily Calories', value: result.dailyCalories, color: 'from-emerald-500 to-teal-500' },
                { label: 'Protein', value: result.macros?.protein, color: 'from-blue-500 to-cyan-500' },
                { label: 'Carbs', value: result.macros?.carbs, color: 'from-orange-500 to-amber-500' },
                { label: 'Fat', value: result.macros?.fat, color: 'from-amber-500 to-yellow-500' },
              ].map((item, i) => (
                <div key={i} className={`bg-gradient-to-br ${item.color} p-5 rounded-2xl text-white text-center shadow-lg`}>
                  <p className="text-sm opacity-80 mb-1">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value ?? '-'}</p>
                </div>
              ))}
            </div>
          )}
          {result.rawPlan && (
            <div className={`${darkMode ? 'bg-white/[0.05] border-white/[0.1]' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-6`}>
              <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'} whitespace-pre-wrap`}>{result.rawPlan}</p>
            </div>
          )}
          <button onClick={() => setResult(null)} className={`w-full py-4 ${darkMode ? 'bg-white/[0.05] hover:bg-white/[0.1]' : 'bg-slate-100 hover:bg-slate-200'} rounded-2xl transition-all font-medium ${darkMode ? 'text-white' : 'text-slate-700'}`}>
            Create New Plan
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== HEALTH CHECK ====================
function HealthCheckSection({ darkMode }) {
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: 'male' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const cardBase = darkMode ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white/80 border-slate-200';
  const inputClass = darkMode ? 'bg-white/[0.05] border-white/[0.1] text-white' : 'bg-slate-50 border-slate-200';

  const analyze = async () => {
    if (!form.weight || !form.height) { toast.error('Please enter weight and height'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/health-analysis', { weight: parseFloat(form.weight), height: parseFloat(form.height), age: form.age ? parseInt(form.age) : null, gender: form.gender });
      setResult(res.data.data);
      toast.success('Analysis complete!');
    } catch (err) { toast.error('Failed to analyze'); }
    finally { setLoading(false); }
  };

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return 'from-blue-500 to-cyan-500';
    if (bmi < 25) return 'from-emerald-500 to-teal-500';
    if (bmi < 30) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div className={`${cardBase} backdrop-blur-xl rounded-3xl border p-8`}>
      <div className="text-center mb-8">
        <div className="relative inline-block mb-5">
          <div className="absolute -inset-2 bg-gradient-to-r from-rose-500 to-orange-500 rounded-3xl blur opacity-30" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
            <Activity className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Health & BMI Analyzer</h2>
        <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Get your BMI and personalized health insights</p>
      </div>

      {!result ? (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <input type="number" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} placeholder="Weight (kg)" className={`${inputClass} border rounded-xl px-4 py-4 focus:outline-none text-lg`} />
            <input type="number" value={form.height} onChange={(e) => setForm({...form, height: e.target.value})} placeholder="Height (cm)" className={`${inputClass} border rounded-xl px-4 py-4 focus:outline-none text-lg`} />
            <input type="number" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} placeholder="Age" className={`${inputClass} border rounded-xl px-4 py-4 focus:outline-none text-lg`} />
            <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} className={`${inputClass} border rounded-xl px-4 py-4 focus:outline-none`}>
              <option value="male">Male</option><option value="female">Female</option>
            </select>
          </div>
          <button onClick={analyze} disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all duration-300">
            {loading ? <Loader className="w-6 h-6 animate-spin" /> : <TrendingUp className="w-6 h-6" />}
            {loading ? 'Analyzing...' : 'Analyze Health'}
          </button>
        </>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-3 gap-5">
            <div className={`bg-gradient-to-br ${getBMIColor(result.bmi)} p-6 rounded-2xl text-white text-center shadow-lg`}>
              <Scale className="w-10 h-10 mx-auto mb-3" />
              <p className="text-sm opacity-80">Your BMI</p>
              <p className="text-4xl font-bold my-2">{result.bmi}</p>
              <p className="text-sm font-medium">{result.bmiCategory}</p>
            </div>
            <div className={`${darkMode ? 'bg-white/[0.05] border-white/[0.1]' : 'bg-slate-50 border-slate-200'} border p-6 rounded-2xl text-center`}>
              <Target className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ideal Weight</p>
              <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{result.idealWeightRange?.min}-{result.idealWeightRange?.max}</p>
              <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>kg</p>
            </div>
            {result.bodyFat && (
              <div className={`${darkMode ? 'bg-white/[0.05] border-white/[0.1]' : 'bg-slate-50 border-slate-200'} border p-6 rounded-2xl text-center`}>
                <Ruler className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Body Fat</p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{result.bodyFat}%</p>
              </div>
            )}
          </div>
          {result.analysis && (
            <div className={`${darkMode ? 'bg-white/[0.05] border-white/[0.1]' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-6`}>
              <h3 className={`font-bold text-lg mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                <Heart className="w-6 h-6 text-rose-500" /> AI Health Analysis
              </h3>
              <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'} whitespace-pre-wrap`}>{result.analysis}</p>
            </div>
          )}
          <button onClick={() => setResult(null)} className={`w-full py-4 ${darkMode ? 'bg-white/[0.05] hover:bg-white/[0.1]' : 'bg-slate-100 hover:bg-slate-200'} rounded-2xl transition-all font-medium ${darkMode ? 'text-white' : 'text-slate-700'}`}>
            Check Again
          </button>
        </div>
      )}
    </div>
  );
}
