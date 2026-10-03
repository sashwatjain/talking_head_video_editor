#!/usr/bin/env python
"""Draft a timecoded, editable scene plan from an approved transcript."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SENTENCE_END = re.compile(r"""[.!?]["')\]]?$""")


def load_transcript(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(f"Transcript not found: {path}. Run tools/transcribe.py first.")
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("approved") is not True:
        raise ValueError("Transcript is not approved. Correct it and set approved=true after user review.")
    segments = data.get("segments")
    if not isinstance(segments, list) or not segments:
        raise ValueError("Approved transcript has no segments to plan.")
    return data


def group_segments(segments: list[dict[str, Any]], max_seconds: float) -> list[list[dict[str, Any]]]:
    units: list[dict[str, Any]] = []
    for segment in segments:
        words = segment.get("words") or []
        if words:
            units.extend(
                {
                    "start": word["start"],
                    "end": word["end"],
                    "text": word["text"],
                }
                for word in words
            )
        else:
            units.append(segment)

    groups: list[list[dict[str, Any]]] = []
    current: list[dict[str, Any]] = []

    for unit in units:
        start, end = float(unit["start"]), float(unit["end"])
        if end <= start or start < 0:
            raise ValueError(f"Invalid transcript segment time range: {start}-{end}")
        if current:
            gap = start - float(current[-1]["end"])
            group_start = float(current[0]["start"])
            if gap > 1.5 or end - group_start > max_seconds:
                groups.append(current)
                current = []
        current.append(unit)
        if SENTENCE_END.search(str(unit.get("text", "")).strip()):
            if float(current[-1]["end"]) - float(current[0]["start"]) >= max_seconds * 0.55:
                groups.append(current)
                current = []

    if current:
        groups.append(current)
    return groups


def join_group_text(group: list[dict[str, Any]]) -> str:
    text = ""
    for item in group:
        word = str(item.get("text", ""))
        if not text or word[:1].isspace():
            text += word
        else:
            text += f" {word}"
    return text.strip()


def make_scenes(segments: list[dict[str, Any]], max_seconds: float) -> list[dict[str, Any]]:
    scenes = []
    for index, group in enumerate(group_segments(segments, max_seconds), start=1):
        text = join_group_text(group)
        excerpt = text[:140] + ("..." if len(text) > 140 else "")
        mentions_numbers = len(re.findall(r"\b\d+(?:[.,]\d+)?%?\b", text)) >= 2
        visual_idea = (
            "Potential comparison graphic: have the reviewer verify labels, exact values, units, and context against the source."
            if mentions_numbers
            else "Stay on the speaker by default; add a quote, lower third, or illustration only if it clarifies this passage."
        )
        scenes.append(
            {
                "id": f"scene-{index:03}",
                "start": round(float(group[0]["start"]), 3),
                "end": round(float(group[-1]["end"]), 3),
                "purpose": f"Emphasize this spoken point: {excerpt}",
                "transcript_excerpt": text,
                "visual": {
                    "kind": "none",
                    "headline": "",
                    "body": "",
                    "values": [],
                    "placement": "safe area",
                    "motion": "subtle fade; keep the speaker primary",
                    "idea": visual_idea,
                },
                "notes": "Draft split from word timing when available. No data values are inferred; verify all graphics against the video and user brief.",
            }
        )
    return scenes


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--transcript", default="project/transcript.json")
    parser.add_argument("--output", default="project/scenes.json")
    parser.add_argument("--max-seconds", type=float, default=12.0, help="Suggested maximum scene length")
    args = parser.parse_args()

    try:
        if args.max_seconds <= 0:
            raise ValueError("--max-seconds must be greater than zero.")
        transcript_path = Path(args.transcript)
        output_path = Path(args.output)
        if not transcript_path.is_absolute():
            transcript_path = ROOT / transcript_path
        if not output_path.is_absolute():
            output_path = ROOT / output_path
        transcript = load_transcript(transcript_path)
        scenes = make_scenes(transcript["segments"], args.max_seconds)
        plan = {
            "approved": False,
            "source_transcript": str(transcript_path.relative_to(ROOT)) if transcript_path.is_relative_to(ROOT) else str(transcript_path),
            "source_duration": transcript.get("duration"),
            "scenes": scenes,
        }
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(plan, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    except (FileNotFoundError, ValueError, KeyError, json.JSONDecodeError) as error:
        print(f"Scene planning failed: {error}", file=sys.stderr)
        return 1

    print(f"Draft scene plan ({len(scenes)} scenes) written to {output_path}")
    print("Human review required: edit scene splits, overlays, copy, values, and timing; set approved=true only after review.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
