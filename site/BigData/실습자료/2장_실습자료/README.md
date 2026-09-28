# 2주차 실습 배포파일 v5

이 ZIP에는 설정과 코드만 들어 있다. Docker 이미지는 별도로 확보한다.
전체 설명: 2주차 강의노트 v5의 6.2절.

## 개념과 역할 설정

강의노트 4절에서 Docker·이미지·컨테이너·Docker Hub·Compose를 읽고, 5.1–5.4절에서 역할 설정을 확인한다. Compose의 entrypoint/command가 Master와 Worker 프로세스를 시작한다. Client는 제출용 대기 컨테이너이며 run.sh 실행 시 Driver가 생긴다. 이번 실습에는 컨테이너 내부 Spark 설정파일 편집이 필요 없다.

도식과 단계별 설명은 강의노트 5.5절, Docker DNS 확인 실습은 5.6절을 따른다.

## 1. 학생이 Docker Hub에서 직접 이미지 다운로드

이 절차가 기본 실습이다. 각 학생은 자신의 PC에서 이미지 태그를 확인하고 PowerShell로 다운로드한다:

```powershell
$sparkImage = "spark:4.1.3-scala2.13-java21-python3-ubuntu"
docker pull $sparkImage
docker image ls $sparkImage
```

이미지를 확인한 뒤 아래 2, 3, 4단계를 순서대로 수행한다.

## 2. 이미지 실행 검사

이 폴더에서:

```powershell
docker compose config --quiet
docker compose run --rm --no-deps --entrypoint /opt/spark/bin/spark-submit spark-client --master "local[1]" /opt/spark/apps/check_pyspark.py
```

PYSPARK_VERSION=4.1.3, PYSPARK_IMAGE_CHECK=PASS와 종료 코드 0을 확인한다.
임시 컨테이너를 자동 제거한다. 이 검사는 아직 분산 실행이 아니다.

## 3. 네 컨테이너 실행

```powershell
docker compose up -d
docker compose ps -a
```

http://localhost:8080 에서 ALIVE Worker 두 개 확인 후, Docker DNS와 내부 포트 연결도 관찰한다.

```powershell
docker compose exec spark-client python3 /opt/spark/apps/check_network.py
```

NETWORK_CHECK=PASS를 확인한다. TCP 성공은 계산 성공을 뜻하지 않으며 다음의 앱 실행도 확인한다:


```powershell
docker compose exec spark-client bash /opt/spark/apps/run.sh
```

SUM_1_TO_100=5050, CHECK=PASS를 확인한다. 120초 대기 중 http://localhost:4040 관찰.
APP_STOPPED 출력 후 `$LASTEXITCODE`가 0인지 확인한다.

## 4. 종료

```powershell
docker compose stop
docker compose ps -a
docker compose start
```

Worker 재등록을 확인하고 실습 종료 시:

```powershell
docker compose down
docker compose ps -a
```

UTF-8/LF로 파일을 유지한다. 제작 환경의 Docker 데몬 미실행으로 실제 이미지 및 클러스터 실행은 미검증이다. 교수자는 수업 전에 이미지 검사와 전체 실습을 예행한다.

## Plan B: 직접 다운로드가 불가능할 때만

네트워크 장애·접근 제한 등으로 다운로드할 수 없으면 교수자에게 실제 오류를 알린다. 교수자가 Plan B를 안내한 경우에만 별도 제공된 TAR를 `docker image load -i <파일경로>`로 불러온다. 이후 위 2단계부터 진행한다. 상세 절차는 강의노트 부록 A를 따른다. 이 ZIP에 이미지 TAR는 포함하지 않는다.
