"""Streamlit interface for the Resume Evaluator."""

import os

import streamlit as st

from resume_core import DEFAULT_JOB_DESCRIPTION, evaluate_resume, parse_job_description


st.set_page_config(page_title="Resume Evaluator", page_icon="📄", layout="wide")
st.title("Resume Evaluator")
st.write("Compare PDF or DOCX resumes with a job description using Groq AI.")

with st.sidebar:
    st.header("Job description")
    use_custom_jd = st.toggle("Paste a different job description", value=False)

job_description = (
    st.text_area("Paste the job description", height=280, placeholder="Paste the full job description here…")
    if use_custom_jd
    else DEFAULT_JOB_DESCRIPTION
)
if not use_custom_jd:
    with st.sidebar:
        st.caption("Using the built-in Amazon SDE I job description.")

uploaded_files = st.file_uploader(
    "Upload resumes",
    type=["pdf", "docx"],
    accept_multiple_files=True,
    help="You can upload multiple PDF or DOCX files at once.",
)

if st.button("Evaluate resumes", type="primary", disabled=not uploaded_files):
    if not job_description or not job_description.strip():
        st.error("Enter a job description before evaluating resumes.")
        st.stop()

    # Streamlit Secrets are the recommended place for GROQ_API_KEY in deployment.
    if not os.getenv("GROQ_API_KEY"):
        try:
            os.environ["GROQ_API_KEY"] = st.secrets["GROQ_API_KEY"]
        except (KeyError, FileNotFoundError):
            pass

    try:
        with st.spinner("Reading the job description…"):
            job = parse_job_description(job_description)
    except Exception as exc:
        st.error(f"Could not analyze the job description: {exc}")
        st.stop()

    results = []
    failures = []
    progress = st.progress(0, text="Starting resume evaluation…")
    for index, uploaded_file in enumerate(uploaded_files, start=1):
        progress.progress((index - 1) / len(uploaded_files), text=f"Evaluating {uploaded_file.name}…")
        try:
            result = evaluate_resume(job, uploaded_file, uploaded_file.name)
            result["filename"] = uploaded_file.name
            results.append(result)
        except Exception as exc:
            failures.append((uploaded_file.name, str(exc)))
    progress.progress(1.0, text="Evaluation complete")

    if results:
        results.sort(key=lambda candidate: candidate["score"], reverse=True)
        st.subheader("Ranked candidates")
        st.dataframe(
            [
                {"Rank": rank, "Candidate": item["name"] or item["filename"], "Resume": item["filename"], "Match (%)": item["score"]}
                for rank, item in enumerate(results, start=1)
            ],
            use_container_width=True,
            hide_index=True,
        )
        st.subheader("Candidate details")
        for rank, item in enumerate(results, start=1):
            with st.expander(f"#{rank} · {item['name'] or item['filename']} · {item['score']:.1f}%"):
                st.json(item["details"])

    for filename, error in failures:
        st.warning(f"{filename} could not be evaluated: {error}")

    if not results and failures:
        st.error("No resumes could be evaluated. Check the errors above and try again.")
