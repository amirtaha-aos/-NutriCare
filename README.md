# 🥗 NutriCare - AI-Powered Nutrition Assistant

<div align="center">

![NutriCare Logo](https://img.shields.io/badge/NutriCare-AI%20Nutrition-00C853?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDNhNiA2IDAgMCAwIDkgOSA5IDkgMCAxIDEtOS05WiI+PC9wYXRoPjwvc3ZnPg==)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

**Your personal AI nutritionist powered by Google Gemini**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-endpoints) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

### 🤖 AI Chat Assistant
- Real-time nutrition advice powered by Google Gemini AI
- Ask questions about calories, diet plans, macronutrients, and health
- Context-aware responses tailored to your needs

### 📸 Food Scanner
- Upload food photos for instant nutritional analysis
- Get detailed breakdown: calories, protein, carbs, fat
- AI-powered food recognition and portion estimation

### 🧪 Lab Test Analyzer
- Input your blood test results
- AI analyzes health markers and identifies concerns
- Get personalized health insights and recommendations

### 💊 Drug Interaction Checker
- Check interactions between multiple medications
- Get nutrition advice based on your medications
- Safety warnings and dietary recommendations

### 📋 AI Meal Planner
- Personalized 7-day meal plans
- Based on your weight, height, age, and goals
- Supports weight loss, maintenance, or muscle gain

### 📊 Health & BMI Analyzer
- Calculate BMI with category assessment
- Get ideal weight range recommendations
- Body fat estimation and health insights

---

## 🎨 Demo

<div align="center">

### Dashboard
Modern glassmorphism UI with dark/light mode support

### Splash Screen
Animated typewriter effect with floating particles

</div>

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nutricare.git
cd nutricare
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/nutricare
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
GEMINI_API_KEY=your-gemini-api-key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd nutridashboard
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📖 Usage

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your backend `.env` file

### Quick Start

1. **Dashboard**: View your nutrition stats and quick actions
2. **AI Chat**: Ask any nutrition-related question
3. **Food Scanner**: Upload a food photo for analysis
4. **Lab Analysis**: Enter blood test values for insights
5. **Drug Check**: Check medication interactions
6. **Meal Plan**: Generate a personalized weekly meal plan
7. **Health**: Calculate BMI and get health recommendations

---

## 🔌 API Endpoints

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI nutritionist |
| POST | `/api/ai/analyze-food` | Analyze food from image |
| POST | `/api/ai/analyze-lab` | Analyze lab test results |
| POST | `/api/ai/analyze-drugs` | Check drug interactions |
| POST | `/api/ai/meal-plan` | Generate meal plan |
| POST | `/api/ai/health-analysis` | BMI and health analysis |

### Request Examples

#### Chat
```json
POST /api/ai/chat
{
  "message": "How much protein should I eat daily?"
}
```

#### Food Analysis
```json
POST /api/ai/analyze-food
{
  "image": "data:image/jpeg;base64,..."
}
```

#### Meal Plan
```json
POST /api/ai/meal-plan
{
  "weight": 70,
  "height": 175,
  "age": 25,
  "gender": "male",
  "goal": "weight_loss",
  "activityLevel": "moderate"
}
```

---

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **@google/generative-ai** - Gemini AI SDK

### AI
- **Google Gemini 2.0 Flash** - Language model for chat and analysis
- **Gemini Vision** - Image analysis for food scanning

---

## 📁 Project Structure

```
nutricare/
├── backend/
│   ├── controllers/
│   │   └── aiController.js    # AI endpoint handlers
│   ├── routes/
│   │   └── ai.js              # API routes
│   ├── models/                # MongoDB models
│   ├── middleware/            # Express middleware
│   ├── config/                # Configuration
│   ├── .env                   # Environment variables
│   └── server.js              # Entry point
│
├── nutridashboard/
│   ├── src/
│   │   ├── pages/
│   │   │   └── NutriCareDashboard.jsx  # Main dashboard
│   │   ├── components/        # Reusable components
│   │   ├── App.jsx           # App entry
│   │   └── main.jsx          # React entry
│   ├── public/               # Static assets
│   └── vite.config.js        # Vite config
│
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRE` | JWT expiration time | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering the AI features
- [Lucide Icons](https://lucide.dev/) for beautiful icons
- [TailwindCSS](https://tailwindcss.com/) for styling utilities

---

<div align="center">

**Made with ❤️ by NutriCare Team**

⭐ Star this repo if you find it helpful!

</div>
