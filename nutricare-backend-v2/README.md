# NutriCare Backend v2 - Mobile API

Backend جدید برای اپلیکیشن موبایل NutriCare با قابلیت‌های پیشرفته

## 🚀 ویژگی‌ها

- ✅ Authentication با JWT
- ✅ مدیریت وعده‌های غذایی
- ✅ ردیابی سلامتی روزانه
- ✅ یکپارچگی AI (آماده برای هر API)
- ✅ پشتیبانی از Offline Sync
- ✅ ام��ن با Rate Limiting و Validation

## 📦 نصب و راه‌اندازی

### 1. نصب Dependencies

```bash
cd nutricare-backend-v2
npm install
```

### 2. تنظیم MongoDB

مطمئن شوید MongoDB در سیستم شما نصب و اجرا شده است:

```bash
# macOS
brew services start mongodb-community

# یا به صورت دستی
mongod --dbpath /path/to/data/db
```

### 3. تنظیم Environment Variables

فایل `.env` را بررسی کنید و در صورت نیاز تغییر دهید.

### 4. اجرای Backend

```bash
# Development mode
npm run dev

# Build و Production
npm run build
npm start
```

Backend روی `http://localhost:5002` اجرا می‌شود.

## 📚 API Endpoints

### Authentication

```
POST   /api/v2/auth/register      - ثبت‌نام کاربر جدید
POST   /api/v2/auth/login         - ورود کاربر
GET    /api/v2/auth/me            - دریافت اطلاعات کاربر (نیاز به token)
PUT    /api/v2/auth/update-profile - به‌روزرسانی پروفایل
```

### Meals

```
GET    /api/v2/meals/today        - وعده‌های امروز
GET    /api/v2/meals/date/:date   - وعده‌های یک تاریخ خاص
POST   /api/v2/meals              - افزودن وعده غذایی
PUT    /api/v2/meals/:id          - ویرایش وعده
DELETE /api/v2/meals/:id          - حذف وعده
GET    /api/v2/meals/common-foods - لیست غذاهای متداول
```

### Health

```
GET    /api/v2/health/dashboard   - داده‌های داشبورد
GET    /api/v2/health/today       - لاگ سلامتی امروز
PUT    /api/v2/health/today       - به‌روزرسانی لاگ امروز
POST   /api/v2/health/water/add   - افزودن لیوان آب
GET    /api/v2/health/weight/history - تاریخچه وزن
POST   /api/v2/health/weight      - ثبت وزن
```

### AI Services

```
POST   /api/v2/ai/chat                  - چت با AI
POST   /api/v2/ai/analyze-food          - تحلیل تصویر غذا
POST   /api/v2/ai/analyze-lab-test      - تحلیل آزمایش لب
POST   /api/v2/ai/analyze-medications   - تحلیل داروها
POST   /api/v2/ai/generate-meal-plan    - ایجاد برنامه غذایی
POST   /api/v2/ai/health-analysis       - تحلیل سلامت و BMI
```

## 🧪 تست با Postman

### 1. ثبت‌نام کاربر

```json
POST http://localhost:5002/api/v2/auth/register
{
  "firstName": "علی",
  "lastName": "محمدی",
  "email": "ali@example.com",
  "password": "123456"
}
```

### 2. ورود و دریافت Token

```json
POST http://localhost:5002/api/v2/auth/login
{
  "email": "ali@example.com",
  "password": "123456"
}
```

توکن دریافتی را کپی کنید.

### 3. دریافت داشبورد (نیاز به Token)

```
GET http://localhost:5002/api/v2/health/dashboard
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. افزودن وعده غذایی

```json
POST http://localhost:5002/api/v2/meals
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body:
{
  "mealType": "lunch",
  "name": "چلو کباب",
  "calories": 650,
  "protein": 35,
  "carbs": 75,
  "fat": 20
}
```

### 5. تست AI - تحلیل سلامت

```json
POST http://localhost:5002/api/v2/ai/health-analysis
{
  "weight": 75,
  "height": 175,
  "age": 30,
  "gender": "male"
}
```

## 🔧 جایگزینی AI API

برای استفاده از AI API خودتان:

1. فایل `src/services/aiService.ts` را باز کنید
2. متدهای مختلف را با API خودتان جایگزین کنید
3. API key را در `.env` تنظیم کنید

مثال:

```typescript
async chat(message: string): Promise<string> {
  const response = await fetch('YOUR_AI_API_URL', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  return data.response;
}
```

## 📝 Models

### User
- اطلاعات پایه (نام، ایمیل، رمز)
- داده‌های سلامتی (وزن، قد، سطح فعالیت)
- توکن‌های دستگاه (برای نوتیفیکیشن)
- تنظیمات نوتیفیکیشن

### Meal
- نوع وعده (صبحانه، ناهار، شام، میان‌وعده)
- کالری و ماکروها
- داده‌های اسکن (برای تصاویر غذا)
- پشتیبانی از Offline Sync

### HealthLog
- مصرف آب
- وزن
- خواب و گام
- حالت روحی

### Medication
- نام و دوز دارو
- زمان‌بندی مصرف
- یادآوری‌ها
- لاگ مصرف

## 🔐 امنیت

- ✅ Password hashing با bcrypt
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ MongoDB sanitization
- ✅ Helmet security headers
- ✅ Input validation

## 📊 Database

MongoDB با Mongoose ODM

## 🛠️ Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- AI Integration Ready

## 📞 پشتیبانی

برای سوالات و مشکلات، issue ایجاد کنید.
