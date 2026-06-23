# IPERS Presentation Content (Polished)

## Slide 1 — Title
**IPERS: Intelligent Placement Eligibility & Recommendation Portal**
- A smart decision-support system for student placement guidance
- Built for students, faculty, and TPC coordinators
- Techniques used: **Decision Tree-based eligibility checking, K-Means clustering, KNN similarity matching, and improvement suggestion logic**

---

## Slide 2 — Problem Statement
- Students often find it difficult to know which companies they are eligible for.
- Placement eligibility depends on multiple factors such as CGPA, skills, internships, and arrears.
- Manual evaluation is slow and may lead to missed opportunities.
- A centralized system is needed to simplify placement analysis and guidance.

---

## Slide 3 — Objectives of the Project
- Help students understand their placement readiness.
- Identify eligible companies for each student.
- Recommend suitable opportunities based on academic and skill data.
- Provide personalized improvement suggestions.
- Support faculty and TPC in monitoring placement-related progress.

---

## Slide 4 — Key Features of IPERS
- Student profile management
- Resume upload and retrieval
- Company eligibility analysis
- Recommendation dashboard for placements
- Similar profile matching with past cases
- Faculty verification for academic records
- Announcements and company updates

---

## Slide 5 — System Architecture
**Architecture flow:**
1. The React frontend sends requests to the Flask backend.
2. The backend handles authentication, student records, company data, and resume uploads.
3. Data is stored in the database and accessed through the API layer.
4. The data mining module evaluates eligibility and generates recommendations.
5. The results are displayed on the student dashboard.

**Simple flow:**
Frontend → Backend API → Database → Data Mining Engine → Dashboard Output

---

## Slide 6 — Users and Modules
- **Student:** updates profile, uploads resume, checks eligibility, views recommendations
- **Faculty:** verifies CGPA and internship details
- **TPC:** manages companies, announcements, and placement updates
- **Common Module:** shared notices and company news

---

## Slide 7 — Data Mining Techniques Used
- **Decision Tree-style threshold logic** for eligibility checking
- The system evaluates:
  - CGPA
  - Aptitude score
  - Communication score
  - Technical score
  - Internships
  - Arrears
- Each company check produces a clear pass/fail decision path.
- The output separates **eligible** and **ineligible** companies.

---

## Slide 8 — Recommendation Logic
- **K-Means Clustering** is used to group companies into categories such as:
  - High CGPA + High Aptitude
  - Technical Skill Focused Companies
  - Service Companies
- **KNN (K-Nearest Neighbors)** compares the current student profile with historical profiles.
- The system generates **improvement suggestions** by identifying gaps in eligibility criteria.

---

## Slide 9 — Workflow of IPERS
1. Student logs in and updates personal details.
2. Student uploads resume and enters academic information.
3. The system fetches open company requirements.
4. Eligibility is checked using data mining logic.
5. Companies are clustered and similar profiles are matched.
6. Recommendations and improvement advice are shown to the student.

---

## Slide 10 — Benefits of the System
- Saves time for students and placement coordinators
- Provides faster and more transparent eligibility evaluation
- Helps students focus on weak areas for improvement
- Supports data-driven placement decision-making
- Increases awareness of suitable career opportunities

---

## Slide 11 — References (Last 5 Years)
1. Maurya, L. S., Hussain, M. S., & Singh, S. (2021). *Developing classifiers through machine learning algorithms for student placement prediction based on academic performance*. Applied Artificial Intelligence.
2. Ramalingam, M., & Ilakkiya, R. (2021). *Data mining algorithms (KNN & DT) based predictive analysis on selected candidates in academic performance*. 2021 11th International Conference on Advanced Computing.
3. Nayak, P., Vaheed, S., Gupta, S., & Mohan, N. (2023). *Predicting students' academic performance by mining the educational data through machine learning-based classification model*. Education and Information Technologies.
4. Rao, K. E., Pydi, B. M., Vital, T. P., & Naidu, P. A. (2023). *An advanced machine learning approach for student placement prediction and analysis*.
5. Alghamdi, W. (2025). *Student placement prediction using machine learning*. AIP Conference Proceedings.

---

## Slide 12 — Conclusion
IPERS combines student data, company requirements, and intelligent recommendation techniques to improve placement planning and decision-making. It helps students identify opportunities, understand gaps, and prepare better for recruitment processes.
