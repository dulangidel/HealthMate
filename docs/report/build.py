"""Builds HealthMate_Technical_Report.pdf from report.html using headless Chrome.

Pass 1 renders the report, reads which page each heading landed on (pypdf),
then pass 2 renders again with page numbers filled into the table of contents.
Usage:  python build.py   (needs Google Chrome and `pip install pypdf`)
"""
import re
import subprocess
import pathlib

from pypdf import PdfReader

HERE = pathlib.Path(__file__).resolve().parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT = HERE / "HealthMate_Technical_Report.pdf"

TOC = [
    (1, "1. Project Overview"),
    (1, "2. Application Features"),
    (1, "3. Application Architecture"),
    (2, "3.1 Explanation of the project architecture"),
    (2, "3.2 Architecture diagram"),
    (2, "3.3 Explanation of each major layer / folder"),
    (2, "3.4 State-management approach"),
    (1, "4. Database Design"),
    (2, "4.1 Database structure"),
    (2, "4.2 Entity / table diagram"),
    (2, "4.3 Field descriptions"),
    (2, "4.4 Sample database code"),
    (2, "4.5 How the application communicates with SQLite"),
    (1, "5. CRUD Implementation"),
    (2, "5.1 Create"),
    (2, "5.2 Read (list, search and filter)"),
    (2, "5.3 Update"),
    (2, "5.4 Delete"),
    (1, "6. Third-Party Libraries"),
    (1, "7. UI / UX Design"),
    (2, "7.1 Wireframes"),
    (2, "7.2 Final screenshots"),
    (2, "7.3 Design decisions"),
    (1, "8. Test Cases"),
    (2, "8.1 Manual test cases"),
    (2, "8.2 Test evidence"),
    (2, "8.3 Automated tests"),
    (1, "9. Issues / Errors & Fixes"),
    (1, "10. Version Control"),
    (1, "11. Conclusion"),
    (1, "12. References"),
]


def render(html: pathlib.Path, pdf: pathlib.Path) -> None:
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
         "--allow-file-access-from-files", f"--print-to-pdf={pdf}", html.as_uri()],
        check=True, capture_output=True,
    )


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", text).replace("’", "'").strip()


def toc_html(pages: dict) -> str:
    rows = []
    for level, title in TOC:
        page = pages.get(title, "")
        safe = title.replace("&", "&amp;")
        rows.append(f'<div class="row l{level}"><span class="t">{safe}</span>'
                    f'<span class="dots"></span><span>{page}</span></div>')
    return "\n".join(rows)


def main() -> None:
    source = (HERE / "report.html").read_text()
    tmp_html = HERE / "_build.html"
    tmp_pdf = HERE / "_pass1.pdf"

    tmp_html.write_text(source.replace("<!--TOC-->", toc_html({t: "00" for _, t in TOC})))
    render(tmp_html, tmp_pdf)

    texts = [norm(p.extract_text() or "") for p in PdfReader(tmp_pdf).pages]
    pages = {}
    for _, title in TOC:
        needle = norm(title).replace("&", "&")
        for i, text in enumerate(texts):
            if i < 2:  # skip cover + TOC
                continue
            if needle in text or needle.split(" (")[0] in text:
                pages[title] = i + 1
                break
    missing = [t for _, t in TOC if t not in pages]
    if missing:
        print("WARNING: headings not found:", missing)

    tmp_html.write_text(source.replace("<!--TOC-->", toc_html(pages)))
    render(tmp_html, OUT)
    n = len(PdfReader(OUT).pages)
    tmp_html.unlink()
    tmp_pdf.unlink()
    print(f"Wrote {OUT.name}: {n} pages")


if __name__ == "__main__":
    main()
