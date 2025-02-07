## RentKenya - Vacant House Rental App

RentKenya is a web application that allows users to post, view, and manage vacant houses for rent. The app is built with **Vue.js**, **Tailwind CSS**, **Express.js**, and **MongoDB**.

---

## 🚀 Features

- User Registration & Login (JWT Authentication)  
- Post Vacant Houses with Images  
- View & Search Available Listings  
- Filter by Location, Price, etc.  
- Edit & Delete Listings (for the owner)  
- Responsive Design (Mobile & Desktop Friendly)  

---

## 🛠️ Tech Stack

- **Frontend:** Vue.js, Tailwind CSS, Axios  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (via Mongoose)  
- **Authentication:** JSON Web Tokens (JWT)  
- **File Uploads:** Multer  

---

## 📦 Project Structure

```
RentKenya/
├── client/          # Frontend (Vue.js + Tailwind CSS)
├── server/          # Backend (Express.js + MongoDB)
├── README.md        # Project Documentation
└── .gitignore       # Git Ignore Configuration
```

---

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/rentkenya.git
cd rentkenya
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Run the server:

```bash
npm start
```

### 3. Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` → Register User  
- `POST /api/auth/login` → Login User  

### House Listings

- `POST /api/houses` → Create New Listing *(Protected)*  
- `GET /api/houses` → Get All Listings  
- `GET /api/houses/:id` → Get Listing by ID  
- `PUT /api/houses/:id` → Edit Listing *(Protected)*  
- `DELETE /api/houses/:id` → Delete Listing *(Protected)*  

---

## 💻 Deployment

- **Frontend:** Deploy with [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/).  
- **Backend:** Deploy with [Render](https://render.com/) or [Railway](https://railway.app/).  
- **Database:** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud database hosting.  

---

## 🔒 Environment Variables

For the backend, create a `.env` file with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## 📝 Contributing

1. Fork the repository  
2. Create a new branch (`git checkout -b feature-branch`)  
3. Commit your changes (`git commit -m 'Add new feature'`)  
4. Push to the branch (`git push origin feature-branch`)  
5. Create a pull request  

---

## 📄 License

This project is licensed under the MIT License.

---

## 🚀 .gitignore File

```
# Node modules
node_modules/

# Environment variables
.env

# Build files
dist/
build/

# Logs
npm-debug.log
yarn-debug.log
yarn-error.log

# IDE folders
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
```

