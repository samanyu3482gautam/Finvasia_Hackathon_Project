# Nivesh AI Fintech

Nivesh AI is a comprehensive financial technology platform that provides a unified dashboard for managing and analyzing investment portfolios across multiple asset classes, including stocks, mutual funds, and cryptocurrencies. The platform integrates advanced AI capabilities to deliver personalized financial insights, risk assessments, and educational tools.

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

## Key Features

1. **Unified Dashboard**  
   Real-time tracking and analysis of stocks, mutual funds, and cryptocurrencies in a single interface.

2. **AI Dost – Multilingual Financial Assistant**  
   An AI-powered chatbot using OpenAI GPT-4o and Google Gemini 2.0 to answer financial queries and provide personalized insights in multiple languages.

3. **Sandbox Trading Environment**  
   A risk-free trading terminal that allows users to practice strategies while leveraging behavioral analytics.

4. **Professional Investment Reports**  
   Automated generation of detailed investment summaries and performance reports in PDF format.

5. **Personalized Risk Assessment**  
   Machine learning models analyze user behavior to provide tailored risk profiles and investment recommendations.

6. **Multilingual Support**  
   Localized interface and AI-driven responses for diverse regional user bases.

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

Ensure the following software is installed on your system before proceeding with the setup:

- Node.js (version 18.0.0 or higher)
- Python (version 3.9 or higher)
- npm (Node Package Manager)
- Git (optional, for version control)

---

## Installation and Setup

### 1. Repository Preparation

Clone the repository or extract the project files and navigate to the project directory:

```bash
git clone https://github.com/your-username/Nivesh-AI-Fintech.git
cd Nivesh-AI-Fintech