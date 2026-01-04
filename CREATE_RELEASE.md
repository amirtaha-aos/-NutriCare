# 📦 راهنمای ایجاد GitHub Release و توزیع APK

این راهنما به شما کمک می‌کند که APK را بسازید و در GitHub Release قرار دهید.

---

## 🚀 روش 1: استفاده از اسکریپت خودکار (پیشنهادی)

### مرحله 1: اجرای اسکریپت

```bash
cd "/Users/amirtaha/Desktop/projects /nutricare"
./build-apk.sh
```

این اسکریپت:
- ✅ پیش‌نیازها را بررسی می‌کند
- ✅ Dependencies را نصب می‌کند
- ✅ Android را initialize می‌کند
- ✅ APK را می‌سازد
- ✅ APK را در Desktop کپی می‌کند

**خروجی:** `~/Desktop/nutricare-v1.0.0.apk`

---

## 📤 روش 2: ساخت دستی APK

### پیش‌نیازها

#### 1. نصب Node.js
```bash
# بررسی
node -v  # باید 18+ باشد

# نصب (اگر نیست)
# از https://nodejs.org/ دانلود کنید
```

#### 2. نصب Java JDK
```bash
# بررسی
java -version

# نصب با Homebrew (macOS)
brew install --cask adoptopenjdk

# یا دانلود از:
# https://adoptium.net/
```

#### 3. نصب Android Studio (اختیاری اما توصیه می‌شود)
دانلود از: https://developer.android.com/studio

### مراحل ساخت

#### مرحله 1: نصب Dependencies

```bash
cd "/Users/amirtaha/Desktop/projects /nutricare/nutricare-mobile"
npm install
```

#### مرحله 2: Initialize Android

اگر پوشه `android` وجود نداره:

```bash
# ساخت پروژه موقت
npx react-native init TempApp --skip-install

# کپی پوشه android
cp -r TempApp/android .

# پاک کردن پروژه موقت
rm -rf TempApp
```

#### مرحله 3: تنظیم Package Name

باز کنید: `android/app/build.gradle`

```gradle
defaultConfig {
    applicationId "com.nutricare"
    minSdkVersion 21
    targetSdkVersion 33
    versionCode 1
    versionName "1.0.0"
}
```

باز کنید: `android/app/src/main/res/values/strings.xml`

```xml
<resources>
    <string name="app_name">NutriCare</string>
</resources>
```

#### مرحله 4: Build APK

```bash
cd android

# Clean
./gradlew clean

# Build Release APK
./gradlew assembleRelease

# APK در:
# android/app/build/outputs/apk/release/app-release.apk
```

#### مرحله 5: کپی به Desktop

```bash
cp app/build/outputs/apk/release/app-release.apk ~/Desktop/nutricare-v1.0.0.apk
```

---

## 🔐 روش 3: ساخت APK با Signing (برای Production)

### مرحله 1: ساخت Keystore

```bash
cd "/Users/amirtaha/Desktop/projects /nutricare/nutricare-mobile"

keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/nutricare-release-key.keystore \
  -alias nutricare-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**مهم:** پسورد را یادداشت کنید! (مثلاً: `nutricare2026`)

### مرحله 2: تنظیم gradle.properties

ایجاد/ویرایش: `android/gradle.properties`

```properties
MYAPP_UPLOAD_STORE_FILE=nutricare-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=nutricare-key
MYAPP_UPLOAD_STORE_PASSWORD=nutricare2026
MYAPP_UPLOAD_KEY_PASSWORD=nutricare2026

org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.daemon=false
```

### مرحله 3: تنظیم build.gradle

ویرایش: `android/app/build.gradle`

در بخش `android` اضافه کنید:

```gradle
android {
    ...

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

### مرحله 4: Build APK Signed

```bash
cd android
./gradlew clean
./gradlew assembleRelease

# APK Signed در:
# android/app/build/outputs/apk/release/app-release.apk
```

**⚠️ مهم:** فایل keystore را backup بگیرید! بدون آن نمی‌توانید update بدهید.

```bash
cp android/app/nutricare-release-key.keystore ~/Dropbox/Backups/
# یا هر جای امن دیگری
```

---

## 🌐 ایجاد GitHub Release

### روش 1: از طریق Web UI (آسان‌تر)

1. **برو به GitHub:**
   https://github.com/amirtaha-aos/-NutriCare/releases/new

2. **Tag version:**
   - Tag: `v1.0.0`
   - Target: `main`

3. **Release title:**
   ```
   NutriCare v1.0.0 - AI-Powered Nutrition Assistant
   ```

4. **Description:**
   ```markdown
   # 🥗 NutriCare v1.0.0

   اولین نسخه رسمی NutriCare - دستیار هوشمند تغذیه

   ## ✨ ویژگی‌ها

   - ✅ تحلیل تصویر غذا با AI (کالری، ماکروها، روغن، افزودنی‌ها)
   - ✅ تحلیل قبل/بعد غذا (درصد مصرف)
   - ✅ تحلیل آزمایش خون
   - ✅ بررسی تداخلات دارویی
   - ✅ AI Chatbot مشاوره تغذیه 24/7
   - ✅ برنامه غذایی هوشمند (بودجه + محل + مواد موجود)
   - ✅ برنامه ورزشی شخصی
   - ✅ محاسبه کالری سوخته (30+ ورزش)
   - ✅ اتصال Samsung Health
   - ✅ BMI, BMR, TDEE Calculator

   ## 📲 نصب

   1. دانلود APK از پایین
   2. نصب روی گوشی اندروید
   3. ثبت‌نام و استفاده

   ## ⚙️ نیازمندی‌ها

   - Android 5.0+ (API 21+)
   - حداقل 100MB فضا
   - اتصال به اینترنت

   ## 🔗 لینک‌ها

   - Backend API: http://your-backend-url.com
   - مستندات: https://github.com/amirtaha-aos/-NutriCare#readme

   ## 📝 تغییرات

   - اولین نسخه عمومی
   ```

5. **آپلود APK:**
   - در قسمت "Attach binaries"
   - کلیک "choose your files"
   - انتخاب `nutricare-v1.0.0.apk` از Desktop
   - صبر تا آپلود شود

6. **تنظیمات:**
   - ✅ این یک **Pre-release** است (اگر هنوز beta است)
   - یا این یک **Latest release** است (برای نسخه نهایی)

7. **Publish release:**
   کلیک روی "Publish release"

---

### روش 2: از طریق GitHub CLI (برای پیشرفته‌ها)

#### نصب GitHub CLI

```bash
# macOS
brew install gh

# ورود
gh auth login
```

#### ایجاد Release

```bash
cd "/Users/amirtaha/Desktop/projects /nutricare"

# ایجاد tag
git tag -a v1.0.0 -m "Release v1.0.0: First official release"
git push origin v1.0.0

# ایجاد release با APK
gh release create v1.0.0 \
  ~/Desktop/nutricare-v1.0.0.apk \
  --title "NutriCare v1.0.0 - AI-Powered Nutrition Assistant" \
  --notes "اولین نسخه رسمی NutriCare

✨ ویژگی‌ها:
- تحلیل تصویر غذا با AI
- برنامه غذایی هوشمند
- برنامه ورزشی شخصی
- و بیش از 10 ویژگی دیگر

📲 نصب: دانلود APK و نصب روی اندروید
⚙️ نیازمندی‌ها: Android 5.0+

مستندات کامل: https://github.com/amirtaha-aos/-NutriCare#readme"
```

---

## 📊 بررسی APK

بعد از ساخت، APK را بررسی کنید:

```bash
# اندازه APK
du -h ~/Desktop/nutricare-v1.0.0.apk

# اطلاعات APK (نیاز به aapt)
aapt dump badging ~/Desktop/nutricare-v1.0.0.apk | grep -E "package|versionCode|versionName"
```

---

## 📱 تست APK

### روش 1: نصب روی گوشی واقعی

1. فایل APK را به گوشی منتقل کنید
2. Settings > Security > Unknown sources را فعال کنید
3. APK را باز و نصب کنید

### روش 2: استفاده از Android Emulator

```bash
# لیست emulators
emulator -list-avds

# اجرای emulator
emulator -avd Pixel_5_API_30

# نصب APK
adb install ~/Desktop/nutricare-v1.0.0.apk
```

---

## 🔄 به‌روزرسانی Release

برای نسخه جدید:

1. **تغییر Version:**
   - `android/app/build.gradle`: `versionCode` و `versionName`
   - مثلاً: `versionCode 2`, `versionName "1.1.0"`

2. **Build APK جدید**

3. **ایجاد Release جدید:**
   - Tag: `v1.1.0`
   - آپلود APK جدید
   - توضیح تغییرات

---

## ✅ Checklist

قبل از Release:

- [ ] APK ساخته شد
- [ ] APK تست شد روی گوشی
- [ ] Version number درست است
- [ ] Changelog نوشته شد
- [ ] Screenshot‌ها آماده است (اختیاری)
- [ ] Backend در production اجرا می‌شود
- [ ] API Key‌ها معتبر هستند
- [ ] مستندات به‌روز است

---

## 🎉 بعد از Release

لینک دانلود APK:
```
https://github.com/amirtaha-aos/-NutriCare/releases/latest/download/nutricare-v1.0.0.apk
```

یا لینک صفحه Release:
```
https://github.com/amirtaha-aos/-NutriCare/releases/latest
```

---

## 🐛 رفع مشکلات

### خطا: `JAVA_HOME` تنظیم نیست

```bash
# macOS
export JAVA_HOME=$(/usr/libexec/java_home)
echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.zshrc
```

### خطا: `SDK location not found`

ایجاد: `android/local.properties`

```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

### خطا: `Gradle build failed`

```bash
cd android
./gradlew clean
rm -rf .gradle
./gradlew assembleRelease
```

---

**موفق باشید!** 🚀

همه چیز برای ساخت و انتشار APK آماده است.
