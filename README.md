# Talking-head video editor

A free, local-first editing workspace for turning a user-provided talking-head video and brief into a reviewed Remotion edit. It includes a CPU-only transcription workflow, editable scene plans, reusable motion-graphic components, a visual theme brief, and Remotion Studio for final review.

**The workflow intentionally stops for human approval twice:** first after transcription, then after the scene plan. It never renders automatically. The user reviews the finished composition in Remotion Studio and starts the final render.

## Prerequisites

- Windows 10/11, macOS, or Linux
- Node.js 20 or newer and npm
- Python 3.10–3.12 (64-bit recommended)
- FFmpeg with `ffmpeg` and `ffprobe` on `PATH`
- Internet access the first time you install dependencies or download a Whisper model
- Enough disk space for the source video, Python environment, Whisper model, and render

Verify Node, Python, and FFmpeg:

```powershell
node --version
npm --version
py --version
ffmpeg -version
ffprobe -version
```

The Python transcription uses `faster-whisper` with CPU `int8` inference; an NVIDIA GPU is not required. The first transcription downloads the selected model. Smaller models use less memory and are faster, while larger models may be more accurate.

## Setup

From the project root in PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
npm install
```

If PowerShell blocks venv activation, allow it for this terminal only with:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

## Project inputs

1. Put the original video in [`input/raw_video/`](input/raw_video/). One video is expected; supported common formats include MP4, MOV, and MKV.
2. Describe the goal, audience, desired length/aspect ratio, editing preferences, must-keep/must-remove sections, caption preference, and any constraints in [`input/brief.md`](input/brief.md).
3. Add logos and other supplied brand assets under [`assets/`](assets/). Keep the original media unchanged.
4. If there is a poster or website reference, give the image to a multimodal ChatGPT using [`prompts/theme-from-reference.md`](prompts/theme-from-reference.md), then save its checked output in [`project/theme.md`](project/theme.md). Do not treat colors or brand details inferred by a model as confirmed facts.

## Editing workflow (human approval required)

### 1. Generate and approve the transcript

With `.venv` active:

```powershell
python tools/transcribe.py
```

Or specify a video, model, or language:

```powershell
python tools/transcribe.py --input "input/raw_video/interview.mp4" --model small --language en
```

The script writes `project/transcript.json` and `project/transcript.srt`. **Read and correct the transcript before approving it**: fix names, numbers, punctuation, and timestamps. Change `"approved": false` to `true` in `project/transcript.json` only when it is checked. The scene planner refuses an unapproved transcript.

### 2. Create and approve the scene plan

```powershell
python tools/plan_scenes.py
```

This creates `project/scenes.json`, with time ranges, purpose, suggested visual treatment, on-screen copy, and editable graphic values. Treat suggestions as a first draft, not as facts. Edit it to match the brief and footage, check every timestamp and statistic, and set `"approved": true` only when the user has approved it.

Check the reviewed files:

```powershell
python tools/validate_review.py
```

Validation checks the approval flags, JSON structure, and time ranges. It does not approve content on a user's behalf.

### 3. Build and review the edit

After reviewing the transcript and scene plan, build the composition using the approved content. Keep generated copy and project-specific visual choices out of reusable components.

```powershell
npm run studio
```

The `TalkingHead` starter composition opens without a source file. Copy the chosen source media into `public/`, then set `sourceVideo`, `durationSeconds`, the approved captions/scenes, and the selected theme in `src/Root.tsx`. Remotion assets referenced with `staticFile()` must be inside `public/`.

For a scene that benefits from visual explanation, set its `presentation` to `split-video-left` or `split-video-right`. The speaker video animates into a one-third panel; the graphic uses the remaining two-thirds, then the layout returns to full-frame when the scene ends. Use `kind: "flowchart"` with `items` and `flow: "sequence"` or `"branches"` to explain steps or relationships. Keep other scenes full-frame by default, and place captions where they remain readable without competing with the graphic.

Make edits, then leave Studio open for the user to review and request changes. Do not render until they explicitly approve.

### 4. Render only after user approval

Once the user confirms the Studio preview is final:

```powershell
npm run render
```

The default render writes to `output/talking-head-final.mp4`. Do not overwrite the source video.

## Useful locations

| Purpose | Location |
|---|---|
| Original video and user brief | `input/` |
| Brand guidance and reviewed edit plan | `project/` |
| Theme-from-image prompt | `prompts/theme-from-reference.md` |
| Reusable React/Remotion elements | `src/components/` |
| Composition and project entry points | `src/` |
| Runtime media loaded by Remotion | `public/` |
| User-provided logos and references | `assets/` |
| CPU transcription and review utilities | `tools/` |
| Final user-approved renders | `output/` |

## Troubleshooting

- **No source video found:** put exactly one supported video in `input/raw_video/`, or pass `--input`.
- **Model download or transcription fails:** check network access, free disk space, and that `.venv` is active. Retry with `--model tiny` or `--model base` on a low-memory machine.
- **Video decode errors:** verify it plays locally and that FFmpeg is installed and on `PATH`.
- **Remotion cannot find media:** place a copy under `public/` and reference its path relative to `public/`, e.g. `media/source.mp4`.
- **Output has the wrong length:** set `durationSeconds` to the source duration and ensure scenes/captions use the source video's timeline.

## License and costs

The starter and workflow scripts are free to use. Transcription runs locally using open-source dependencies and does not require a paid API. Remotion's licensing terms apply to the user's usage; check its current license before commercial use. Fonts, music, stock footage, logos, and other imported assets must each have appropriate usage rights.
