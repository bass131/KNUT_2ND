"""Count the supplied small text fixture, save Parquet, then read it back."""
import argparse
import csv
from pathlib import Path


def small_counts(frame):
    rows = frame.limit(101).collect()
    if len(rows) > 100:
        raise ValueError("this teaching check supports at most 100 distinct words")
    return {row["word"]: row["count"] for row in rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="/opt/spark/lab-data/words.txt")
    parser.add_argument("--expected", default="/opt/spark/lab-expected/wordcounts.csv")
    parser.add_argument("--output", default="/opt/spark/lab-output/wordcounts")
    args = parser.parse_args()
    with Path(args.expected).open(encoding="utf-8-sig", newline="") as stream:
        expected = {row["word"]: int(row["count"]) for row in csv.DictReader(stream)}
    from pyspark.sql import SparkSession, functions as F

    spark = SparkSession.builder.appName("Public-Wordcount").getOrCreate()
    try:
        spark.sparkContext.setLogLevel("WARN")
        if not spark.sparkContext.master.startswith("local["):
            raise ValueError("use --master local[2]: files are mounted only in the client")
        lines = spark.read.text(args.input)
        words = lines.select(
            F.explode(F.split(F.col("value"), r"\s+")).alias("word")
        ).where(F.col("word") != "")
        counts = words.groupBy("word").count()
        ordered = counts.orderBy(F.desc("count"), F.asc("word"))
        print("INPUT_LINES")
        lines.show(truncate=False)
        print("WORD_ROWS")
        words.show(truncate=False)
        print("WORD_COUNTS")
        ordered.show(truncate=False)
        ordered.explain()
        if small_counts(ordered) != expected:
            raise ValueError("word counts differ from the expected CSV")
        ordered.write.mode("errorifexists").parquet(args.output)
        restored = spark.read.parquet(args.output)
        if small_counts(restored) != expected:
            raise ValueError("Parquet round-trip check failed")
        print("WORDCOUNT_CHECK=PASS", flush=True)
        print(f"PARQUET_OUTPUT={args.output}", flush=True)
    finally:
        spark.stop()
    print("APP_STOPPED", flush=True)


if __name__ == "__main__":
    main()
