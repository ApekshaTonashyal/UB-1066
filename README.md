# UB-1066
AgriSmart – AI-Powered Smart Farming Platform

AgriSmart is a comprehensive web application designed to help small-scale farmers make smarter decisions using AI-driven insights. The platform enables early crop disease detection, delivers real-time weather updates, supports efficient irrigation management, and tracks market prices — all within an intuitive, easy-to-use interface. By combining technology and agriculture, AgriSmart empowers farmers to maximize yield, reduce losses, and increase profitability.

# Core Features

User-Friendly Landing Page: Highlights key benefits and guides farmers through the platform.

Crop Encyclopedia: Searchable database providing cultivation tips, growth guidelines, and best practices for common crops.

Alerts & Notifications: Centralized feed with disease alerts, weather warnings, and market price updates.

Farmer Profile Management: Personalized profiles with farmer name, location, crops grown, and land area.

# Technology Stack

Frontend: React.js + Tailwind CSS + Recharts — for a responsive, modern interface and data visualization.

Backend: Node.js + Express.js — handles API requests, data processing, and AI integration.

Database: MongoDB — stores farmer profiles, historical data, and alerts securely.

AI Integration: Google Gemini API — analyzes text and images for crop disease detection.

Weather Data: OpenWeatherMap API — provides accurate, real-time weather information.

UI Icons & Components: Lucide React

# Installation & Setup
- Backend
cd backend
npm install
npm start
- Frontend
cd frontend
npm install
npm start

Visit: http://localhost:8080/
 to access the application.

# Professional Notes

Ensure .env files are configured with API keys (Google Gemini, OpenWeatherMap).

Recommended Node.js version: 18+

MongoDB connection string must be updated in backend/config.js.
