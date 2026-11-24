# Resume Evaluator

Resume Evaluator compares resumes with a job description and returns a match score and explanation. It uses the Groq API to send text to a large language model (LLM), and Pydantic models to validate the structured data returned by the model.

The project can be run as a command-line program or as a Streamlit web app. It supports PDF and DOCX resumes.

## Features

- Extracts text from PDF and DOCX resumes.
- Extracts structured resume and job information with Groq.
- Validates model responses with Pydantic.
- Scores resumes against a job description and ranks candidates.
- Offers a command-line workflow and a browser-based Streamlit interface.

## Requirements

- Python 3.11 or later
- A [Groq API key](https://console.groq.com/keys)

## Setup

Clone the repository and move into its directory:

```bash
git clone https://github.com/MusavirMehdi/Resume-Evaluator.git
cd Resume-Evaluator
```

Install dependencies with `uv`:

```bash
uv sync
```

Alternatively, use pip:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project directory and add your Groq key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Keep this key private. Do not commit `.env` to GitHub.

## Run from the command line

Put PDF or DOCX resumes in the `resume/` directory, then run:

```bash
python evaluator.py
```

The CLI processes the resumes in that folder against the job description defined in `evaluator.py`, then prints scores and the highest and lowest matches.

## Run the Streamlit web app

Start the app locally:

```bash
uv run streamlit run app.py
```

Or, if you installed packages with pip:

```bash
streamlit run app.py
```

The app uses a built-in Amazon SDE I job description by default. Turn on **Paste a different job description** to provide another one. Upload one or more PDF or DOCX resumes and choose **Evaluate resumes** to view the ranked results and candidate details.

## Deploy on Streamlit Community Cloud

1. Push the project to a GitHub repository.
2. Sign in at [Streamlit Community Cloud](https://share.streamlit.io/) with GitHub and create an app from the repository.
3. Set the app's main file path to `app.py`.
4. Add your Groq key in the app's **Secrets** settings:

   ```toml
   GROQ_API_KEY = "your_groq_api_key_here"
   ```

5. Deploy the app. Streamlit will provide a shareable `streamlit.app` URL.

## How it works

1. The program extracts text from the uploaded or local resume files.
2. Groq's LLM converts the job description and resume text into structured JSON.
3. Pydantic validates that JSON and creates typed Python objects.
4. The LLM compares each resume with the structured job description and returns a score and details.
5. The CLI prints the results, while the web app displays a ranked table and expandable candidate details.

For the Streamlit app, uploaded files are handled in memory and are not saved by the app. Their extracted text and the job description are sent to Groq for analysis.
