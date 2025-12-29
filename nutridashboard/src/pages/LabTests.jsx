import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { labTestAPI } from '../services/api';
import {
  TestTube,
  Plus,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Brain,
  Loader,
  X,
  Sparkles,
  Heart,
  Activity,
  Droplets,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  BarChart3
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

const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedTest, setExpandedTest] = useState(null);
  const [analyzing, setAnalyzing] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await labTestAPI.getAll();
      setTests(res.data.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (testId) => {
    setAnalyzing(testId);
    try {
      const res = await labTestAPI.analyze(testId);
      setTests(tests.map(t =>
        t._id === testId ? { ...t, aiAnalysis: res.data.data.analysis } : t
      ));
      toast.success('Analysis completed successfully');
    } catch (error) {
      toast.error('Failed to analyze test');
    } finally {
      setAnalyzing(null);
    }
  };

  const testTypeLabels = {
    blood: 'Blood Test',
    lipid: 'Lipid Profile',
    thyroid: 'Thyroid',
    liver: 'Liver Function',
    kidney: 'Kidney Function',
    vitamin: 'Vitamins',
    complete: 'Complete Panel'
  };

  const testTypeIcons = {
    blood: Droplets,
    lipid: Heart,
    thyroid: Activity,
    vitamin: Sparkles,
    complete: FileText
  };

  const testTypeColors = {
    blood: { bg: 'from-red-400 to-rose-500', light: 'bg-red-100', text: 'text-red-600', shadow: 'shadow-red-200' },
    lipid: { bg: 'from-pink-400 to-rose-500', light: 'bg-pink-100', text: 'text-pink-600', shadow: 'shadow-pink-200' },
    thyroid: { bg: 'from-blue-400 to-indigo-500', light: 'bg-blue-100', text: 'text-blue-600', shadow: 'shadow-blue-200' },
    vitamin: { bg: 'from-amber-400 to-orange-500', light: 'bg-amber-100', text: 'text-amber-600', shadow: 'shadow-amber-200' },
    complete: { bg: 'from-purple-400 to-violet-500', light: 'bg-purple-100', text: 'text-purple-600', shadow: 'shadow-purple-200' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-purple-100"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <TestTube className="absolute inset-0 m-auto w-10 h-10 text-purple-500" />
          </div>
          <p className="text-gray-500 font-medium">Loading your lab tests...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Header */}
      <motion.div
        className="relative overflow-hidden rounded-3xl"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600" />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <motion.div
                className="flex items-center gap-4 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TestTube className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Lab Results</h1>
                  <p className="text-purple-100">AI-powered health insights from your tests</p>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <div className="flex gap-4 mt-6">
                <motion.div
                  className="px-5 py-3 bg-white/15 backdrop-blur-sm rounded-2xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-3xl font-bold text-white">{tests.length}</span>
                  <span className="text-purple-100 text-sm ml-2">Tests Recorded</span>
                </motion.div>
                <motion.div
                  className="px-5 py-3 bg-white/15 backdrop-blur-sm rounded-2xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-3xl font-bold text-emerald-300">{tests.filter(t => t.aiAnalysis).length}</span>
                  <span className="text-purple-100 text-sm ml-2">AI Analyzed</span>
                </motion.div>
              </div>
            </div>

            <motion.button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold shadow-xl shadow-purple-900/20"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-6 h-6" />
              Add New Test
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tests List */}
      {tests.length === 0 ? (
        <motion.div
          className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm"
          variants={itemVariants}
        >
          <motion.div
            className="w-28 h-28 bg-gradient-to-br from-purple-100 to-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <TestTube className="w-14 h-14 text-purple-500" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No tests recorded yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Add your first lab test to get AI-powered insights about your health
          </p>
          <motion.button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-purple-200"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-6 h-6" />
            Add Your First Test
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tests.map((test, index) => {
              const Icon = testTypeIcons[test.testType] || TestTube;
              const colors = testTypeColors[test.testType] || testTypeColors.complete;

              return (
                <motion.div
                  key={test._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Test Header */}
                  <motion.div
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedTest(expandedTest === test._id ? null : test._id)}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                  >
                    <div className="flex items-center gap-5">
                      <motion.div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg ${colors.shadow}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-xl">
                          {testTypeLabels[test.testType] || test.testType}
                        </h3>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          {new Date(test.testDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {test.aiAnalysis ? (
                        <motion.span
                          className="px-5 py-2.5 bg-emerald-100 text-emerald-600 rounded-xl font-medium flex items-center gap-2"
                          whileHover={{ scale: 1.02 }}
                        >
                          <CheckCircle className="w-5 h-5" />
                          Analyzed
                        </motion.span>
                      ) : (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnalyze(test._id);
                          }}
                          disabled={analyzing === test._id}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {analyzing === test._id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader className="w-5 h-5" />
                            </motion.div>
                          ) : (
                            <Brain className="w-5 h-5" />
                          )}
                          AI Analysis
                        </motion.button>
                      )}
                      <motion.div
                        className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center"
                        animate={{ rotate: expandedTest === test._id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedTest === test._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
                          {/* Results */}
                          <div>
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-200">
                                <BarChart3 className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="font-bold text-gray-800 text-lg">Test Results</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {Object.entries(test.results || {}).map(([key, data]) => {
                                if (!data?.value) return null;
                                const isAbnormal = data.normalRange &&
                                  (data.value < data.normalRange.min || data.value > data.normalRange.max);
                                const isHigh = data.normalRange && data.value > data.normalRange.max;

                                return (
                                  <motion.div
                                    key={key}
                                    className={`p-5 rounded-2xl border transition-all ${
                                      isAbnormal
                                        ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
                                        : 'bg-white border-gray-100 hover:border-gray-200'
                                    }`}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                  >
                                    <p className="text-sm text-gray-500 mb-1 font-medium">{getTestLabel(key)}</p>
                                    <div className="flex items-center gap-2">
                                      <p className={`text-2xl font-bold ${isAbnormal ? 'text-red-600' : 'text-gray-800'}`}>
                                        {data.value}
                                      </p>
                                      <span className="text-sm text-gray-400">{data.unit}</span>
                                      {isAbnormal && (
                                        <motion.div
                                          animate={{ y: [0, -2, 0] }}
                                          transition={{ duration: 1, repeat: Infinity }}
                                        >
                                          {isHigh ? (
                                            <TrendingUp className="w-5 h-5 text-red-500" />
                                          ) : (
                                            <TrendingDown className="w-5 h-5 text-blue-500" />
                                          )}
                                        </motion.div>
                                      )}
                                    </div>
                                    {data.normalRange && (
                                      <>
                                        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                          <motion.div
                                            className={`h-full rounded-full ${isAbnormal ? 'bg-gradient-to-r from-red-400 to-rose-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (data.value / data.normalRange.max) * 100)}%` }}
                                            transition={{ duration: 1 }}
                                          />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                          Normal: {data.normalRange.min}-{data.normalRange.max}
                                        </p>
                                      </>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>

                          {/* AI Analysis */}
                          {test.aiAnalysis && (
                            <motion.div
                              className="bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 rounded-3xl p-6 border border-indigo-100"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <div className="flex items-center gap-4 mb-5">
                                <motion.div
                                  className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200"
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                >
                                  <Brain className="w-7 h-7 text-white" />
                                </motion.div>
                                <div>
                                  <h4 className="font-bold text-gray-800 text-lg">AI Analysis</h4>
                                  <p className="text-gray-500">Automated review powered by advanced AI</p>
                                </div>
                                <Sparkles className="w-6 h-6 text-amber-400 ml-auto" />
                              </div>

                              <p className="text-gray-700 mb-5 leading-relaxed text-lg">{test.aiAnalysis.summary}</p>

                              {test.aiAnalysis.concerns?.length > 0 && (
                                <motion.div
                                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 mb-5 border border-amber-200"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                                    <p className="font-bold text-amber-700 text-lg">Areas of Concern</p>
                                  </div>
                                  <ul className="space-y-3">
                                    {test.aiAnalysis.concerns.map((concern, i) => (
                                      <li key={i} className="flex items-start gap-3 text-gray-700">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0"></span>
                                        {concern}
                                      </li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}

                              {test.aiAnalysis.recommendations?.length > 0 && (
                                <motion.div
                                  className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <div className="flex items-center gap-3 mb-4">
                                    <Shield className="w-6 h-6 text-emerald-500" />
                                    <p className="font-bold text-emerald-700 text-lg">Recommendations</p>
                                  </div>
                                  <ul className="space-y-3">
                                    {test.aiAnalysis.recommendations.map((rec, i) => (
                                      <li key={i} className="flex items-start gap-3 text-gray-700">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Test Modal */}
      <AnimatePresence>
        {showModal && (
          <AddTestModal onClose={() => setShowModal(false)} onSuccess={fetchTests} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AddTestModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState('blood');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState({});

  const testFields = {
    blood: ['hemoglobin', 'wbc', 'rbc', 'platelets'],
    lipid: ['totalCholesterol', 'ldl', 'hdl', 'triglycerides'],
    thyroid: ['tsh', 't3', 't4'],
    vitamin: ['vitaminD', 'vitaminB12', 'iron', 'ferritin'],
    complete: ['hemoglobin', 'fastingGlucose', 'totalCholesterol', 'vitaminD']
  };

  const normalRanges = {
    hemoglobin: { min: 12, max: 17 },
    wbc: { min: 4, max: 11 },
    rbc: { min: 4, max: 6 },
    platelets: { min: 150, max: 400 },
    totalCholesterol: { min: 0, max: 200 },
    ldl: { min: 0, max: 100 },
    hdl: { min: 40, max: 100 },
    triglycerides: { min: 0, max: 150 },
    fastingGlucose: { min: 70, max: 100 },
    tsh: { min: 0.4, max: 4 },
    vitaminD: { min: 30, max: 100 },
    vitaminB12: { min: 200, max: 900 },
    iron: { min: 60, max: 170 },
    ferritin: { min: 20, max: 200 }
  };

  const testTypeIcons = {
    blood: Droplets,
    lipid: Heart,
    thyroid: Activity,
    vitamin: Sparkles,
    complete: FileText
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedResults = {};
      Object.entries(results).forEach(([key, value]) => {
        if (value) {
          formattedResults[key] = {
            value: parseFloat(value),
            normalRange: normalRanges[key]
          };
        }
      });

      await labTestAPI.create({
        testType,
        testDate,
        results: formattedResults
      });

      toast.success('Test recorded successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to record test');
    } finally {
      setLoading(false);
    }
  };

  const Icon = testTypeIcons[testType] || TestTube;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Modal Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 p-6 text-white">
          <motion.div
            className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
            animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <Icon className="w-7 h-7" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Add New Test</h2>
                <p className="text-purple-100">Enter your lab results</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all"
              >
                <option value="blood">Blood Test</option>
                <option value="lipid">Lipid Profile</option>
                <option value="thyroid">Thyroid</option>
                <option value="vitamin">Vitamins</option>
                <option value="complete">Complete Panel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Date</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-200">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-800">Test Results</h3>
            </div>
            <div className="space-y-3">
              {testFields[testType]?.map((field) => (
                <motion.div
                  key={field}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.01 }}
                >
                  <label className="w-32 text-sm font-medium text-gray-600">{getTestLabel(field)}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={results[field] || ''}
                    onChange={(e) => setResults({ ...results, [field]: e.target.value })}
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    placeholder={`${normalRanges[field]?.min}-${normalRanges[field]?.max}`}
                  />
                  <span className="text-xs text-gray-400 w-16 text-right">Normal</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-purple-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader className="w-6 h-6" />
                </motion.div>
                Recording...
              </>
            ) : (
              <>
                <Plus className="w-6 h-6" />
                Record Test
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const getTestLabel = (key) => {
  const labels = {
    hemoglobin: 'Hemoglobin',
    wbc: 'WBC',
    rbc: 'RBC',
    platelets: 'Platelets',
    totalCholesterol: 'Total Cholesterol',
    ldl: 'LDL',
    hdl: 'HDL',
    triglycerides: 'Triglycerides',
    fastingGlucose: 'Fasting Glucose',
    hba1c: 'HbA1c',
    tsh: 'TSH',
    t3: 'T3',
    t4: 'T4',
    vitaminD: 'Vitamin D',
    vitaminB12: 'Vitamin B12',
    iron: 'Iron',
    ferritin: 'Ferritin',
    alt: 'ALT',
    ast: 'AST',
    creatinine: 'Creatinine',
    bun: 'BUN'
  };
  return labels[key] || key;
};

export default LabTests;
