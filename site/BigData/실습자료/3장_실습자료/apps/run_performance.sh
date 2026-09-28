#!/usr/bin/env bash
set -euo pipefail

TOTAL_EXECUTOR_CORES="${TOTAL_EXECUTOR_CORES:-1}"

exec /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --deploy-mode client \
  --driver-memory 512m \
  --executor-memory 512m \
  --executor-cores 1 \
  --total-executor-cores "${TOTAL_EXECUTOR_CORES}" \
  --conf spark.dynamicAllocation.enabled=false \
  --conf spark.driver.host=spark-client \
  --conf spark.driver.bindAddress=0.0.0.0 \
  --conf spark.driver.port=39000 \
  --conf spark.blockManager.port=39001 \
  /opt/spark/apps/performance_app.py "$@"

