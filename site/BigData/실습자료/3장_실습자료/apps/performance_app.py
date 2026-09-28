"""Measure the same Spark aggregation with different cluster resources."""

import argparse
import statistics
import time

from pyspark.sql import SparkSession


parser = argparse.ArgumentParser()
parser.add_argument("--end", type=int, default=1_000_000_001)
parser.add_argument("--partitions", type=int, default=128)
parser.add_argument("--repetitions", type=int, default=3)
parser.add_argument("--wait-seconds", type=int, default=0)
args = parser.parse_args()

if args.end <= 1:
    parser.error("--end must be greater than 1")
if args.partitions <= 0:
    parser.error("--partitions must be greater than 0")
if args.repetitions <= 0:
    parser.error("--repetitions must be greater than 0")

spark = SparkSession.builder.appName("Week03-Scaling-Experiment").getOrCreate()

try:
    spark.sparkContext.setLogLevel("WARN")
    print(f"MASTER={spark.sparkContext.master}", flush=True)
    print(f"APP_ID={spark.sparkContext.applicationId}", flush=True)
    print(f"RANGE=1..{args.end - 1}", flush=True)
    print(f"PARTITIONS={args.partitions}", flush=True)
    print(f"REPETITIONS={args.repetitions}", flush=True)

    numbers = spark.range(1, args.end, 1, args.partitions)
    expected = (args.end - 1) * args.end // 2
    elapsed_values = []

    for run_number in range(1, args.repetitions + 1):
        started = time.perf_counter()
        total = numbers.selectExpr("SUM(id) AS total").first()["total"]
        elapsed = time.perf_counter() - started

        assert total == expected, f"Unexpected result: {total}"
        elapsed_values.append(elapsed)
        print(f"RUN_{run_number}_SECONDS={elapsed:.3f}", flush=True)

    median_seconds = statistics.median(elapsed_values)
    print(f"SUM_RESULT={total}", flush=True)
    print(f"MEDIAN_SECONDS={median_seconds:.3f}", flush=True)
    print("CHECK=PASS", flush=True)
    print(f"UI observation: {max(0, args.wait_seconds)} seconds", flush=True)
    time.sleep(max(0, args.wait_seconds))
finally:
    spark.stop()

print("APP_STOPPED", flush=True)
