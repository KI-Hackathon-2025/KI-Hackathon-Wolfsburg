
# 🚀 KI-Hackathon-2025

Repository for KI Hackathon - An AI-powered personal information management and form filling assistant.

## 🎯 Project Overview

This project aims to simplify personal information management and form filling through AI assistance. Users can upload their personal information through various formats, ask questions about processed data, and have forms automatically filled out based on their stored information.

## 📁 Project Structure

- **Frontend**: React-based UI with TypeScript
  - User interface components
  - API integration
  - Form visualization
- **Backend**: FastAPI Python backend
  - Data processing modules
  - AI agent integration
  - Document handling
  - Data storage
  - **Data** 
    - Scraped Data: Background knowledge from public sources
    - User Data: Securely stored personal information
- `README.md`: Project documentation

## 👤 User Experience Flows

![image](https://github.com/user-attachments/assets/3cc2acdd-4c28-4ebf-b968-f42c9fac499c)

## How to start presentation
1. Go to the `presentation` directory
2. Open the `genially.html` file to start presentation

## 🖥️ How to run frontend

1. Run `cd fronted` to move to frontend directory
2. Run `npm install` to **install** the required packages
3. Run `npm start` to **start** the frontend server
4. Open your browser to `http://localhost:3000` to view the application

## ⚙️ How to run backend

1. Run `cd backend` to move to backend directory
2. Run `npm install` to **install** the required packages
3. Run `npm start` to **start** the backend server
4. 
## ✨ Features

### 🗃️ Data Handling

- **Background Knowledge** (Data Scraping and Processing)
  - Wolfsburg City Data
  - Public services information
  - Local regulations and requirements
  - Common form types and structures

- **User Data** (User Input)
  - Personal Information
    - Name, date of birth, nationality
    - Address and contact details
    - Family information
    - Professional and educational background
    - Financial information
  - Personal documents
    - ID card, passport
    - Certificates and diplomas
    - Tax documents
    - Prior applications and forms

### 🤖 AI Agent Implementation

- **Information Extraction Agent**
  - Extracts personal information from user input (text and documents)
  - Uses OCR techniques to identify relevant data points
  - Structures data into markdown format for verification
  - Provides guidance on missing or unclear information
  - Stores verified information in JSON format with appropriate schema
  - Handles updates and corrections to existing information

- **Q&A Agent (Chatbot)**
  - Answers user questions using background knowledge and personal data
  - Handles natural language queries about stored information
  - Helps users understand forms and requirements
  - Provides context-aware assistance
  - Maintains conversation history for better context understanding

- **Form Filling Agent**
  - Analyzes uploaded PDF forms to identify fields
  - Maps form fields to appropriate user data
  - Makes intelligent decisions when exact matches aren't available
  - Fills out PDF forms using stored personal information
  - Returns completed forms to the user
  - Explains which information was used and why

### 👤 User Interface

- **Start** (Landing Page)
  - Overview of available features
  - Quick access to main functionalities(Information Management, Chatbot, Form Filling)

## 🛠️ API Documentation

...


## start
```
cd chatbot
npm install
npm start
```

## backend
```
cd backend
npm install
npm start or node server.js
```
