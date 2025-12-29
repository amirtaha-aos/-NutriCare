import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Sparkles,
  X,
  Check,
  AlertCircle,
  Apple,
  Flame,
  Droplets,
  Wheat,
  Beef,
  Plus,
  ChevronRight,
  Image,
  Zap,
  Star,
  Info,
  RefreshCw
} from 'lucide-react';

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

// Sample analysis result
const sampleAnalysis = {
  foodName: 'Grilled Chicken Salad',
  confidence: 94,
  servingSize: '1 bowl (350g)',
  calories: 385,
  macros: {
    protein: { value: 42, unit: 'g', percentage: 44 },
    carbs: { value: 18, unit: 'g', percentage: 19 },
    fat: { value: 16, unit: 'g', percentage: 37 },
    fiber: { value: 6, unit: 'g', percentage: 24 }
  },
  healthScore: 92,
  ingredients: [
    { name: 'Grilled Chicken Breast', amount: '150g', calories: 231 },
    { name: 'Mixed Greens', amount: '100g', calories: 20 },
    { name: 'Cherry Tomatoes', amount: '50g', calories: 9 },
    { name: 'Cucumber', amount: '30g', calories: 5 },
    { name: 'Olive Oil Dressing', amount: '20ml', calories: 120 }
  ],
  recommendations: [
    { type: 'positive', text: 'High protein content - great for muscle recovery' },
    { type: 'positive', text: 'Rich in fiber and vitamins from fresh vegetables' },
    { type: 'info', text: 'Consider adding avocado for healthy fats' },
    { type: 'warning', text: 'Watch the dressing portion for calorie control' }
  ],
  allergens: ['None detected'],
  dietaryInfo: ['High Protein', 'Low Carb', 'Keto-Friendly', 'Gluten-Free']
};

const FoodScanner = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult(sampleAnalysis);
    }, 3000);
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="relative rounded-3xl overflow-hidden"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500" />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative z-10 p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Food Scanner</h1>
              <p className="text-cyan-100">Instantly analyze nutrition from food photos</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 text-cyan-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Powered by AI</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-cyan-200" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Instant Analysis</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-cyan-200" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>95% Accuracy</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <motion.div variants={itemVariants}>
          {!selectedImage ? (
            <div
              className={`relative bg-white rounded-3xl p-8 border-2 border-dashed transition-all ${
                dragActive
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-cyan-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
              />

              <div className="text-center py-12">
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center"
                  animate={{ scale: dragActive ? 1.1 : 1 }}
                >
                  <Camera className="w-12 h-12 text-cyan-500" />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Upload Food Photo
                </h3>
                <p className="text-gray-500 mb-6">
                  Drag and drop an image or click to browse
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-cyan-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="w-5 h-5" />
                    Choose Photo
                  </motion.button>

                  <motion.button
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </motion.button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 text-center">
                  Supported formats: JPG, PNG, HEIC • Max size: 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected food"
                  className="w-full h-64 object-cover"
                />
                <motion.button
                  onClick={resetScanner}
                  className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-4 border-4 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="font-medium">Analyzing with AI...</p>
                      <p className="text-sm text-gray-300 mt-1">Identifying ingredients</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {!analysisResult ? (
                  <motion.button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-cyan-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Analyze with AI
                  </motion.button>
                ) : (
                  <div className="flex gap-3">
                    <motion.button
                      onClick={resetScanner}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RefreshCw className="w-5 h-5" />
                      Scan Another
                    </motion.button>
                    <motion.button
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-5 h-5" />
                      Log This Meal
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Scans */}
          <div className="mt-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-gray-400" />
              Recent Scans
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Image className="w-6 h-6 text-gray-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div className="space-y-6" variants={itemVariants}>
          <AnimatePresence mode="wait">
            {analysisResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Main Result Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {analysisResult.foodName}
                      </h2>
                      <p className="text-gray-500">{analysisResult.servingSize}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">{analysisResult.confidence}% match</span>
                    </div>
                  </div>

                  {/* Health Score */}
                  <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Health Score</p>
                        <p className="text-3xl font-bold text-emerald-600">{analysisResult.healthScore}/100</p>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Calories */}
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 mb-6">
                    <Flame className="w-10 h-10 mx-auto text-orange-500 mb-2" />
                    <p className="text-4xl font-bold text-orange-600">{analysisResult.calories}</p>
                    <p className="text-gray-500">Calories</p>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-4 gap-3">
                    <MacroCard
                      icon={<Beef className="w-5 h-5" />}
                      label="Protein"
                      value={analysisResult.macros.protein.value}
                      unit="g"
                      percentage={analysisResult.macros.protein.percentage}
                      color="red"
                    />
                    <MacroCard
                      icon={<Wheat className="w-5 h-5" />}
                      label="Carbs"
                      value={analysisResult.macros.carbs.value}
                      unit="g"
                      percentage={analysisResult.macros.carbs.percentage}
                      color="blue"
                    />
                    <MacroCard
                      icon={<Droplets className="w-5 h-5" />}
                      label="Fat"
                      value={analysisResult.macros.fat.value}
                      unit="g"
                      percentage={analysisResult.macros.fat.percentage}
                      color="yellow"
                    />
                    <MacroCard
                      icon={<Apple className="w-5 h-5" />}
                      label="Fiber"
                      value={analysisResult.macros.fiber.value}
                      unit="g"
                      percentage={analysisResult.macros.fiber.percentage}
                      color="green"
                    />
                  </div>
                </div>

                {/* Dietary Tags */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Dietary Information</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.dietaryInfo.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 rounded-full text-sm font-medium border border-cyan-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ingredients */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Detected Ingredients</h3>
                  <div className="space-y-3">
                    {analysisResult.ingredients.map((ingredient, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Apple className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{ingredient.name}</p>
                            <p className="text-sm text-gray-500">{ingredient.amount}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{ingredient.calories} cal</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-6 border border-purple-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI Recommendations
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((rec, i) => (
                      <RecommendationCard key={i} recommendation={rec} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
              >
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gray-100 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-gray-500">
                    Upload a food photo to see detailed nutrition information
                  </p>
                </div>

                {/* Features */}
                <div className="mt-8 space-y-4">
                  <FeatureItem
                    icon={<Check className="w-5 h-5 text-emerald-500" />}
                    title="Instant Calorie Count"
                    description="Get accurate calorie estimates in seconds"
                  />
                  <FeatureItem
                    icon={<Check className="w-5 h-5 text-emerald-500" />}
                    title="Macro Breakdown"
                    description="See protein, carbs, fat, and fiber content"
                  />
                  <FeatureItem
                    icon={<Check className="w-5 h-5 text-emerald-500" />}
                    title="Ingredient Detection"
                    description="AI identifies all ingredients in your meal"
                  />
                  <FeatureItem
                    icon={<Check className="w-5 h-5 text-emerald-500" />}
                    title="Health Recommendations"
                    description="Get personalized nutrition advice"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

const MacroCard = ({ icon, label, value, unit, percentage, color }) => {
  const colorClasses = {
    red: 'from-red-100 to-rose-100 text-red-600 border-red-200',
    blue: 'from-blue-100 to-indigo-100 text-blue-600 border-blue-200',
    yellow: 'from-amber-100 to-yellow-100 text-amber-600 border-amber-200',
    green: 'from-emerald-100 to-green-100 text-emerald-600 border-green-200'
  };

  return (
    <motion.div
      className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border text-center`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold">{value}{unit}</p>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-xs mt-1 font-medium">{percentage}% DV</p>
    </motion.div>
  );
};

const RecommendationCard = ({ recommendation }) => {
  const typeStyles = {
    positive: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200'
  };

  const typeIcons = {
    positive: <Check className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${typeStyles[recommendation.type]}`}>
      {typeIcons[recommendation.type]}
      <p className="text-sm font-medium">{recommendation.text}</p>
    </div>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="font-medium text-gray-800">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

export default FoodScanner;
