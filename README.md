# Resume-Evaluator
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
