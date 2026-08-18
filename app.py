from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

from resume_parser import extract_text, extract_skills, calculate_ats_score
from model import predict_role


# ==========================================
# FLASK APP CONFIGURATION
# ==========================================

app = Flask(__name__, template_folder='.')
CORS(app)


# ==========================================
# ALLOWED FILE TYPES
# ==========================================

ALLOWED_EXTENSIONS = {'pdf'}


def allowed_file(filename):
    return (
        '.' in filename
        and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    )


# ==========================================
# HOME PAGE
# ==========================================

@app.route('/')
@app.route('/index.html')
def home():
    return render_template('index.html')


# ==========================================
# CHECK ATS PAGE
# ==========================================

@app.route('/checkats')
@app.route('/checkats.html')
def checkats_page():
    return render_template('checkats.html')


# ==========================================
# RESUME COMPARISON PAGE
# ==========================================

@app.route('/compare')
@app.route('/compare.html')
def compare_page():
    return render_template('compare.html')


# ==========================================
# CONTACT PAGE
# ==========================================

@app.route('/contact')
@app.route('/contact.html')
def contact_page():
    return render_template('contact.html')


# ==========================================
# ATS & RESUME PARSER API
# ==========================================

@app.route('/upload', methods=['POST'])
def upload_resume():

    try:

        # Check if resume exists
        if 'resume' not in request.files:
            return jsonify({
                "error": "No file uploaded"
            }), 400

        file = request.files['resume']


        # Check filename
        if file.filename == '':
            return jsonify({
                "error": "No selected file"
            }), 400


        # Check file format
        if not allowed_file(file.filename):
            return jsonify({
                "error": "Invalid format. Only PDF allowed!"
            }), 400


        # Extract resume text
        text = extract_text(file)


        if text is None:
            return jsonify({
                "error": "Could not read PDF. File might be corrupted."
            }), 500


        # Extract skills
        skills = extract_skills(text)


        # Predict career role
        role = predict_role(skills)


        # Calculate ATS score
        score = calculate_ats_score(
            text,
            skills
        )


        # Return result
        return jsonify({

            "ats_score": score,

            "skills": skills,

            "recommended_role": role

        }), 200


    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==========================================
# RESUME COMPARISON API
# ==========================================

@app.route('/compare', methods=['POST'])
def compare_resumes():

    try:

        # Check both resumes
        if (
            'resumeA' not in request.files
            or
            'resumeB' not in request.files
        ):

            return jsonify({
                "error": "Please upload both resumes"
            }), 400


        fileA = request.files['resumeA']
        fileB = request.files['resumeB']


        # Check file formats
        if (
            not allowed_file(fileA.filename)
            or
            not allowed_file(fileB.filename)
        ):

            return jsonify({
                "error": "Both files must be PDF format."
            }), 400


        # Extract text
        textA = extract_text(fileA)
        textB = extract_text(fileB)


        # Check extraction
        if textA is None or textB is None:

            return jsonify({
                "error": "Error extracting text from one or both PDFs."
            }), 500


        # Extract skills
        skillsA = extract_skills(textA)
        skillsB = extract_skills(textB)


        # Calculate ATS scores
        scoreA = calculate_ats_score(
            textA,
            skillsA
        )

        scoreB = calculate_ats_score(
            textB,
            skillsB
        )


        # Decide winner
        if scoreA > scoreB:

            winner = "Candidate A"

        elif scoreB > scoreA:

            winner = "Candidate B"

        else:

            winner = "Tie"


        # Return comparison result
        return jsonify({

            "candidateA": {

                "ats_score": scoreA,

                "skills_count": len(skillsA)

            },

            "candidateB": {

                "ats_score": scoreB,

                "skills_count": len(skillsB)

            },

            "winner": winner

        }), 200


    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==========================================
# HEALTH CHECK
# ==========================================

@app.route('/health')
def health():

    return jsonify({

        "status": "online",

        "message": "AI CV Analytics Backend Running 🚀"

    }), 200


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    import os

    # Render automatically provides PORT
    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )


    app.run(

        host="0.0.0.0",

        port=port

    )
