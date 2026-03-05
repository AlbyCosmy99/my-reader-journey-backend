# 📚 My Reader Journey (Backend)

This is the **backend** for **My Reader Journey**, a web application that helps readers track and organize their books.  
It was developed in **February 2024** as the **final capstone project** of the *Epicode Full-Stack Developer* course.  

👉 [Frontend repo](https://github.com/AlbyCosmy99/my-reader-journey-frontend)<br>
👉 [View site here](https://my-reader-journey.onrender.com)

---

## 🚀 Features

- RESTful API built with **Express.js**  
- CRUD operations for books:
  - ➕ Add new books  
  - 📖 Mark books as read / to read  
  - ❤️ Favorite books  
  - 🌟 Assign ratings  
  - 🗑️ Delete books
  - 🔍 Filter and search books
- **Authentication with JWT** for protected routes (login required for managing books)  
- Data stored in **MongoDB** (cloud)

---

## 🛠️ Tech stack

- **Node.js** (runtime)  
- **Express.js** (web library)  
- **MongoDB + Mongoose** (database & ODM)  
- **dotenv** (environment variable management)
- **JWT (JSON Web Tokens)** (authentication & authorization)  
- **Cors / body-parser / nodemon** (middleware & dev tools)  

---

## Password reset email on Railway

The `/api/users/password-reset/request` endpoint sends a verification code by email.

- If you deploy on **Railway** and use **SMTP** (for example Gmail on port `465`), the connection can time out on **Free / Trial / Hobby** plans because outbound SMTP may be blocked.
- In that setup the backend currently answers with `502 Unable to send reset email right now. Please try again later.`
- The supported workaround in this project is to use **Resend over HTTPS**:
  - set `MAIL_PROVIDER=resend`
  - set `RESEND_API_KEY=...`
  - set `MAIL_FROM=My Reader Journey <onboarding@resend.dev>` for testing, or your verified domain for production

See `.env.example` for the exact variable names.

---


## 📖 Example API endpoints - authentication with jwt required

- `GET /books` → Fetch all books  
- `POST /books` → Add a new book  
- `PUT /books/:id` → Update book
- `DELETE /books/:id` → Remove a book  


---


👉 This backend, together with the frontend, forms the complete **My Reader Journey** application: a personal reading tracker built as the final full-stack Epicode scapstone project.
