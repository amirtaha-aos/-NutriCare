# 🔧 وضعیت ساخت APK - NutriCare

## ✅ کارهای انجام شده

### 1. Android Folder - کامل شد! ✅

تمام فایل‌های ضروری Android ایجاد شد:

```
android/
├── build.gradle              ✅ پیکربندی اصلی Gradle
├── settings.gradle           ✅ تنظیمات پروژه
├── gradle.properties         ✅ پراپرتی‌های Gradle
├── gradle/wrapper/           ✅ Gradle Wrapper
└── app/
    ├── build.gradle          ✅ پیکربندی App
    ├── proguard-rules.pro    ✅ قوانین ProGuard
    ├── debug.keystore        ✅ Keystore برای Debug
    └── src/main/
        ├── AndroidManifest.xml              ✅ مانیفست اپلیکیشن
        ├── java/com/nutricare/
        │   ├── MainActivity.kt              ✅ Activity اصلی
        │   └── MainApplication.kt           ✅ Application کلاس
        └── res/
            └── values/
                ├── strings.xml              ✅ نام اپلیکیشن
                └── styles.xml               ✅ استایل‌ها
```

**Package Name:** `com.nutricare`
**Version:** 1.0.0 (versionCode: 1)
**Min SDK:** Android 5.0 (API 21)
**Target SDK:** Android 13 (API 33)

---

## ⚠️ مشکل فعلی: اتصال به اینترنت

### علت مشکل:

npm نمی‌تواند به اینترنت متصل شود برای دانلود dependencies:

```
npm error code ECONNRESET
npm error syscall read
npm error errno -54
npm error network read ECONNRESET
```

### آزمایش شده:

- ✅ npm registry پیش‌فرض
- ✅ npm registry آلترناتیو (npmmirror.com)
- ✅ افزایش timeout و retry
- ✅ Clear cache

همه با خطای شبکه مواجه شدند.

---

## 🔧 راه‌حل‌های پیشنهادی

### روش 1: بررسی اتصال اینترنت

```bash
# تست اتصال
ping google.com
ping registry.npmjs.org

# بررسی proxy
npm config get proxy
npm config get https-proxy
```

اگر پشت proxy هستید:
```bash
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port
```

برای حذف proxy:
```bash
npm config delete proxy
npm config delete https-proxy
```

---

### روش 2: استفاده از اتصال دیگر

- WiFi دیگری امتحان کنید
- از mobile hotspot استفاده کنید
- VPN را خاموش/روشن کنید

---

### روش 3: استفاده از اسکریپت خودکار

وقتی اینترنت شما stable شد:

```bash
cd "/Users/amirtaha/Desktop/projects /nutricare"
chmod +x build-apk.sh
./build-apk.sh
```

این اسکریپت:
1. npm install را اجرا می‌کند
2. Dependencies را نصب می‌کند
3. APK را می‌سازد
4. APK را روی Desktop کپی می‌کند

---

### روش 4: ساخت دستی (بعد از حل مشکل شبکه)

#### مرحله 1: نصب Dependencies

```bash
cd "/Users/amirtaha/Desktop/projects /nutricare/nutricare-mobile"

# حذف cache
rm -rf node_modules
rm package-lock.json
npm cache clean --force

# نصب
npm install
```

#### مرحله 2: ساخت APK

```bash
cd android

# Clean
./gradlew clean

# Build APK
./gradlew assembleRelease

# کپی به Desktop
cp app/build/outputs/apk/release/app-release.apk ~/Desktop/nutricare-v1.0.0.apk

echo "✅ APK آماده است: ~/Desktop/nutricare-v1.0.0.apk"
```

---

## 📋 Checklist بعد از حل مشکل

- [ ] اتصال اینترنت stable شد
- [ ] npm install با موفقیت اجرا شد
- [ ] node_modules ایجاد شد
- [ ] ./gradlew assembleRelease اجرا شد
- [ ] APK ساخته شد
- [ ] APK تست شد روی گوشی
- [ ] APK به GitHub Release آپلود شد

---

## 🎯 گام بعدی: ایجاد GitHub Release

بعد از ساخت APK:

### روش 1: Web UI (آسان‌تر)

1. **برو به:**
   ```
   https://github.com/amirtaha-aos/-NutriCare/releases/new
   ```

2. **Tag:** `v1.0.0`

3. **Title:** `NutriCare v1.0.0 - AI Nutrition Assistant`

4. **Description:**
   ```markdown
   # 🥗 NutriCare v1.0.0

   اولین نسخه رسمی - دستیار هوشمند تغذیه با AI

   ## ✨ ویژگی‌ها
   - تحلیل تصویر غذا با GPT-4 Vision
   - برنامه غذایی هوشمند
   - برنامه ورزشی شخصی
   - AI Chatbot مشاوره تغذیه
   - ردیابی کالری و سلامتی

   ## 📲 نصب
   1. دانلود APK
   2. نصب روی اندروید
   3. ثبت‌نام و استفاده

   ## ⚙️ نیازمندی‌ها
   - Android 5.0+ (API 21+)
   - 100MB فضای خالی
   - اتصال اینترنت
   ```

5. **آپلود APK:**
   - کلیک "Attach binaries"
   - انتخاب `nutricare-v1.0.0.apk`

6. **Publish release**

---

### روش 2: GitHub CLI

```bash
cd "/Users/amirtaha/Desktop/projects /nutricare"

# Tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Release با APK
gh release create v1.0.0 \
  ~/Desktop/nutricare-v1.0.0.apk \
  --title "NutriCare v1.0.0" \
  --notes "اولین نسخه رسمی NutriCare - دستیار هوشمند تغذیه با AI"
```

---

## 📞 لینک‌های مفید

- **Repository:** https://github.com/amirtaha-aos/-NutriCare
- **Backend API:** http://localhost:8000 (local)
- **راهنمای کامل:** [CREATE_RELEASE.md](CREATE_RELEASE.md)
- **دستورات سریع:** [QUICK_COMMANDS.md](QUICK_COMMANDS.md)

---

## 💡 نکته مهم

**همه چیز آماده است!** فقط نیاز به اتصال اینترنت stable دارید تا:
1. npm dependencies نصب شوند
2. APK ساخته شود
3. به GitHub Release آپلود شود

Android folder و تمام configuration ها کامل است. ✅

---

**آخرین بروزرسانی:** 2026-01-04

وضعیت: منتظر حل مشکل اتصال اینترنت
