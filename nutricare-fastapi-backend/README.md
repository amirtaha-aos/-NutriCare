# NutriCare FastAPI Backend

Backend هوشمند NutriCare با Python FastAPI و OpenAI GPT-4 Vision

## ویژگی‌های کامل

### 1. تحلیل هوشمند غذا با تصویر
- ✅ تحلیل کامل تصویر غذا (کالری، کربوهیدرات، پروتئین، چربی)
- ✅ تشخیص قبل و بعد غذا (محاسبه درصد مصرف شده)
- ✅ توضیحات تفصیلی (نوع روغن، افزودنی‌ها، طرز تهیه)
- ✅ تشخیص چند غذا در یک تصویر

### 2. تحلیل آزمایش‌های پزشکی
- ✅ آپلود تصویر آزمایش خون
- ✅ تحلیل نتایج با AI
- ✅ توصیه‌های تغذیه‌ای مرتبط با وضعیت سلامتی
- ✅ هشدارهای سلامتی

### 3. تحلیل داروها
- ✅ بررسی تداخلات دارویی
- ✅ توصیه‌های تغذیه‌ای بر اساس داروهای مصرفی
- ✅ زمان‌بندی مصرف دارو با غذا
- ✅ محدودیت‌های غذایی

### 4. AI Chatbot مشاوره تغذیه
- ✅ چت زنده با متخصص تغذیه AI
- ✅ پاسخ به سوالات تخصصی
- ✅ شخصی‌سازی بر اساس پروفایل کاربر
- ✅ حفظ تاریخچه گفتگو

### 5. برنامه غذایی هوشمند
- ✅ ایجاد برنامه بر اساس قد، وزن، سن، جنسیت
- ✅ در نظر گرفتن بودجه مالی
- ✅ لیست خرید بر اساس مکان جغرافیایی (شهر/کشور)
- ✅ استفاده از مواد موجود در خانه
- ✅ رژیم‌های مختلف (کاهش وزن، حفظ وزن، افزایش عضله)
- ✅ در نظر گرفتن بیماری‌ها و محدودیت‌های غذایی
- ✅ Export به PDF

### 6. برنامه ورزشی
- ✅ پیشنهاد ورزش بر اساس BMI و جنسیت
- ✅ دسته‌بندی ورزش‌ها:
  - زنان: پیلاتس، یوگا، آئروبیک، کاردیو
  - مردان: باشگاه، وزنه، کراس‌فیت، کاردیو
- ✅ برنامه هفتگی تمرین
- ✅ ویدیوهای آموزشی (لینک‌ها)

### 7. ردیابی کالری سوخته
- ✅ ثبت ورزش انجام شده
- ✅ محاسبه کالری بر اساس:
  - نوع ورزش
  - مدت زمان
  - شدت (مبتدی، متوسط، حرفه‌ای)
  - وزن و سن کاربر
- ✅ پشتیبانی از ورزش‌های متنوع (شنا، دوچرخه، اسب‌سواری، پیاده‌روی و...)

### 8. اتصال به Samsung Health
- ✅ خواندن داده‌های قدم شماری
- ✅ دریافت تاریخچه ورزش
- ✅ همگام‌سازی کالری سوخته
- ✅ وزن و فشار خون

### 9. محاسبات سلامتی
- ✅ BMI Calculator
- ✅ TDEE (Total Daily Energy Expenditure)
- ✅ BMR (Basal Metabolic Rate)
- ✅ Ideal Weight Range
- ✅ Body Fat Percentage Estimation

## فناوری‌های استفاده شده

- **Python 3.11+**
- **FastAPI** - وب فریمورک مدرن و سریع
- **OpenAI GPT-4 Vision** - تحلیل تصویر و متن
- **MongoDB** - پایگاه داده NoSQL
- **Motor** - درایور async MongoDB
- **Beanie** - ODM برای MongoDB
- **Pydantic** - Data validation
- **JWT** - Authentication
- **ReportLab** - تولید PDF
- **Python-multipart** - آپلود فایل
- **Pillow** - پردازش تصویر
- **httpx** - HTTP client برای Samsung Health

## نصب و راه‌اندازی

### پیش‌نیازها

```bash
# Python 3.11+
python --version

# MongoDB
brew install mongodb-community  # macOS
# یا از Docker استفاده کنید
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### نصب Dependencies

```bash
cd nutricare-fastapi-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### تنظیمات Environment

فایل `.env` ایجاد کنید:

```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Database
MONGODB_URL=mongodb://localhost:27017
DB_NAME=nutricare

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Samsung Health (optional)
SAMSUNG_CLIENT_ID=your-samsung-client-id
SAMSUNG_CLIENT_SECRET=your-samsung-client-secret
```

### اجرا

```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production با Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Backend در `http://localhost:8000` اجرا می‌شود.

## API Documentation

بعد از اجرا، مستندات API در این آدرس‌ها در دسترس است:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## ساختار پروژه

```
nutricare-fastapi-backend/
├── main.py                      # Entry point
├── requirements.txt             # Dependencies
├── .env                        # Environment variables
├── config/
│   └── settings.py             # تنظیمات پروژه
├── models/
│   ├── user.py                 # User model
│   ├── meal.py                 # Meal model
│   ├── health_log.py           # Health tracking
│   ├── medication.py           # Medications
│   ├── exercise.py             # Exercise tracking
│   └── chat_history.py         # Chat history
├── schemas/
│   ├── user.py                 # User schemas
│   ├── meal.py                 # Meal schemas
│   ├── ai.py                   # AI request/response schemas
│   └── exercise.py             # Exercise schemas
├── api/
│   ├── auth.py                 # Authentication endpoints
│   ├── ai.py                   # AI services endpoints
│   ├── meals.py                # Meal management
│   ├── health.py               # Health tracking
│   ├── exercise.py             # Exercise tracking
│   └── samsung_health.py       # Samsung Health integration
├── services/
│   ├── openai_service.py       # OpenAI GPT-4 Vision service
│   ├── nutrition_service.py    # Nutrition calculations
│   ├── exercise_service.py     # Exercise & calorie burn
│   ├── pdf_service.py          # PDF generation
│   └── samsung_health.py       # Samsung Health API
├── utils/
│   ├── auth.py                 # JWT utilities
│   ├── dependencies.py         # FastAPI dependencies
│   └── validators.py           # Custom validators
└── database/
    └── db.py                   # Database connection
```

## API Endpoints

### Authentication

```
POST   /api/auth/register           - ثبت‌نام
POST   /api/auth/login              - ورود
GET    /api/auth/me                 - پروفایل کاربر
PUT    /api/auth/profile            - به‌روزرسانی پروفایل
```

### AI Services

```
POST   /api/ai/chat                     - چت با AI
POST   /api/ai/analyze-food-image       - تحلیل تصویر غذا
POST   /api/ai/analyze-food-portion     - تحلیل قبل/بعد غذا (درصد مصرف)
POST   /api/ai/analyze-lab-test         - تحلیل آزمایش
POST   /api/ai/analyze-medications      - تحلیل داروها
POST   /api/ai/generate-meal-plan       - ایجاد برنامه غذایی
POST   /api/ai/generate-workout-plan    - ایجاد برنامه ورزشی
GET    /api/ai/meal-plan/:id/pdf        - دانلود PDF برنامه غذایی
```

### Meals

```
GET    /api/meals                   - لیست وعده‌های غذایی
POST   /api/meals                   - افزودن وعده
GET    /api/meals/:id               - جزئیات وعده
PUT    /api/meals/:id               - ویرایش وعده
DELETE /api/meals/:id               - حذف وعده
GET    /api/meals/today             - وعده‌های امروز
GET    /api/meals/date/:date        - وعده‌های یک تاریخ
```

### Health

```
GET    /api/health/dashboard        - داشبورد سلامتی
GET    /api/health/bmi              - محاسبه BMI
POST   /api/health/weight           - ثبت وزن
GET    /api/health/weight/history   - تاریخچه وزن
```

### Exercise

```
GET    /api/exercise                - لیست ورزش‌ها
POST   /api/exercise/log            - ثبت ورزش
GET    /api/exercise/history        - تاریخچه ورزش
GET    /api/exercise/calories       - کالری سوخته
GET    /api/exercise/types          - انواع ورزش‌ها
```

### Samsung Health

```
POST   /api/samsung/connect         - اتصال به Samsung Health
GET    /api/samsung/steps           - قدم‌های روزانه
GET    /api/samsung/exercises       - ورزش‌های ثبت شده
POST   /api/samsung/sync            - همگام‌سازی داده‌ها
```

## نمونه Request/Response

### تحلیل تصویر غذا

```json
POST /api/ai/analyze-food-image
Content-Type: multipart/form-data

{
  "image": <file>,
  "meal_type": "lunch"
}

Response:
{
  "success": true,
  "data": {
    "detected_foods": [
      {
        "name": "چلو کباب کوبیده",
        "calories": 650,
        "protein": 35,
        "carbs": 75,
        "fats": 22,
        "description": "برنج سفید با کباب کوبیده گوشت گوساله",
        "cooking_details": {
          "oil_type": "روغن مایع آفتابگردان",
          "oil_amount": "2 قاشق غذاخوری",
          "additives": ["پیاز", "زعفران", "سماق"],
          "cooking_method": "کباب شده روی آتش"
        }
      }
    ],
    "total_nutrition": {
      "calories": 650,
      "protein": 35,
      "carbs": 75,
      "fats": 22,
      "fiber": 3
    },
    "recommendations": [
      "به دلیل کالری بالا، برای کاهش وزن نصف پورشن توصیه می‌شود",
      "اضافه کردن سالاد سبزیجات فیبر را افزایش می‌دهد"
    ]
  }
}
```

### تحلیل قبل/بعد غذا

```json
POST /api/ai/analyze-food-portion
Content-Type: multipart/form-data

{
  "before_image": <file>,
  "after_image": <file>
}

Response:
{
  "success": true,
  "data": {
    "consumed_percentage": 65,
    "initial_calories": 650,
    "consumed_calories": 422,
    "remaining_calories": 228,
    "nutrition_consumed": {
      "calories": 422,
      "protein": 23,
      "carbs": 49,
      "fats": 14
    }
  }
}
```

### ایجاد برنامه غذایی هوشمند

```json
POST /api/ai/generate-meal-plan

{
  "user_info": {
    "age": 30,
    "gender": "male",
    "weight": 75,
    "height": 175,
    "activity_level": "moderate",
    "goal": "weight_loss"
  },
  "preferences": {
    "budget": 500000,
    "currency": "تومان",
    "location": {
      "city": "تهران",
      "country": "ایران"
    },
    "available_items": ["برنج", "مرغ", "تخم مرغ", "سبزیجات"],
    "dietary_restrictions": ["بدون لبنیات"],
    "diseases": ["دیابت نوع 2"]
  },
  "duration": 7
}

Response:
{
  "success": true,
  "data": {
    "meal_plan_id": "mp_123456",
    "duration_days": 7,
    "daily_calorie_target": 2000,
    "total_budget": 450000,
    "days": [
      {
        "day": 1,
        "date": "2026-01-04",
        "meals": {
          "breakfast": {
            "name": "املت سبزیجات با نان سنگک",
            "ingredients": ["2 عدد تخم مرغ", "سبزیجات", "نان سنگک"],
            "calories": 350,
            "protein": 18,
            "carbs": 40,
            "fats": 12,
            "cost": 35000,
            "recipe": "املت را با کمی روغن زیتون تهیه کنید..."
          },
          "lunch": {...},
          "dinner": {...},
          "snacks": [...]
        }
      }
    ],
    "shopping_list": {
      "proteins": ["مرغ: 2 کیلو - 180,000 تومان", ...],
      "vegetables": [...],
      "grains": [...],
      "total_cost": 450000
    },
    "nutritional_summary": {
      "daily_avg_calories": 2000,
      "daily_avg_protein": 120,
      "daily_avg_carbs": 200,
      "daily_avg_fats": 65
    }
  }
}
```

### ایجاد برنامه ورزشی

```json
POST /api/ai/generate-workout-plan

{
  "user_info": {
    "age": 25,
    "gender": "female",
    "weight": 60,
    "height": 165,
    "bmi": 22.03,
    "fitness_level": "beginner",
    "goal": "تناسب اندام و انعطاف‌پذیری"
  }
}

Response:
{
  "success": true,
  "data": {
    "recommended_activities": ["پیلاتس", "یوگا", "آئروبیک", "پیاده‌روی"],
    "weekly_plan": [
      {
        "day": "شنبه",
        "exercises": [
          {
            "name": "پیلاتس مبتدی",
            "duration_minutes": 30,
            "intensity": "متوسط",
            "calories_burned": 120,
            "video_url": "https://youtube.com/...",
            "description": "تمرینات پایه پیلاتس برای تقویت کور بدن"
          }
        ]
      }
    ]
  }
}
```

### ثبت ورزش و محاسبه کالری

```json
POST /api/exercise/log

{
  "exercise_type": "اسب سواری",
  "duration_minutes": 45,
  "intensity": "متوسط"
}

Response:
{
  "success": true,
  "data": {
    "exercise_type": "اسب سواری",
    "duration_minutes": 45,
    "intensity": "متوسط",
    "calories_burned": 285,
    "met_value": 5.5,
    "calculation_details": {
      "formula": "MET × وزن(kg) × زمان(ساعت)",
      "user_weight": 75,
      "met": 5.5,
      "duration_hours": 0.75
    }
  }
}
```

## امنیت

- ✅ Password hashing با bcrypt
- ✅ JWT token authentication
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Input validation با Pydantic
- ✅ SQL injection prevention
- ✅ File upload validation

## Testing

```bash
# Unit tests
pytest tests/

# با coverage
pytest --cov=. tests/

# Integration tests
pytest tests/integration/
```

## Deployment

### Docker

```bash
docker build -t nutricare-backend .
docker run -p 8000:8000 --env-file .env nutricare-backend
```

### Docker Compose

```bash
docker-compose up -d
```

## مجوزها

Copyright © 2026 NutriCare Team

## پشتیبانی

برای سوالات و مشکلات، Issue ایجاد کنید یا به ما ایمیل بزنید.
