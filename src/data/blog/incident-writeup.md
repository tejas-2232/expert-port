---
title: "Incident writeup: what we learned"
description: "A short template and habits for post-incident writeups that actually get read and reused."
pubDate: 2024-09-20
---

After a production issue, a short writeup helps the team and future you. Here’s what we try to capture.

## What happened

One or two sentences: **what** users or systems saw and **when** (with timezone). No blame, just facts.

## Impact

Who or what was affected, and for how long. If you have numbers (errors, latency, users), add them.

## Root cause

The **direct** cause (e.g. config typo, capacity limit). If you don’t know yet, say “under investigation” and add a follow-up.

## What we did

Timeline of actions: who did what and when. Helps next time and for audits.

## Follow-ups

Concrete actions: fix configs, add alerts, update runbooks, or schedule a deeper post-mortem. Assign owners.

---

Keeping writeups short and consistent makes them more likely to be read and reused when something similar happens again.
