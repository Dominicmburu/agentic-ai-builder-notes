# Agentic AI Builder: Course Notes

A small static website of plain-language notes for the 4-week Agentic AI Builder course: 20 lessons, with a project at the end of each week (lessons 5, 10, 15 and 20). No build step and no installs. It is just HTML, CSS and a little JavaScript.

## What is inside

```
index.html                  Home page: four weeks of lesson cards and a progress counter
glossary.html               Every term from every lesson, A to Z
lessons/lesson-1.html ...   Lessons 1 to 20
assets/style.css            All the styling (light and dark mode)
assets/app.js               Copy buttons, quiz, JSON checker, saved exercise tables
assets/widgets.js           Interactive demos, checklists, "mark as done" and progress
downloads/                  Slide decks students can download (Lesson 1 so far)
.nojekyll                   Tells GitHub Pages to serve the files as they are
```

Every lesson has the same shape: the big idea, plain explanations with everyday comparisons, a worked example, an exercise, an "if something goes wrong" table, a five-question quiz, a glossary and a recap.

Students' progress (ticked checklists, filled-in tables, finished lessons) is saved in their own browser only. Nothing is sent anywhere.

## Preview on your computer

Open `index.html` in a browser. Or, from this folder, run a tiny local server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Publish with GitHub Pages (free)

1. Push this folder to a GitHub repository.
2. On GitHub open the repository, then **Settings**, then **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **main** and folder **/ (root)**, then **Save**.
5. Wait about a minute. Your site appears at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

Note: GitHub Pages on a free account needs the repository to be public.

## Editing a lesson

Each lesson is a normal HTML file in `lessons/`. Open it in any text editor and change the words between the tags. Keep these in step if you change them:

- Section headings have an `id` (for example `<h2 id="exercise">`). The "On this page" list links to those ids.
- The quiz answers are marked with `data-correct`. Keep exactly one per question.
- Checklist boxes have a `data-check` name, and exercise table inputs have a `name`. Students' saved answers are stored under these names, so renaming them clears what was saved.

To add a slide deck, put the file in `downloads/` and link it from the lesson.

## Writing style guide for the notes

- Start every idea with an everyday comparison (restaurant, phone keyboard, car, airtime).
- Short sentences. One idea per paragraph.
- Explain a new word the first time it appears, and add it to the glossary.
- End each lesson with an exercise and a short quiz.

## Before you teach each lesson

The steps that use outside services (n8n, ElevenLabs, Supabase, Ollama, MCP servers, Firecrawl, Hunter.io) were written from general knowledge of these tools. Their menus, node names and settings change often. Do a dry run of each lesson yourself first, and fix any button or node name that has moved.

## Safety

Never put API keys in these files. If a key is ever pasted into a page, delete it from the file, rotate the key with the provider, and remove it from the git history.
