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

#HLD ( High level design ) 

<img width="1607" height="479" alt="Screenshot 2025-09-04 at 10 54 15 AM" src="https://github.com/user-attachments/assets/54a18de8-140f-49c1-934c-a20e2d3bc8ec" />
<img width="1210" height="849" alt="Screenshot 2025-09-04 at 10 54 49 AM" src="https://github.com/user-attachments/assets/bedc4672-4e03-46ac-9919-1c57ae62967f" />

## Instructor 
<img width="1327" height="793" alt="Screenshot 2025-09-04 at 10 55 35 AM" src="https://github.com/user-attachments/assets/b313b3dd-5f81-4d95-aa4a-7766f2e1494c" />

## Student
<img width="1551" height="813" alt="Screenshot 2025-09-04 at 10 56 09 AM" src="https://github.com/user-attachments/assets/1381bf12-9e30-4d42-8cee-11cf81c3cf60" />

#LLD (UML Class Diagram of my app)
<img width="3840" height="1405" alt="Untitled diagram _ Mermaid Chart-2025-08-23-132045" src="https://github.com/user-attachments/assets/408f2881-6dd4-44aa-98e6-c72db9411151" />



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
<img width="1267" height="462" alt="Screenshot 2025-08-22 at 9 53 50 PM" src="https://github.com/user-attachments/assets/e8752c20-b3a0-4ae3-9e2b-9fff9f81ab3a" />
<img width="1008" height="707" alt="Screenshot 2025-08-22 at 9 54 10 PM" src="https://github.com/user-attachments/assets/f85ce1b9-d6d2-4923-a0e9-0c19960321f3" />
<img width="1014" height="673" alt="Screenshot 2025-08-22 at 9 55 49 PM" src="https://github.com/user-attachments/assets/9e038ebf-af7d-46c7-91db-2a6bb79f5e6b" />



## Student Section 
### 📚 Course Browsing  
<img width="1415" height="682" alt="Screenshot 2025-08-22 at 9 59 02 PM" src="https://github.com/user-attachments/assets/4dabf6a1-7056-4835-951f-2a3da26e1554" />


### 📝 Lecture View  
<img width="1366" height="721" alt="Screenshot 2025-08-22 at 9 59 16 PM" src="https://github.com/user-attachments/assets/deb64a0f-474a-4ca3-abd6-ae6d0024fa1d" />


### 🧩 Quiz and lecture reading page (Learning page)
<img width="1000" height="649" alt="Screenshot 2025-08-24 at 8 59 57 AM" src="https://github.com/user-attachments/assets/7026e2f6-4620-4b29-9702-27ecdb16b086" />


---

## ⚙️ Tech Stack  

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS  
- **Backend:** Next.js API Routes (REST)  
- **ORM & DB:** Prisma ORM + SQLite (local)
- **Auth:** JWT with HttpOnly cookies  

---

## 📂 Project Structure 

matrika/
├── app/ # Next.js App Router pages
├── components/ # Reusable UI components
├── prisma/ # Prisma schema + migrations
├── public/assets/ # Images (architecture, schema, UI)
└── README.md



---

## 🔑 API Endpoints (Highlights)  

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST   | `/api/auth/register` | Public | Register (choose Student/Instructor) |
| POST   | `/api/auth/login`    | Public | Login |
| GET    | `/api/courses`       | Student | List all courses |
| POST   | `/api/courses`       | Instructor | Create new course |
| GET    | `/api/courses/:id`   | Student | Get course + lectures |
| POST   | `/api/courses/:id/lectures` | Instructor | Add lecture |
| POST   | `/api/lectures/:id/complete` | Student | Mark reading lecture done |
| POST   | `/api/lectures/:id/quiz/submit` | Student | Submit quiz → graded instantly |

---

## 🛠️ Setup & Run Locally  

1. Clone the repo  
   ```bash
   git clone https://github.com/<your-username>/matrika.git
   cd matrika

 2) Install dependencies

npm install

3) Create a .env file:
DATABASE_URL="file:./dev.db"
JWT_SECRET="yoursecret"

4) Run Prisma migrations

npx prisma migrate dev

5) npm run dev












