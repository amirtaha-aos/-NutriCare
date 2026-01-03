# 📦 راهنمای کامل Deploy و ساخت APK

## 🎯 مراحل کلی

1. ✅ Push کد به GitHub
2. ✅ ساخت APK برای Android
3. ✅ تست و آماده‌سازی برای انتشار

---

## 📤 مرحله 1: Push به GitHub

### 1.1. Initialize Git (اگر قبلاً نکردید)

```bash
cd "/Users/amirtaha/Desktop/projects /nutricare"
git init
git add .
git commit -m "🚀 Initial commit: NutriCare Complete System with FastAPI Backend"
```

### 1.2. ساخت Repository در GitHub

1. برو به https://github.com/new
2. نام repository: `nutricare`
3. Description: `AI-Powered Nutrition Assistant with React Native & FastAPI`
4. Public یا Private انتخاب کن
5. **Create repository** کلیک کن

### 1.3. Push کردن کد

```bash
git remote add origin https://github.com/YOUR_USERNAME/nutricare.git
git branch -M main
git push -u origin main
```

---

## 📱 مرحله 2: ساخت APK برای Android

### 2.1. نصب Java JDK (اگر نداری)

```bash
# macOS
brew install --cask adoptopenjdk

# یا دانلود از:
# https://adoptium.net/

# بررسی نصب:
java -version
```

### 2.2. تنظیمات Android

```bash
cd nutricare-mobile

# 1. ساخت keystore برای signing
keytool -genkeypair -v -storetype PKCS12 \
  -keystore nutricare-release-key.keystore \
  -alias nutricare-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**نکته:** پسورد را یادداشت کن! (مثلاً: `nutricare2026`)

### 2.3. تنظیم Gradle

فایل `android/gradle.properties` را باز کن و این خطوط را اضافه کن:

```properties
MYAPP_UPLOAD_STORE_FILE=nutricare-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=nutricare-key
MYAPP_UPLOAD_STORE_PASSWORD=nutricare2026
MYAPP_UPLOAD_KEY_PASSWORD=nutricare2026
```

### 2.4. تنظیم build.gradle

فایل `android/app/build.gradle` را باز کن:

```gradle
android {
    ...
    defaultConfig {
        applicationId "com.nutricare"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }

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
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 2.5. ساخت APK

```bash
cd android

# Clean build
./gradlew clean

# Build Release APK
./gradlew assembleRelease

# یا Bundle (AAB) برای Google Play:
./gradlew bundleRelease
```

**APK نهایی در:**
```
android/app/build/outputs/apk/release/app-release.apk
```

**Bundle (AAB) در:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔧 مرحله 3: آماده‌سازی Backend در Production

### 3.1. Backend روی Server (VPS/Cloud)

#### گزینه A: Docker (پیشنهادی)

**ساخت Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Create directories
RUN mkdir -p uploads generated_pdfs

# Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=mongodb://mongo:27017/nutricare
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads
      - ./generated_pdfs:/app/generated_pdfs

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

**اجرا:**
```bash
docker-compose up -d
```

#### گزینه B: سرویس‌های Cloud

**Heroku:**
```bash
heroku create nutricare-backend
heroku addons:create mongolab
git push heroku main
```

**Railway.app:**
1. Connect GitHub repo
2. Deploy automatically

**Render.com:**
1. New Web Service
2. Connect GitHub
3. Auto deploy

---

## 📲 مرحله 4: اتصال Mobile به Backend Production

### 4.1. تغییر API Base URL

در `nutricare-mobile/src/services/api.config.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:8000'  // Development
  : 'https://api.nutricare.app';  // Production

export default axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 4.2. Build Final APK

```bash
cd nutricare-mobile
npm run android:release

# یا مستقیم:
cd android
./gradlew assembleRelease
```

---

## 🎉 مرحله 5: انتشار

### Google Play Store

1. **ساخت Developer Account:**
   - https://play.google.com/console
   - هزینه: $25 (یکبار)

2. **ساخت App:**
   - Create app
   - Fill details
   - Upload AAB file
   - Submit for review

### توزیع مستقیم APK

1. **GitHub Releases:**
   ```bash
   # Tag کردن نسخه
   git tag -a v1.0.0 -m "First release"
   git push origin v1.0.0
   ```

2. **آپلود APK:**
   - برو به GitHub > Releases > New Release
   - انتخاب tag: v1.0.0
   - آپلود `app-release.apk`
   - Publish release

---

## 📋 Checklist نهایی

### Backend:
- [ ] کد به GitHub push شد
- [ ] .env به .gitignore اضافه شد
- [ ] Backend روی server deploy شد
- [ ] MongoDB راه‌اندازی شد
- [ ] API در دسترس است (https)
- [ ] SSL certificate فعال است

### Mobile:
- [ ] API URL به production تغییر کرد
- [ ] Keystore ساخته شد
- [ ] gradle.properties تنظیم شد
- [ ] APK ساخته شد
- [ ] APK تست شد
- [ ] APK آپلود شد (GitHub/Play Store)

---

## 🔗 لینک‌های مفید

- **Backend API Docs:** `https://your-domain.com/docs`
- **GitHub Repository:** `https://github.com/YOUR_USERNAME/nutricare`
- **APK Download:** `https://github.com/YOUR_USERNAME/nutricare/releases/latest`

---

## 🚀 دستور سریع برای همه مراحل

```bash
# 1. Push to GitHub
cd "/Users/amirtaha/Desktop/projects /nutricare"
git add .
git commit -m "Complete NutriCare System"
git push origin main

# 2. Build APK
cd nutricare-mobile/android
./gradlew clean assembleRelease

# 3. Copy APK
cp app/build/outputs/apk/release/app-release.apk ~/Desktop/nutricare.apk

# 4. Upload to GitHub Releases
# از UI GitHub استفاده کن
```

---

**موفق باشید!** 🎉
