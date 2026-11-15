"""Step 3: better craft labels.

The first pass labelled every piece by keyword, which over-fills "Painted & dyed cotton" (any record that says
"printed, dyed & painted" lands there). This step:

  1. keeps a label only where the museum record names the technique unambiguously (the "seed" set);
  2. trains a classifier on the image embeddings of those seeds;
  3. reports cross-validated accuracy, so the number is known rather than assumed;
  4. labels every other piece from what it looks like, and records that the label came from the model.

Writes c (craft), cs ("record" | "model") and cp (model confidence) into web/data/items.json,
and the fitted model to data/craft_model.joblib for the upload matcher.
Usage: ~/.venvs/bunai/Scripts/python pipeline/labels.py
"""
import json, os, re
from collections import Counter
import numpy as np
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
import joblib
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from embed import CRAFTS as KEYWORDS, label as keyword_label   # the first-pass keyword labeller
from sklearn.model_selection import StratifiedKFold, cross_val_predict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# A record is a seed for a craft only if it matches that craft's pattern and no other craft's.
STRICT = {
    "Embroidery": r"embroider|chain[- ]stitch|needlework|quilted|appliqu",
    "Kashmir shawl weave": r"twill[- ]tapestry|tapestry[- ]twill|kani\b|pashmina|cashmere",
    "Carpet & pile": r"\bcarpet|\brug\b|knotted pile|\bpile\b",
    "Tie-dye & ikat": r"\bikat|patol|tie[- ]dye|bandhan",
    "Velvet": r"velvet",
    "Brocade & metal thread": r"brocad|kinkhab|kincob|lampas|samite|metal[- ]wrapped|metal thread|supplementary weft|gilt|gold wound",
    "Block print": r"block[- ]print|woodblock|block[- ]printed|stamped",
    "Painted & dyed cotton": r"mordant[- ]paint|hand[- ]paint|drawn and painted|painted resist|painted and dyed|kalamkari|palampore|\bpainted\b",
}
MIN_SEEDS = 12      # crafts with fewer seeds are too thin to learn; their seeds keep the record label
KEEP_BELOW = 0.70   # a model label is adopted only above this confidence; in cross-validation such calls were right about 9 times in 10


def main():
    recs = {r["id"]: r for r in json.load(open(os.path.join(ROOT, "data", "records.json"), encoding="utf-8"))}
    path = os.path.join(ROOT, "web", "data", "items.json")
    data = json.load(open(path, encoding="utf-8"))
    items = data["items"]
    feats = np.load(os.path.join(ROOT, "data", "feats.npz"))
    X = np.stack([feats[it["id"]] for it in items])

    seed, fallback = [], []
    for it in items:
        r = recs[it["id"]]
        text = " ".join(str(r.get(k) or "") for k in ("title", "type", "technique", "medium")).lower()
        fallback.append(keyword_label(text, KEYWORDS, "Other"))   # recomputed, so re-running this script is safe
        hits = [c for c, pat in STRICT.items() if re.search(pat, text)]
        seed.append(hits[0] if len(hits) == 1 else None)
    counts = Counter(s for s in seed if s)
    classes = sorted(c for c, n in counts.items() if n >= MIN_SEEDS)
    idx = np.array([i for i, s in enumerate(seed) if s in classes])
    y = np.array([classes.index(seed[i]) for i in idx])
    print("seeds per craft:", dict(counts))
    print(f"training on {len(idx)} seeds in {len(classes)} crafts; {len(items) - sum(s is not None for s in seed)} pieces have no clear record label")

    # an RBF support-vector machine beat logistic regression here (0.69 vs 0.62-0.65 cross-validated)
    clf = make_pipeline(StandardScaler(), SVC(C=3, probability=True, class_weight="balanced", random_state=0))
    cv = StratifiedKFold(5, shuffle=True, random_state=0)
    cvp = cross_val_predict(clf, X[idx], y, cv=cv, method="predict_proba")
    pred, conf = cvp.argmax(1), cvp.max(1)
    acc = float((pred == y).mean())
    sure = conf >= KEEP_BELOW
    acc_sure = float((pred == y)[sure].mean())
    print(f"when at least {KEEP_BELOW:.0%} confident: accuracy {acc_sure:.3f}, on {sure.mean():.0%} of seeds")
    print(f"5-fold cross-validated accuracy on seeds: {acc:.3f}  (chance = {max(Counter(y).values()) / len(y):.3f} for always guessing the largest craft)")
    for k, c in enumerate(classes):
        m = y == k
        print(f"  {c:26s} n={m.sum():3d}  recall={float((pred[m] == k).mean()):.2f}")

    clf.fit(X[idx], y)
    proba = clf.predict_proba(X)
    changed = Counter()
    for i, it in enumerate(items):
        old = it["c"]
        if seed[i]:
            it["c"], it["cs"], it["cp"] = seed[i], "record", 1.0
        else:
            k = int(proba[i].argmax())
            if proba[i][k] >= KEEP_BELOW:
                it["c"], it["cs"], it["cp"] = classes[k], "model", round(float(proba[i][k]), 2)
            else:
                it["c"], it["cs"], it["cp"] = fallback[i], "keyword", round(float(proba[i][k]), 2)
        if it["c"] != old:
            changed[(old, it["c"])] += 1
    data["craftModel"] = dict(accuracy=round(acc, 3), accuracySure=round(acc_sure, 3), threshold=KEEP_BELOW, seeds=int(len(idx)), classes=classes)
    json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    joblib.dump(dict(model=clf, classes=classes), os.path.join(ROOT, "data", "craft_model.joblib"))
    print("label source:", dict(Counter(it["cs"] for it in items)))
    print("crafts now:", Counter(it["c"] for it in items).most_common())
    print("biggest moves:", changed.most_common(8))


if __name__ == "__main__":
    main()
