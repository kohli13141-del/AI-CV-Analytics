import pdfplumber
import re

# Expanded Skills Database
skills_db = [
    "python", "sql", "power bi", "tableau", "machine learning",
    "deep learning", "data analysis", "excel", "pandas", "numpy",
    "tensorflow", "flask", "django", "java", "c++", "html", "css",
    "javascript", "react", "node.js", "aws", "docker", "kubernetes",
    "git", "linux", "agile", "scrum"
]

# Extract Text From PDF
def extract_text(file):
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None  # Handle corrupted PDFs gracefully
        
    return text.lower()

# Extract Skills using Regex (Fixes Java vs JavaScript issue)
def extract_skills(text):
    if not text:
        return []
        
    found_skills = []
    for skill in skills_db:
        # \b ensures we only match whole words
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text):
            found_skills.append(skill)
            
    return found_skills

# Generate Real ATS Score
def calculate_ats_score(text, found_skills):
    if not text:
        return 0
        
    score = 0
    
    # Base score from word count (Ideal length check)
    words = text.split()
    if len(words) > 200:
        score += 30
    elif len(words) > 100:
        score += 15
        
    # Score from skills found (Max 50 points)
    skill_score = min(len(found_skills) * 5, 50)
    score += skill_score
    
    # Structure checks (Max 20 points)
    if "experience" in text or "work history" in text:
        score += 10
    if "education" in text or "university" in text or "college" in text:
        score += 10
        
    return min(score, 100) # Cap at 100