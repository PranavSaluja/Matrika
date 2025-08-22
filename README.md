# Matrika – Online Learning Platform 🎓  

> **A simplified online learning platform built as part of the Scalar Take-Home Assignment.**  
> In ~36 hours, I designed and developed this MVP to demonstrate end-to-end product thinking, clean architecture, and functional implementation.  

---

## 🚀 Overview  

**Matrika** allows two types of users — **Instructors** and **Students**.  
- Instructors can create courses and lectures (reading or quiz).  
- Students can browse courses, view lectures in order, attempt quizzes, and track their progress.  

This project demonstrates:  
- Authentication & role-based access  
- RESTful APIs with clear separation of concerns  
- Clean frontend with Next.js (App Router)  
- Real-time grading logic for quizzes  
- Student progress tracking  

---

## 🏗️ Architecture  

<img width="1158" height="631" alt="Screenshot 2025-08-22 at 9 44 14 PM" src="https://github.com/user-attachments/assets/500b9b87-3b03-41a9-b2d1-7bb3160e3a53" />


---

## 🗄️ Database Schema  

![Schema](./assets/schema.png)  

---

## ✨ Features  

### 👨‍🏫 For Instructors  
- Create courses with title + description  
- Add lectures:  
  - **Reading** → text or link  
  - **Quiz** → MCQs with grading logic  

### 👩‍🎓 For Students  
- Browse available courses  
- Sequential lecture completion flow  
- Progress tracking → *“X / Y lectures completed”*  
- Attempt quizzes → graded instantly, must pass (≥70%)  

---

## 🖼️ Glimpse of the App  

### 🔑 Authentication  
![Auth](./assets/auth.png)  

### 📚 Course Browsing  
![Courses](./assets/courses.png)  

### 📝 Lecture View  
![Lecture](./assets/lecture.png)  

### 🧩 Quiz Attempt  
![Quiz](./assets/quiz.png)  

---

## ⚙️ Tech Stack  

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS  
- **Backend:** Next.js API Routes (REST)  
- **ORM & DB:** Prisma ORM + SQLite (local), PostgreSQL (production)  
- **Auth:** JWT with HttpOnly cookies  
- **Deployment:** Vercel (app) + Supabase/Neon (DB)  

---

## 📂 Project Structure  

