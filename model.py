def predict_role(skills):
    if not skills:
        return "No matching role found"

    skills_set = set(skills)

    # Define Role Clusters
    data_science_skills = {"python", "machine learning", "deep learning", "pandas", "numpy", "tensorflow"}
    data_analyst_skills = {"sql", "excel", "power bi", "tableau", "data analysis"}
    frontend_skills = {"html", "css", "javascript", "react"}
    backend_skills = {"python", "flask", "django", "java", "c++", "node.js"}
    devops_skills = {"aws", "docker", "kubernetes", "linux", "git"}

    # Calculate overlaps
    scores = {
        "Machine Learning Engineer": len(skills_set.intersection(data_science_skills)),
        "Data Analyst / BI": len(skills_set.intersection(data_analyst_skills)),
        "Frontend Developer": len(skills_set.intersection(frontend_skills)),
        "Backend Developer": len(skills_set.intersection(backend_skills)),
        "DevOps/Cloud Engineer": len(skills_set.intersection(devops_skills))
    }

    # Find the role with the maximum overlapping skills
    best_match = max(scores, key=scores.get)
    
    if scores[best_match] == 0:
        return "General Software Engineer"
        
    return best_match