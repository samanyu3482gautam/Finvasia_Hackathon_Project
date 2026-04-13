# Nivesh AI Fintech <img src="/readme_images/logo.png" alt="Nivesh AI Logo" align="right" width="120"/>

Nivesh AI is a comprehensive financial technology platform that provides a unified dashboard for managing and analyzing investment portfolios across multiple asset classes, including stocks, mutual funds, and cryptocurrencies. The platform integrates advanced AI capabilities to deliver personalized financial insights, risk assessments, and educational tools.

---

## 🔗 Important Links

-  Demo Video: https://drive.google.com/file/d/10nCb-10yLLoUu4ghXBLdFVjirvwE9jNw/view?usp=sharing
-  PPT Presentation: https://drive.google.com/file/d/1FlgQU8qb36Ko3jSbOmRBGowiqJEWC7Om/view?usp=sharing
-  LinkedIn Video: https://www.linkedin.com/posts/samanyu-gautam-cse-ai_hackathon-ai-fintech-ugcPost-7448306815945302016-JIFO?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFYjJHIBK_3b8Urw4ABpYV4EZN5O68K6bz4

---

## Table of Contents

- Overview
- Key Features
- Technical Architecture
- Tech Stack
- Prerequisites
- Installation and Setup
- Running the Application
- Project Structure
- Environment Variables
- Database Management
- Maintenance and Updates
- Future Enhancements
- Contributing
- License
- Contact

---

## Overview

Nivesh AI empowers investors with intelligent tools to track, analyze, and optimize their financial portfolios. By leveraging artificial intelligence and real-time financial data, the platform simplifies investment decision-making and enhances financial literacy through multilingual support.

---

##  Key Features

### 1. Unified Dashboard  
Real-time tracking and analysis of stocks, mutual funds, and cryptocurrencies in a single interface.  

<img src="/readme_images/dashboard.png" alt="Nivesh AI Logo" />

---

### 2. AI Dost – Multilingual Financial Assistant  
An AI-powered chatbot using OpenAI GPT-4o and Google Gemini 2.0 to answer financial queries and provide personalized insights in multiple languages.  

<img src="/readme_images/aiDost.png" alt="Nivesh AI Logo" />

---

### 3. Sandbox Trading Environment  
A risk-free trading terminal that allows users to practice strategies while leveraging behavioral analytics.  

<img src="/readme_images/sandbox1.png" alt="Nivesh AI Logo" />

---

### 4. Professional Investment Reports  
Automated generation of detailed investment summaries and performance reports in PDF format.  

<img src="/readme_images/report.png" alt="Nivesh AI Logo" />

---

### 5. Personalized Risk Assessment  
Machine learning models analyze user behavior to provide tailored risk profiles and investment recommendations.  

<img src="/readme_images/ai_agent2.png" alt="Nivesh AI Logo" />

---

### 6. Multilingual Support  
Localized interface and AI-driven responses for diverse regional user bases.  
<img src="/readme_images/multi.png" alt="Nivesh AI Logo" />

### 7. Monte Carlo Profit Prediction

AI-powered simulations using Monte Carlo algorithms to forecast potential investment returns and assess risk scenarios.

<img src="/readme_images/monte.png" alt="Nivesh AI Logo" />

### 8. Community Platform

Interactive space for investors to connect, share insights, discuss strategies, and learn from each other in real time.
<img src="/readme_images/community_platform.png" alt="Nivesh AI Logo" />

### 9. Education Learning Hub

Comprehensive learning platform offering curated resources, tutorials, and guides to enhance financial knowledge and decision-making skills.

<img src="/readme_images/education.png" alt="Nivesh AI Logo" />

---

## Technical Architecture

The platform follows a decoupled architecture with a high-performance frontend and a specialized financial backend.

### Frontend
- Framework: Next.js 15
- Styling: Tailwind CSS, Framer Motion
- Authentication: Auth0
- Data Visualization: Recharts, OGL
- State Management: React Context API

### Backend
- Framework: FastAPI (Python)
- Database: SQLite (Primary), MongoDB (Optional support)
- Financial Data: Yahoo Finance (yfinance)
- Machine Learning: Scikit-learn
- Media Generation: MoviePy, gTTS

### AI Integration
- Models: OpenAI GPT-4o, Google Gemini 2.0 (via OpenRouter)
- Features: Investment report generation, automated fund summarization, and multilingual chatbot (AI Dost)

---

## Tech Stack

### Frontend
- Next.js 15
- React
- Tailwind CSS
- Framer Motion
- Recharts
- OGL
- Auth0

### Backend
- FastAPI
- Python 3.9+
- SQLite
- MongoDB (Optional)
- Scikit-learn
- yfinance
- MoviePy
- gTTS

### AI & Integrations
- OpenAI GPT-4o
- Google Gemini 2.0
- OpenRouter

---

## Prerequisites

Ensure the following software is installed:

- Node.js (version 18+)
- Python (version 3.9+)
- npm
- Git (optional)

---

## Installation and Setup

### 1. Repository Preparation
Clone or extract the project files.

### 2. Frontend Configuration
```bash
npm install
touch .env

## Installation and Setup

Follow these steps to set up the project on a local machine.

### 1. Repository Preparation
Extract the project files or clone the repository to your local directory.


### 2. Frontend Configuration
Install the required Node.js dependencies and configure the environment variables.
```bash
# Install dependencies

npm install

# Create environment file
touch .env
```
Open the `.env` file and populate it with the following required keys:
```text
AUTH0_SECRET=your_auth0_secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=your_auth0_issuer_url
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
```

### 3. Backend Configuration
Navigate to the backend directory, create a virtual environment, and install the Python dependencies.
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Create backend environment file
touch .env
```
Populate the `backend/.env` file:
```text
PORT=8000
MONGODB_URI=your_mongodb_uri (Optional)
JWT_SECRET=your_jwt_secret
ASI_API_KEY=your_asi_api_key
```

## Running the Application

Both the backend and frontend servers must be running concurrently for the application to function correctly.

### Start Backend Server
From the `backend` directory (with the virtual environment activated):
```bash
uvicorn main:app --reload --port 8000
```
The API documentation will be available at `http://127.0.0.1:8000/docs`.

### Start Frontend Server
From the root directory:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

## Project Structure

- /app: Next.js pages and application routes.
- /components: Reusable React components.
- /public: Static assets (images, logos).
- /backend: FastAPI application, routers, and data models.
- /backend/routers: Domain-specific API endpoints (stocks, crypto, portfolio).
- /backend/Generation: Scripts for AI-driven asset generation (images, voice, video).


## Maintenance and Updates

### Adding New Dependencies
- Frontend: `npm install <package-name>`
- Backend: `pip install <package-name>` followed by `pip freeze > requirements.txt`

### Database Management
By default, the application uses local SQLite databases found in the `backend` folder (`portfolio.db`, `sandbox.db`, `tradeverse.db`). For production scaling, configure the `MONGODB_URI` in the backend environment variables.
