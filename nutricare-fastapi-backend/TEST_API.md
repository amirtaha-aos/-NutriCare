# 🧪 راهنمای تست API

## 🚀 اجرای Backend

```bash
cd nutricare-fastapi-backend
source venv/bin/activate
python main.py
```

Backend روی `http://localhost:8000` اجرا می‌شود.

---

## 📚 Swagger UI

برو به: **http://localhost:8000/docs**

همه endpoints را می‌بینی و می‌تونی مستقیم تست کنی.

---

## 🧪 تست با cURL

### 1. Health Check ✅

```bash
curl http://localhost:8000/health
```

**پاسخ:**
```json
{
  "status": "healthy",
  "environment": "development"
}
```

---

### 2. ثبت‌نام کاربر 👤

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

**پاسخ:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "ali@test.com",
    "first_name": "علی",
    "last_name": "محمدی"
  }
}
```

**توکن را کپی کن!** برای بقیه درخواست‌ها نیاز داری.

---

### 3. ورود 🔐

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ali@test.com",
    "password": "123456"
  }'
```

---

### 4. دریافت پروفایل 👨

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 5. به‌روزرسانی پروفایل ✏️

```bash
curl -X PUT http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "male",
    "weight": 75,
    "height": 175,
    "activity_level": "moderate",
    "goal": "weight_loss"
  }'
```

---

### 6. چت با AI 💬

```bash
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "چطور میتونم وزن کم کنم؟"
  }'
```

---

### 7. تحلیل تصویر غذا 🍽️

```bash
curl -X POST http://localhost:8000/api/ai/analyze-food-image \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/food.jpg" \
  -F "meal_type=lunch"
```

---

### 8. افزودن وعده غذایی 🍴

```bash
curl -X POST http://localhost:8000/api/meals/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "meal_type": "lunch",
    "name": "چلو کباب",
    "calories": 650,
    "protein": 35,
    "carbs": 75,
    "fats": 22
  }'
```

---

### 9. دریافت وعده‌های امروز 📅

```bash
curl -X GET http://localhost:8000/api/meals/today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 10. داشبورد سلامتی 💪

```bash
curl -X GET http://localhost:8000/api/health/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 11. ثبت ورزش 🏃

```bash
curl -X POST http://localhost:8000/api/exercise/log \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_type": "دویدن",
    "duration_minutes": 30,
    "intensity": "moderate"
  }'
```

---

### 12. تولید برنامه غذایی 📋

```bash
curl -X POST http://localhost:8000/api/ai/generate-meal-plan \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 500000,
    "currency": "تومان",
    "location_city": "تهران",
    "location_country": "ایران",
    "available_items": ["برنج", "مرغ", "سبزیجات"],
    "dietary_restrictions": [],
    "duration_days": 7
  }'
```

---

### 13. تولید برنامه ورزشی 🏋️

```bash
curl -X POST http://localhost:8000/api/ai/generate-workout-plan \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "fitness_level": "beginner",
    "goal": "تناسب اندام"
  }'
```

---

## ✅ Checklist تست

- [ ] Backend اجرا می‌شود
- [ ] MongoDB متصل است
- [ ] Swagger UI کار می‌کند
- [ ] ثبت‌نام کاربر موفق است
- [ ] ورود کاربر و دریافت توکن موفق است
- [ ] به‌روزرسانی پروفایل کار می‌کند
- [ ] چت با AI پاسخ می‌دهد
- [ ] تحلیل تصویر غذا کار می‌کند
- [ ] افزودن وعده غذایی موفق است
- [ ] ثبت ورزش کار می‌کند
- [ ] تولید برنامه غذایی موفق است
- [ ] تولید برنامه ورزشی موفق است

---

## 🐛 رفع مشکلات

### خطای MongoDB Connection

```
Could not connect to MongoDB
```

**راه حل:**
```bash
mongosh -u root --port 27017 --host nutri -p KmmryUC2AtJ32s4PbtuI2Icf --authenticationDatabase admin
```

اگر خطا داد، MongoDB را راه‌اندازی کنید.

---

### خطای 401 Unauthorized

```
{"detail": "Invalid or expired token"}
```

**راه حل:**
- توکن را دوباره بگیر (login کن)
- توکن را به درستی در Header بذار:
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```

---

### خطای OpenAI API

```
{"detail": "AI service error: ..."}
```

**راه حل:**
- بررسی کن API key در `.env` درست است
- اطمینان حاصل کن که API key منقضی نشده

---

## 🎉 همه چیز کار کرد؟

اگر همه تست‌ها موفق بودند، Backend آماده است! ✅

**مرحله بعدی:** اتصال Mobile App به Backend
