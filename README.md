# ResumeParser

Screen the PDF and DOCX resumes in `resume/` against the sample **Entry-Level Data Analyst** job description in `evaluator.py`.

## Run

From this directory:

```powershell
uv sync
uv run evaluator.py
```

The evaluator prints JSON with each resume's match percentage, score breakdown, matched and missing skills, and any extraction errors. Results are ranked by score.

## Sample screening criteria

- **Required skills (45%)**: SQL, Excel, Python, data visualization, and statistics.
- **Preferred skills (25%)**: pandas, NumPy, Power BI, Tableau, and PostgreSQL.
- **Education (15%)**: relevant bachelor's degree or equivalent coursework.
- **Relevant experience (10%)**: at least one year, an internship, or a substantial academic project.
- **Responsibilities (5%)**: evidence of data cleaning, analysis, reporting, and communicating insights.

This is a local, keyword-based screening aid: resume contents are not sent to an external API. Keyword matching can miss equivalent wording and cannot verify claims, so review the original resumes and do not use the score as the sole basis for a hiring decision. Scanned PDFs without selectable text are reported as extraction errors.