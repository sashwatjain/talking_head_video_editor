#!/usr/bin/env python
"""Transcribe a local video/audio file on CPU for human review."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SUPPORTED_EXTENSIONS = {".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v", ".mp3", ".wav", ".m4a", ".flac"}


def find_input(explicit: str | None) -> Path:
    if explicit:
        path = Path(explicit).expanduser()
        if not path.is_absolute():
            path = ROOT / path
        if not path.is_file():
            raise FileNotFoundError(f"Input media file does not exist: {path}")
        return path.resolve()

    candidates = sorted(
        path for path in (ROOT / "input" / "raw_video").iterdir()
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )
    if len(candidates) != 1:
        raise ValueError(
            f"Expected exactly one supported media file in input/raw_video; found {len(candidates)}. "
            "Add one file or pass --input PATH."
        )
    return candidates[0].resolve()


def transcribe(input_path: Path, model_name: str, language: str | None) -> dict[str, Any]:
    try:
        from faster_whisper import WhisperModel
    except ImportError as error:
        raise RuntimeError("faster-whisper is missing. Activate .venv and run: pip install -r requirements.txt") from error

    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        str(input_path),
        language=language,
        word_timestamps=True,
        vad_filter=True,
    )

    result_segments: list[dict[str, Any]] = []
    for segment in segments:
        words = [
            {
                "start": round(word.start, 3),
                "end": round(word.end, 3),
                "text": word.word,
                "confidence": round(word.probability, 4),
            }
            for word in (segment.words or [])
        ]
        result_segments.append(
            {
                "start": round(segment.start, 3),
                "end": round(segment.end, 3),
                "text": segment.text.strip(),
                "confidence": round(segment.avg_logprob, 4),
                "words": words,
            }
        )

    if not result_segments:
        raise RuntimeError("No speech was detected. Check the media/audio track and try again.")

    return {
        "approved": False,
        "language": info.language,
        "source": str(input_path.relative_to(ROOT)) if input_path.is_relative_to(ROOT) else str(input_path),
        "duration": round(info.duration, 3),
        "segments": result_segments,
    }


def srt_timestamp(seconds: float) -> str:
    milliseconds = round(max(0, seconds) * 1000)
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    secs, millis = divmod(remainder, 1_000)
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"


def write_srt(transcript: dict[str, Any], destination: Path) -> None:
    entries = []
    for number, segment in enumerate(transcript["segments"], start=1):
        entries.append(
            f"{number}\n{srt_timestamp(segment['start'])} --> {srt_timestamp(segment['end'])}\n"
            f"{segment['text']}\n"
        )
    destination.write_text("\n".join(entries), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", help="Video or audio path (defaults to the only media file in input/raw_video)")
    parser.add_argument("--model", default="small", help="Whisper model size (default: small; try base or tiny on low-memory CPUs)")
    parser.add_argument("--language", help="Optional language code, e.g. en. Auto-detected when omitted.")
    parser.add_argument("--output", default="project/transcript.json", help="Transcript JSON output path")
    args = parser.parse_args()

    try:
        source = find_input(args.input)
        transcript = transcribe(source, args.model, args.language)
        output = Path(args.output)
        if not output.is_absolute():
            output = ROOT / output
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(transcript, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        srt_path = output.with_suffix(".srt")
        write_srt(transcript, srt_path)
    except (FileNotFoundError, ValueError, RuntimeError) as error:
        print(f"Transcription failed: {error}", file=sys.stderr)
        return 1

    print(f"Transcript written to {output.relative_to(ROOT) if output.is_relative_to(ROOT) else output}")
    print(f"Subtitle draft written to {srt_path.relative_to(ROOT) if srt_path.is_relative_to(ROOT) else srt_path}")
    print("Human review required: correct the transcript, then set approved=true in the JSON.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
