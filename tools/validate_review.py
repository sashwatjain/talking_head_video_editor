#!/usr/bin/env python
"""Validate reviewed transcript and scene-plan structure without approving content."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]


def read_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(f"Required review file is missing: {path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"{path.name} must contain a JSON object.")
    return data


def validate_transcript(data: dict[str, Any]) -> None:
    if data.get("approved") is not True:
        raise ValueError("Transcript needs human review and approved=true.")
    segments = data.get("segments")
    if not isinstance(segments, list) or not segments:
        raise ValueError("Transcript must contain at least one segment.")
    previous_end = -1.0
    for index, segment in enumerate(segments, start=1):
        start, end = float(segment["start"]), float(segment["end"])
        if start < 0 or end <= start or start < previous_end:
            raise ValueError(f"Transcript segment {index} has invalid or out-of-order timestamps.")
        if not str(segment.get("text", "")).strip():
            raise ValueError(f"Transcript segment {index} has no text.")
        previous_end = end


def validate_scenes(data: dict[str, Any], source_duration: float | None) -> None:
    if data.get("approved") is not True:
        raise ValueError("Scene plan needs human review and approved=true.")
    scenes = data.get("scenes")
    if not isinstance(scenes, list) or not scenes:
        raise ValueError("Scene plan must contain at least one scene.")
    ids: set[str] = set()
    previous_end = -1.0
    for index, scene in enumerate(scenes, start=1):
        scene_id = str(scene.get("id", "")).strip()
        start, end = float(scene["start"]), float(scene["end"])
        if not scene_id or scene_id in ids:
            raise ValueError(f"Scene {index} needs a unique, non-empty id.")
        if start < 0 or end <= start or start < previous_end:
            raise ValueError(f"Scene {scene_id} has invalid, overlapping, or out-of-order timestamps.")
        if source_duration is not None and end > source_duration:
            raise ValueError(f"Scene {scene_id} ends after the source video's duration.")
        if not str(scene.get("purpose", "")).strip():
            raise ValueError(f"Scene {scene_id} needs an editorial purpose.")
        visual = scene.get("visual")
        if not isinstance(visual, dict) or not str(visual.get("kind", "")).strip():
            raise ValueError(f"Scene {scene_id} needs a visual.kind (use 'none' when no overlay is wanted).")
        ids.add(scene_id)
        previous_end = end


def main() -> int:
    try:
        transcript = read_json(ROOT / "project" / "transcript.json")
        scenes = read_json(ROOT / "project" / "scenes.json")
        validate_transcript(transcript)
        duration = transcript.get("duration")
        validate_scenes(scenes, float(duration) if duration is not None else None)
    except (FileNotFoundError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        print(f"Review validation failed: {error}", file=sys.stderr)
        return 1

    print(f"Review structure is valid: {len(transcript['segments'])} transcript segments, {len(scenes['scenes'])} scenes.")
    print("This check does not verify factual accuracy or replace user approval.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
