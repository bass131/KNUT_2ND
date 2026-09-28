import pyspark
from pyspark.sql import SparkSession

print(f"PYSPARK_VERSION={pyspark.__version__}", flush=True)
assert pyspark.__version__ == "4.1.3"
spark = SparkSession.builder.appName("Week02-Image-Check").getOrCreate()
try:
    assert spark.range(1).count() == 1
    print("PYSPARK_IMAGE_CHECK=PASS", flush=True)
finally:
    spark.stop()
