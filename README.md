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

 <img width="1404" height="725" alt="Screenshot 2025-08-22 at 9 45 28 PM" src="https://github.com/user-attachments/assets/9a58ee9d-98ac-4e6e-a996-53c3cd39aff9" />


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

### Landing page

<img width="1421" height="669" alt="Screenshot 2025-08-22 at 9 46 47 PM" src="https://github.com/user-attachments/assets/a1bd5cc2-ae98-4f8d-8e9e-0ebe80a6597a" />


### 🔑 Authentication  

<img width="1437" height="745" alt="Screenshot 2025-08-22 at 9 47 09 PM" src="https://github.com/user-attachments/assets/c703b70b-1905-4323-9fd6-dac738e7375f" />

### Instructor Section


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

