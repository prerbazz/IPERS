from app import create_app
from database import db
from models import User, StudentProfile, FacultyProfile, TpcProfile, Company, Announcement, CompanyNews

def seed_database():
    app = create_app()
    with app.app_context():
        print("Recreating database tables...")
        db.drop_all()
        db.create_all()
        
        print("Creating default TPC User...")
        tpc_user = User(username="tpc", email="tpc@university.edu", role="tpc")
        tpc_user.set_password("tpc123")
        db.session.add(tpc_user)
        db.session.flush()
        
        tpc_prof = TpcProfile(user_id=tpc_user.id, name="Dr. Sarah Jenkins")
        db.session.add(tpc_prof)
        
        print("Creating default Faculty User...")
        faculty_user = User(username="faculty", email="faculty@university.edu", role="faculty")
        faculty_user.set_password("faculty123")
        db.session.add(faculty_user)
        db.session.flush()
        
        faculty_prof = FacultyProfile(user_id=faculty_user.id, name="Prof. Alan Turing", department="Computer Science & Engineering")
        db.session.add(faculty_prof)

        # Create some other faculty users
        fac2 = User(username="faculty_ece", email="ece_fac@university.edu", role="faculty")
        fac2.set_password("faculty123")
        db.session.add(fac2)
        db.session.flush()
        fac2_prof = FacultyProfile(user_id=fac2.id, name="Dr. Grace Hopper", department="Electronics & Communication Engineering")
        db.session.add(fac2_prof)

        print("Creating Student Users...")
        # 1. Main Student (will have average scores initially, ready for faculty updates)
        student_user = User(username="student", email="student@university.edu", role="student")
        student_user.set_password("student123")
        db.session.add(student_user)
        db.session.flush()
        
        student_prof = StudentProfile(
            user_id=student_user.id,
            full_name="Prerna Premkumar",
            roll_number="CS2026001",
            cgpa=8.2,
            internships=1,
            aptitude_score=75,
            communication_score=80,
            technical_score=78,
            cgpa_verified=True,
            internships_verified=True,
            arrears=0,
            skills="React, Node.js, Python, Flask"
        )
        db.session.add(student_prof)

        # 2. High Performing Student (eligible for Tier 1)
        s_high = User(username="high_performer", email="alice@university.edu", role="student")
        s_high.set_password("student123")
        db.session.add(s_high)
        db.session.flush()
        s_high_prof = StudentProfile(
            user_id=s_high.id,
            full_name="Alice Vance",
            roll_number="CS2026002",
            cgpa=9.6,
            internships=2,
            aptitude_score=95,
            communication_score=90,
            technical_score=94,
            cgpa_verified=True,
            internships_verified=True,
            arrears=0,
            skills="Machine Learning, PyTorch, C++, Algorithms"
        )
        db.session.add(s_high_prof)

        # 3. Average Student with Arrears (needs improvement)
        s_avg = User(username="avg_student", email="bob@university.edu", role="student")
        s_avg.set_password("student123")
        db.session.add(s_avg)
        db.session.flush()
        s_avg_prof = StudentProfile(
            user_id=s_avg.id,
            full_name="Bob Miller",
            roll_number="CS2026003",
            cgpa=6.9,
            internships=0,
            aptitude_score=60,
            communication_score=62,
            technical_score=58,
            cgpa_verified=False,
            internships_verified=False,
            arrears=2,
            skills="HTML, CSS, SQL"
        )
        db.session.add(s_avg_prof)

        # 4. Tech Enthusiast (high tech, lower cgpa)
        s_tech = User(username="tech_enthusiast", email="charlie@university.edu", role="student")
        s_tech.set_password("student123")
        db.session.add(s_tech)
        db.session.flush()
        s_tech_prof = StudentProfile(
            user_id=s_tech.id,
            full_name="Charlie Root",
            roll_number="CS2026004",
            cgpa=7.4,
            internships=3,
            aptitude_score=72,
            communication_score=65,
            technical_score=88,
            cgpa_verified=True,
            internships_verified=True,
            arrears=0,
            skills="Rust, Docker, Go, Kubernetes, Backend"
        )
        db.session.add(s_tech_prof)

        print("Creating Companies...")
        companies = [
            # High CGPA + High Aptitude (Tier 1/Dream)
            Company(name="Google", min_cgpa=9.0, min_aptitude=85, min_communication=85, min_technical=85, min_internships=2, allowed_arrears=0, status="Open"),
            Company(name="Microsoft", min_cgpa=8.8, min_aptitude=80, min_communication=80, min_technical=90, min_internships=1, allowed_arrears=0, status="Open"),
            Company(name="Adobe", min_cgpa=8.5, min_aptitude=82, min_communication=80, min_technical=85, min_internships=1, allowed_arrears=0, status="Open"),
            
            # Technical Skill Focused
            Company(name="Zoho", min_cgpa=7.5, min_aptitude=70, min_communication=65, min_technical=80, min_internships=1, allowed_arrears=1, status="Open"),
            Company(name="Freshworks", min_cgpa=7.8, min_aptitude=72, min_communication=75, min_technical=78, min_internships=1, allowed_arrears=0, status="Open"),
            Company(name="NVIDIA", min_cgpa=8.2, min_aptitude=78, min_communication=70, min_technical=88, min_internships=2, allowed_arrears=0, status="Open"),
            Company(name="Atlassian", min_cgpa=8.0, min_aptitude=80, min_communication=80, min_technical=85, min_internships=1, allowed_arrears=0, status="Closed"),
            
            # Service Companies
            Company(name="TCS", min_cgpa=6.0, min_aptitude=55, min_communication=55, min_technical=55, min_internships=0, allowed_arrears=3, status="Open"),
            Company(name="Infosys", min_cgpa=6.2, min_aptitude=58, min_communication=60, min_technical=58, min_internships=0, allowed_arrears=2, status="Open"),
            Company(name="Wipro", min_cgpa=6.0, min_aptitude=55, min_communication=55, min_technical=55, min_internships=0, allowed_arrears=4, status="Open"),
            Company(name="Cognizant", min_cgpa=6.5, min_aptitude=60, min_communication=60, min_technical=60, min_internships=0, allowed_arrears=2, status="Open"),
        ]
        
        for c in companies:
            db.session.add(c)
            
        print("Creating Announcements...")
        announcements = [
            Announcement(
                title="Placement Registration Open for Batch 2026",
                content="All final year students must update their profiles, upload their resume in PDF format, and request faculty verification for CGPA and internships before next Friday.",
                created_by_id=tpc_user.id
            ),
            Announcement(
                title="Aptitude & Coding Prep Classes",
                content="A series of mock tests and webinars on quantitative aptitude and technical interviews will start from Monday. Schedule has been emailed to all departments.",
                created_by_id=tpc_user.id
            ),
            Announcement(
                title="Google Prep Talk by Alumni",
                content="Join us for an interactive Q&A session with alumni placed at Google, sharing their coding round experiences and interview tips. Date: June 25, 4:00 PM.",
                created_by_id=tpc_user.id
            )
        ]
        
        for a in announcements:
            db.session.add(a)
            
        print("Creating Company News Feed...")
        news_items = [
            CompanyNews(
                company_name="Google",
                title="Google Drive 2026 Announced",
                content="Google has officially opened its software engineering internship and full-time hiring portals. Minimum CGPA threshold is set to 9.0. Standard online coding rounds will commence in early July.",
                created_by_id=tpc_user.id
            ),
            CompanyNews(
                company_name="TCS",
                title="TCS National Qualifier Test (NQT)",
                content="TCS NQT registrations are open now. Open to all branches with up to 3 active arrears. Outstanding performers will be eligible for the TCS Digital package (7 LPA), while others qualify for Ninja (3.6 LPA).",
                created_by_id=tpc_user.id
            ),
            CompanyNews(
                company_name="NVIDIA",
                title="Hardware & System Software Hiring",
                content="NVIDIA is looking for CUDA developers and hardware interns. Strong knowledge of computer architecture, operating systems, and C++ is mandatory. Minimum technical score benchmark: 88.",
                created_by_id=tpc_user.id
            )
        ]
        
        for n in news_items:
            db.session.add(n)
            
        db.session.commit()
        print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
