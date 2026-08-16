from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path


SOURCES = [
    Path("/home/ubuntu/upload/pasted_file_H639xl_yemen_trade_name_master_2018_2019.csv"),
    Path("/home/ubuntu/upload/pasted_file_fr8Hdv_yemen_trade_names_2018_2019_extracted_final.csv"),
]
OUTPUT = Path("/home/ubuntu/exports/yemen_trade_name_source_quality_2018_2019.json")


def normalize(value: str | None) -> str:
    text = (value or "").strip().casefold()
    text = re.sub(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06EDـ]", "", text)
    text = re.sub("[أإآٱ]", "ا", text).replace("ى", "ي")
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())


def row_key(row: dict[str, str]) -> tuple[str, ...]:
    return tuple(
        normalize(row.get(key))
        for key in ("trade_name", "generic_name_composition", "dosage_form", "manufacturer", "country")
    )


def is_combination(generic: str) -> bool:
    return bool(re.search(r"\+|\b(and|with)\b|[+&]", generic or "", flags=re.IGNORECASE))


def parse_source(source: Path) -> tuple[list[dict[str, str]], dict]:
    lines = source.read_text(encoding="utf-8-sig").splitlines()
    header = lines[0].split(",")
    expected_columns = len(header)
    rows: list[dict[str, str]] = []
    extra_column_rows = 0
    missing_key_rows = 0
    for line_number, line in enumerate(lines[1:], start=2):
        if not line.strip():
            continue
        fields = line.split(",")
        if len(fields) > expected_columns:
            extra_column_rows += 1
        row = {column: (fields[index].strip() if index < len(fields) else "") for index, column in enumerate(header)}
        row["_line"] = str(line_number)
        row["_column_count"] = str(len(fields))
        if not row.get("trade_name") or not row.get("generic_name_composition"):
            missing_key_rows += 1
        else:
            rows.append(row)

    count_by_country = Counter((row.get("country") or "unknown").strip() or "unknown" for row in rows)
    names_to_generics: dict[str, set[str]] = defaultdict(set)
    for row in rows:
        names_to_generics[normalize(row["trade_name"])].add(normalize(row["generic_name_composition"]))
    repeated_trade_names = {
        name: len(generics)
        for name, generics in names_to_generics.items()
        if name and len(generics) > 1
    }

    summary = {
        "file": source.name,
        "header": header,
        "raw_non_empty_data_lines": len([line for line in lines[1:] if line.strip()]),
        "usable_rows": len(rows),
        "rows_with_extra_columns_from_unquoted_commas": extra_column_rows,
        "rows_missing_trade_or_generic": missing_key_rows,
        "unique_trade_names": len({normalize(row["trade_name"]) for row in rows}),
        "unique_trade_generic_form_manufacturer_country": len({row_key(row) for row in rows}),
        "combination_rows": sum(is_combination(row["generic_name_composition"]) for row in rows),
        "trade_names_with_multiple_generic_compositions": len(repeated_trade_names),
        "top_countries": count_by_country.most_common(10),
        "example_combination_rows": [
            {
                "line": row["_line"],
                "trade_name": row["trade_name"],
                "generic_name_composition": row["generic_name_composition"],
                "dosage_form": row.get("dosage_form"),
                "manufacturer": row.get("manufacturer"),
            }
            for row in rows
            if is_combination(row["generic_name_composition"])
        ][:25],
        "example_multi_generic_trade_names": [
            {"trade_name": name, "unique_generic_count": count}
            for name, count in sorted(repeated_trade_names.items(), key=lambda item: (-item[1], item[0]))[:25]
        ],
    }
    return rows, summary


def main() -> None:
    parsed = [parse_source(source) for source in SOURCES]
    master_rows, master_summary = parsed[0]
    final_rows, final_summary = parsed[1]
    master_keys = {row_key(row) for row in master_rows}
    final_keys = {row_key(row) for row in final_rows}

    report = {
        "source_summaries": [master_summary, final_summary],
        "comparison": {
            "master_keys_present_in_final": len(master_keys & final_keys),
            "master_keys_not_in_final": len(master_keys - final_keys),
            "final_keys_not_in_master": len(final_keys - master_keys),
            "recommended_primary_source": final_summary["file"],
            "recommendation_reason": "يتضمن ملف الاستخراج النهائي بيانات إضافية للعبوة والجرعة، بينما يبقى الملف الرئيسي مرجعاً تكميلياً للتحقق من الصفوف المتطابقة.",
        },
        "data_handling_note": "الصفوف ذات الفواصل غير المقتبسة في حقول المرض أو الجرعة لا تؤثر في أول حقول الاسم التجاري والاسم العلمي والشكل الصيدلاني والمصنع والبلد. ستُحفظ الحقول غير الموثوقة كمصدر نصي فقط، ولن تُستخدم لتحديد هوية الدواء.",
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
