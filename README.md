# 📚 My Reader Journey (Backend)

This is the **backend API** for **My Reader Journey**, a web application that helps readers track and organize their books.  
It was developed in **February 2024** as the **final capstone project** of the *Epicode Full-Stack Developer* course.  

👉 Frontend repo: https://github.com/AlbyCosmy99/my-reader-journey-frontend <br>
👉 View site here: https://my-reader-journey.onrender.com/home

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


## 📖 Example API endpoints - authentication with jwt required

- `GET /books` → Fetch all books  
- `POST /books` → Add a new book  
- `PUT /books/:id` → Update book
- `DELETE /books/:id` → Remove a book  


👉 This backend, together with the frontend, forms the complete **My Reader Journey** application: a personal reading tracker built as the final full-stack Epicode scapstone project.
