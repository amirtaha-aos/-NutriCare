const LabTest = require('../models/LabTest');
const Patient = require('../models/Patient');

// ثبت آزمایش جدید
exports.createLabTest = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل بیمار یافت نشد'
      });
    }

    const labTest = await LabTest.create({
      patient: patient._id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: labTest
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت آزمایش',
      error: err.message
    });
  }
};

// دریافت همه آزمایش‌های بیمار
exports.getMyLabTests = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل بیمار یافت نشد'
      });
    }

    const labTests = await LabTest.find({ patient: patient._id })
      .sort({ testDate: -1 });

    res.json({
      success: true,
      count: labTests.length,
      data: labTests
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت آزمایش‌ها'
    });
  }
};

// دریافت یک آزمایش خاص
exports.getLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'آزمایش یافت نشد'
      });
    }

    // بررسی نتایج غیرطبیعی
    const abnormalResults = labTest.getAbnormalResults();

    res.json({
      success: true,
      data: {
        ...labTest.toObject(),
        abnormalResults
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت آزمایش'
    });
  }
};

// به‌روزرسانی آزمایش
exports.updateLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'آزمایش یافت نشد'
      });
    }

    res.json({
      success: true,
      data: labTest
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی آزمایش'
    });
  }
};

// تحلیل آزمایش با AI
exports.analyzeLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'آزمایش یافت نشد'
      });
    }

    const patient = await Patient.findById(labTest.patient).populate('user', 'name');
    const abnormalResults = labTest.getAbnormalResults();

    // تحلیل اولیه بدون AI
    const analysis = {
      summary: generateBasicAnalysis(labTest, abnormalResults),
      concerns: abnormalResults.map(r => {
        const testNames = {
          hemoglobin: 'هموگلوبین',
          fastingGlucose: 'قند خون ناشتا',
          totalCholesterol: 'کلسترول کل',
          ldl: 'کلسترول بد (LDL)',
          hdl: 'کلسترول خوب (HDL)',
          triglycerides: 'تری‌گلیسرید',
          vitaminD: 'ویتامین D',
          vitaminB12: 'ویتامین B12',
          iron: 'آهن',
          tsh: 'TSH تیروئید'
        };
        return `${testNames[r.test] || r.test}: ${r.value} ${r.unit} (${r.status === 'low' ? 'پایین' : 'بالا'})`;
      }),
      recommendations: generateRecommendations(abnormalResults),
      analyzedAt: new Date()
    };

    // ذخیره تحلیل
    labTest.aiAnalysis = analysis;
    await labTest.save();

    res.json({
      success: true,
      data: {
        labTest,
        analysis,
        abnormalResults
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در تحلیل آزمایش',
      error: err.message
    });
  }
};

// تولید تحلیل پایه
function generateBasicAnalysis(labTest, abnormalResults) {
  if (abnormalResults.length === 0) {
    return 'تمام نتایج آزمایش در محدوده طبیعی قرار دارند. وضعیت سلامت شما مطلوب است.';
  }

  const count = abnormalResults.length;
  return `${count} مورد از نتایج آزمایش خارج از محدوده طبیعی است. توصیه می‌شود با پزشک خود مشورت کنید.`;
}

// تولید توصیه‌ها
function generateRecommendations(abnormalResults) {
  const recommendations = [];

  abnormalResults.forEach(result => {
    switch (result.test) {
      case 'hemoglobin':
        if (result.status === 'low') {
          recommendations.push('مصرف غذاهای غنی از آهن مانند گوشت قرمز، اسفناج و حبوبات');
          recommendations.push('مصرف ویتامین C برای جذب بهتر آهن');
        }
        break;
      case 'fastingGlucose':
        if (result.status === 'high') {
          recommendations.push('کاهش مصرف قند و کربوهیدرات‌های ساده');
          recommendations.push('افزایش فعالیت بدنی');
          recommendations.push('مشاوره با متخصص غدد');
        }
        break;
      case 'totalCholesterol':
      case 'ldl':
        if (result.status === 'high') {
          recommendations.push('کاهش مصرف چربی‌های اشباع');
          recommendations.push('افزایش مصرف فیبر و سبزیجات');
          recommendations.push('ورزش منظم');
        }
        break;
      case 'vitaminD':
        if (result.status === 'low') {
          recommendations.push('قرار گرفتن در معرض نور آفتاب');
          recommendations.push('مصرف مکمل ویتامین D');
        }
        break;
      case 'vitaminB12':
        if (result.status === 'low') {
          recommendations.push('مصرف گوشت، تخم مرغ و لبنیات');
          recommendations.push('در صورت گیاهخواری، مصرف مکمل B12');
        }
        break;
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('ادامه رژیم غذایی سالم و فعالیت بدنی منظم');
  }

  return [...new Set(recommendations)]; // حذف موارد تکراری
}

// مقایسه آزمایش‌ها
exports.compareLabTests = async (req, res) => {
  try {
    const { testIds } = req.body;

    const labTests = await LabTest.find({ _id: { $in: testIds } })
      .sort({ testDate: 1 });

    res.json({
      success: true,
      data: labTests
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در مقایسه آزمایش‌ها'
    });
  }
};
