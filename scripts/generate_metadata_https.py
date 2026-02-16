import json
from pathlib import Path

TOTAL = 2026
BASE_URL_PLACEHOLDER = "__BASE_URL__"  # later replace with real https origin, e.g. https://xxx.vercel.app

DESCRIPTION = (
    "起于2026，马不停蹄。\n\n"
    "感谢AI时代的馈赠，让我得以用一己之力，‘手搓’出这第一届Web3春晚。这枚NFT，不仅是新春的纪念，更是我们在这条数字洪流中相遇的信物。\n\n"
    "我许下一个愿望：从今年起，每一个春节，我们都在春晚相聚。\n\n"
    "12年，是一个生肖的轮回。在代码与算法飞速更迭的世界里，万物皆流，变幻莫测。如果我们有缘，能携手走完这一个轮回，集齐12枚徽章的时刻，或许我们召唤的不止是神龙，更是这一段属于我们共同跨越周期的、闪闪发光的岁月。\n\n"
    "感谢你，成为这漫长旅程的第一位见证者。\n\n"
    "新春快乐，在这个奔腾的马年，祝你拥有跨越一切不确定的勇气与好运。"
)

out_dir = Path(__file__).resolve().parents[1] / "public" / "metadata"
out_dir.mkdir(parents=True, exist_ok=True)

for token_id in range(TOTAL):
    serial = token_id + 1
    serial_str = f"{serial:04d}"

    obj = {
        "name": f"Web3春晚2026徽章 #{serial_str}",
        "description": DESCRIPTION,
        "image": f"{BASE_URL_PLACEHOLDER}/nft-preview.jpg",
        "animation_url": f"{BASE_URL_PLACEHOLDER}/nft-preview.mp4",
        "attributes": [
            {"trait_type": "Year", "value": "2026"},
            {"trait_type": "Event", "value": "Web3春晚"},
            {"trait_type": "Type", "value": "纪念NFT"},
            {"trait_type": "Serial", "value": serial_str},
        ],
    }

    (out_dir / f"{token_id}.json").write_text(
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

print(f"Wrote {TOTAL} metadata files to {out_dir}")
