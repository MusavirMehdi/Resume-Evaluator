# Resume-Evaluator

## Run the web app locally

1. Install dependencies with `uv sync` (or `pip install -r requirements.txt`).
2. Put your Groq API key in `.env` as `GROQ_API_KEY=your_key`.
3. Start the app with `streamlit run app.py`.

The app uses the built-in Amazon SDE I job description by default. Turn on
“Paste a different job description” to compare resumes against another role.
Upload PDF or DOCX files and select **Evaluate resumes**.

## Deploy on Streamlit Community Cloud

1. Commit and push this project to the GitHub repository.
2. Sign in at [share.streamlit.io](https://share.streamlit.io/) with GitHub and
   create an app from that repository. Set the main file path to `app.py`.
3. In the app settings, add a secret named `GROQ_API_KEY` with your Groq API
   key, then deploy. Keep `.env` out of GitHub; it is ignored by `.gitignore`.

Streamlit Community Cloud will provide the public `*.streamlit.app` URL after
the deployment succeeds.

## Resume handling

Uploaded files are processed in memory and are not saved by the app. Resume
text is sent to Groq to parse and compare it with the job description.

---

## CLI example

Upload several resumes and enter the job description. The Python program extracts text from each resume. It sends the text to an LLM through the Groq service.  The program uses Pydantic to structure the LLM output. It compares each resume with the job description and gives it a score. It then shows the two highest scores and the two lowest scores.

Sample Output Example -:

Processing: Alex_Sample_Resume.pdf
Score: 25.0

Processing: Jordan_Example_Resume.docx
Score: 42.0

Processing: Sam_Placeholder_Resume.docx
Score: 45.0

Processing: Taylor_Demo_Resume.pdf
Score: 30.0

TOP 2 CANDIDATES
Sam Placeholder - 45.0 %
{'candidate_name': 'Sam Placeholder', 'matching_skills': ['Java', 'Object-oriented design'], 'missing_important_skills': ['Python', 'C++', 'C#', 'Go', 'Rust', 'TypeScript', 'Data structures', 'Algorithms'], 'experience_requirement_met': True, 'overall_match_percentage': 45, 'final_verdict': 'Partial fit; core required skills are weak, but strong project experience and many preferred skills. Needs to improve on key languages and fundamentals.'}
Jordan Example - 42.0 %
{'name': 'Jordan Example', 'matching_skills': ['C++', 'Python'], 'missing_important_skills': ['Java', 'C#', 'Go', 'Rust', 'TypeScript', 'Data structures', 'Algorithms', 'Object-oriented design'], 'experience_requirement_met': True, 'overall_match_percentage': 42, 'verdict': 'Partial fit: core programming languages present and education aligns, but many required technical skills and preferred cloud/DevOps experience are missing.'}

LOWEST 2 CANDIDATES
Taylor Demo - 30.0 %
{'candidate_name': 'Taylor Demo', 'matching_skills': ['C++', 'Python', 'Data Structures and Algorithms'], 'missing_important_skills': ['Java', 'C#', 'Go', 'Rust', 'TypeScript', 'Object-oriented design'], 'experience_requirement_met': True, 'overall_match_percentage': 30, 'final_verdict': 'Candidate meets basic requirements but lacks many core required skills; overall fit is low.'}
Alex Sample - 25.0 %
{'candidate_name': 'Alex Sample', 'matching_skills': ['C++', 'Data Structures', 'Algorithms', 'SQL', 'Git/GitHub'], 'missing_important_skills': ['Java', 'Python', 'C#', 'Go', 'Rust', 'TypeScript', 'Object-oriented design'], 'experience_requirement_met': True, 'overall_match_percentage': 25, 'final_verdict': 'Partial fit; strong front-end experience but lacks core required programming languages and many preferred cloud/AI skills.'}
