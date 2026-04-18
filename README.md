# Dividi & Conquista! 🌸

An Italian math education game for kids, focused on **division** and **fractions**. No frameworks, no dependencies — a single HTML page with vanilla JS and CSS.

## What it does

Players create a profile (avatar + name), pick a game mode, and answer math questions. Correct answers earn XP, build streaks for score multipliers, and unlock trophies. Progress is saved in `localStorage`.

### Game modes

| Mode | Description |
|---|---|
| 📚 **Classica** | 15 questions, review each answer before moving on |
| ⚡ **Blitz** | Unlimited questions in 60 seconds |
| 🎯 **Vero o Falso** | True/False statements in 45 seconds |
| 🧚 **Sfida Magica** | Boss battle — answer correctly to drain the witch's HP |
| 🍕 **Sfida Frazioni** | Fractions-only session, 20 questions per round |

### Question types

**Division**
- Basic division, reverse division, hidden divisor, chain division
- Word problems: sharing groups, time, money
- Trap questions and true/false statements
- Identifying multiplication vs division

**Fractions**
- Unit fractions: *"What is 1/3 of 12?"*
- Non-unit fractions: *"What is 2/3 of 12?"*
- Equivalent fractions: *"Complete: 1/2 = ?/4"*
- Simplification: *"Simplify 4/6"*
- Comparison: *"Which is bigger: 1/3 or 1/7?"*
- True/False fraction statements

### Progression system

- XP and 8 level titles (Fiorellino → Leggenda)
- Streak multipliers: ×2 at 3, ×3 at 7, ×4 at 10
- 12 unlockable trophies
- Leaderboard across profiles

## How to run

Just open `index.html` in a browser — or serve the folder with any static file server:

```bash
npx serve .
```

No build step, no install needed.

## Structure

```
index.html   — all screens and markup
app.js       — game logic, question generators, profile system
styles.css   — layout and animations
```
