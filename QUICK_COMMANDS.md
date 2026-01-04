# ⚡ دستورات سریع NutriCare

این فایل شامل تمام دستورات مورد نیاز برای اجرا، تست و ساخت APK است.

---

## 🚀 اجرای سریع Backend

```bash
# رفتن به پوشه backend
cd "/Users/amirtaha/Desktop/projects /nutricare/nutricare-fastapi-backend"

# فعال‌سازی virtual environment
source venv/bin/activate

# اجرا
python main.py
```

**✅ Backend اجرا شد:** http://localhost:8000
**✅ Swagger UI:** http://localhost:8000/docs

---

## 📱 اجرای سریع Mobile App

```bash
# رفتن به پوشه mobile
cd "/Users/amirtaha/Desktop/projects /nutricare/nutricare-mobile"

# شروع Metro
npm start

# در ترمینال جدید - اجرای Android
npm run android

# یا اجرای iOS (macOS only)
npm run ios
```

---

## 🧪 تست سریع Backend

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. ثبت‌نام کاربر جدید
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

**توکن را کپی کنید!**

### 3. ورود
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ali@test.com",
    "password": "123456"
  }'
```

### 4. دریافت پروفایل
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. به‌روزرسانی پروفایل
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

### 6. چت با AI
```bash
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "چطور میتونم وزن کم کنم؟"
  }'
```

### 7. تولید برنامه غذایی
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

## 📲 ساخت APK (روش سریع)

```bash
# رفتن به پوشه mobile
cd "/Users/amirtaha/Desktop/projects /nutricare/nutricare-mobile"

# رفتن به پوشه android
cd android

# Clean
./gradlew clean

# Build APK
./gradlew assembleRelease

# کپی به Desktop
cp app/build/outputs/apk/release/app-release.apk ~/Desktop/nutricare.apk

echo "✅ APK آماده است در Desktop!"
```

**APK در:** `~/Desktop/nutricare.apk`

---

## 📲 ساخت APK (با Signing)

### مرحله 1: ساخت Keystore (فقط یک بار)

```bash
cd "/Users/amirtaha/Desktop/projects /nutricare/nutricare-mobile"

keytool -genkeypair -v -storetype PKCS12 \
  -keystore nutricare-release-key.keystore \
  -alias nutricare-key \
  -keyalg RSA -keysize 2048 -validity 10000

# پسورد: nutricare2026 (یا هر چیز دیگری - یادداشت کنید!)
```

### مرحله 2: تنظیم gradle.properties

باز کنید: `android/gradle.properties`

اضافه کنید:
```properties
MYAPP_UPLOAD_STORE_FILE=nutricare-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=nutricare-key
MYAPP_UPLOAD_STORE_PASSWORD=nutricare2026
MYAPP_UPLOAD_KEY_PASSWORD=nutricare2026
```

### مرحله 3: تنظیم build.gradle

باز کنید: `android/app/build.gradle`

در بخش `android`:
```gradle
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
    }
}
```

### مرحله 4: Build

```bash
cd android
./gradlew assembleRelease
```

**APK Signed در:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔄 Git Commands

### Push تغییرات جدید
```bash
cd "/Users/amirtaha/Desktop/projects /nutricare"

git add .
git commit -m "Update: توضیح تغییرات"
git push origin main
```

### ساخت Release جدید
```bash
# Tag کردن
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

بعد برو به GitHub > Releases > New Release و APK را آپلود کن.

---

## 🐛 رفع مشکلات

### خطای MongoDB
```bash
# بررسی اتصال
mongosh -u root --port 27017 --host nutri -p KmmryUC2AtJ32s4PbtuI2Icf --authenticationDatabase admin
```

### خطای Port in Use
```bash
# پیدا کردن process
lsof -i :8000

# Kill کردن
kill -9 <PID>
```

### خطای Node Modules
```bash
cd nutricare-mobile
rm -rf node_modules
npm install
```

### خطای Gradle
```bash
cd nutricare-mobile/android
./gradlew clean
./gradlew assembleRelease
```

### خطای iOS Pods
```bash
cd nutricare-mobile/ios
pod deintegrate
pod install
cd ..
```

---

## 📊 Monitoring Commands

### Backend Logs
```bash
cd nutricare-fastapi-backend
uvicorn main:app --reload --log-level debug
```

### Mobile Logs
```bash
# Android
npm run android -- --verbose

# iOS
npm run ios -- --verbose

# React Native Logs
npx react-native log-android
npx react-native log-ios
```

---

## 🔧 Development Commands

### Backend

```bash
# نصب dependency جدید
pip install package-name
pip freeze > requirements.txt

# ساخت migration (اگر نیاز باشد)
# MongoDB migration ندارد، اما برای reference:
# alembic revision --autogenerate -m "message"
# alembic upgrade head
```

### Mobile

```bash
# نصب dependency جدید
npm install package-name

# iOS
cd ios && pod install && cd ..

# Clear cache
npm start -- --reset-cache

# Type checking
npx tsc --noEmit
```

---

## 📦 Build Commands مختلف

### Android

```bash
# Debug APK
./gradlew assembleDebug

# Release APK
./gradlew assembleRelease

# Release Bundle (AAB) for Play Store
./gradlew bundleRelease

# All variants
./gradlew assemble
```

### iOS (macOS only)

```bash
# Debug
npx react-native run-ios --configuration Debug

# Release
npx react-native run-ios --configuration Release

# Specific device
npx react-native run-ios --device "iPhone Name"
```

---

## 🎯 دستور یک خطی - همه چیز

### Backend + Mobile

```bash
# Terminal 1 - Backend
cd "/Users/amirtaha/Desktop/projects /nutricare/nutricare-fastapi-backend" && source venv/bin/activate && python main.py

# Terminal 2 - Mobile
cd "/Users/amirtaha/Desktop/projects /nutricare/nutricare-mobile" && npm start
```

### Build APK سریع

```bash
cd "/Users/amirtaha/Desktop/projects /nutricare/nutricare-mobile/android" && ./gradlew clean assembleRelease && cp app/build/outputs/apk/release/app-release.apk ~/Desktop/nutricare-$(date +%Y%m%d).apk && echo "✅ APK: ~/Desktop/nutricare-$(date +%Y%m%d).apk"
```

---

## 📝 نکته مهم

**همیشه `.env` را backup بگیرید!**

```bash
cp nutricare-fastapi-backend/.env nutricare-fastapi-backend/.env.backup
```

**همیشه Keystore را backup بگیرید!**

```bash
cp nutricare-mobile/nutricare-release-key.keystore ~/Dropbox/
```

---

**موفق باشید!** 🚀

همه دستورات مورد نیاز را اینجا دارید.
