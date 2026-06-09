import pandas as pd
import shutil
import json
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────
IMAGE_SRC = Path(r"D:\Education\research\archive\images\images_normalized")
IMAGE_DST = Path("public/images")
DATA_DIR  = Path("src/data")
OUT_JSON  = DATA_DIR / "samples.json"

IMAGE_DST.mkdir(parents=True, exist_ok=True)

# ── Load CSVs ──────────────────────────────────────────────────
df   = pd.read_csv(DATA_DIR / "fixed_v2_GCRF.csv")
full = pd.read_csv(DATA_DIR / "gcrf_results_full.csv")

df["uid"]   = df["uid"].astype(str).str.strip()
full["uid"] = full["uid"].astype(str).str.strip()

# Drop duplicates
df   = df.drop_duplicates(subset=["uid"], keep="first")
full = full.drop_duplicates(subset=["uid"], keep="first")

print(f"df rows:   {len(df)}")
print(f"full rows: {len(full)}")

# Save image column from df BEFORE merging
df["image_filename"] = df["image"].astype(str).str.strip()

# Only keep needed columns from full — rename image to avoid clash
full_slim = full[["uid", "image", "findings_reference",
                   "impression", "draft_report", "final_report",
                   "final_severity", "issues_found",
                   "final_bleu1", "final_bleu4", "final_rougeL"]].copy()
full_slim = full_slim.rename(columns={"image": "image_from_full"})

# Merge on uid only
merged = df.merge(full_slim, on="uid", how="inner")

print(f"Merged rows: {len(merged)}")
print(f"\nnew_class distribution:\n{merged['new_class'].value_counts()}")
print()
print(f"Sample image values: {merged['image_filename'].head(3).tolist()}")
print()

# ── Select balanced samples ────────────────────────────────────
available = merged["new_class"].value_counts().to_dict()
print("Available per class:", available)

targets = {
    "Hallucination-Free": min(15, available.get("Hallucination-Free", 0)),
    "Low":                min(35, available.get("Low", 0)),
    "Moderate":           min(35, available.get("Moderate", 0)),
    "High":               min(15, available.get("High", 0)),
    "Severe":             min(5,  available.get("Severe", 0)),
}

# Fill up to 100 from biggest class if total < 100
total = sum(targets.values())
if total < 100:
    gap = 100 - total
    biggest = max(available, key=available.get)
    targets[biggest] = min(
        targets.get(biggest, 0) + gap,
        available.get(biggest, 0)
    )

print(f"\nTarget selection: {targets}")

selected = []
for cls, n in targets.items():
    if n == 0:
        print(f"  Skipping '{cls}' — no samples available")
        continue
    subset = merged[merged["new_class"] == cls].copy()
    subset = subset[subset["image_filename"].notna()]
    subset = subset[subset["image_filename"] != "nan"]
    take   = min(n, len(subset))
    chosen = subset.sample(take, random_state=42)
    selected.append(chosen)
    print(f"  {cls}: selected {take}")

sample_df = pd.concat(selected).reset_index(drop=True)
sample_df["sample_id"] = range(1, len(sample_df) + 1)
print(f"\nTotal selected: {len(sample_df)}")

# ── Build JSON ─────────────────────────────────────────────────
records = []
for _, row in sample_df.iterrows():
    img_file = str(row["image_filename"]).strip()
    if not img_file.endswith(".png"):
        img_file = img_file + ".png"

    def clean(val, fallback):
        s = str(val).strip()
        return fallback if s in ("nan","None","") else s

    records.append({
        "sample_id":      int(row["sample_id"]),
        "uid":            str(row["uid"]),
        "image_file":     img_file,
        "ai_report":      clean(row.get("final_report"),       "Report not available"),
        "draft_report":   clean(row.get("draft_report"),        "Draft not available"),
        "ground_truth":   clean(row.get("findings_reference"),  "Reference not available"),
        "impression":     clean(row.get("impression"),          ""),
        "computed_class": str(row["new_class"]),
        "computed_score": round(float(row["new_score"]), 2),
        "was_refined":    bool(row.get("was_refined", False)),
        "final_severity": clean(row.get("final_severity"),      ""),
        "final_chair_s":  round(float(row.get("final_chair_s",  0) or 0), 4),
        "final_npv":      round(float(row.get("final_npv",      0) or 0), 4),
        "final_ppv":      round(float(row.get("final_ppv",      0) or 0), 4),
        "bleu1":          round(float(row.get("final_bleu1",    0) or 0), 4),
        "bleu4":          round(float(row.get("final_bleu4",    0) or 0), 4),
        "rouge_l":        round(float(row.get("final_rougeL",   0) or 0), 4),
    })

with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(records)} records → {OUT_JSON}")

# ── Copy images ────────────────────────────────────────────────
print(f"\nCopying images from:\n  {IMAGE_SRC}")
copied  = 0
missing = []

for rec in records:
    img_name = rec["image_file"]
    dst_path = IMAGE_DST / img_name

    candidates = [
        IMAGE_SRC / img_name,
        IMAGE_SRC / img_name.replace(".png",""),
        IMAGE_SRC / img_name.replace(".dcm.png",".png"),
        IMAGE_SRC / (img_name.replace(".png","") + ".png"),
    ]

    found = False
    for src_path in candidates:
        if src_path.exists():
            shutil.copy(src_path, dst_path)
            copied += 1
            found  = True
            break

    if not found and IMAGE_SRC.exists():
        name_lower = img_name.lower()
        for f in IMAGE_SRC.iterdir():
            if f.name.lower() == name_lower:
                shutil.copy(f, dst_path)
                copied += 1
                found  = True
                break

    if not found:
        missing.append(img_name)

print(f"Copied:  {copied}")
print(f"Missing: {len(missing)}")
if missing:
    print("First 5 missing:")
    for m in missing[:5]:
        print(f"  {m}")

# ── Summary ────────────────────────────────────────────────────
print("\n" + "="*50)
print("SUMMARY")
print("="*50)
print(f"Total records in samples.json : {len(records)}")
print(f"Images copied to public/images: {copied}")
print(f"Class breakdown:")
for cls in ["Hallucination-Free","Low","Moderate","High","Severe"]:
    cnt = sum(1 for r in records if r["computed_class"]==cls)
    if cnt > 0:
        print(f"  {cls:<22}: {cnt}")
print()
print("FIRST RECORD PREVIEW:")
print(json.dumps(records[0], indent=2)[:600])
print()
print("DONE — ready for Cursor!")
