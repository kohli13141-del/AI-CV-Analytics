from flask import Flask, request, jsonify
from flask_cors import CORS

from resume_parser import extract_text, extract_skills, calculate_ats_score
from model import predict_role

app = Flask(__name__, template_folder='.')
CORS(app)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Home Route
@app.route('/')
def home():
    return "AI CV Analytics Backend Running 🚀"

# ----------------------------
# 1. ATS & PARSER ROUTE
# ----------------------------
@app.route('/upload', methods=['POST'])
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['resume']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid format. Only PDF allowed!"}), 400

        text = extract_text(file)
        
        if text is None:
            return jsonify({"error": "Could not read PDF. File might be corrupted."}), 500

        skills = extract_skills(text)
        role = predict_role(skills)
        score = calculate_ats_score(text, skills)

        return jsonify({
            "ats_score": score,
            "skills": skills,
            "recommended_role": role
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------
# 2. COMPARISON BATTLE ROUTE
# ----------------------------
@app.route('/compare', methods=['POST'])
def compare_resumes():
    try:
        if 'resumeA' not in request.files or 'resumeB' not in request.files:
            return jsonify({"error": "Please upload both resumes"}), 400

        fileA = request.files['resumeA']
        fileB = request.files['resumeB']

        if not allowed_file(fileA.filename) or not allowed_file(fileB.filename):
            return jsonify({"error": "Both files must be PDF format."}), 400

        textA = extract_text(fileA)
        textB = extract_text(fileB)

        if textA is None or textB is None:
            return jsonify({"error": "Error extracting text from one or both PDFs."}), 500

        skillsA = extract_skills(textA)
        skillsB = extract_skills(textB)

        scoreA = calculate_ats_score(textA, skillsA)
        scoreB = calculate_ats_score(textB, skillsB)

        # Decide Winner Backend Logic
        if scoreA > scoreB:
            winner = "Candidate A"
        elif scoreB > scoreA:
            winner = "Candidate B"
        else:
            winner = "Tie"

        return jsonify({
            "candidateA": {"ats_score": scoreA, "skills_count": len(skillsA)},
            "candidateB": {"ats_score": scoreB, "skills_count": len(skillsB)},
            "winner": winner
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
