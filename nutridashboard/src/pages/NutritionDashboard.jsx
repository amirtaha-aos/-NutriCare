import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import {
  Home, User, ClipboardList, Pill, Utensils, Camera, TrendingUp,
  MessageCircle, Plus, Droplets, Footprints,
  Moon, Sun, Flame, Target,
  Upload, X, Send, Heart, Activity, CheckCircle,
  ArrowUp, ArrowDown, Minus, Clock, Bot,
  Scale, Ruler, Bell, Leaf, LogOut, Mic, MicOff, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { healthAPI, mealsAPI, chatAPI } from '../services/api';

// ============================================
// SAMPLE DATA
// ============================================
const defaultUserData = {
  name: "User",
  age: 30,
  gender: "Not set",
  weight: 70,
  height: 170,
  targetWeight: 65,
  bodyFat: 25,
  activityLevel: "Moderately Active",
  goal: "Weight Loss",
  dailyCalories: 1800,
  caloriesConsumed: 0,
  waterIntake: 0,
  waterGoal: 8,
  steps: 0,
  stepsGoal: 10000,
  healthScore: 0
};

const weightHistory = [
  { date: 'Jan', weight: 72 },
  { date: 'Feb', weight: 71 },
  { date: 'Mar', weight: 70 },
  { date: 'Apr', weight: 69.5 },
  { date: 'May', weight: 69 },
  { date: 'Jun', weight: 68 }
];


const labResults = [
  { name: 'Glucose', value: 95, min: 70, max: 100, unit: 'mg/dL', status: 'optimal', trend: 'stable' },
  { name: 'HbA1c', value: 5.4, min: 4.0, max: 5.6, unit: '%', status: 'optimal', trend: 'improving' },
  { name: 'Total Cholesterol', value: 195, min: 0, max: 200, unit: 'mg/dL', status: 'normal', trend: 'improving' },
  { name: 'LDL', value: 118, min: 0, max: 100, unit: 'mg/dL', status: 'borderline', trend: 'stable' },
  { name: 'HDL', value: 58, min: 40, max: 60, unit: 'mg/dL', status: 'optimal', trend: 'improving' },
  { name: 'Triglycerides', value: 142, min: 0, max: 150, unit: 'mg/dL', status: 'normal', trend: 'stable' },
  { name: 'Vitamin D', value: 32, min: 30, max: 100, unit: 'ng/mL', status: 'borderline', trend: 'improving' },
  { name: 'Vitamin B12', value: 450, min: 200, max: 900, unit: 'pg/mL', status: 'optimal', trend: 'stable' },
  { name: 'Iron', value: 85, min: 60, max: 170, unit: 'μg/dL', status: 'optimal', trend: 'stable' },
  { name: 'TSH', value: 2.1, min: 0.4, max: 4.0, unit: 'mIU/L', status: 'optimal', trend: 'stable' }
];

const medications = [
  { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily', purpose: 'Bone Health', time: 'Morning' },
  { name: 'Omega-3', dosage: '1000mg', frequency: 'Once daily', purpose: 'Heart Health', time: 'With food' }
];

const interactions = [
  { severity: 'low', drugs: ['Omega-3', 'Vitamin D3'], message: 'These supplements work well together. Omega-3 may enhance Vitamin D absorption.' }
];


const chatMessages = [
  { role: 'assistant', content: "Hello! I'm your AI nutrition assistant. How can I help you today? You can ask me about meal suggestions, nutrition advice, or your health goals." }
];

// ============================================
// HELPER COMPONENTS
// ============================================

const AnimatedNumber = ({ value, suffix = '', prefix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

const CircularProgress = ({ value, max, size = 120, strokeWidth = 10, color = '#10b981', label, sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min((value / max) * 100, 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{label}</span>
        {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    optimal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    normal: 'bg-blue-100 text-blue-700 border-blue-200',
    borderline: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const TrendIndicator = ({ trend }) => {
  const icons = {
    improving: <ArrowUp className="w-4 h-4 text-emerald-500" />,
    declining: <ArrowDown className="w-4 h-4 text-red-500" />,
    stable: <Minus className="w-4 h-4 text-slate-400" />
  };

  return icons[trend];
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function NutritionDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(chatMessages);
  const [waterIntake, setWaterIntake] = useState(0);
  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [todaysMealsData, setTodaysMealsData] = useState([]);
  const [weightHistoryData, setWeightHistoryData] = useState(weightHistory);
  const [commonFoods, setCommonFoods] = useState([]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [newMeal, setNewMeal] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashRes, mealsRes, commonRes] = await Promise.all([
          healthAPI.getDashboard(),
          mealsAPI.getToday(),
          mealsAPI.getCommonFoods()
        ]);

        if (dashRes.data.success) {
          setDashboardData(dashRes.data.data);
          setWaterIntake(dashRes.data.data.today?.waterIntake || 0);
          if (dashRes.data.data.weightHistory?.length > 0) {
            setWeightHistoryData(dashRes.data.data.weightHistory.map(w => ({
              date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              weight: w.weight
            })));
          }
        }

        if (mealsRes.data.success) {
          setTodaysMealsData(mealsRes.data.data);
        }

        if (commonRes.data.success) {
          setCommonFoods(commonRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate totals from today's meals
  const todaysTotals = todaysMealsData.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Get user data merged with API data
  const userData = {
    ...defaultUserData,
    name: user?.firstName || user?.name?.split(' ')[0] || 'User',
    weight: dashboardData?.user?.healthData?.weight || user?.healthData?.weight || defaultUserData.weight,
    height: dashboardData?.user?.healthData?.height || user?.healthData?.height || defaultUserData.height,
    targetWeight: dashboardData?.user?.healthData?.targetWeight || user?.healthData?.targetWeight || defaultUserData.targetWeight,
    dailyCalories: dashboardData?.goals?.calories || defaultUserData.dailyCalories,
    waterIntake: waterIntake,
    caloriesConsumed: todaysTotals.calories
  };

  const [bmiWeight, setBmiWeight] = useState(userData.weight);
  const [bmiHeight, setBmiHeight] = useState(userData.height);
  const [foodAnalysis, setFoodAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Update BMI values when userData changes
  useEffect(() => {
    if (dashboardData?.user?.healthData) {
      setBmiWeight(dashboardData.user.healthData.weight || 70);
      setBmiHeight(dashboardData.user.healthData.height || 170);
    }
  }, [dashboardData]);

  // Handle water intake change - save to backend
  const handleWaterChange = async (amount) => {
    const previousValue = waterIntake;
    setWaterIntake(amount);

    try {
      await healthAPI.setWater(amount);
    } catch (err) {
      console.error('Error saving water intake:', err);
      setWaterIntake(previousValue);
    }
  };

  // Handle adding a meal
  const handleAddMeal = async () => {
    if (!newMeal.name) return;

    try {
      const res = await mealsAPI.add({
        mealType: selectedMealType,
        ...newMeal
      });

      if (res.data.success) {
        setTodaysMealsData([...todaysMealsData, res.data.data]);
        setNewMeal({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
        setShowAddMealModal(false);
      }
    } catch (err) {
      console.error('Error adding meal:', err);
    }
  };

  // Handle quick add from common foods
  const handleQuickAdd = async (food) => {
    try {
      const res = await mealsAPI.add({
        mealType: selectedMealType,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat
      });

      if (res.data.success) {
        setTodaysMealsData([...todaysMealsData, res.data.data]);
      }
    } catch (err) {
      console.error('Error adding meal:', err);
    }
  };

  // Handle deleting a meal
  const handleDeleteMeal = async (mealId) => {
    try {
      await mealsAPI.delete(mealId);
      setTodaysMealsData(todaysMealsData.filter(m => m._id !== mealId));
    } catch (err) {
      console.error('Error deleting meal:', err);
    }
  };

  const bmi = (bmiWeight / ((bmiHeight / 100) ** 2)).toFixed(1);

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6', zone: 0 };
    if (bmi < 25) return { label: 'Normal', color: '#10b981', zone: 1 };
    if (bmi < 30) return { label: 'Overweight', color: '#f59e0b', zone: 2 };
    return { label: 'Obese', color: '#ef4444', zone: 3 };
  };

  const bmiCategory = getBmiCategory(parseFloat(bmi));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: <Sun className="w-6 h-6 text-amber-400" /> };
    if (hour < 17) return { text: 'Good afternoon', icon: <Sun className="w-6 h-6 text-orange-400" /> };
    return { text: 'Good evening', icon: <Moon className="w-6 h-6 text-indigo-400" /> };
  };

  const greeting = getGreeting();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Simulated food analysis
  const analyzeFood = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setFoodAnalysis({
        items: ['Grilled Chicken Breast', 'Brown Rice', 'Steamed Broccoli', 'Olive Oil Drizzle'],
        calories: 485,
        protein: 42,
        carbs: 38,
        fat: 16,
        fiber: 6,
        sodium: 380,
        verdict: 'good',
        verdictText: 'Great Choice!',
        insights: [
          'Excellent protein content supporting your muscle goals',
          'Good complex carbs from brown rice for sustained energy',
          'Low sodium - perfect for heart health',
          'Consider adding more vegetables for extra fiber'
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const [chatSessionId, setChatSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const userMessage = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsSending(true);

    try {
      // Start a new session if we don't have one
      let sessionId = chatSessionId;
      if (!sessionId) {
        const startRes = await chatAPI.start('Nutrition Consultation');
        if (startRes.data.success) {
          sessionId = startRes.data.data.sessionId;
          setChatSessionId(sessionId);
        }
      }

      // Send message to AI
      const res = await chatAPI.sendMessage(sessionId, userMessage);
      if (res.data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: res.data.data.response
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I couldn't process your request. Please try again."
      }]);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'profile', icon: User, label: 'My Profile' },
    { id: 'labs', icon: ClipboardList, label: 'Lab Results' },
    { id: 'medications', icon: Pill, label: 'Medications' },
    { id: 'meals', icon: Utensils, label: 'Meal Planner' },
    { id: 'scanner', icon: Camera, label: 'Food Scanner' },
    { id: 'progress', icon: TrendingUp, label: 'Progress' },
    { id: 'chat', icon: MessageCircle, label: 'AI Chat' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 z-40 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 tracking-tight">NutriCare</h1>
              <p className="text-xs text-slate-500">Health Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800">NutriCare</span>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-lg">
          <Bell className="w-5 h-5 text-slate-600" />
        </button>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 z-40 flex items-center justify-around px-4 pb-4">
        {[
          { id: 'dashboard', icon: Home },
          { id: 'scanner', icon: Camera },
          { id: 'chat', icon: MessageCircle },
          { id: 'profile', icon: User }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-3 rounded-xl transition-all ${
              activeTab === item.id
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-500'
            }`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 lg:pt-8 pb-24 lg:pb-8 px-4 lg:px-10 xl:px-12">
        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-emerald-500/20">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  {greeting.icon}
                  <span className="text-emerald-100 text-lg">{greeting.text}</span>
                </div>
                <h2 className="text-2xl lg:text-4xl font-bold mb-2">Welcome back, {userData.name}!</h2>
                <p className="text-emerald-100 text-lg">Track your health and nutrition goals.</p>

                <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-6 h-6 text-orange-300" />
                      <span className="text-base text-emerald-100">Calories</span>
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold">
                      <AnimatedNumber value={userData.caloriesConsumed} />
                    </div>
                    <div className="text-sm text-emerald-200 mt-1">of {userData.dailyCalories} kcal</div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="w-6 h-6 text-blue-300" />
                      <span className="text-base text-emerald-100">Water</span>
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold">{userData.waterIntake}</div>
                    <div className="text-sm text-emerald-200 mt-1">of {userData.waterGoal} glasses</div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <Footprints className="w-6 h-6 text-purple-300" />
                      <span className="text-base text-emerald-100">Steps</span>
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold">
                      <AnimatedNumber value={userData.steps} />
                    </div>
                    <div className="text-sm text-emerald-200 mt-1">of {userData.stepsGoal.toLocaleString()}</div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-6 h-6 text-red-300" />
                      <span className="text-base text-emerald-100">Health Score</span>
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold">{userData.healthScore}</div>
                    <div className="text-sm text-emerald-200 mt-1">out of 100</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Water Tracker */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 lg:p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 text-lg">Water Intake</span>
                    <p className="text-sm text-gray-500">Stay hydrated today</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-xl">
                  {waterIntake}/8
                </span>
              </div>
              <div className="flex gap-3">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <button
                    key={i}
                    onClick={() => handleWaterChange(i)}
                    className={`flex-1 h-12 lg:h-14 rounded-xl transition-all hover:scale-105 ${
                      i <= waterIntake
                        ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-500/30'
                        : 'bg-white border-2 border-blue-200 hover:border-blue-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { icon: Camera, label: 'Scan Meal', desc: 'AI-powered analysis', color: 'from-violet-500 to-purple-600', action: () => setActiveTab('scanner') },
                { icon: Plus, label: 'Log Food', desc: 'Track your meals', color: 'from-emerald-500 to-teal-600', action: () => setActiveTab('meals') },
                { icon: ClipboardList, label: 'Lab Results', desc: 'View biomarkers', color: 'from-blue-500 to-indigo-600', action: () => setActiveTab('labs') },
                { icon: MessageCircle, label: 'Ask AI', desc: 'Nutrition advice', color: 'from-pink-500 to-rose-600', action: () => setActiveTab('chat') }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
                  className={`bg-gradient-to-br ${action.color} p-5 lg:p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left`}
                >
                  <action.icon className="w-8 h-8 mb-3" />
                  <span className="block text-lg font-semibold">{action.label}</span>
                  <span className="text-sm opacity-80">{action.desc}</span>
                </button>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Calorie Progress */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-800 mb-6 text-lg">Today's Calories</h3>
                <div className="flex items-center justify-center mb-6">
                  <CircularProgress
                    value={userData.caloriesConsumed}
                    max={userData.dailyCalories}
                    size={180}
                    strokeWidth={14}
                    color="#10b981"
                    label={userData.caloriesConsumed}
                    sublabel={`of ${userData.dailyCalories} kcal`}
                  />
                </div>
                <div className="text-center bg-emerald-50 rounded-xl py-3">
                  <span className="text-emerald-600 font-bold text-lg">{userData.dailyCalories - userData.caloriesConsumed} kcal</span>
                  <span className="text-slate-500"> remaining</span>
                </div>
              </div>

              {/* Macros Breakdown */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-800 mb-6 text-lg">Macro Breakdown</h3>
                <div className="flex items-center justify-center mb-6">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Protein', value: todaysTotals.protein || 1, color: '#10b981' },
                          { name: 'Carbs', value: todaysTotals.carbs || 1, color: '#3b82f6' },
                          { name: 'Fats', value: todaysTotals.fat || 1, color: '#f97316' }
                        ]}
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f97316" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Protein', amount: `${todaysTotals.protein}g`, color: '#10b981', bg: 'bg-emerald-50' },
                    { name: 'Carbs', amount: `${todaysTotals.carbs}g`, color: '#3b82f6', bg: 'bg-blue-50' },
                    { name: 'Fats', amount: `${todaysTotals.fat}g`, color: '#f97316', bg: 'bg-orange-50' }
                  ].map((macro, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${macro.bg}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: macro.color }}></div>
                        <span className="font-medium text-slate-700">{macro.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{macro.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Meals */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800 text-lg">Today's Meals</h3>
                  <button
                    onClick={() => setActiveTab('meals')}
                    className="text-sm text-emerald-600 font-medium hover:text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {todaysMealsData.length > 0 ? (
                    todaysMealsData.slice(0, 4).map((meal) => (
                      <div
                        key={meal._id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="text-3xl">
                          {meal.mealType === 'breakfast' ? '🍳' : meal.mealType === 'lunch' ? '🥗' : meal.mealType === 'dinner' ? '🍽️' : '🍎'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{meal.name}</p>
                          <p className="text-sm text-slate-500">{meal.mealType} • {meal.calories} kcal</p>
                        </div>
                        <button
                          onClick={() => handleDeleteMeal(meal._id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      onClick={() => setActiveTab('meals')}
                      className="flex items-center gap-4 p-5 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">Add your first meal</p>
                        <p className="text-sm text-slate-500">Track your nutrition today</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Weight Progress Chart */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Weight Progress</h3>
                  <p className="text-slate-500">Your journey to {userData.targetWeight} kg</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-emerald-600">On Track</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weightHistoryData}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={13} tickMargin={10} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" fontSize={13} tickMargin={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={4}
                    fill="url(#weightGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold shadow-lg">
                  {userData.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-800">{userData.name}</h2>
                  <p className="text-slate-500">{user?.email}</p>
                </div>
              </div>

              {/* BMI Calculator */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  BMI Calculator
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        value={bmiWeight}
                        onChange={(e) => setBmiWeight(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Height (cm)</label>
                      <input
                        type="number"
                        value={bmiHeight}
                        onChange={(e) => setBmiHeight(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold mb-2" style={{ color: bmiCategory.color }}>
                      {bmi}
                    </div>
                    <div className="text-lg font-medium text-slate-700 mb-4">{bmiCategory.label}</div>

                    {/* BMI Scale */}
                    <div className="w-full h-3 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-red-400 relative">
                      <div
                        className="absolute w-4 h-4 bg-white rounded-full border-2 shadow-md -top-0.5 transform -translate-x-1/2 transition-all duration-500"
                        style={{
                          left: `${Math.min(Math.max((parseFloat(bmi) - 15) / 25 * 100, 0), 100)}%`,
                          borderColor: bmiCategory.color
                        }}
                      />
                    </div>
                    <div className="flex justify-between w-full mt-2 text-xs text-slate-500">
                      <span>15</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>40</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Current Weight', value: `${userData.weight} kg`, icon: Scale, color: 'text-emerald-600' },
                  { label: 'Target Weight', value: `${userData.targetWeight} kg`, icon: Target, color: 'text-blue-600' },
                  { label: 'Height', value: `${userData.height} cm`, icon: Ruler, color: 'text-violet-600' },
                  { label: 'BMI', value: bmi, icon: Activity, color: 'text-orange-600' }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-4">
                    <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                    <p className="text-xl lg:text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LAB RESULTS VIEW */}
        {activeTab === 'labs' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Lab Results</h2>
                <p className="text-slate-500">Track your biomarkers</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                <Upload className="w-5 h-5" />
                <span className="hidden sm:inline">Upload Results</span>
              </button>
            </div>

            {/* Biomarkers */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-6">Biomarkers</h3>
              <div className="space-y-4">
                {labResults.map((result, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-medium text-slate-800">{result.name}</p>
                        <StatusBadge status={result.status} />
                        <TrendIndicator trend={result.trend} />
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        Reference: {result.min} - {result.max} {result.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl lg:text-2xl font-bold text-slate-800">{result.value}</p>
                        <p className="text-sm text-slate-500">{result.unit}</p>
                      </div>
                      <div className="w-24 lg:w-32">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              result.status === 'optimal' ? 'bg-emerald-500' :
                              result.status === 'normal' ? 'bg-blue-500' :
                              result.status === 'borderline' ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min((result.value / result.max) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEDICATIONS VIEW */}
        {activeTab === 'medications' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Medications & Supplements</h2>
                <p className="text-slate-500">Track your medications</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            {/* Current Medications */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">Current Medications</h3>
              <div className="space-y-3">
                {medications.map((med, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{med.name}</p>
                      <p className="text-sm text-slate-500">{med.dosage} • {med.frequency}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-slate-700">{med.purpose}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {med.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactions */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">Interaction Analysis</h3>
              <div className="space-y-3">
                {interactions.map((int, i) => (
                  <div key={i} className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-800">{int.drugs.join(' + ')}</p>
                        <p className="text-sm text-slate-600 mt-1">{int.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEAL PLANNER VIEW */}
        {activeTab === 'meals' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Meal Planner</h2>
                <p className="text-slate-500">Plan your meals</p>
              </div>
              <button
                onClick={() => setShowAddMealModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Meal</span>
              </button>
            </div>

            {/* Today's Summary */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{todaysTotals.calories}</p>
                  <p className="text-emerald-100 text-sm">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{todaysTotals.protein}g</p>
                  <p className="text-emerald-100 text-sm">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{todaysTotals.carbs}g</p>
                  <p className="text-emerald-100 text-sm">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{todaysTotals.fat}g</p>
                  <p className="text-emerald-100 text-sm">Fat</p>
                </div>
              </div>
            </div>

            {/* Meal Type Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedMealType(type)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedMealType === type
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Today's Meals List */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-6">Today's Meals</h3>
              {todaysMealsData.length > 0 ? (
                <div className="space-y-3">
                  {todaysMealsData.map((meal) => (
                    <div key={meal._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="text-3xl">
                        {meal.mealType === 'breakfast' ? '🍳' : meal.mealType === 'lunch' ? '🥗' : meal.mealType === 'dinner' ? '🍽️' : '🍎'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{meal.name}</p>
                        <p className="text-sm text-slate-500">{meal.mealType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{meal.calories} kcal</p>
                        <p className="text-xs text-slate-500">P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMeal(meal._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Utensils className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No meals logged today</p>
                  <p className="text-sm">Add your first meal to start tracking</p>
                </div>
              )}
            </div>

            {/* Quick Add Common Foods */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">Quick Add Common Foods</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {commonFoods.map((food, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAdd(food)}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all text-left"
                  >
                    <Plus className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{food.name}</p>
                      <p className="text-xs text-slate-500">{food.calories} kcal • P: {food.protein}g</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Meal Modal */}
        {showAddMealModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Add Meal</h3>
                <button
                  onClick={() => setShowAddMealModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Meal Type</label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Food Name</label>
                  <input
                    type="text"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    placeholder="e.g., Grilled Chicken Salad"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Calories</label>
                    <input
                      type="number"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({ ...newMeal, calories: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Protein (g)</label>
                    <input
                      type="number"
                      value={newMeal.protein}
                      onChange={(e) => setNewMeal({ ...newMeal, protein: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Carbs (g)</label>
                    <input
                      type="number"
                      value={newMeal.carbs}
                      onChange={(e) => setNewMeal({ ...newMeal, carbs: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Fat (g)</label>
                    <input
                      type="number"
                      value={newMeal.fat}
                      onChange={(e) => setNewMeal({ ...newMeal, fat: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddMeal}
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                >
                  Add Meal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOD SCANNER VIEW */}
        {activeTab === 'scanner' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800">AI Food Scanner</h2>
              <p className="text-slate-500">Take a photo of your meal for instant analysis</p>
            </div>

            {/* Scanner Area */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
              {!foodAnalysis ? (
                <div className="text-center">
                  <div className="w-40 h-40 lg:w-48 lg:h-48 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-6 border-4 border-dashed border-slate-300">
                    <Camera className="w-12 h-12 lg:w-16 lg:h-16 text-slate-400" />
                  </div>
                  <p className="text-slate-600 mb-6">Upload a photo of your meal or take one now</p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <button
                      onClick={analyzeFood}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <Camera className="w-5 h-5" />
                      Take Photo
                    </button>
                    <button
                      onClick={analyzeFood}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Image
                    </button>
                  </div>

                  {isAnalyzing && (
                    <div className="mt-8">
                      <div className="w-16 h-16 mx-auto border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="mt-4 text-slate-600">Analyzing your meal with AI...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Verdict */}
                  <div className="text-center p-6 rounded-2xl bg-emerald-50">
                    <div className="text-5xl mb-3">✅</div>
                    <h3 className="text-2xl font-bold text-emerald-600">{foodAnalysis.verdictText}</h3>
                  </div>

                  {/* Food Items */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Identified Foods</h4>
                    <div className="flex flex-wrap gap-2">
                      {foodAnalysis.items.map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-slate-800">{foodAnalysis.calories}</p>
                      <p className="text-sm text-slate-500">Calories</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{foodAnalysis.protein}g</p>
                      <p className="text-sm text-slate-500">Protein</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{foodAnalysis.carbs}g</p>
                      <p className="text-sm text-slate-500">Carbs</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">{foodAnalysis.fat}g</p>
                      <p className="text-sm text-slate-500">Fat</p>
                    </div>
                  </div>

                  {/* Insights */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">AI Insights</h4>
                    <ul className="space-y-2">
                      {foodAnalysis.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setFoodAnalysis(null)}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    Scan Another Meal
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROGRESS VIEW */}
        {activeTab === 'progress' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Progress Tracking</h2>
              <p className="text-slate-500">Monitor your health journey</p>
            </div>

            {/* Weight Progress Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-6">Weight Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weightHistoryData}>
                  <defs>
                    <linearGradient id="weightGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#weightGradient2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI CHAT VIEW */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto h-[calc(100vh-180px)] lg:h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">AI Nutrition Assistant</h2>
                <p className="text-sm text-slate-500">Powered by AI</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 bg-white rounded-3xl p-4 lg:p-6 shadow-sm border border-slate-100 overflow-y-auto mb-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] lg:max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex items-center gap-2">
              <button
                onClick={toggleVoiceInput}
                className={`p-3 rounded-xl transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={isListening ? "Listening..." : "Ask me anything about nutrition..."}
                className="flex-1 px-4 py-3 outline-none text-sm"
                disabled={isSending}
              />
              <button
                onClick={sendMessage}
                disabled={isSending || !chatInput.trim()}
                className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
