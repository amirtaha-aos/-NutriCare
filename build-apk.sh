#!/bin/bash

# 🚀 NutriCare APK Builder Script
# این اسکریپت تمام مراحل ساخت APK را خودکار انجام می‌دهد

set -e  # Exit on error

echo "🚀 NutriCare APK Builder"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# بررسی پیش‌نیازها
echo "📋 بررسی پیش‌نیازها..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js نصب نیست!${NC}"
    echo "نصب کنید: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm نصب نیست!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm: $(npm -v)${NC}"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${YELLOW}⚠️  Java نصب نیست!${NC}"
    echo "نصب کنید: brew install --cask adoptopenjdk"
    echo "یا از https://adoptium.net/ دانلود کنید"
    exit 1
fi
echo -e "${GREEN}✅ Java: $(java -version 2>&1 | head -n 1)${NC}"

echo ""
echo "📦 مرحله 1: نصب Dependencies"
echo "================================"

cd nutricare-mobile

# Install npm packages
if [ ! -d "node_modules" ]; then
    echo "نصب npm packages..."
    npm install
else
    echo "✅ node_modules موجود است"
fi

echo ""
echo "🔧 مرحله 2: Initialize React Native Android"
echo "=============================================="

# Initialize Android if not exists
if [ ! -d "android" ]; then
    echo "ایجاد پوشه Android..."
    npx react-native init NutriCareMobile --skip-install

    # Copy android folder
    if [ -d "NutriCareMobile/android" ]; then
        cp -r NutriCareMobile/android .
        rm -rf NutriCareMobile
        echo "✅ پوشه Android ایجاد شد"
    else
        echo -e "${RED}❌ خطا در ایجاد پوشه Android${NC}"
        exit 1
    fi
else
    echo "✅ پوشه Android موجود است"
fi

echo ""
echo "⚙️  مرحله 3: تنظیمات Android"
echo "=============================="

# Update app name in android
sed -i '' 's/NutriCareMobile/NutriCare/g' android/app/src/main/res/values/strings.xml 2>/dev/null || true
sed -i '' 's/com.nutricaremobile/com.nutricare/g' android/app/build.gradle 2>/dev/null || true

# Set version
VERSION="1.0.0"
VERSION_CODE="1"

cat > android/app/build.gradle << 'EOF'
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"

react {
    /* Folders */
    root = file("../../")
    reactNativeDir = file("../../node_modules/react-native")
    codegenDir = file("../../node_modules/@react-native/codegen")
}

android {
    compileSdkVersion 33
    namespace "com.nutricare"

    defaultConfig {
        applicationId "com.nutricare"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            // Release signing config - will be added if keystore exists
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            signingConfig signingConfigs.debug
        }
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
}
EOF

echo "✅ تنظیمات Android به‌روز شد"

echo ""
echo "🏗️  مرحله 4: Build APK"
echo "======================="

cd android

# Clean
echo "پاک‌سازی build قبلی..."
./gradlew clean

# Build APK
echo "ساخت APK (ممکن است چند دقیقه طول بکشد)..."
./gradlew assembleRelease

if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo -e "${GREEN}✅ APK با موفقیت ساخته شد!${NC}"

    # Copy to desktop
    APK_NAME="nutricare-v${VERSION}.apk"
    cp app/build/outputs/apk/release/app-release.apk ~/Desktop/"$APK_NAME"

    # Get file size
    APK_SIZE=$(du -h ~/Desktop/"$APK_NAME" | cut -f1)

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}🎉 APK آماده است!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📍 مسیر: ~/Desktop/$APK_NAME"
    echo "📦 حجم: $APK_SIZE"
    echo ""
    echo "نسخه: $VERSION"
    echo "Build: $VERSION_CODE"
    echo ""
    echo -e "${YELLOW}⚠️  این APK با debug keystore ساخته شده${NC}"
    echo "برای production از release keystore استفاده کنید"
    echo ""

else
    echo -e "${RED}❌ خطا در ساخت APK${NC}"
    echo "لاگ خطا را بررسی کنید"
    exit 1
fi

echo ""
echo "📤 مرحله بعدی: GitHub Release"
echo "==============================="
echo ""
echo "برای ایجاد Release در GitHub:"
echo "1. برو به: https://github.com/amirtaha-aos/-NutriCare/releases/new"
echo "2. Tag: v${VERSION}"
echo "3. Title: NutriCare v${VERSION}"
echo "4. آپلود APK از Desktop"
echo "5. Publish release"
echo ""
echo -e "${GREEN}✨ تمام!${NC}"
