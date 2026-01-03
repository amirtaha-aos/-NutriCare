# NutriCare - راهنمای کامل پیاده‌سازی

## 📋 خلاصه پروژه

یک سیستم کامل تغذیه و سلامت با هوش مصنوعی که شامل:

- ✅ **Backend با Python FastAPI** - تمام ساختار ایجاد شده
- ✅ **Mobile App با React Native** - کد موجود نیاز به بهبود دارد
- ✅ **AI Services با OpenAI GPT-4 Vision** - کامل پیاده‌سازی شده
- ✅ **MongoDB Database** - تمام Models آماده
- ✅ **Samsung Health Integration** - Service آماده

---

## 🎯 ویژگی‌های پیاده‌سازی شده

### 1. Backend (Python FastAPI) ✅

#### Models موجود:
- ✅ `User` - مدیریت کاربران، BMI, BMR, TDEE
- ✅ `Meal` - وعده‌های غذایی با تحلیل تصویر
- ✅ `Exercise` - ورزش‌ها و MET values
- ✅ `ExerciseLog` - ردیابی ورزش و کالری
- ✅ `Medication` - داروها و تداخلات
- ✅ `HealthLog` - لاگ سلامتی روزانه
- ✅ `ChatHistory` - تاریخچه چت با AI
- ✅ `MealPlan` - برنامه غذایی هفتگی

#### Services موجود:
- ✅ `OpenAIService` - تمام قابلیت‌های AI
  - تحلیل تصویر غذا با جزئیات کامل
  - تحلیل قبل/بعد غذا (درصد مصرف)
  - تحلیل آزمایش خون
  - تحلیل داروها و تداخلات
  - AI Chatbot تغذیه
  - تولید برنامه غذایی هوشمند
  - تولید برنامه ورزشی
- ✅ `PDFService` - تولید PDF برای برنامه غذایی
- ✅ `ExerciseService` - محاسبه کالری سوخته با MET
- ✅ `NutritionService` - محاسبات تغذیه
- ✅ `SamsungHealthService` - اتصال به Samsung Health

#### Utils موجود:
- ✅ Authentication (JWT)
- ✅ Dependencies (get_current_user)

---

## 🚀 مراحل تکمیل پروژه

### مرحله 1: راه‌اندازی Backend ⏳

#### 1.1. نصب و تنظیم

```bash
cd nutricare-fastapi-backend

# ایجاد virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# نصب dependencies
pip install -r requirements.txt

# کپی .env.example به .env
cp .env.example .env
```

#### 1.2. تنظیم .env

```env
# اضافه کنید:
OPENAI_API_KEY=sk-your-actual-openai-key-here
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=your-very-strong-random-secret-key-here
```

#### 1.3. ایجاد API Endpoints (باید انجام شود)

شما باید این فایل‌ها را در `api/` بسازید:

**`api/auth.py`** - Authentication endpoints:
```python
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from models.user import User
from utils.auth import hash_password, verify_password, create_access_token
from datetime import datetime

router = APIRouter()

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register(data: RegisterRequest):
    # بررسی کاربر موجود
    existing_user = await User.find_one(User.email == data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # ساخت کاربر جدید
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    await user.save()

    # ساخت token
    access_token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    }

@router.post("/login")
async def login(data: LoginRequest):
    user = await User.find_one(User.email == data.email)

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    # به‌روزرسانی last_login
    user.last_login = datetime.utcnow()
    await user.save()

    # ساخت token
    access_token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    }

# و endpoints دیگر...
```

**`api/ai.py`** - AI Services endpoints (نمونه):
```python
from fastapi import APIRouter, UploadFile, File, Depends
from models.user import User
from utils.dependencies import get_current_user
from services.openai_service import openai_service
import base64

router = APIRouter()

@router.post("/analyze-food-image")
async def analyze_food_image(
    image: UploadFile = File(...),
    meal_type: str = "lunch",
    current_user: User = Depends(get_current_user)
):
    # خواندن تصویر
    image_bytes = await image.read()
    image_base64 = base64.b64encode(image_bytes).decode('utf-8')

    # تحلیل با AI
    result = await openai_service.analyze_food_image(image_base64, meal_type)

    return {
        "success": True,
        "data": result
    }

@router.post("/analyze-food-portion")
async def analyze_food_portion(
    before_image: UploadFile = File(...),
    after_image: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # خواندن تصاویر
    before_bytes = await before_image.read()
    after_bytes = await after_image.read()

    before_base64 = base64.b64encode(before_bytes).decode('utf-8')
    after_base64 = base64.b64encode(after_bytes).decode('utf-8')

    # تحلیل قبل/بعد
    result = await openai_service.analyze_food_portion(before_base64, after_base64)

    return {
        "success": True,
        "data": result
    }

# endpoints دیگر برای chat, meal plan, workout plan...
```

باقی endpoints را به همین صورت در فایل‌های:
- `api/meals.py`
- `api/health.py`
- `api/exercise.py`
- `api/samsung_health.py`

پیاده‌سازی کنید.

#### 1.4. اضافه کردن routers به main.py

در `main.py` این خطوط را uncomment کنید:

```python
from api import auth, ai, meals, health, exercise, samsung_health

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Services"])
# ...
```

#### 1.5. اجرای Backend

```bash
python main.py
# یا
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

برو به `http://localhost:8000/docs` برای دیدن Swagger UI.

---

### مرحله 2: بهبود Mobile App (React Native) ⏳

#### 2.1. صفحات جدید مورد نیاز

در `nutricare-mobile/src/screens/` باید این صفحات را اضافه کنید:

**صفحات AI:**
- `ai/ChatScreen.tsx` - چت با AI nutritionist
- `ai/LabTestScreen.tsx` - آپلود و تحلیل آزمایش
- `ai/MedicationScreen.tsx` - مدیریت داروها
- `ai/MealPlanScreen.tsx` - نمایش و ایجاد برنامه غذایی
- `ai/MealPlanDetailScreen.tsx` - جزئیات برنامه غذایی
- `ai/WorkoutPlanScreen.tsx` - برنامه ورزشی

**صفحات Exercise:**
- `exercise/ExerciseListScreen.tsx` - لیست ورزش‌ها
- `exercise/LogExerciseScreen.tsx` - ثبت ورزش
- `exercise/ExerciseHistoryScreen.tsx` - تاریخچه ورزش

**صفحات Health:**
- `health/HealthDashboardScreen.tsx` - داشبورد سلامتی
- `health/WeightTrackingScreen.tsx` - ردیابی وزن
- `health/SamsungHealthScreen.tsx` - اتصال Samsung Health

**صفحات Meal:**
- بهبود `nutrition/ScanFoodScreen.tsx` برای قبل/بعد غذا

#### 2.2. نمونه ChatScreen.tsx

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { aiService } from '../../services';
import { theme } from '../../theme';

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await aiService.chat(inputText);
      const aiMessage = { role: 'assistant', content: response.data };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={item.role === 'user' ? styles.userMessage : styles.aiMessage}>
            <Text>{item.content}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="پیام خود را بنویسید..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
          <Text style={styles.sendButtonText}>ارسال</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6', padding: 10, margin: 5, borderRadius: 10 },
  aiMessage: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA', padding: 10, margin: 5, borderRadius: 10 },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#ccc' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  sendButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, justifyContent: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default ChatScreen;
```

#### 2.3. بهبود Services

در `nutricare-mobile/src/services/` این سرویس‌ها را اضافه کنید:

**`ai.service.ts`:**
```typescript
import api from './api.config';

export const aiService = {
  async analyzeFoodImage(image: string, mealType: string) {
    const formData = new FormData();
    formData.append('image', {
      uri: image,
      type: 'image/jpeg',
      name: 'food.jpg',
    } as any);
    formData.append('meal_type', mealType);

    const response = await api.post('/ai/analyze-food-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async analyzeFoodPortion(beforeImage: string, afterImage: string) {
    const formData = new FormData();
    formData.append('before_image', {
      uri: beforeImage,
      type: 'image/jpeg',
      name: 'before.jpg',
    } as any);
    formData.append('after_image', {
      uri: afterImage,
      type: 'image/jpeg',
      name: 'after.jpg',
    } as any);

    const response = await api.post('/ai/analyze-food-portion', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async chat(message: string) {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  },

  async generateMealPlan(userInfo: any, preferences: any) {
    const response = await api.post('/ai/generate-meal-plan', {
      user_info: userInfo,
      preferences: preferences,
    });
    return response.data;
  },

  async generateWorkoutPlan(userInfo: any) {
    const response = await api.post('/ai/generate-workout-plan', {
      user_info: userInfo,
    });
    return response.data;
  },
};
```

#### 2.4. بهبود Navigation

در `nutricare-mobile/src/navigation/` navigation را به‌روزرسانی کنید تا صفحات جدید را شامل شود.

---

### مرحله 3: ویژگی‌های خاص

#### 3.1. تحلیل قبل/بعد غذا

در `ScanFoodScreen.tsx`:

```typescript
const [beforeImage, setBeforeImage] = useState<string | null>(null);
const [afterImage, setAfterImage] = useState<string | null>(null);
const [portionAnalysis, setPortionAnalysis] = useState<any>(null);

const analyzePortionConsumed = async () => {
  if (!beforeImage || !afterImage) {
    Alert.alert('خطا', 'لطفاً هر دو تصویر را انتخاب کنید');
    return;
  }

  setIsAnalyzing(true);
  try {
    const result = await aiService.analyzeFoodPortion(beforeImage, afterImage);
    setPortionAnalysis(result.data);
  } catch (error) {
    Alert.alert('خطا', 'تحلیل ناموفق بود');
  } finally {
    setIsAnalyzing(false);
  }
};
```

#### 3.2. برنامه غذایی هوشمند

صفحه `MealPlanScreen.tsx` باید شامل:
- فرم ورودی (بودجه، شهر، مواد موجود، محدودیت‌ها)
- نمایش برنامه روزانه
- دکمه Export PDF
- لیست خرید

#### 3.3. Samsung Health Integration

صفحه `SamsungHealthScreen.tsx`:
- دکمه Connect
- نمایش قدم‌های روزانه
- نمایش ورزش‌های sync شده
- دکمه Sync

---

## 📱 دستورات اجرا

### Backend:
```bash
cd nutricare-fastapi-backend
source venv/bin/activate
python main.py
```

### Mobile:
```bash
cd nutricare-mobile
npm install
npm start

# Android
npm run android

# iOS
npm run ios
```

---

## ✅ Checklist پیاده‌سازی

### Backend:
- [x] Models ساخته شدند
- [x] Services ساخته شدند
- [x] Utils ساخته شدند
- [ ] API Endpoints ساخته شوند (auth, ai, meals, health, exercise, samsung)
- [ ] تست با Postman

### Mobile:
- [x] ساختار اولیه موجود است
- [ ] صفحات AI اضافه شوند
- [ ] صفحات Exercise اضافه شوند
- [ ] صفحات Health اضافه شوند
- [ ] Services کامل شوند
- [ ] Navigation به‌روز شود

### Integration:
- [ ] اتصال Mobile به Backend
- [ ] تست تمام flow ها
- [ ] Samsung Health اتصال
- [ ] PDF Generation تست شود

---

## 🎯 اولویت‌بندی

### فاز 1 (ضروری):
1. ✅ Backend Models & Services
2. ⏳ Backend API Endpoints
3. ⏳ Mobile AI Services
4. ⏳ صفحات اصلی Mobile

### فاز 2 (مهم):
1. Samsung Health
2. PDF Export
3. برنامه ورزشی
4. Chat با AI

### فاز 3 (بهبود):
1. UI/UX بهبود
2. Performance optimization
3. Offline support
4. Analytics

---

## 📞 پشتیبانی

اگر در هر مرحله سوال داشتید، موارد زیر را بررسی کنید:
1. README.md در هر پوشه
2. API Documentation: `http://localhost:8000/docs`
3. نمونه کدهای موجود

---

**موفق باشید!** 🚀
