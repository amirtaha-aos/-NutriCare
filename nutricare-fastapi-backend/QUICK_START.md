# 🚀 راهنمای سریع اجرا

## ✅ چک‌لیست آماده‌سازی

- [x] MongoDB تنظیم شد
- [x] API Key GPT-4/5.1 اضافه شد
- [x] فایل .env ساخته شد
- [ ] Dependencies نصب شود
- [ ] Backend اجرا شود

---

## 📦 مرحله 1: نصب Dependencies

```bash
cd nutricare-fastapi-backend

# ساخت virtual environment
python3 -m venv venv

# فعال‌سازی
# macOS/Linux:
source venv/bin/activate

# Windows:
# venv\Scripts\activate

# نصب dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 🏃 مرحله 2: اجرای Backend

```bash
# اطمینان از فعال بودن venv
source venv/bin/activate  # macOS/Linux

# اجرا
python main.py

# یا با uvicorn (پیشنهادی):
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

اگر همه چیز درست باشد، باید این پیام را ببینید:

```
🚀 Starting NutriCare FastAPI Backend...
Connecting to MongoDB at mongodb://root:***@nutri:27017/nutricare?authSource=admin
✅ MongoDB connected and Beanie initialized
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🧪 مرحله 3: تست Backend

1. **مستندات API:**
   - برو به: http://localhost:8000/docs
   - Swagger UI باید باز شود

2. **Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```

   پاسخ:
   ```json
   {
     "status": "healthy",
     "environment": "development"
   }
   ```

---

## ⚠️ رفع مشکلات رایج

### 1. خطای MongoDB Connection

```
Could not connect to MongoDB
```

**راه حل:**
```bash
# بررسی اتصال MongoDB
mongosh -u root --port 27017 --host nutri -p KmmryUC2AtJ32s4PbtuI2Icf --authenticationDatabase admin

# اگر متصل شد، MongoDB کار می‌کند
# اگر خطا داد، MongoDB را راه‌اندازی کنید
```

---

### 2. خطای Import Module

```
ModuleNotFoundError: No module named 'fastapi'
```

**راه حل:**
```bash
# مطمئن شوید venv فعال است
source venv/bin/activate

# دوباره نصب کنید
pip install -r requirements.txt
```

---

### 3. خطای OpenAI API

```
AuthenticationError: Invalid API key
```

**راه حل:**
- بررسی کنید API key در `.env` درست است
- مطمئن شوید که API key منقضی نشده
- اگر از سرویس خاصی استفاده می‌کنید، `AI_BASE_URL` را تنظیم کنید

---

### 4. خطای Port Already in Use

```
Address already in use
```

**راه حل:**
```bash
# پیدا کردن process روی پورت 8000
lsof -i :8000

# kill کردن process
kill -9 <PID>

# یا استفاده از پورت دیگر
uvicorn main:app --port 8001
```

---

## 🔍 بررسی Logs

اگر مشکلی پیش آمد، logs را بررسی کنید:

```bash
# اجرا با لاگ کامل
uvicorn main:app --reload --log-level debug
```

---

## 📊 مرحله بعدی: ایجاد API Endpoints

Backend شما الان اجرا می‌شود ولی API endpoints هنوز ساخته نشده‌اند.

**فایل‌هایی که باید بسازید:**

```bash
nutricare-fastapi-backend/api/
├── __init__.py
├── auth.py          # ثبت‌نام، ورود، پروفایل
├── ai.py            # تمام سرویس‌های AI
├── meals.py         # مدیریت وعده‌های غذایی
├── health.py        # ردیابی سلامتی
├── exercise.py      # ثبت و ردیابی ورزش
└── samsung_health.py # اتصال Samsung Health
```

نمونه‌کدها در [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md) موجود است.

---

## 🎯 تست API با cURL

بعد از ساخت endpoints، این دستورات را تست کنید:

### ثبت‌نام کاربر:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "علی",
    "last_name": "محمدی",
    "email": "ali@test.com",
    "password": "123456"
  }'
```

### ورود:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ali@test.com",
    "password": "123456"
  }'
```

### تحلیل غذا (با token):
```bash
curl -X POST http://localhost:8000/api/ai/analyze-food-image \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/food.jpg" \
  -F "meal_type=lunch"
```

---

## 📱 اتصال Mobile App

بعد از اینکه Backend کار کرد:

1. در `nutricare-mobile/src/services/api.config.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP:8000';  // نه localhost!
   ```

2. IP خود را پیدا کنید:
   ```bash
   # macOS/Linux:
   ifconfig | grep "inet "

   # Windows:
   ipconfig
   ```

3. Mobile app را اجرا کنید:
   ```bash
   cd nutricare-mobile
   npm start
   npm run android
   ```

---

## ✅ Backend آماده است!

اگر همه مراحل را انجام دادید:
- ✅ MongoDB متصل است
- ✅ Backend اجرا می‌شود
- ✅ Swagger UI در دسترس است: http://localhost:8000/docs

**مرحله بعدی:** ایجاد API Endpoints طبق راهنمای [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)

---

**موفق باشید!** 🎉

اگر مشکلی پیش آمد، لاگ‌ها را بررسی کنید یا از Swagger UI برای تست استفاده کنید.
