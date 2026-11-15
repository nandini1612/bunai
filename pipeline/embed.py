"""Step 2: turn downloaded records + images into everything the web app needs.

- DINOv2 embeddings (pretrained, no training) -> UMAP 3D layout + nearest neighbours
- dominant colour palette per piece
- normalised craft / region labels from the museums' free-text fields
- one thumbnail atlas + a resized detail image per piece
Usage: .venv/Scripts/python pipeline/embed.py
"""
import colorsys, json, math, os, re
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "data", "images")
OUT = os.path.join(ROOT, "web", "data")
os.makedirs(os.path.join(OUT, "img"), exist_ok=True)
THUMB = 128

# order matters: first match wins
CRAFTS = [
    ("Carpet & pile", r"carpet|rug\b|pile|knotted"),
    ("Tie-dye & ikat", r"ikat|patola|tie[- ]?dye|bandhan|resist[- ]dyed yarn|warp[- ]resist|telia"),
    ("Embroidery", r"embroider|needlework|chain stitch|phulkari|kantha|chikan|zardozi|quilt|appliqu|couch"),
    ("Painted & dyed cotton", r"paint|mordant|kalamkari|chintz|palampore|resist[- ]dye|resist-printed|drawn"),
    ("Block print", r"block|print|stamp"),
    ("Kashmir shawl weave", r"kashmir|twill tapestry|pashmina|shawl|kani"),
    ("Brocade & metal thread", r"brocad|metal|gold|silver|lampas|samite|kinkhab|kamkhwab|zari|supplementary|compound"),
    ("Velvet", r"velvet"),
    ("Woven", r"weav|woven|twill|satin|tapestry|muslin|jamdani|silk|cotton|wool"),
]
REGIONS = [
    ("Kashmir", r"kashmir|srinagar"),
    ("Gujarat", r"gujarat|ahmedabad|ahmadabad|surat|kutch|kachchh|patan|cambay|saurashtra|kathiawar"),
    ("Rajasthan", r"rajasthan|jaipur|sanganer|jodhpur|udaipur|bikaner|kota|amber"),
    ("Coromandel & South", r"coromandel|madras|chennai|tamil|masulipatam|machilipatnam|golconda|andhra|pulicat|"
                           r"south india|southern india|karnataka|mysore|kerala|kalahasti|petaboli"),
    ("Deccan", r"deccan|hyderabad|burhanpur|aurangabad|maharashtra|bijapur|paithan"),
    ("Bengal & East", r"bengal|dhaka|dacca|calcutta|kolkata|murshidabad|odisha|orissa|bihar|assam"),
    ("North India", r"punjab|lahore|amritsar|delhi|agra|lucknow|varanasi|benares|banaras|uttar|oudh|awadh|"
                       r"himachal|chamba|north india|northern india|mughal"),
    ("Made for export", r"for the .* market|european market|export|indonesia|sumatra|sulawesi|toraja|thailand|siam|"
                        r"egypt|fustat|armenian|dutch|english market|portuguese"),
]


def label(text, table, default):
    t = text.lower()
    for name, pat in table:
        if re.search(pat, t):
            return name
    return default


def palette(img, k=5):
    from sklearn.cluster import KMeans
    px = np.asarray(img.convert("RGB").resize((48, 48))).reshape(-1, 3).astype(np.float32)
    km = KMeans(k, n_init=2, random_state=0).fit(px)
    counts = np.bincount(km.labels_, minlength=k)
    cols = km.cluster_centers_[np.argsort(-counts)]
    hexes = ["#%02x%02x%02x" % tuple(int(v) for v in c) for c in cols]
    # "signature" colour = most vivid of the palette (skips grey photo backgrounds)
    best, score = cols[0], -1
    for c, n in zip(cols, np.sort(counts)[::-1]):
        h, l, s = colorsys.rgb_to_hls(*(c / 255))
        sc = s * (1 - abs(l - 0.5) * 1.4) * (0.35 + n / counts.sum())
        if sc > score:
            best, score = c, sc
    h, l, s = colorsys.rgb_to_hls(*(float(x) / 255 for x in best))
    return hexes, round(h, 3), round(s, 3), round(l, 3)


def main():
    import torch
    from transformers import AutoImageProcessor, AutoModel
    import umap
    from sklearn.neighbors import NearestNeighbors

    with open(os.path.join(ROOT, "data", "records.json"), encoding="utf-8") as f:
        recs = json.load(f)

    proc = AutoImageProcessor.from_pretrained("facebook/dinov2-small")
    model = AutoModel.from_pretrained("facebook/dinov2-small").eval()

    cache_path = os.path.join(ROOT, "data", "feats.npz")
    cache = dict(np.load(cache_path)) if os.path.exists(cache_path) else {}
    items, feats, thumbs = [], [], []
    for n, r in enumerate(recs):
        try:
            img = Image.open(os.path.join(IMG, r["id"] + ".jpg")).convert("RGB")
        except Exception as e:  # noqa: BLE001
            print("skip", r["id"], e)
            continue
        if r["id"] in cache:
            v = cache[r["id"]]
        else:
            with torch.no_grad():
                out = model(**proc(images=img, return_tensors="pt")).last_hidden_state[0]
            v = torch.cat([out[0], out[1:].mean(0)]).numpy()
            v = v / np.linalg.norm(v)
        feats.append(v)

        w, h = img.size
        s = min(w, h)
        sq = img.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
        thumbs.append(sq.resize((THUMB, THUMB), Image.LANCZOS))
        det = img.copy()
        det.thumbnail((640, 640), Image.LANCZOS)
        det.save(os.path.join(OUT, "img", r["id"] + ".jpg"), quality=82)

        pal, hue, sat, lig = palette(sq)
        text = " ".join(str(r.get(k) or "") for k in ("title", "type", "technique", "medium"))
        y0, y1 = r.get("y0"), r.get("y1")
        year = None
        if isinstance(y0, (int, float)) and y0:
            year = int((y0 + (y1 if isinstance(y1, (int, float)) and y1 else y0)) / 2)
        items.append(dict(
            id=r["id"], t=r["title"] or r["type"] or "Textile", s=r["source"], d=r["date"], y=year,
            p=r["place"], r=label(r["place"] + " " + r["title"], REGIONS, "India, unspecified"),
            c=label(text, CRAFTS, "Other"), m=r["medium"][:220], u=r["url"], a=r["accession"], cr=r["credit"],
            pal=pal, h=hue, sa=sat, l=lig))
        if (n + 1) % 100 == 0:
            print("embedded", n + 1, flush=True)

    X = np.stack(feats)
    np.savez(cache_path, **{it["id"]: f for it, f in zip(items, feats)})
    # flat map used by the web app: spread-out 2D UMAP, so tiles can be laid side by side without overlap
    xy = umap.UMAP(n_components=2, n_neighbors=20, min_dist=0.9, spread=1.6, metric="cosine", random_state=7).fit_transform(X)
    nn = NearestNeighbors(n_neighbors=9, metric="cosine").fit(X).kneighbors(X, return_distance=False)
    for i, it in enumerate(items):
        it["xy"] = [round(float(v), 4) for v in xy[i]]
        it["nn"] = [int(j) for j in nn[i] if j != i][:8]

    cols = math.ceil(math.sqrt(len(items)))
    rows = math.ceil(len(items) / cols)
    atlas = Image.new("RGB", (cols * THUMB, rows * THUMB), (12, 10, 20))
    for i, t in enumerate(thumbs):
        atlas.paste(t, ((i % cols) * THUMB, (i // cols) * THUMB))
    atlas.save(os.path.join(OUT, "atlas.webp"), quality=82, method=5)   # a little smaller than the JPEG it replaced, with fewer block artefacts

    with open(os.path.join(OUT, "items.json"), "w", encoding="utf-8") as f:
        json.dump(dict(cols=cols, rows=rows, thumb=THUMB, items=items), f, ensure_ascii=False, separators=(",", ":"))
    from collections import Counter
    print("DONE", len(items), "items; atlas", atlas.size)
    for key in ("c", "r", "s"):
        print(key, Counter(it[key] for it in items).most_common())


if __name__ == "__main__":
    main()
