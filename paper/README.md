# Master's Thesis LaTeX Template
## Machine Learning Detection of Shadow Fleet Vessels in the Baltic Sea
### Leon Håkansson Ingman - Spring 2025

## Overview
This is your customized LaTeX template for your Master's thesis at LTH, Department of Computer Science. The template follows the structure recommended for examensarbeten at Lunds Tekniska Högskola.

## File Structure

```
thesis/
├── main.tex                          # Main document file - compile this
├── parameters.tex                    # Thesis metadata (EDIT THIS FIRST)
├── refs.bib                         # Bibliography file
├── README.md                        # This file
│
├── auxiliary_textfiles/
│   ├── preamble.tex                 # LaTeX packages and formatting
│   └── frontmatter.tex              # Title page and abstract
│
└── chapters/
    ├── acknowledgements.tex         # Acknowledgements
    ├── sammanfattning.tex          # Swedish popular summary
    ├── introduction.tex            # Chapter 1: Introduction
    ├── background.tex              # Chapter 2: Background
    ├── methodology.tex             # Chapter 3: Methodology
    ├── implementation.tex          # Chapter 4: Implementation
    ├── results.tex                 # Chapter 5: Results
    ├── discussion.tex              # Chapter 6: Discussion
    └── conclusions.tex             # Chapter 7: Conclusions
```

## Getting Started

### 1. Edit parameters.tex
This file contains all your thesis metadata. Fill in:
- Your abstract (English)
- Supervisor and examiner names (when you have them)
- Acknowledgements
- Popular summary in Swedish

### 2. Work on chapters
Edit the individual chapter files in the `chapters/` folder. Each file has a template structure to guide you.

### 3. Add references
Add your bibliography entries to `refs.bib` in BibTeX format.
Cite them in your text using: `\cite{reference_key}`

### 4. Compile
Compile `main.tex` using XeLaTeX for best results (Lund University fonts).
Or use pdfLaTeX if you prefer standard fonts.

## Using on Overleaf

1. Create a new blank project on Overleaf
2. Upload all these files maintaining the folder structure
3. Set the compiler to XeLaTeX (or pdfLaTeX)
4. Compile main.tex

## Chapter Guidelines

### Introduction
- Background and context
- Problem statement
- Research questions
- Objectives
- Scope and limitations
- Thesis outline

### Background and Related Work
- Maritime tracking systems (AIS)
- Shadow fleet characteristics
- Machine learning for maritime applications
- Related work and existing solutions

### Methodology
- Data collection and sources
- Data preprocessing
- Feature engineering
- ML algorithms used
- Evaluation methodology

### Implementation
- System architecture
- Technology stack
- Data pipeline
- Model implementation

### Results
- Dataset overview
- Model performance metrics
- Feature importance
- Case studies

### Discussion
- Interpretation of results
- Comparison with related work
- Practical implications
- Limitations

### Conclusions
- Summary of contributions
- Research questions answered
- Future work

## Important Notes

1. **Abstract**: Must be in English (obligatory)
2. **Popular Summary**: Must be in Swedish (obligatory)
3. **Word Limit**: Check with your department - typically around 10,000 words
4. **Figures**: Create a `figures/` folder and add your images there
5. **Code**: Use `listings` package for code snippets (already configured)

## Useful LaTeX Commands

### Citing references
```latex
\cite{author2024}              % Basic citation
\citep{author2024}             % Citation in parentheses
\citet{author2024}             % Textual citation
```

### Figures
```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.8\textwidth]{figures/myimage.pdf}
    \caption{Figure caption}
    \label{fig:mylabel}
\end{figure}

% Reference: See Figure~\ref{fig:mylabel}
```

### Tables
```latex
\begin{table}[htbp]
    \centering
    \caption{Table caption}
    \label{tab:mytable}
    \begin{tabular}{lcc}
        \toprule
        Header 1 & Header 2 & Header 3 \\
        \midrule
        Data 1 & Data 2 & Data 3 \\
        \bottomrule
    \end{tabular}
\end{table}
```

### Equations
```latex
\begin{equation}
    f(x) = ax^2 + bx + c
    \label{eq:quadratic}
\end{equation}

% Reference: As shown in Equation~\ref{eq:quadratic}
```

### Code listings
```latex
\begin{lstlisting}[language=Python, caption={My Python code}]
def detect_shadow_fleet(vessel_data):
    # Your code here
    return predictions
\end{lstlisting}
```

## TODO Before Submission

- [ ] Fill in supervisor and examiner names in parameters.tex
- [ ] Complete the abstract
- [ ] Write the Swedish popular summary
- [ ] Complete all chapters
- [ ] Add all references to refs.bib
- [ ] Proofread everything
- [ ] Check with your supervisor/examiner
- [ ] Get opposition scheduled
- [ ] Print and submit according to LTH guidelines

## Contact

For questions about the template or thesis process:
- Your supervisor: [To be assigned]
- Department: Department of Computer Science, LTH
- Study guidance: Check LTH's examensarbete website

## Additional Resources

- LTH Examensarbete process: https://www.student.lth.se/kurs-och-programinformation/examensarbete/
- LaTeX help: https://www.overleaf.com/learn
- BibTeX guide: https://www.bibtex.org/
- LUP Student Papers (for publishing): https://lup.lub.lu.se/student-papers/

Good luck with your thesis!
