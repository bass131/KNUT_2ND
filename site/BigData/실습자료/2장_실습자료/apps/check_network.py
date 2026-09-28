"""Run after all four Compose services have started. No extra container needed."""
import socket
import sys

names = ("spark-master", "spark-worker-1", "spark-worker-2", "spark-client")
failures = 0
for name in names:
    try:
        print(f"DNS {name} -> {socket.gethostbyname(name)}", flush=True)
    except OSError as exc:
        failures += 1
        print(f"DNS_FAIL {name}: {exc}", flush=True)

for name, port in (("spark-master", 7077), ("spark-worker-1", 8081), ("spark-worker-2", 8081)):
    try:
        with socket.create_connection((name, port), timeout=3):
            print(f"TCP {name}:{port} -> OK", flush=True)
    except OSError as exc:
        failures += 1
        print(f"TCP_FAIL {name}:{port}: {exc}", flush=True)

print("NETWORK_CHECK=" + ("PASS" if failures == 0 else "FAIL"), flush=True)
print("TCP success alone does not verify Spark registration or application correctness.")
sys.exit(0 if failures == 0 else 1)
