# 🌿 Zestful - Master the Kitchen

**Zestful** is an elite, full-stack culinary platform designed to streamline the cooking experience. It combines powerful recipe discovery with AI-driven planning, inventory management, and social features.

Built with **Spring Boot** and **React (TypeScript)**, Zestful features a modern "Glassmorphism" UI, smooth Framer Motion animations, and a robust secure backend.

---

## 🚀 Key Features

### 🔍 **Smart Discovery & AI**
* **Advanced Recipe Search:** Integration with **Edamam API** to search 2M+ recipes with filters for Diet (Keto, Paleo), Health (Vegan, Gluten-Free), Cuisine, Time, and Calories.
* **AI Sous Chef:** A real-time chatbot powered by **Google Gemini** to answer cooking questions.
* **AI Meal Generator:** Automatically generates a 7-day meal plan based on your dietary preferences and pantry ingredients.
* **Food News Feed:** Live culinary news updates via **GNews API** with pagination and refresh logic.

### 📅 **Planning & Organization**
* **Interactive Meal Planner:** A drag-and-drop weekly calendar (using `react-beautiful-dnd`) to organize breakfasts, lunches, and dinners.
* **Smart Shopping List:** Automatically generates a shopping list from your meal plan, subtracting items you already have in your Pantry.
* **Pantry Tracker:** Track ingredients at home and monitor expiration dates with visual status indicators (Fresh, Expiring Soon, Expired).

### 👤 **User & Social**
* **My Cookbook:** Save favorite recipes into custom **Collections** (Folders).
* **Custom Recipe Creator:** Users can publish their own recipes with image uploads, rich text instructions, and dynamic ingredient lists.
* **Review System:** 5-star rating system and comments for both external and custom recipes.
* **Gamification:** Users earn XP, level up, and unlock badges (e.g., "Head Chef", "Creator") based on their activity.

### 🛡️ **Admin & Security**
* **Secure Auth:** Full JWT Authentication (Login/Register) with role-based access control (RBAC).
* **Admin Dashboard:** A dedicated analytics dashboard visualizing user growth, diet preferences, and content stats using **Recharts**.
* **Moderation:** Admins can view and delete user reviews.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React 19 (TypeScript)
* **Styling:** Bootstrap 5, Custom CSS Variables (Matcha Theme), Glassmorphism effects.
* **Animation:** Framer Motion.
* **State/Data:** React Hooks, Fetch API.
* **Libraries:** React Beautiful DND (Drag & Drop), Recharts (Analytics), React Bootstrap Icons.

### **Backend**
* **Framework:** Spring Boot 3 (Java 21).
* **Security:** Spring Security 6, JWT (JSON Web Tokens), BCrypt.
* **Database:** MySQL (with Hibernate/JPA).
* **APIs Integrated:** Edamam (Recipes), GNews (News), Google Gemini (AI), OpenAI (Optional).
* **File Storage:** Local file system storage for uploaded images.

---

## 🎨 Design System

Zestful uses a custom **"Matcha & Sage"** color palette designed for a calm, organic feel.

* **Primary:** `#588157` (Sage Green)
* **Dark:** `#2d4a3e` (Deep Forest)
* **Accent:** `#bc4749` (Muted Red)
* **Background:** `#fdfcf8` (Off-white paper texture)

---

## 📱 Mobile Responsiveness

The application is fully responsive:
* **Navbar:** Collapses into a hamburger menu.
* **Meal Planner:** Switches from a 7-column grid to a vertical stack on mobile.
* **Search:** Adaptive input groups and hidden labels for small screens.
