"""Step 1: fetch CC0 Indian textile records + images from four museum APIs.

Only items the API itself flags as public domain / CC0 are kept.
Resumable: raw API responses and images already on disk are reused.
Usage: python pipeline/download.py
"""
import json, os, re, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")
IMG = os.path.join(ROOT, "data", "images")
os.makedirs(RAW, exist_ok=True)
os.makedirs(IMG, exist_ok=True)
UA = {"User-Agent": "textile-atlas-research/0.1", "AIC-User-Agent": "textile-atlas-research/0.1"}


def fetch(url, data=None, binary=False, tries=4):
    headers = dict(UA)
    if data is not None:
        data = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
    err = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers=headers)
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read()
                return body if binary else json.loads(body)
        except Exception as e:  # noqa: BLE001
            err = e
            time.sleep(1.5 * (i + 1))
    print("  FAIL", url[:110], err, flush=True)
    return None


def cached(name, fn):
    path = os.path.join(RAW, name)
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    val = fn()
    if val is not None:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(val, f)
    return val


ORD = {"first": 1, "second": 2, "third": 3}


def years(text):
    """Best-effort (start, end) year range from a museum date string."""
    if not text:
        return None, None
    t = str(text).lower().replace("–", "-").replace("—", "-")
    found = []
    for m in re.finditer(r"(\d{1,2})(?:st|nd|rd|th)(?:\s*(?:-|to|or|/)\s*(\d{1,2})(?:st|nd|rd|th))?\s*centur", t):
        a = int(m.group(1))
        b = int(m.group(2) or a)
        found += [(a - 1) * 100, (b - 1) * 100 + 99]
    if not found:
        for m in re.finditer(r"(?<!\d)(1\d{3}|20[0-2]\d)(s)?(?!\d)", t):
            y = int(m.group(1))
            found += [y, y + (9 if m.group(2) and y % 100 else 99 if m.group(2) else 0)]
    if not found:
        return None, None
    return min(found), max(found)


def clean(s):
    return re.sub(r"\s+", " ", str(s)).strip() if s else ""


# ---------------------------------------------------------------- Met
def met():
    base = "https://collectionapi.metmuseum.org/public/collection"
    ids = set()
    for qs in ["geoLocation=India&medium=Textiles&hasImages=true&q=*",
               "geoLocation=India&hasImages=true&q=textile"]:
        off = 0
        while True:
            r = fetch(f"{base}/v1.1/search?{qs}&limit=100&offset={off}")
            got = (r or {}).get("objectIDs") or []
            ids.update(got)
            off += 100
            if len(got) < 100 or off > 3000:
                break
    print("met ids", len(ids), flush=True)

    def one(i):
        # the Met answers 403 when asked too quickly, so go two at a time with a pause between new requests
        def polite():
            time.sleep(0.4)
            return fetch(f"{base}/v1/objects/{i}")
        return cached(f"met_{i}.json", polite)

    with ThreadPoolExecutor(2) as ex:
        objs = list(ex.map(one, sorted(ids)))
    out = []
    for o in objs:
        if not o or not o.get("isPublicDomain") or not o.get("primaryImageSmall"):
            continue
        if "textile" not in (o.get("classification") or "").lower():
            continue
        place = ", ".join(x for x in [o.get("city"), o.get("region"), o.get("country")] if x) or o.get("culture") or "India"
        out.append(dict(
            id=f"met_{o['objectID']}", source="The Met", title=clean(o.get("title") or o.get("objectName")),
            type=clean(o.get("objectName")), date=clean(o.get("objectDate")),
            y0=o.get("objectBeginDate") or None, y1=o.get("objectEndDate") or None,
            place=clean(place), medium=clean(o.get("medium")), technique=clean(o.get("classification")),
            url=o.get("objectURL"), image=o["primaryImageSmall"], accession=o.get("accessionNumber"),
            credit=clean(o.get("creditLine"))))
    return out


# ---------------------------------------------------------------- Cleveland
def cleveland():
    url = ("https://openaccess-api.clevelandart.org/api/artworks/?type=Textile&q=India&has_image=1&cc0=1&limit=1000")
    r = cached("cma.json", lambda: fetch(url))
    out = []
    for d in (r or {}).get("data", []):
        culture = "; ".join(d.get("culture") or [])
        web = ((d.get("images") or {}).get("web") or {}).get("url")
        if "india" not in culture.lower() or not web or d.get("share_license_status") != "CC0":
            continue
        place = re.sub(r",?\s*(\d|early|late|mid|first|second|1st|2nd|c\.).*$", "", culture, flags=re.I).strip(" ,") or "India"
        out.append(dict(
            id=f"cma_{d['id']}", source="Cleveland Museum of Art", title=clean(d.get("title")),
            type=clean(d.get("type")), date=clean(d.get("creation_date")),
            y0=d.get("creation_date_earliest"), y1=d.get("creation_date_latest"),
            place=clean(place), medium=clean(d.get("technique")), technique=clean(d.get("technique")),
            url=d.get("url"), image=web, accession=d.get("accession_number"), credit=clean(d.get("creditline"))))
    return out


# ---------------------------------------------------------------- Chicago
def chicago():
    api = "https://api.artic.edu/api/v1/artworks/search"
    fields = ["id", "title", "date_display", "date_start", "date_end", "place_of_origin", "medium_display",
              "technique_titles", "classification_title", "image_id", "main_reference_number", "credit_line",
              "is_public_domain"]
    query = {"bool": {"must": [{"term": {"department_title.keyword": "Textiles"}},
                               {"match_phrase": {"place_of_origin": "India"}},
                               {"term": {"is_public_domain": True}},
                               {"exists": {"field": "image_id"}}]}}
    rows = []
    for page in range(1, 6):
        r = cached(f"aic_{page}.json", lambda: fetch(api, {"query": query, "limit": 100, "page": page, "fields": fields}))
        data = (r or {}).get("data", [])
        rows += data
        if len(data) < 100:
            break
    out = []
    for d in rows:
        out.append(dict(
            id=f"aic_{d['id']}", source="Art Institute of Chicago", title=clean(d.get("title")),
            type=clean(d.get("classification_title")), date=clean(d.get("date_display")),
            y0=d.get("date_start"), y1=d.get("date_end"), place=clean(d.get("place_of_origin")),
            medium=clean(d.get("medium_display")), technique=", ".join(d.get("technique_titles") or []),
            url=f"https://www.artic.edu/artworks/{d['id']}",
            image=f"https://www.artic.edu/iiif/2/{d['image_id']}/full/600,/0/default.jpg",
            accession=d.get("main_reference_number"), credit=clean(d.get("credit_line"))))
    return out


# ---------------------------------------------------------------- Cooper Hewitt
def cooper_hewitt():
    q = urllib.parse.quote("unit_code:CHNDM AND India AND textile AND media_usage:CC0")
    rows = []
    for start in range(0, 600, 100):
        r = cached(f"si_{start}.json",
                   lambda: fetch(f"https://api.si.edu/openaccess/api/v1.0/search?api_key=DEMO_KEY&rows=100&start={start}&q={q}"))
        got = ((r or {}).get("response") or {}).get("rows", [])
        rows += got
        if len(got) < 100:
            break
    out = []
    for row in rows:
        c = row["content"]
        dn, ft, ix = c["descriptiveNonRepeating"], c.get("freetext", {}), c.get("indexedStructured", {})
        places = [p["content"] for p in ft.get("place", [])]
        if not any("india" in p.lower() for p in places + ix.get("place", [])):
            continue
        media = [m for m in (dn.get("online_media") or {}).get("media", [])
                 if m.get("type") == "Images" and (m.get("usage") or {}).get("access") == "CC0"]
        if not media:
            continue
        date = "; ".join(d["content"] for d in ft.get("date", []))
        y0, y1 = years(date)
        types = [t["content"] for t in ft.get("objectType", [])]
        phys = "; ".join(p["content"] for p in ft.get("physicalDescription", []))
        tech = re.search(r"Technique:\s*([^;]+)", phys)
        acc = next((i["content"] for i in ft.get("identifier", []) if "Accession" in i.get("label", "")), "")
        credit = next((i["content"] for i in ft.get("creditLine", [])), "")
        out.append(dict(
            id="ch_" + re.sub(r"\W+", "-", dn["record_ID"]), source="Cooper Hewitt",
            title=clean(dn.get("title", {}).get("content")), type=clean(types[-1] if types else ""),
            date=clean(date), y0=y0, y1=y1, place=clean(places[0] if places else "India"),
            medium=clean(phys), technique=clean(tech.group(1) if tech else (types[0] if types else "")),
            url=dn.get("record_link"), image=f"https://ids.si.edu/ids/deliveryService?id={media[0]['idsId']}&max=600",
            accession=acc, credit=clean(credit)))
    return out


def grab(rec):
    path = os.path.join(IMG, rec["id"] + ".jpg")
    if os.path.exists(path) and os.path.getsize(path) > 2000:
        return True
    body = fetch(rec["image"], binary=True)
    if not body or len(body) < 2000:
        return False
    with open(path, "wb") as f:
        f.write(body)
    time.sleep(0.15)
    return True


if __name__ == "__main__":
    records = []
    for name, fn in [("cleveland", cleveland), ("chicago", chicago), ("cooper_hewitt", cooper_hewitt), ("met", met)]:
        try:
            got = fn()
        except Exception as e:  # noqa: BLE001
            print(name, "ERROR", repr(e), flush=True)
            got = []
        print(f"{name}: {len(got)} records", flush=True)
        records += got
    for r in records:
        if r.get("y0") is None:
            r["y0"], r["y1"] = years(r.get("date"))
    with ThreadPoolExecutor(4) as ex:
        ok = list(ex.map(grab, records))
    kept = [r for r, good in zip(records, ok) if good]
    with open(os.path.join(ROOT, "data", "records.json"), "w", encoding="utf-8") as f:
        json.dump(kept, f, ensure_ascii=False, indent=1)
    print(f"DONE: {len(kept)} records with images (of {len(records)})", flush=True)
