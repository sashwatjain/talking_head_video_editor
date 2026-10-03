# Talking-head editing skill

Instructions for a coding agent editing a user-provided talking-head video in this repository.

## Mission and non-negotiable workflow

Create a clear, polished, accurate edit that follows the user brief and approved brand theme. Use Remotion for composition and preview. Keep source media unmodified and keep project-specific edits separate from reusable elements.

**Human-in-the-loop gates are mandatory:**

1. Generate a transcript, then stop and ask the user to validate/correct it. Do not plan final scenes from unchecked words, names, or numbers.
2. Generate a timecoded scene plan, then stop and ask the user to review/edit/approve all scene splits, graphic copy, data, and timing. Do not build the final edit until approved.
3. Build the composition and start Remotion Studio for user review. Gather requested changes and iterate in Studio.
4. Never render or publish automatically. Render only after the user explicitly approves the Studio preview.

Do not interpret a generated transcript or plan's `"approved"` field as user consent unless the user has actually reviewed it.

## Before editing

1. Read `input/brief.md`, `project/theme.md`, and this file. Inspect all supplied files under `input/` and `assets/`; do not invent missing brand assets or facts.
2. Check that there is a source video under `input/raw_video/`. Preserve the original. Copy only the required runtime files into `public/`; use `staticFile()` paths relative to `public/`.
3. Follow the README setup. For transcription, use the local `.venv`; do not send private footage to external services.
4. If the transcript has not been reviewed, run `python tools/transcribe.py`, then ask the user to correct and approve `project/transcript.json`. Use `python tools/validate_review.py` after approval.
5. If the scene plan has not been reviewed, run `python tools/plan_scenes.py`, then ask the user to verify and edit `project/scenes.json`. Validate again after approval.
6. If the theme file is still a template, ask the user to provide brand guidance or a poster/site reference. The prompt in `prompts/theme-from-reference.md` can draft a theme; the user must verify it.

## Scene plan expectations

Use `project/scenes.json` as the reviewed edit decision list. Every scene must have:

- A stable ID and start/end times in seconds on the original video timeline.
- A concise purpose and a visual treatment appropriate to the spoken content.
- On-screen copy sourced from the approved transcript or user brief.
- Graphic/animation instructions and explicit editable values where relevant (e.g. chart title, labels, values, units, colors, placement, and timing).
- A clear indication when no overlay is preferable.

Keep scenes contiguous unless the edit intentionally removes a time range. Avoid unsupported factual claims, fabricated chart data, crowded overlays, and changing the speaker's meaning. Validate time ranges against the video and preserve a sensible safe area for the target aspect ratio.

## Remotion implementation

- Keep all reusable visual elements in `src/components/`; keep composition-specific orchestration in a clearly named file under `src/`.
- Register compositions in `src/Root.tsx`. Expose meaningful edit controls in Remotion Studio where practical (source path, duration, theme colors, caption visibility, and scene/overlay settings).
- Use `useCurrentFrame()`, `useVideoConfig()`, `interpolate()`, and `spring()` for deterministic animation. Do not use CSS transitions, CSS keyframe animations, timers, or randomness that changes between renders.
- Use `Sequence` for timeline elements, set durations explicitly, and use `staticFile()` for local assets in `public/`. Check aspect ratio, framing, audio, captions, and timing in Studio.
- Captions must use the human-approved transcript timings. Keep readable contrast and safe margins. Do not add captions if the user declines them.
- Prefer restrained motion, clear hierarchy, legible typography, and a small number of purposeful visual treatments. Match colors and fonts to `project/theme.md`.
- Charts must show only user-provided or otherwise verified data. Make chart values, labels, units, and source clear; never infer quantitative values from speech.
- Keep files modular and typed. Add new dependencies only when necessary. Do not modify original input files or render as a substitute for review.

## Finish and handoff

1. Run `python tools/validate_review.py` after transcript/scene changes and run `npx tsc --noEmit` after composition changes.
2. Start Remotion Studio (`npm run studio`) and keep it available for user review.
3. Summarize the edit and any unresolved questions; ask for specific change requests. Do not render until the user explicitly approves.
4. After approval, render with `npm run render` (or a documented composition-specific command) and verify the output exists and plays. Keep the final file in `output/`.

## Useful references

- Setup and commands: `README.md`
- User intent: `input/brief.md`
- Brand/style source of truth: `project/theme.md`
- Approved transcript: `project/transcript.json`
- Approved scene plan: `project/scenes.json`
- Reusable components: `src/components/`
