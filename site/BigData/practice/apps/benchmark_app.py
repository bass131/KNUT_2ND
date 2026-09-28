"""Measure repeated aggregation actions; timings are produced only by real runs."""
import argparse
import statistics
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--end", type=int, default=1_000_001)
    parser.add_argument("--partitions", type=int, default=128)
    parser.add_argument("--repetitions", type=int, default=3)
    parser.add_argument("--wait-seconds", type=int, default=0)
    args = parser.parse_args()
    if not 2 <= args.end <= 4_294_967_296:
        parser.error("end must be 2..4294967296 (keeps the sum within signed 64-bit)")
    if args.partitions < 1 or args.repetitions < 1 or args.wait_seconds < 0:
        parser.error("partitions/repetitions must be positive; wait must be nonnegative")
    from pyspark.sql import SparkSession, functions as F

    spark = SparkSession.builder.appName("Public-Worker-Benchmark").getOrCreate()
    try:
        spark.sparkContext.setLogLevel("WARN")
        context = spark.sparkContext
        print(f"MASTER={context.master}", flush=True)
        print(f"APP_ID={context.applicationId}", flush=True)
        print(f"REQUESTED_CORES={context.getConf().get('spark.cores.max', 'unset')}", flush=True)
        print(f"END_EXCLUSIVE={args.end}", flush=True)
        print(f"PARTITIONS={args.partitions}", flush=True)
        print(f"REPETITIONS={args.repetitions}", flush=True)
        numbers = spark.range(1, args.end, 1, args.partitions)
        expected = (args.end - 1) * args.end // 2
        durations = []
        for repeat in range(1, args.repetitions + 1):
            started = time.perf_counter()
            total = numbers.agg(F.sum("id").alias("total")).first()["total"]
            elapsed = time.perf_counter() - started
            if total != expected:
                raise ValueError(f"expected {expected}, received {total}")
            durations.append(elapsed)
            print(f"RUN_{repeat}_SECONDS={elapsed:.6f}", flush=True)
        print(f"SUM_RESULT={total}", flush=True)
        print(f"MEDIAN_SECONDS={statistics.median(durations):.6f}", flush=True)
        print("CHECK=PASS", flush=True)
        print(f"UI_WAIT_SECONDS={args.wait_seconds}", flush=True)
        time.sleep(args.wait_seconds)
    finally:
        spark.stop()
    print("APP_STOPPED", flush=True)


if __name__ == "__main__":
    main()
