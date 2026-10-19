---
title: Surveys
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-15
version: 0.1
phase: 2
---

# Surveys

[🏠 Home](../../README.md) › Productivity & quality › Surveys

These instruments measure developer experience, loosely based on the SPACE framework (Satisfaction, Performance, Activity, Communication, Efficiency/flow). The same core items are used pre, mid, and post so changes can be compared. Everything is anonymous to managers. Only the evaluation lead holds the pseudonym mapping.

## Contents
- [Schedule](#schedule)
- [Core items (pre, mid, post)](#core-items-pre-mid-post)
- [Pre-survey only](#pre-survey-only)
- [Mid and post additions](#mid-and-post-additions)
- [Weekly pulse (2 minutes)](#weekly-pulse-2-minutes)
- [Exit interview guide](#exit-interview-guide)

## Schedule

| Instrument | When | Who | Time |
|---|---|---|---|
| Pre-survey | Prep week (before access) | All participants | 10 min |
| Weekly pulse | Every Friday while using Claude Code | Active participants | 2 min |
| Mid-survey | Pilot week 4 | All participants (cohort B: control framing) | 10 min |
| Post-survey | Final week | All participants | 15 min |
| Exit interviews | Final week | 6–8 participants (a mix of heavy and light users) | 30 min |

## Core items (pre, mid, post)

Use a 5-point Likert scale (1 = strongly disagree … 5 = strongly agree) unless noted.

| # | Item | Dimension |
|---|---|---|
| C1 | I'm satisfied with the tools I have for my development work. | Satisfaction |
| C2 | I can complete my typical tasks efficiently. | Efficiency |
| C3 | I often get into a state of flow while coding. | Flow |
| C4 | I spend too much time on repetitive or boilerplate work. (reverse) | Efficiency |
| C5 | Understanding unfamiliar code takes me a long time. (reverse) | Cognitive load |
| C6 | I'm confident in the quality of the code I ship. | Performance |
| C7 | Writing tests is a burden. (reverse) | Efficiency |
| C8 | I get the information I need without interrupting colleagues. | Communication |
| C9 | In a typical week, how many hours go on work you'd describe as low-value or toil? (number) | Efficiency |

## Pre-survey only

| # | Item | Type |
|---|---|---|
| P1 | Years of professional development experience | Number |
| P2 | Primary language(s) / stack | Multi-choice |
| P3 | Prior use of AI coding tools (none / occasional / daily), and which | Choice + text |
| P4 | How do you expect an AI coding agent to affect your work? (much worse … much better) | 5-point |
| P5 | What concerns do you have? (quality, security, skills atrophy, job impact, privacy, other) | Multi-choice + text |
| P6 | Which tasks do you most hope it helps with? | Text |

## Mid and post additions

| # | Item | Type |
|---|---|---|
| M1 | Claude Code makes me more productive. | Likert |
| M2 | I'd want to keep using Claude Code after the pilot. | Likert |
| M3 | How likely are you to recommend Claude Code to a colleague? (0–10) | NPS |
| M4 | In a typical week, roughly how many hours does Claude Code save you? (0 / <1 / 1–3 / 3–5 / 5–10 / 10+) | Choice |
| M5 | I trust the code Claude Code produces after my review. | Likert |
| M6 | The security controls (prompts, blocked commands, sandbox) got in my way. | Likert |
| M7 | Which tasks did Claude Code help with **most**? (bug fixing, features, tests, refactoring, understanding code, docs, reviews, other) | Multi-choice |
| M8 | Which tasks did it **not** help with, or make worse? | Text |
| M9 | Did Claude Code ever do something unexpected or concerning? Describe. | Text |
| M10 | Has using Claude Code changed how you work with colleagues (reviews, questions)? | Text |
| M11 | What one change would make Claude Code more useful here? | Text |

## Weekly pulse (2 minutes)

| # | Item | Type |
|---|---|---|
| W1 | Days you used Claude Code this week | 0–5 |
| W2 | Hours it saved you this week (estimate) | Number |
| W3 | Overall, this week Claude Code was… (a hindrance … a big help) | 5-point |
| W4 | Did security controls block something you legitimately needed? | Yes/No + text |
| W5 | Best or worst moment this week (optional) | Text |

## Exit interview guide

1. Walk me through a typical session from last week. What did you ask for, and what happened?
2. Show me the change where Claude Code helped most. What would it have taken without it?
3. When did you **not** use it, and why?
4. How did you check its work? Did your review habits change?
5. Did anything make you uneasy (security, quality, over-reliance)?
6. Which controls felt reasonable, and which felt like obstacles?
7. If we rolled this out to everyone tomorrow, what should we tell them?
8. Would you fight to keep it? Why or why not?

## Related
- [Measurement framework](measurement-framework.md) · [Success criteria (experience)](../00-charter/success-criteria.md#developer-experience-criteria)
