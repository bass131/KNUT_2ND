#!/usr/bin/env bash
set -euo pipefail
exec /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --deploy-mode client \
  --driver-memory 512m \
  --executor-memory 512m \
  --executor-cores 1 \
  --total-executor-cores 2 \
  --conf spark.dynamicAllocation.enabled=false \
  --conf spark.driver.host=spark-client \
  --conf spark.driver.bindAddress=0.0.0.0 \
  --conf spark.driver.port=39000 \
  --conf spark.blockManager.port=39001 \
  /opt/spark/apps/first_app.py "$@"
