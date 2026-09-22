/* Course search metadata. IDs and order must match authored chapter HTML. */
(() => {
  'use strict';
  const site = (globalThis.BigDataCourse = {});
  const chapters = [
    {
      id: '01',
      title: '데이터 엔지니어링의 이해',
      sections: [
        ['first-words', '처음 만나는 빅데이터', '분산 데이터 프로세스 서버 클러스터 병목'],
        [
          'data-pipeline',
          '데이터의 네 단계',
          '수집 변환 저장 제공 파이프라인 중복 레이크 웨어하우스',
        ],
        [
          'four-skills',
          '네 가지 역량과 Spark 용어',
          'Driver Executor Worker Partition Shuffle DataFrame SQL 배치 스트리밍 스키마',
        ],
        [
          'semester-map',
          '한 학기의 학습 지도',
          '커리큘럼 로드맵 시험 Parquet Kafka Iceberg Lakehouse',
        ],
        ['reproducible-lab', '같은 환경으로 실습하기', 'Docker WSL Compose 환경 이미지 컨테이너'],
        [
          'verify-ai',
          'AI 코드 검증하기',
          'collect toPandas sum 검증 명세 Transformation Action explain',
        ],
        ['next-step', '진로와 다음 단계', '직무 커리어 채용 연봉 정리 복습'],
      ],
    },
    {
      id: '02',
      title: 'Docker와 Spark 첫 실습',
      sections: [
        ['docker', 'Docker 용어부터', '이미지 컨테이너 Registry 태그 Desktop Engine CLI'],
        ['prepare', 'Windows와 이미지 준비', '설치 WSL PowerShell pull hello-world TAR 다운로드'],
        [
          'compose',
          'Compose 설정 읽기',
          'yaml anchor bind mount healthcheck 메모리 CPU ro init depends_on',
        ],
        [
          'roles',
          'Spark 역할과 실행 흐름',
          'Master Worker Client Driver Executor Standalone 자원 Task',
        ],
        [
          'addresses',
          '주소와 포트 이해하기',
          'localhost DNS TCP 7077 8080 8081 8082 4040 네트워크',
        ],
        ['image-check', '1단계 · 이미지 검사', 'check_pyspark local PYSPARK_IMAGE_CHECK PASS 버전'],
        [
          'cluster-check',
          '2단계 · 클러스터 검사',
          'up ps ALIVE NETWORK_CHECK check_network 네트워크',
        ],
        [
          'first-app',
          '3단계 · 첫 계산 실행',
          'run.sh first_app.py 5050 range partition core spark-submit LASTEXITCODE',
        ],
        [
          'observe',
          '4단계 · UI와 오류 확인',
          '4040 Jobs Stages Executors logs 오류 로그 troubleshooting',
        ],
        ['lifecycle', '종료·재시작과 총정리', 'stop start down 재등록 종료 원본 자료'],
      ],
    },
    {
      id: '03',
      title: '분산 처리와 Spark 실행 원리',
      sections: [
        ['distributed', '분산 처리의 필요성과 비용', 'Scale-up Scale-out Core 병렬 통신 직렬화'],
        ['spark', 'Spark가 맡는 일', '처리 엔진 DAG Lineage cache persist HDFS YARN'],
        ['roles', '클러스터와 애플리케이션', 'Node Process Master Worker Driver Executor'],
        [
          'dataframe',
          'DataFrame · 표에서 숫자까지',
          'DataFrame Row Column 스키마 Schema selectExpr range sum first total',
        ],
        [
          'execution',
          '계산이 실행되는 과정',
          'DataFrame Transformation Action Lazy Evaluation Partition Job Stage Task Shuffle first',
        ],
        [
          'dataframe-wordcount',
          'DataFrame · 단어 세기 코드 해설',
          'wordcount value split explode alias where groupBy count orderBy Parquet',
        ],
        [
          'code',
          '실제 코드 · 제출부터 종료까지',
          'compose.yaml run.sh first_app.py spark-submit argparse assert finally 5050',
        ],
        [
          'guide-prepare',
          'PPTX 실습·guide · 실행 준비',
          'guide 이미지 검사 네트워크 check_pyspark check_network',
        ],
        [
          'guide-observe',
          'PPTX 실습·guide · Worker 2개 관찰',
          'guide Master Driver UI Jobs Stages Executors Skipped',
        ],
        [
          'guide-compare',
          'PPTX 실습·guide · Worker 1개 비교',
          'guide stop start down 복원 합계 완료 Task',
        ],
        [
          'exercise-prepare',
          'Exercise · 측정 준비',
          'exercise performance_app.py run_performance.sh 18080 24040 중앙값',
        ],
        [
          'exercise-scale',
          'Exercise · Worker와 Core 확장',
          'exercise scale 128 partitions repetitions end 성능 Speedup 효율',
        ],
        [
          'exercise-fixed',
          'Exercise · Core 2개 고정',
          'exercise TOTAL_EXECUTOR_CORES 자원 한도 8 Worker',
        ],
        [
          'exercise-review',
          'Exercise · 결과 해석과 정리',
          'exercise 중앙값 JVM 자원 경합 결과표 종료',
        ],
      ],
    },
  ];
  site.chapters = chapters;
})();
