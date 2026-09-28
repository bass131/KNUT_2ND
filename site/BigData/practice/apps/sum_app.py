"""Verify a known answer and leave time to inspect the Spark UI."""
import argparse
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--wait-seconds", type=int, default=0)
    args = parser.parse_args()
    if args.wait_seconds < 0:
        parser.error("wait-seconds must be nonnegative")
    from pyspark.sql import SparkSession, functions as F

    spark = SparkSession.builder.appName("Public-First-Sum").getOrCreate()
    try:
        spark.sparkContext.setLogLevel("WARN")
        print(f"MASTER={spark.sparkContext.master}", flush=True)
        print(f"APP_ID={spark.sparkContext.applicationId}", flush=True)
        numbers = spark.range(1, 101, 1, 4)
        numbers.printSchema()
        result = numbers.agg(F.sum("id").alias("total"))
        result.explain()
        total = result.first()["total"]
        if total != 5050:
            raise ValueError(f"expected 5050, received {total}")
        print(f"SUM_1_TO_100={total}", flush=True)
        print("CHECK=PASS", flush=True)
        print(f"UI_WAIT_SECONDS={args.wait_seconds}", flush=True)
        time.sleep(args.wait_seconds)
    finally:
        spark.stop()
    print("APP_STOPPED", flush=True)


if __name__ == "__main__":
    main()
