# Quick Start Guide

## Immediate Next Steps

1. **Upload to Overleaf**
   - Go to https://www.overleaf.com
   - Create new project → Upload Project
   - Upload all files maintaining folder structure
   - Set compiler to XeLaTeX (Menu → Compiler)

2. **First Edits (do these now)**
   - Open `parameters.tex`
   - Fill in your abstract (even a draft version)
   - Fill in basic information for supervisors/examiner when available
   - Start your acknowledgements

3. **Start Writing**
   - Begin with `chapters/introduction.tex`
   - Use the template structure as a guide
   - Add content gradually
   - Compile frequently to check formatting

4. **Add References**
   - As you read papers, add them to `refs.bib`
   - Use Google Scholar → Cite → BibTeX for easy import
   - Cite in text with `\cite{key}`

## Key Files to Edit Regularly

1. `parameters.tex` - Update abstract, add supervisor names
2. `chapters/*.tex` - Your main writing
3. `refs.bib` - Your bibliography
4. `chapters/sammanfattning.tex` - Swedish summary (write near the end)
5. `chapters/acknowledgements.tex` - Thank people who helped

## Tips

- **Write iteratively**: Don't wait to have everything perfect
- **Commit often**: Use Git or Overleaf's version history
- **Get feedback early**: Share drafts with your supervisor
- **Keep notes**: Document your progress and ideas
- **Track todos**: Use comments in LaTeX `% TODO: add figure here`

## Common Issues

**Problem**: Compilation errors
**Solution**: Check the log, usually a missing `}` or `\end{}`

**Problem**: References not showing
**Solution**: Compile multiple times (LaTeX → BibTeX → LaTeX → LaTeX)

**Problem**: Figures not displaying
**Solution**: Check file path and format (PDF recommended)

## When You're Stuck

1. Check the template examples in each chapter file
2. Consult Overleaf documentation
3. Ask your supervisor
4. Check LTH guidelines
5. Look at previous theses in LUP Student Papers

## Important Dates

- Start: Spring 2025
- Expected completion: June 12, 2025
- Opposition: Schedule 1-2 weeks before completion
- Final submission: Coordinate with your examiner

Good luck!
