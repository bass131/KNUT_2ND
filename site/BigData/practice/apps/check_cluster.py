"""Wait for the requested number of live one-core workers; no PySpark needed."""
import argparse
import json
import time
from urllib.error import URLError
from urllib.request import urlopen


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, required=True)
    parser.add_argument("--timeout", type=int, default=90)
    args = parser.parse_args()
    if args.workers < 1 or args.timeout < 1:
        parser.error("workers and timeout must be positive")
    deadline = time.monotonic() + args.timeout
    observed = "master not reached"
    while time.monotonic() < deadline:
        try:
            with urlopen("http://spark-master:8080/json/", timeout=3) as response:
                status = json.load(response)
            live = [worker for worker in status["workers"] if worker["state"] == "ALIVE"]
            cores = sum(int(worker["cores"]) for worker in live)
            observed = f"ALIVE_WORKERS={len(live)} TOTAL_CORES={cores}"
            if len(live) == args.workers and cores == args.workers:
                print(observed)
                print("REGISTRATION_CHECK=PASS")
                return
        except (URLError, TimeoutError, OSError, ValueError, KeyError) as error:
            observed = str(error)
        time.sleep(1)
    parser.exit(1, f"REGISTRATION_CHECK=FAIL: {observed}\n")


if __name__ == "__main__":
    main()
