const NutritionPlan = require('../models/NutritionPlan');
const FoodLog = require('../models/FoodLog');
const Patient = require('../models/Patient');

// ایجاد برنامه تغذیه
exports.createPlan = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل بیمار یافت نشد'
      });
    }

    const plan = await NutritionPlan.create({
      patient: patient._id,
      createdBy: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد برنامه تغذیه',
      error: err.message
    });
  }
};

// دریافت برنامه‌های تغذیه بیمار
exports.getMyPlans = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل بیمار یافت نشد'
      });
    }

    const plans = await NutritionPlan.find({ patient: patient._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت برنامه‌ها'
    });
  }
};

// دریافت برنامه فعال
exports.getActivePlan = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل بیمار یافت نشد'
      });
    }

    const plan = await NutritionPlan.findOne({
      patient: patient._id,
      status: 'active'
    });

    res.json({
      success: true,
      data: plan
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت برنامه'
    });
  }
};

// ثبت غذای خورده شده
exports.logFood = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل بیمار یافت نشد'
      });
    }

    const foodLog = await FoodLog.create({
      patient: patient._id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: foodLog
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت غذا',
      error: err.message
    });
  }
};

// دریافت لاگ غذای روزانه
exports.getDailyLog = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل بیمار یافت نشد'
      });
    }

    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const logs = await FoodLog.find({
      patient: patient._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: 1 });

    // محاسبه جمع کل روز
    const dailyTotals = logs.reduce((acc, log) => {
      acc.calories += log.totalCalories || 0;
      acc.protein += log.totalProtein || 0;
      acc.carbs += log.totalCarbs || 0;
      acc.fat += log.totalFat || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.json({
      success: true,
      data: {
        logs,
        dailyTotals
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت لاگ غذا'
    });
  }
};

// دریافت آمار تغذیه هفتگی
exports.getWeeklyStats = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل بیمار یافت نشد'
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const logs = await FoodLog.find({
      patient: patient._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // گروه‌بندی بر اساس روز
    const dailyStats = {};
    logs.forEach(log => {
      const day = log.date.toISOString().split('T')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      dailyStats[day].calories += log.totalCalories || 0;
      dailyStats[day].protein += log.totalProtein || 0;
      dailyStats[day].carbs += log.totalCarbs || 0;
      dailyStats[day].fat += log.totalFat || 0;
    });

    res.json({
      success: true,
      data: dailyStats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت آمار'
    });
  }
};

// بانک اطلاعات غذایی ساده
exports.searchFood = async (req, res) => {
  try {
    const { query } = req.query;

    // بانک غذایی ساده (بعداً می‌تونیم از API استفاده کنیم)
    const foodDatabase = [
      { name: 'برنج پخته', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, per: '100 گرم' },
      { name: 'مرغ گریل شده', calories: 165, protein: 31, carbs: 0, fat: 3.6, per: '100 گرم' },
      { name: 'تخم مرغ', calories: 155, protein: 13, carbs: 1.1, fat: 11, per: '100 گرم' },
      { name: 'نان سنگک', calories: 265, protein: 9, carbs: 55, fat: 1.2, per: '100 گرم' },
      { name: 'ماست', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, per: '100 گرم' },
      { name: 'سیب', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, per: '100 گرم' },
      { name: 'موز', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, per: '100 گرم' },
      { name: 'گوشت گوساله', calories: 250, protein: 26, carbs: 0, fat: 15, per: '100 گرم' },
      { name: 'عدس پخته', calories: 116, protein: 9, carbs: 20, fat: 0.4, per: '100 گرم' },
      { name: 'سالاد سبزیجات', calories: 20, protein: 1.5, carbs: 4, fat: 0.2, per: '100 گرم' },
      { name: 'پنیر لیقوان', calories: 264, protein: 17, carbs: 1.3, fat: 21, per: '100 گرم' },
      { name: 'گردو', calories: 654, protein: 15, carbs: 14, fat: 65, per: '100 گرم' },
      { name: 'بادام', calories: 579, protein: 21, carbs: 22, fat: 50, per: '100 گرم' },
      { name: 'ماهی سالمون', calories: 208, protein: 20, carbs: 0, fat: 13, per: '100 گرم' },
      { name: 'اسفناج', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, per: '100 گرم' }
    ];

    const results = foodDatabase.filter(food =>
      food.name.includes(query || '')
    );

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در جستجو'
    });
  }
};
