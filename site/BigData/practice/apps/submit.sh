#!/usr/bin/env bash
set -euo pipefail

app="${1:-sum_app.py}"
if (( $# > 0 )); then shift; fi
case "$app" in
  sum_app.py|benchmark_app.py) ;;
  *) echo "Choose sum_app.py or benchmark_app.py" >&2; exit 2 ;;
esac
cores="${TOTAL_EXECUTOR_CORES:-2}"
if [[ ! "$cores" =~ ^[1-9][0-9]*$ ]]; then
  echo "TOTAL_EXECUTOR_CORES must be a positive integer" >&2
  exit 2
fi

exec /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --deploy-mode client \
  --driver-memory 512m \
  --executor-memory 512m \
  --executor-cores 1 \
  --total-executor-cores "$cores" \
  --conf spark.dynamicAllocation.enabled=false \
  --conf spark.sql.adaptive.enabled=false \
  --conf spark.driver.host=spark-client \
  --conf spark.driver.bindAddress=0.0.0.0 \
  --conf spark.driver.port=39000 \
  --conf spark.blockManager.port=39001 \
  "/opt/spark/apps/$app" "$@"
