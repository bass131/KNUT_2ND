"""Small, synthetic CSV pipeline. Python standard library only."""
import argparse
import csv
from datetime import date
from pathlib import Path
import tempfile

ROOT = Path(__file__).resolve().parents[1]
FIELDS = ["order_id", "order_date", "amount"]


def clean_orders(source):
    unique = {}
    input_rows = 0
    with source.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != FIELDS:
            raise ValueError("CSV header must be order_id,order_date,amount")
        for line, row in enumerate(reader, start=2):
            input_rows += 1
            if None in row or any(row[key] is None for key in FIELDS):
                raise ValueError(f"line {line}: expected three columns")
            order_id = row["order_id"].strip()
            if not order_id:
                raise ValueError(f"line {line}: empty order_id")
            order_date = date.fromisoformat(row["order_date"].strip()).isoformat()
            amount = int(row["amount"])
            if amount < 0:
                raise ValueError(f"line {line}: amount must be nonnegative")
            record = (order_date, amount)
            if order_id in unique and unique[order_id] != record:
                raise ValueError(f"line {line}: conflicting order_id {order_id}")
            unique[order_id] = record
    return unique, input_rows


def run(source, output):
    if source.resolve() == output.resolve():
        raise ValueError("input and output must be different files")
    orders, input_rows = clean_orders(source)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", newline="", dir=output.parent,
            prefix="orders-", suffix=".tmp", delete=False,
        ) as stream:
            temporary = Path(stream.name)
            writer = csv.writer(stream, lineterminator="\n")
            writer.writerow(FIELDS)
            for order_id, (order_date, amount) in sorted(orders.items()):
                writer.writerow([order_id, order_date, amount])
        temporary.replace(output)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    print(f"INPUT_ROWS={input_rows}")
    print(f"UNIQUE_ORDERS={len(orders)}")
    print(f"DUPLICATE_ROWS={input_rows - len(orders)}")
    print(f"TOTAL_AMOUNT={sum(amount for _, amount in orders.values())}")
    print(f"OUTPUT={output}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "data/orders.csv")
    parser.add_argument("--output", type=Path, default=ROOT / "output/orders-clean.csv")
    args = parser.parse_args()
    try:
        run(args.input, args.output)
    except (ValueError, OSError) as error:
        parser.exit(1, f"ERROR: {error}\n")


if __name__ == "__main__":
    main()
