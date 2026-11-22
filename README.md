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


Alex Sample - 25.0 %
{'candidate_name': 'Alex Sample', 'matching_skills': ['C++', 'Data Structures', 'Algorithms', 'SQL', 'Git/GitHub'], 'missing_important_skills': ['Java', 'Python', 'C#', 'Go', 'Rust', 'TypeScript', 'Object-oriented design'], 'experience_requirement_met': True, 'overall_match_percentage': 25, 'final_verdict': 'Partial fit; strong front-end experience but lacks core required programming languages and many preferred cloud/AI skills.'}
