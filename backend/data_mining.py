import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

# Reference/Seed historical student profiles for KNN
HISTORICAL_STUDENTS = [
    # Format: [cgpa, aptitude_score, communication_score, technical_score, internships, arrears, placed_at]
    [9.5, 95, 90, 95, 2, 0, "Microsoft"],
    [9.2, 90, 92, 90, 2, 0, "Google"],
    [8.9, 88, 85, 88, 1, 0, "Amazon"],
    [8.7, 85, 88, 85, 2, 0, "Adobe"],
    [8.8, 82, 85, 90, 1, 0, "NVIDIA"],
    [8.5, 80, 80, 85, 1, 0, "Cisco"],
    [8.3, 78, 82, 80, 1, 0, "Oracle"],
    [8.2, 85, 75, 82, 1, 0, "Samsung"],
    [8.0, 75, 80, 78, 1, 0, "Accenture"],
    [7.8, 70, 75, 72, 1, 0, "TCS (Digital)"],
    [7.5, 72, 70, 75, 1, 0, "Cognizant"],
    [7.2, 65, 72, 68, 0, 0, "Infosys"],
    [7.0, 68, 65, 70, 0, 1, "Wipro"],
    [6.8, 60, 60, 65, 0, 1, "TCS (Ninja)"],
    [6.5, 58, 62, 60, 0, 2, "Tech Mahindra"],
    [8.1, 80, 90, 70, 1, 0, "Deloitte"],
    [8.4, 75, 88, 72, 1, 0, "EY"],
    [9.0, 85, 95, 80, 2, 0, "McKinsey & Co"],
    [7.9, 72, 78, 75, 1, 0, "Capgemini"],
    [7.6, 70, 70, 70, 0, 0, "LTI Mindtree"],
    [9.3, 92, 85, 96, 2, 0, "Uber"],
    [9.1, 89, 90, 92, 2, 0, "Directi"],
    [8.6, 80, 85, 88, 1, 0, "Zhoho"],
    [8.2, 78, 80, 85, 1, 0, "Freshworks"],
    [7.4, 68, 70, 72, 0, 0, "Hexaware"],
    [6.9, 62, 65, 66, 0, 1, "HCL Tech"],
    [6.7, 60, 60, 62, 0, 2, "Syntel"],
]

HISTORICAL_STUDENTS_DF = pd.DataFrame(
    HISTORICAL_STUDENTS,
    columns=["cgpa", "aptitude_score", "communication_score", "technical_score", "internships", "arrears", "placed_at"]
)

# Reference companies for K-Means fitting (ensures stable cluster definitions)
REFERENCE_COMPANIES = [
    # Name, min_cgpa, min_aptitude, min_communication, min_technical, min_internships, allowed_arrears
    {"name": "Tier 1 High-End A", "min_cgpa": 9.0, "min_aptitude": 85, "min_communication": 85, "min_technical": 90, "min_internships": 1, "allowed_arrears": 0},
    {"name": "Tier 1 High-End B", "min_cgpa": 8.5, "min_aptitude": 80, "min_communication": 80, "min_technical": 85, "min_internships": 1, "allowed_arrears": 0},
    {"name": "Tech Focused A", "min_cgpa": 7.5, "min_aptitude": 70, "min_communication": 70, "min_technical": 80, "min_internships": 1, "allowed_arrears": 1},
    {"name": "Tech Focused B", "min_cgpa": 8.0, "min_aptitude": 75, "min_communication": 75, "min_technical": 85, "min_internships": 2, "allowed_arrears": 0},
    {"name": "Service Mass A", "min_cgpa": 6.0, "min_aptitude": 60, "min_communication": 60, "min_technical": 60, "min_internships": 0, "allowed_arrears": 2},
    {"name": "Service Mass B", "min_cgpa": 6.5, "min_aptitude": 65, "min_communication": 65, "min_technical": 65, "min_internships": 0, "allowed_arrears": 3},
]

def run_decision_tree_eligibility(student_profile, companies):
    """
    Simulates a Decision Tree classifier for placement eligibility based on threshold checks.
    Returns lists of eligible and ineligible companies with the decision path (traversal tree).
    """
    eligible_list = []
    ineligible_list = []
    
    # Extract student values
    cgpa = student_profile.cgpa or 0.0
    aptitude = student_profile.aptitude_score or 0
    comm = student_profile.communication_score or 0
    tech = student_profile.technical_score or 0
    internships = student_profile.internships or 0
    arrears = student_profile.arrears or 0
    
    for comp in companies:
        path = []
        is_eligible = True
        failures = []
        
        # 1. Arrears check (Root node check)
        if arrears > comp.allowed_arrears:
            is_eligible = False
            failures.append(f"Arrears: {arrears} exceeds allowed {comp.allowed_arrears}")
            path.append(f"Arrears Check -> Failed (Student has {arrears} arrears, company allows max {comp.allowed_arrears})")
        else:
            path.append(f"Arrears Check -> Passed (Student has {arrears} arrears, company allows max {comp.allowed_arrears})")
            
        # 2. CGPA check
        if cgpa < comp.min_cgpa:
            is_eligible = False
            failures.append(f"CGPA: {cgpa:.2f} is below min {comp.min_cgpa:.2f}")
            path.append(f"CGPA Check -> Failed (Student CGPA {cgpa:.2f} < Min CGPA {comp.min_cgpa:.2f})")
        else:
            path.append(f"CGPA Check -> Passed (Student CGPA {cgpa:.2f} >= Min CGPA {comp.min_cgpa:.2f})")
            
        # 3. Internships check
        if internships < comp.min_internships:
            is_eligible = False
            failures.append(f"Internships: {internships} is below min {comp.min_internships}")
            path.append(f"Internship Check -> Failed (Student internships {internships} < Min Internships {comp.min_internships})")
        else:
            path.append(f"Internship Check -> Passed (Student internships {internships} >= Min Internships {comp.min_internships})")

        # 4. Technical score check
        if tech < comp.min_technical:
            is_eligible = False
            failures.append(f"Technical Score: {tech} is below min {comp.min_technical}")
            path.append(f"Technical Score Check -> Failed (Student Technical {tech} < Min Technical {comp.min_technical})")
        else:
            path.append(f"Technical Score Check -> Passed (Student Technical {tech} >= Min Technical {comp.min_technical})")
            
        # 5. Aptitude check
        if aptitude < comp.min_aptitude:
            is_eligible = False
            failures.append(f"Aptitude Score: {aptitude} is below min {comp.min_aptitude}")
            path.append(f"Aptitude Check -> Failed (Student Aptitude {aptitude} < Min Aptitude {comp.min_aptitude})")
        else:
            path.append(f"Aptitude Check -> Passed (Student Aptitude {aptitude} >= Min Aptitude {comp.min_aptitude})")

        # 6. Communication check
        if comm < comp.min_communication:
            is_eligible = False
            failures.append(f"Communication Score: {comm} is below min {comp.min_communication}")
            path.append(f"Communication Check -> Failed (Student Communication {comm} < Min Communication {comp.min_communication})")
        else:
            path.append(f"Communication Check -> Passed (Student Communication {comm} >= Min Communication {comp.min_communication})")

        # Summary decision
        decision_record = {
            "company": comp.to_dict(),
            "decision_path": path,
            "failures": failures,
            "is_eligible": is_eligible
        }
        
        if is_eligible:
            eligible_list.append(decision_record)
        else:
            ineligible_list.append(decision_record)
            
    return eligible_list, ineligible_list


def cluster_companies_kmeans(companies):
    """
    Clusters companies using K-Means into:
    - High CGPA + High Aptitude (Tier 1/Dream)
    - Technical Skill Focused
    - Service Companies
    
    If list is too small, uses reference companies to stabilize centroids.
    """
    if not companies:
        return {}

    # Extract company features
    comp_data = []
    for c in companies:
        comp_data.append({
            "id": c.id,
            "min_cgpa": c.min_cgpa,
            "min_aptitude": c.min_aptitude,
            "min_communication": c.min_communication,
            "min_technical": c.min_technical,
            "min_internships": c.min_internships,
            "allowed_arrears": c.allowed_arrears,
            "name": c.name
        })
        
    df_active = pd.DataFrame(comp_data)
    
    # If we have too few companies, append reference companies to establish robust clusters
    if len(df_active) < 5:
        ref_df = pd.DataFrame(REFERENCE_COMPANIES)
        ref_df["id"] = -1
        df_for_clustering = pd.concat([df_active, ref_df], ignore_index=True)
    else:
        df_for_clustering = df_active.copy()

    features = ["min_cgpa", "min_aptitude", "min_communication", "min_technical", "min_internships", "allowed_arrears"]
    
    # Scale features
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(df_for_clustering[features])
    
    # Fit K-Means
    num_clusters = min(3, len(df_for_clustering))
    if num_clusters < 3:
        # Fallback labeling if not enough variation
        cluster_assignments = {}
        for index, row in df_active.iterrows():
            if row["min_cgpa"] >= 8.0:
                cluster_assignments[row["id"]] = "High CGPA + High Aptitude"
            elif row["min_technical"] >= 75:
                cluster_assignments[row["id"]] = "Technical Skill Focused Companies"
            else:
                cluster_assignments[row["id"]] = "Service Companies"
        return cluster_assignments

    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    df_for_clustering["cluster"] = kmeans.fit_predict(scaled_features)
    
    # Map cluster numbers to meaningful labels by evaluating the centroids
    centroids = kmeans.cluster_centers_
    # centroids is of shape (3, 6)
    # columns are: min_cgpa, min_aptitude, min_communication, min_technical, min_internships, allowed_arrears
    
    # We unscale the centroids to interpret them easily
    unscaled_centroids = scaler.inverse_transform(centroids)
    
    cluster_stats = []
    for i in range(3):
        stat = {
            "cluster_id": i,
            "cgpa": unscaled_centroids[i][0],
            "aptitude": unscaled_centroids[i][1],
            "comm": unscaled_centroids[i][2],
            "tech": unscaled_centroids[i][3],
            "internships": unscaled_centroids[i][4],
            "arrears": unscaled_centroids[i][5]
        }
        cluster_stats.append(stat)
        
    # Rules to map clusters:
    # 1. "High CGPA + High Aptitude" -> Highest average min_cgpa + min_aptitude
    # 2. "Service Companies" -> Highest allowed arrears (or lowest technical score)
    # 3. "Technical Skill Focused Companies" -> Remaining cluster
    
    sorted_by_cgpa_apt = sorted(cluster_stats, key=lambda x: x["cgpa"] + x["aptitude"], reverse=True)
    high_cgpa_cluster = sorted_by_cgpa_apt[0]["cluster_id"]
    
    remaining = [c for c in cluster_stats if c["cluster_id"] != high_cgpa_cluster]
    
    # Of the remaining, the one with higher arrears (or lower technical score) is Service
    sorted_by_arrears = sorted(remaining, key=lambda x: x["arrears"] - x["tech"]/10, reverse=True)
    service_cluster = sorted_by_arrears[0]["cluster_id"]
    
    tech_cluster = [c for c in remaining if c["cluster_id"] != service_cluster][0]["cluster_id"]
    
    label_mapping = {
        high_cgpa_cluster: "High CGPA + High Aptitude",
        tech_cluster: "Technical Skill Focused Companies",
        service_cluster: "Service Companies"
    }
    
    # Match back to active companies
    active_assignments = {}
    for index, row in df_active.iterrows():
        # Find assignment in df_for_clustering for this active company ID
        clust_num = df_for_clustering.loc[df_for_clustering["id"] == row["id"], "cluster"].values[0]
        active_assignments[row["id"]] = label_mapping[clust_num]
        
    return active_assignments


def run_knn_similar_profiles(student_profile, k=3):
    """
    Fits KNN on historical student profiles and finds the k most similar past students.
    Returns their profile metrics, placement outcomes, and calculated similarity percentages.
    """
    student_features = [
        student_profile.cgpa or 0.0,
        student_profile.aptitude_score or 0,
        student_profile.communication_score or 0,
        student_profile.technical_score or 0,
        student_profile.internships or 0,
        student_profile.arrears or 0
    ]
    
    features = ["cgpa", "aptitude_score", "communication_score", "technical_score", "internships", "arrears"]
    
    # Combine active student with historical records to fit scaler
    df_hist = HISTORICAL_STUDENTS_DF.copy()
    
    scaler = StandardScaler()
    scaled_hist = scaler.fit_transform(df_hist[features])
    scaled_student = scaler.transform([student_features])
    
    # Fit KNN
    knn = NearestNeighbors(n_neighbors=k, metric='euclidean')
    knn.fit(scaled_hist)
    
    distances, indices = knn.kneighbors(scaled_student)
    
    similar_profiles = []
    
    # Convert distances to similarity percentages.
    # In standardized space, a distance of 0 is 100% similarity.
    # We define a distance threshold of 4.0 as ~50% similarity.
    # similarity = 100 * exp(-distance^2 / 8) or simple linear mapping.
    for dist, idx in zip(distances[0], indices[0]):
        matched_student = df_hist.iloc[idx]
        
        # Calculate similarity percentage
        sim_pct = int(max(55, min(99, 100 * np.exp(- (dist ** 2) / 8.0))))
        
        similar_profiles.append({
            "name": f"Alumnus Profile #{idx + 101}",
            "cgpa": float(matched_student["cgpa"]),
            "aptitude_score": int(matched_student["aptitude_score"]),
            "communication_score": int(matched_student["communication_score"]),
            "technical_score": int(matched_student["technical_score"]),
            "internships": int(matched_student["internships"]),
            "arrears": int(matched_student["arrears"]),
            "placed_at": str(matched_student["placed_at"]),
            "similarity_score": sim_pct
        })
        
    return similar_profiles


def generate_improvement_suggestions(student_profile, ineligible_companies):
    """
    Analyzes gap between student profile and requirements of ineligible companies,
    generating clear, action-oriented career improvement plans.
    """
    suggestions = []
    
    cgpa = student_profile.cgpa or 0.0
    aptitude = student_profile.aptitude_score or 0
    comm = student_profile.communication_score or 0
    tech = student_profile.technical_score or 0
    internships = student_profile.internships or 0
    arrears = student_profile.arrears or 0

    # Collect gaps across all ineligible companies
    gaps = {
        "cgpa": [],
        "aptitude": [],
        "comm": [],
        "tech": [],
        "internships": [],
        "arrears": []
    }
    
    for record in ineligible_companies:
        comp = record["company"]
        if cgpa < comp["min_cgpa"]:
            gaps["cgpa"].append(comp["min_cgpa"] - cgpa)
        if aptitude < comp["min_aptitude"]:
            gaps["aptitude"].append(comp["min_aptitude"] - aptitude)
        if comm < comp["min_communication"]:
            gaps["comm"].append(comp["min_communication"] - comm)
        if tech < comp["min_technical"]:
            gaps["tech"].append(comp["min_technical"] - tech)
        if internships < comp["min_internships"]:
            gaps["internships"].append(comp["min_internships"] - internships)
        if arrears > comp["allowed_arrears"]:
            gaps["arrears"].append(arrears - comp["allowed_arrears"])
            
    # Formulate suggestions based on major gap domains
    if gaps["cgpa"]:
        max_gap = max(gaps["cgpa"])
        target = cgpa + max_gap
        suggestions.append({
            "category": "Academic Excellence",
            "message": f"Your CGPA ({cgpa:.2f}) is holding you back from {len(gaps['cgpa'])} companies. Aim to increase it to at least {target:.2f} by focusing on theory courses and core subjects in your upcoming exams.",
            "priority": "High" if max_gap > 0.5 else "Medium"
        })
        
    if gaps["tech"]:
        max_gap = max(gaps["tech"])
        target = tech + max_gap
        suggestions.append({
            "category": "Technical Skill Enhancement",
            "message": f"Your Technical Evaluation Score ({tech}) is below requirements for {len(gaps['tech'])} companies. Practice coding on LeetCode/HackerRank, build simple React/Flask web applications, and review basic Data Structures & Algorithms to boost your score to {target}+.",
            "priority": "High" if max_gap > 15 else "Medium"
        })
        
    if gaps["aptitude"]:
        max_gap = max(gaps["aptitude"])
        target = aptitude + max_gap
        suggestions.append({
            "category": "Aptitude and Problem Solving",
            "message": f"Your Aptitude Score ({aptitude}) fails eligibility for {len(gaps['aptitude'])} companies. Dedicate time to practice quantitative aptitude, logical reasoning, and puzzle solving. Take weekly mock tests to target a score of {target}.",
            "priority": "Medium"
        })

    if gaps["comm"]:
        max_gap = max(gaps["comm"])
        target = comm + max_gap
        suggestions.append({
            "category": "Communication & Mock Interviews",
            "message": f"Your Communication Score ({comm}) needs improvement to qualify for {len(gaps['comm'])} recruiters. Participate in group discussions, practice self-introduction videos, and conduct mock HR interviews to reach a score of {target}.",
            "priority": "Medium"
        })
        
    if gaps["internships"]:
        max_gap = max(gaps["internships"])
        suggestions.append({
            "category": "Practical Experience",
            "message": f"You have {internships} internships, but some top-tier companies require at least {internships + max(gaps['internships'])}. Work on securing a software engineering or technical internship, or contribute to recognized open-source projects.",
            "priority": "High"
        })
        
    if gaps["arrears"]:
        suggestions.append({
            "category": "Arrear Clearance",
            "message": f"You currently have {arrears} active arrears. Many placement opportunities have a strict 0-arrear policy. Prioritize clearing all pending arrears in the supplementary examination cycles.",
            "priority": "High"
        })

    # Default suggestion if eligible for everything
    if not suggestions:
        suggestions.append({
            "category": "Career Growth",
            "message": "Congratulations! You are eligible for all currently open recruitments. Focus on maintaining your high scores, polish your resume, and conduct company-specific research to prepare for interviews.",
            "priority": "Low"
        })
        
    return suggestions
