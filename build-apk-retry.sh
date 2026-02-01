#!/bin/bash

# 🚀 NutriCare APK Builder with Auto-Retry
# این اسکریپت build را تا موفقیت تکرار می‌کند

set +e  # Don't exit on error

# Set Java 17 for compatibility
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 NutriCare APK Builder (Auto-Retry Mode)"
echo "==========================================="
echo ""
echo "این اسکریپت build را تا زمان موفقیت ادامه می‌دهد"
echo "اگر اتصال قطع شد، خودکار retry می‌کند"
echo ""

cd "/Users/amirtaha/Desktop/nutricare2/android"

MAX_RETRIES=20
RETRY_COUNT=0
SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$SUCCESS" = false ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))

    echo ""
    echo -e "${YELLOW}📦 تلاش #${RETRY_COUNT} از ${MAX_RETRIES}...${NC}"
    echo ""

    ./gradlew assembleRelease --no-daemon

    if [ $? -eq 0 ]; then
        SUCCESS=true
        echo ""
        echo -e "${GREEN}✅ Build موفقیت‌آمیز بود!${NC}"

        # Copy APK to Desktop
        if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
            APK_NAME="nutricare-v1.0.0.apk"
            cp app/build/outputs/apk/release/app-release.apk ~/Desktop/"$APK_NAME"
            APK_SIZE=$(du -h ~/Desktop/"$APK_NAME" | cut -f1)

            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo -e "${GREEN}🎉 APK آماده است!${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "📍 مسیر: ~/Desktop/$APK_NAME"
            echo "📦 حجم: $APK_SIZE"
            echo ""
        fi
    else
        echo ""
        echo -e "${RED}❌ Build ناموفق - خطای شبکه${NC}"

        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}⏳ صبر 10 ثانیه قبل از retry...${NC}"
            sleep 10
        fi
    fi
done

if [ "$SUCCESS" = false ]; then
    echo ""
    echo -e "${RED}❌ Build بعد از ${MAX_RETRIES} تلاش ناموفق ماند${NC}"
    echo "لطفاً اتصال اینترنت را بررسی کنید"
    exit 1
fi

echo ""
echo -e "${GREEN}✨ تمام!${NC}"
