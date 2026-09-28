"""Week 2: submit, verify a known answer, observe the UI, and stop."""
import argparse
import time
from pyspark.sql import SparkSession

parser = argparse.ArgumentParser()
parser.add_argument("--wait-seconds", type=int, default=120)
args = parser.parse_args()

spark = SparkSession.builder.appName("Week02-First-App").getOrCreate()
try:
    spark.sparkContext.setLogLevel("WARN")
    print(f"MASTER={spark.sparkContext.master}", flush=True)
    print(f"APP_ID={spark.sparkContext.applicationId}", flush=True)
    assert spark.sparkContext.master == "spark://spark-master:7077"

    # Four input partitions. DataFrame syntax is covered next week.
    numbers = spark.range(1, 101, 1, 4)
    total = numbers.selectExpr("sum(id) AS total").first()["total"]
    print(f"SUM_1_TO_100={total}", flush=True)
    assert total == 5050, f"Unexpected result: {total}"
    print("CHECK=PASS", flush=True)
    print(f"UI observation: {max(0, args.wait_seconds)} seconds", flush=True)
    time.sleep(max(0, args.wait_seconds))
finally:
    spark.stop()
print("APP_STOPPED", flush=True)
