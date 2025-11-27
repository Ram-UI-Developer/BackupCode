### Getting started

## Workshine

Workshine — Cloud-native HRMS front-end application built with React, following modern development best practices, CI/CD, and scalable architecture.

## 📂 Project Structure

WEBUI/

├── public/ # Static files served as-is

│ ├── dist/ # Images, fonts, 

│ ├── plugins/ # plugings

│ ├── wp-content/ # Homepage content from word press

│ ├── wp-includes/ # Homepage css and js files

│ ├── wp-json/ # Homepage json file

│ └── index.html # Main HTML file, entry point for the web application

│ └── favicon.ico # Browser tab icon for the application

│ └── manifest.json # favicon and logos specifications

├── src/ # Application source code

│ ├── Common/ # common and Reusable React components

│ ├── components/ # Page-level components (screens)

│ ├── reducers/ # Redux reducers

│ ├── Routes/ # React Router configurations

│ ├── store/ # Application state management (Redux/Context)

│ └── apm # user experience monotering

│ └── App.js # Main App component

│ └── App.test.js # tests

│ └── index.css # base level css

│ └── index.js # Entry point 

│ └── reportWebVitals.js # using the web-vitals library

│ └── setupTests.js # Test setup

├── .env # Environment-specific variables (API keys, secrets, etc.)

├── .eslintrc.json # ESLint configuration for code quality and linting rules

├── .gitignore # Specifies files and folders to be ignored by Git

├── .prettierrc # Prettier configuration for code formatting

├── .project # IDE-specific project metadata (typically for Eclipse or similar)

├── babel.config.js # Babel configuration for JavaScript transpilation

├── Dockerfile # Docker build instructions

├── ecosystem.config.js # PM2 or process manager config

├── Jenkinsfile  # Jenkins pipeline configuration for default/dev environment

├── JenkinsfilePROD # Jenkins pipeline configuration for Production environment

├── JenkinsfileQA # Jenkins pipeline configuration for QA environment

├── JenkinsfileUAT # Jenkins pipeline configuration for UAT environment

├── package-lock.json # Auto-generated lockfile for exact dependency versions

├── package.json  # Project dependencies and scripts

└── README.md # Project documentation and usage instructions

## 🖥️ Tech Stack

React 18+

Redux / Context API (state management)

React Router

ESLint + Prettier (code quality & formatting)

Jest + React Testing Library (tests)

Docker (containerization)

Jenkins (CI/CD)

Shape

## 🛠️ Getting Started

Prerequisites

Node.js >= 18.x

npm

## Install dependencies

npm install

## Run in development mode

npm start

App runs at: http://localhost:3000

## Build for production

npm run build

Output: build/ folder.

## Code Quality & Conventions

✅ ESLint and Prettier are configured to enforce coding standards.

## 🌐 Deployment

This app is containerized with Docker and integrated into a CI/CD pipeline (via Jenkins).

## Build Docker image

docker build -t infyshinetech/webui:dev.0.1 .
docker build common

## Run Docker container

docker run -d -p 8080:80 --name webui-container infyshinetech/webui:dev.0.1
docker run commond
