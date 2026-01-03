# 🥗 NutriCare - سیستم کامل تغذیه و سلامت با هوش مصنوعی

<div align="center">

![NutriCare](https://img.shields.io/badge/NutriCare-v2.0.0-00C853?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)
![React Native](https://img.shields.io/badge/React_Native-0.73-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai)

**دستیار هوشمند تغذیه با GPT-4 Vision**

[ویژگی‌ها](#-ویژگی-ها) •
[نصب](#-نصب-و-راه-اندازی) •
[استفاده](#-استفاده) •
[API](#-api-endpoints) •
[دانلود APK](#-دانلود-apk)

</div>

---

## ✨ ویژگی‌ها

### 🤖 هوش مصنوعی پیشرفته

- ✅ **تحلیل تصویر غذا** - کالری، ماکروها، نوع روغن، افزودنی‌ها
- ✅ **تحلیل قبل/بعد غذا** - محاسبه درصد مصرف شده
- ✅ **تحلیل آزمایش خون** - AI تحلیل می‌کند و توصیه می‌دهد
- ✅ **تحلیل داروها** - بررسی تداخلات دارویی
- ✅ **AI Chatbot** - مشاوره 24/7 با متخصص تغذیه AI
- ✅ **برنامه غذایی هوشمند** - بر اساس بودجه، محل، مواد موجود
- ✅ **برنامه ورزشی شخصی** - بر اساس BMI، جنسیت، هدف

### 📊 ردیابی سلامتی

- ✅ **BMI, BMR, TDEE Calculator** - محاسبات دقیق سلامتی
- ✅ **ردیابی کالری** - مصرفی و سوخته شده
- ✅ **ردیابی وزن** - نمودار پیشرفت
- ✅ **ردیابی آب** - هدف‌گذاری و یادآوری
- ✅ **ردیابی قدم** - از Samsung Health
- ✅ **لاگ خواب** - کیفیت و مدت

### 🏃 ورزش و فعالیت

- ✅ **30+ ورزش** - با MET values دقیق
- ✅ **محاسبه کالری سوخته** - بر اساس وزن، شدت، مدت
- ✅ **توصیه ورزش** - مخصوص جنسیت و هدف
- ✅ **اتصال Samsung Health** - sync خودکار

### 🍽️ مدیریت غذا

- ✅ **اسکن غذا با دوربین** - تشخیص خودکار
- ✅ **پایگاه داده غذایی** - هزاران آیتم
- ✅ **وعده‌های روزانه** - صبحانه، ناهار، شام، اسنک
- ✅ **Export PDF** - برنامه غذایی

---

## 🏗️ معماری سیستم

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ UI تمیز  │  │ AI Chat  │  │  Health  │  │Exercise │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────┬───────────────────────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────────────────────┐
│              Backend (FastAPI + Python)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth   │  │ AI APIs  │  │  Health  │  │  Meals  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────┬───────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                  │
┌────────▼────────┐  ┌─────▼──────────┐
│   MongoDB        │  │ OpenAI GPT-4   │
│  (Database)      │  │   Vision API   │
└──────────────────┘  └────────────────┘
```

---

## 🛠️ فناوری‌های استفاده شده

### Frontend (Mobile)
- **React Native 0.73** - Cross-platform
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Navigation** - Routing
- **Axios** - HTTP client

### Backend
- **Python 3.11+** - Language
- **FastAPI** - Web framework
- **OpenAI GPT-4 Vision** - AI engine
- **MongoDB + Beanie** - Database
- **JWT** - Authentication
- **ReportLab** - PDF generation

---

## 📦 نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+
- Python 3.11+
- MongoDB
- OpenAI API Key

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/nutricare.git
cd nutricare
```

### 2. Backend Setup

```bash
cd nutricare-fastapi-backend

# Virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install
pip install -r requirements.txt

# تنظیم .env
cp .env.example .env
# در .env کلید OpenAI و MongoDB را تنظیم کنید

# اجرا
python main.py
```

Backend روی `http://localhost:8000` اجرا می‌شود.

### 3. Mobile App Setup

```bash
cd nutricare-mobile

# Install
npm install

# iOS (macOS only)
cd ios && pod install && cd ..

# اجرا
npm start

# Android
npm run android

# iOS
npm run ios
```

---

## 📱 استفاده

### 1. ثبت‌نام و ورود

- اپ را باز کنید
- ثبت‌نام کنید با ایمیل و رمز
- پروفایل خود را کامل کنید (وزن، قد، سن، جنسیت)

### 2. دریافت برنامه غذایی

- برو به قسمت "Meal Plan"
- بودجه و شهر خود را وارد کنید
- مواد موجود در خانه را انتخاب کنید
- برنامه 7 روزه دریافت کنید
- Export PDF

### 3. اسکن غذا

- برو به "Scan Food"
- عکس غذا بگیر (قبل از خوردن)
- تحلیل دریافت کن
- بعد از خوردن، عکس بگیر
- درصد مصرف محاسبه می‌شود

### 4. چت با AI

- برو به "AI Chat"
- هر سوالی درباره تغذیه بپرس
- پاسخ فوری از AI دریافت کن

### 5. ثبت ورزش

- برو به "Exercise"
- نوع ورزش را انتخاب کن
- مدت و شدت را وارد کن
- کالری سوخته محاسبه می‌شود

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      - ثبت‌نام
POST   /api/auth/login         - ورود
GET    /api/auth/me            - پروفایل
PUT    /api/auth/profile       - به‌روزرسانی
```

### AI Services
```
POST   /api/ai/chat                     - چت با AI
POST   /api/ai/analyze-food-image       - تحلیل غذا
POST   /api/ai/analyze-food-portion     - قبل/بعد
POST   /api/ai/analyze-lab-test         - آزمایش
POST   /api/ai/analyze-medications      - داروها
POST   /api/ai/generate-meal-plan       - برنامه غذایی
POST   /api/ai/generate-workout-plan    - برنامه ورزشی
GET    /api/ai/meal-plan/:id/pdf        - دانلود PDF
```

### Meals
```
POST   /api/meals/             - افزودن وعده
GET    /api/meals/today        - امروز
GET    /api/meals/date/:date   - تاریخ مشخص
DELETE /api/meals/:id          - حذف
```

### Health
```
GET    /api/health/dashboard   - داشبورد
GET    /api/health/today       - امروز
PUT    /api/health/today       - به‌روزرسانی
POST   /api/health/water/add   - افزودن آب
POST   /api/health/weight      - ثبت وزن
```

### Exercise
```
POST   /api/exercise/log           - ثبت ورزش
GET    /api/exercise/history       - تاریخچه
GET    /api/exercise/today         - امروز
GET    /api/exercise/types         - انواع
GET    /api/exercise/recommendations - توصیه‌ها
```

**مستندات کامل:** `http://localhost:8000/docs`

---

## 📲 دانلود APK

### نسخه آماده

📥 [دانلود NutriCare v1.0.0 (APK)](https://github.com/YOUR_USERNAME/nutricare/releases/latest)

**نیازمندی‌ها:**
- Android 5.0+ (API 21+)
- حداقل 100MB فضای خالی
- اتصال به اینترنت

### ساخت خودتان

```bash
cd nutricare-mobile/android
./gradlew assembleRelease
```

APK در: `android/app/build/outputs/apk/release/app-release.apk`

**راهنمای کامل:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🧪 تست

### Backend
```bash
cd nutricare-fastapi-backend
pytest tests/
```

### Mobile
```bash
cd nutricare-mobile
npm test
```

**راهنمای تست:** [TEST_API.md](nutricare-fastapi-backend/TEST_API.md)

---

## 📖 مستندات

- **[README.md](README.md)** - معرفی کلی
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - راهنمای پیاده‌سازی
- **[QUICK_START.md](nutricare-fastapi-backend/QUICK_START.md)** - شروع سریع
- **[TEST_API.md](nutricare-fastapi-backend/TEST_API.md)** - تست API
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deploy و APK

---

## 🤝 مشارکت

1. Fork کنید
2. Branch بسازید (`git checkout -b feature/amazing`)
3. Commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing`)
5. Pull Request باز کنید

---

## 📄 لایسنس

MIT License - به فایل [LICENSE](LICENSE) مراجعه کنید.

---

## 🙏 تشکر

- [OpenAI](https://openai.com/) - GPT-4 Vision API
- [FastAPI](https://fastapi.tiangolo.com/) - Web Framework
- [React Native](https://reactnative.dev/) - Mobile Framework
- [MongoDB](https://www.mongodb.com/) - Database

---

## 📞 پشتیبانی

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/nutricare/issues)
- **Email:** support@nutricare.app
- **Website:** https://nutricare.app

---

<div align="center">

**ساخته شده با ❤️ توسط تیم NutriCare**

⭐ اگر این پروژه به شما کمک کرد، یک ستاره بدهید!

</div>
