# Agentic AI Builder: Course Notes

A small static website of plain-language notes for the 4-week Agentic AI Builder course. No build step and no installs: it is just HTML, CSS and a little JavaScript.

## What is inside

```
index.html                  Home page with the lesson list
lessons/lesson-1.html       Lesson 1 notes
assets/style.css            All the styling (light and dark mode)
assets/app.js               Copy buttons, quiz, JSON checker, next-word demo
downloads/                  Slide decks students can download
```

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

## Add the next lesson

1. Copy `lessons/lesson-1.html` to `lessons/lesson-2.html`.
2. Change the title, the "On this page" list, and the content. Keep the section `id` values matching the links in the list.
3. In `index.html`, replace the "Coming soon" card for that lesson with a link card like the Lesson 1 card.
4. Put the lesson's slide deck in `downloads/`.

## Writing style guide for the notes

- Start every idea with an everyday comparison (restaurant, phone keyboard, car, airtime).
- Short sentences. One idea per paragraph.
- Explain a new word the first time it appears, and add it to the glossary.
- End each lesson with an exercise and a short quiz.

## Safety

Never put API keys in these files. If a key is ever pasted into a page, delete it from the file, rotate the key with the provider, and remove it from the git history.
