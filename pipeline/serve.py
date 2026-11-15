"""Bunai's local server: the website, plus one endpoint that places a visitor's own cloth in the atlas.

  GET  /...          files from web/
  POST /api/match    body = one image (jpeg/png/webp, up to 12 MB)
                     -> { nn: [item indexes, closest first], sim: [...], craft: [[name, probability], ...],
                          pal: [hex x5], h, sa, l }

The uploaded image is held in memory for the length of the request and never written to disk.
Usage: ~/.venvs/bunai/Scripts/python pipeline/serve.py [port]
"""
import io, json, os, sys, threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(ROOT, "web")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
MAX_BYTES = 12 * 1024 * 1024

_lock = threading.Lock()        # guards loading the models
_infer = threading.Lock()       # one image through the network at a time; torch is not built for concurrent calls
_state = {}


def matcher():
    """Load the embedding model, the collection's embeddings and the craft classifier once, on first use."""
    with _lock:
        if _state:
            return _state
        import joblib, torch
        from transformers import AutoImageProcessor, AutoModel
        items = json.load(open(os.path.join(WEB, "data", "items.json"), encoding="utf-8"))["items"]
        feats = np.load(os.path.join(ROOT, "data", "feats.npz"))
        _state.update(
            torch=torch,
            proc=AutoImageProcessor.from_pretrained("facebook/dinov2-small"),
            model=AutoModel.from_pretrained("facebook/dinov2-small").eval(),
            X=np.stack([feats[it["id"]] for it in items]),
            craft=joblib.load(os.path.join(ROOT, "data", "craft_model.joblib")),
        )
        return _state


def match(img):
    from embed import palette
    s = matcher()
    with _infer, s["torch"].no_grad():
        out = s["model"](**s["proc"](images=img, return_tensors="pt")).last_hidden_state[0]
    v = s["torch"].cat([out[0], out[1:].mean(0)]).numpy()
    v = v / np.linalg.norm(v)
    sims = s["X"] @ v
    order = np.argsort(-sims)[:8]
    proba = s["craft"]["model"].predict_proba(v[None])[0]
    top = np.argsort(-proba)[:3]
    w, h = img.size
    side = min(w, h)
    square = img.crop(((w - side) // 2, (h - side) // 2, (w - side) // 2 + side, (h - side) // 2 + side))
    pal, hue, sat, lig = palette(square)
    return dict(nn=[int(i) for i in order], sim=[round(float(sims[i]), 3) for i in order],
                craft=[[s["craft"]["classes"][k], round(float(proba[k]), 2)] for k in top],
                pal=pal, h=hue, sa=sat, l=lig)


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")   # always revalidate, so edits show without version bumps
        super().end_headers()

    def reply(self, code, payload):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/health":
            return self.reply(200, {"ok": True, "matcherReady": bool(_state)})
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/match":
            return self.reply(404, {"error": "not found"})
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0 or n > MAX_BYTES:
            return self.reply(413, {"error": "Please choose an image under 12 MB."})
        try:
            img = Image.open(io.BytesIO(self.rfile.read(n)))
            img.load()
            img = img.convert("RGB")
            img.thumbnail((1200, 1200))
        except Exception:  # noqa: BLE001
            return self.reply(400, {"error": "That file could not be read as an image."})
        try:
            self.reply(200, match(img))
        except Exception as e:  # noqa: BLE001
            print("match failed:", repr(e), flush=True)
            self.reply(500, {"error": "The matcher failed on this image."})

    def log_message(self, fmt, *args):
        if "/api/" in (args[0] if args else ""):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    print(f"Bunai on http://localhost:{port}", flush=True)
    # load the models in the background so the first upload does not wait 20 seconds for them
    threading.Thread(target=lambda: (matcher(), print("matcher ready", flush=True)), daemon=True).start()
    ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=WEB)).serve_forever()
