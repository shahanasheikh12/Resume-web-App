# Interactive Resume Builder Web App 📄✨

A modern, fast, and responsive React web application that allows users to create, customize, preview, and download professional resumes in minutes. The application features user authentication and securely saves generated resumes to the cloud using Supabase.

🌐 **Live Demo:** [https://resume-web-app-seven.vercel.app/](https://resume-web-app-seven.vercel.app/)

---

## 🚀 Key Features

* **Dynamic Live Form Builder**: Seamless inputs for:
  * **Personal Details**: Name, Job Title, Contact Details, and Professional Summary.
  * **Education**: History of schools, degrees, and graduation periods.
  * **Work Experience**: Job roles, companies, dates, and responsibilities.
  * **Projects**: Project names, technologies used, and descriptions.
  * **Skills**: Comma-separated list rendered as sleek, tag-like badges.
  * **Achievements & Certifications**: Multi-line list of career accomplishments.
* **Instant Live Preview**: Watch the resume update in real-time on the right side of the screen as you type in the form.
* **Multiple Layout Templates**: Switch between layouts at any time:
  1. **Modern Blue & White**: Sleek double-column layout with a styled sidebar and modern tag badges.
  2. **Plain & Simple**: Minimalist, clean, and classic layout designed for maximum ATS readability.
* **Cloud Storage & Database (Supabase)**:
  * **User Authentication**: Secure Sign-up and Sign-in to enable saving and downloading of resumes.
  * **Database Table (`resume_data`)**: Stores all filled form data in structured JSON format linked to the user's ID.
  * **Storage Bucket (`resumes`)**: Uploads generated PDF files directly to Supabase Storage organized by User ID.
* **Flawless PDF Downloads**: Converts the resume section to a high-quality A4 PDF using `html2pdf.js` with proper page-break handling, CSS optimizations, and direct integration with the browser's printing flow.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19
* **Build Tool:** Vite
* **Styling:** Vanilla CSS (Responsive Layouts, Glassmorphism, Print Media Styles)
* **Backend & Database:** Supabase (Auth, PostgreSQL database, and Storage buckets)
* **PDF Engine:** `html2pdf.js` (uses `html2canvas` and `jsPDF` internally)
* **Icons:** Lucide React
* **Deployment Platform:** Vercel

---

## 📂 Project Structure

```text
Resume/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Asset files
│   ├── App.css             # Main styling rules
│   ├── App.jsx             # Core application code (Forms, Templates, Logic)
│   ├── index.css           # Global designs, utility classes, and print-media styles
│   ├── main.jsx            # React application entry point
│   └── supabaseClient.js   # Supabase database configuration & connection
├── package.json            # Scripts and dependency lists
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

---

## 💻 Setup and Installation

Follow these steps to run the project locally:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Clone the Repository
```bash
git clone https://github.com/shahanasheikh12/Resume-web-App.git
cd Resume-web-App
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the Development Server
Start the local server with hot reload:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### 5. Build for Production
Create an optimized build in the `dist` folder:
```bash
npm run build
```

---

## ☁️ Supabase Integration Reference

To connect your own backend instance:
1. Create a Supabase project at [supabase.com](https://supabase.com/).
2. Enable Email Auth in **Authentication -> Providers**.
3. Create a table named `resume_data` with the following schema:
   * `id`: bigint (Primary Key, Auto-increment)
   * `created_at`: timestamp with time zone (Default: `now()`)
   * `user_id`: uuid (Foreign Key linking to `auth.users.id`)
   * `form_data`: jsonb (Stores input fields)
   * `template`: text (Stores selected layout)
4. Create a public Storage Bucket named `resumes` and set up appropriate Policy Rules (e.g. allowing users to upload only to their own folder: `(role() = 'authenticated'::text)`.
5. Update your keys inside [supabaseClient.js](file:///c:/Users/shaha/OneDrive/Desktop/Resume/src/supabaseClient.js):
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL'
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
   ```

---

## 📄 License
This project is open-source and available under the MIT License.
