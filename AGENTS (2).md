# AGENTS.md
## Reference Materials
The following files demonstrate the preferred structure and style for new
project pages. The assistant should consult them for guidance whenever
generating or reviewing code:

- clock-example.html – a copy of your clock project page
- Generic Page.html – a template for general project pages

## Usage
1. Open the example HTML page(s) to review typical layout and formatting.
2. Follow the same section order, header styles, and basic CSS when
   producing new pages.
3. Keep comments and indentation consistent with the examples.

The assistant must reference these files first whenever asked to create or
evaluate project pages in this repository.

## Creating New Project Pages
When building a new page from `Generic Page.html`, follow these steps in order:
1. **Review the examples** – open `Generic Page.html` and `clock-example.html` to confirm the desired layout, section order, and header styles.
2. **Copy the template** – duplicate `Generic Page.html` and rename the copy to match your project.
3. **Update headers** – replace the placeholder title, heading text, meta description, and image with project-specific content.
4. **Adjust navigation and section titles** – keep the order from the template but rename headings and links as needed.
5. **Replace placeholder text** – fill in each section (program, syllabus, assessments, etc.) with the new material while preserving the HTML structure.
6. **Configure script URLs** – update the `SCRIPT_URL` constant and any form submission URLs so quiz data is sent to the correct Google Apps Script endpoint.
7. **Add resources** – include PDFs, images, and other links inside the existing `<ul>` lists.
8. **Test locally** – open the page in a browser to verify navigation, styling, and quiz functionality before committing.
