#!/usr/bin/env python3
"""Build orchestrator for the capstone video "The Shape of a Thought".

Pipeline (each step is independent and re-runnable):

  1. tts       generate audio/<id>.{mp3} per beat from narration.json
               (ElevenLabs if ELEVENLABS_API_KEY is set; otherwise skipped).
  2. measure   ffprobe every audio clip and write beat_durations.json, so the
               scenes hold each beat exactly as long as its narration.
  3. render    render all eight acts (HD) with the measured durations baked in.
  4. assemble  concat the act videos + the per-beat audio, mux them into
               out/capstone.mp4. Missing clips become silence of the default
               length, so a partial run still produces a watchable cut.
  5. all       tts -> measure -> render -> assemble.

  preview      concat whatever act videos already exist into a silent
               out/preview.mp4 (no audio needed) — for reviewing the visuals.

Usage:
  conda run -n rnd_env python manim/capstone/build.py preview
  conda run -n rnd_env python manim/capstone/build.py measure
  conda run -n rnd_env python manim/capstone/build.py render --hd
  conda run -n rnd_env python manim/capstone/build.py assemble
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
SCENES = os.path.join(HERE, "scenes.py")
AUDIO_DIR = os.path.join(HERE, "audio")
OUT_DIR = os.path.join(HERE, "out")
DUR_PATH = os.path.join(HERE, "beat_durations.json")

ACTS = ["Act0Cold", "Act1Signal", "Act2Covariance", "Act3Cone",
        "Act4Swelling", "Act5Ruler", "Act6Decoding", "Act7Close"]


def beats() -> list[dict]:
    with open(os.path.join(HERE, "narration.json"), encoding="utf-8") as f:
        return json.load(f)["beats"]


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    print("·", " ".join(cmd[:6]), "..." if len(cmd) > 6 else "")
    return subprocess.run(cmd, check=True, **kw)


def ffprobe_dur(path: str) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def find_audio(beat_id: str) -> str | None:
    for ext in (".mp3", ".wav", ".m4a"):
        p = os.path.join(AUDIO_DIR, beat_id + ext)
        if os.path.exists(p):
            return p
    return None


def latest_video(act: str) -> str | None:
    hits = glob.glob(os.path.join(REPO, "videos", "**", act + ".mp4"), recursive=True)
    hits += glob.glob(os.path.join(REPO, "videos", act + ".mp4"))
    return max(hits, key=os.path.getmtime) if hits else None


# --- steps -----------------------------------------------------------------
def measure() -> None:
    durs = {}
    missing = []
    for b in beats():
        p = find_audio(b["id"])
        if p:
            durs[b["id"]] = round(ffprobe_dur(p) + 0.35, 2)  # +breath at clip end
        else:
            missing.append(b["id"])
    with open(DUR_PATH, "w", encoding="utf-8") as f:
        json.dump(durs, f, indent=2)
    print(f"wrote {DUR_PATH}: {len(durs)} measured, {len(missing)} missing")
    if missing:
        print("  missing audio for:", ", ".join(missing))


def render(hd: bool) -> None:
    flags = ["-w"] + (["--hd"] if hd else ["-l"])
    run(["manimgl", SCENES, *ACTS, *flags], cwd=REPO)


def _silence(path: str, seconds: float) -> None:
    run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-f", "lavfi",
         "-i", "anullsrc=r=44100:cl=stereo", "-t", f"{seconds:.2f}",
         "-c:a", "pcm_s16le", path])


def _segment(clip: str, path: str, seconds: float) -> None:
    """One beat's audio, end-padded with silence to exactly `seconds` so it
    matches that beat's video length (keeps audio and video locked)."""
    run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", clip,
         "-af", "apad", "-t", f"{seconds:.2f}", "-ar", "44100", "-ac", "2",
         "-c:a", "pcm_s16le", path])


def assemble() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    tmp = os.path.join(OUT_DIR, "_tmp")
    os.makedirs(tmp, exist_ok=True)
    durs = json.load(open(DUR_PATH)) if os.path.exists(DUR_PATH) else {}

    # 1. video: concat the act renders in order
    vlist = os.path.join(tmp, "video.txt")
    with open(vlist, "w") as f:
        for act in ACTS:
            v = latest_video(act)
            if not v:
                sys.exit(f"missing render for {act} — run `render` first")
            f.write(f"file '{v}'\n")
    video = os.path.join(tmp, "video.mp4")
    run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-f", "concat",
         "-safe", "0", "-i", vlist, "-c", "copy", video])

    # 2. audio: one segment per beat, each padded to its exact scene length so
    #    audio and video stay locked end-to-end
    alist = os.path.join(tmp, "audio.txt")
    with open(alist, "w") as f:
        for b in beats():
            seg = os.path.join(tmp, f"seg_{b['id']}.wav")
            d = float(durs.get(b["id"], 4.0))
            p = find_audio(b["id"])
            if p:
                _segment(p, seg, d)
            else:
                _silence(seg, d)
            f.write(f"file '{seg}'\n")
    audio = os.path.join(tmp, "audio.m4a")
    run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-f", "concat",
         "-safe", "0", "-i", alist, "-c:a", "aac", "-b:a", "192k", audio])

    # 3. mux
    out = os.path.join(OUT_DIR, "capstone.mp4")
    run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", video,
         "-i", audio, "-c:v", "copy", "-c:a", "aac", "-shortest", out])
    print("\n✓ wrote", out)


def preview() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    lst = os.path.join(OUT_DIR, "_preview.txt")
    have = []
    with open(lst, "w") as f:
        for act in ACTS:
            v = latest_video(act)
            if v:
                f.write(f"file '{v}'\n")
                have.append(act)
    out = os.path.join(OUT_DIR, "preview.mp4")
    run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-f", "concat",
         "-safe", "0", "-i", lst, "-c", "copy", out])
    print(f"\n✓ wrote {out}  ({len(have)}/{len(ACTS)} acts: {', '.join(have)})")


def tts() -> None:
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("set ELEVENLABS_API_KEY (or drop your own audio/<id>.mp3 files in)")
    import time
    import urllib.error
    import urllib.request
    os.makedirs(AUDIO_DIR, exist_ok=True)
    voice = os.environ.get("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
    model = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
    for b in beats():
        dst = os.path.join(AUDIO_DIR, b["id"] + ".mp3")
        if os.path.exists(dst):
            continue
        body = json.dumps({"text": b["text"], "model_id": model,
                           "voice_settings": {"stability": 0.4,
                                              "similarity_boost": 0.8}}).encode()
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice}",
            data=body, headers={"xi-api-key": key,
                                "Content-Type": "application/json"})
        for attempt in range(10):  # ElevenLabs throttles with transient 401/429
            try:
                with urllib.request.urlopen(req) as r, open(dst, "wb") as out:
                    out.write(r.read())
                print("  voiced", b["id"], flush=True)
                break
            except urllib.error.HTTPError as e:
                if e.code in (401, 429, 500, 502, 503) and attempt < 9:
                    time.sleep(10.0 * (attempt + 1))
                    continue
                raise
        time.sleep(4.0)  # pace requests to stay under the rate limit


def tts_local() -> None:
    """Offline fallback voice via macOS `say` (free, unlimited). Lower realism
    than ElevenLabs, but lets us lock visuals/pacing now and swap later by
    deleting audio/ and re-running `tts`."""
    os.makedirs(AUDIO_DIR, exist_ok=True)
    voice = os.environ.get("SAY_VOICE", "Daniel")
    rate = os.environ.get("SAY_RATE", "168")
    for b in beats():
        dst = os.path.join(AUDIO_DIR, b["id"] + ".mp3")
        if os.path.exists(dst):
            continue
        aiff = dst[:-4] + ".aiff"
        run(["say", "-v", voice, "-r", rate, "-o", aiff, b["text"]])
        run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", aiff,
             "-ar", "44100", "-ac", "2", "-b:a", "192k", dst])
        os.remove(aiff)
        print("  said", b["id"], flush=True)


def tts_kokoro() -> None:
    """Open-weights local voice via Kokoro-82M (Apache-2.0, commercial-safe).
    No API key, no quota. Set KOKORO_VOICE (default af_heart)."""
    import warnings
    warnings.filterwarnings("ignore")
    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline
    voice = os.environ.get("KOKORO_VOICE", "af_heart")
    lang = os.environ.get("KOKORO_LANG", voice[0])  # 'a' = US, 'b' = UK
    os.makedirs(AUDIO_DIR, exist_ok=True)
    pipe = KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M")
    for b in beats():
        dst = os.path.join(AUDIO_DIR, b["id"] + ".mp3")
        if os.path.exists(dst):
            continue
        chunks = [a for _, _, a in pipe(b["text"], voice=voice)]
        audio = np.concatenate(chunks)
        wav = dst[:-4] + ".wav"
        sf.write(wav, audio, 24000)
        run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", wav,
             "-ar", "44100", "-ac", "2", "-b:a", "192k", dst])
        os.remove(wav)
        print("  kokoro", b["id"], flush=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("step", choices=["tts", "say", "kokoro", "measure", "render",
                                     "assemble", "all", "preview"])
    ap.add_argument("--hd", action="store_true", help="render in HD (else low)")
    a = ap.parse_args()
    if a.step == "preview":
        preview()
    elif a.step == "tts":
        tts()
    elif a.step == "say":
        tts_local()
    elif a.step == "kokoro":
        tts_kokoro()
    elif a.step == "measure":
        measure()
    elif a.step == "render":
        render(a.hd)
    elif a.step == "assemble":
        assemble()
    elif a.step == "all":
        tts(); measure(); render(a.hd); assemble()


if __name__ == "__main__":
    main()
