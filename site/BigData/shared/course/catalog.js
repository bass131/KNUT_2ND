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
          '코드 해설 · 실행과 시간 측정',
          'compose.yaml run.sh first_app.py spark-submit argparse assert finally 5050',
        ],
        [
          'guide-prepare',
          '실행 환경과 통신 점검',
          '이미지 검사 네트워크 check_pyspark check_network',
        ],
        [
          'guide-observe',
          '두 Worker에서 실행 관찰',
          'Master Driver UI Jobs Stages Executors Skipped',
        ],
        ['guide-compare', '한 Worker와 실행 비교', 'stop start down 복원 합계 완료 Task'],
        [
          'exercise-prepare',
          '자원과 성능 측정 조건',
          'performance_app.py run_performance.sh 18080 24040 중앙값',
        ],
        [
          'exercise-scale',
          'Worker와 코어 늘리기',
          'scale 128 partitions repetitions end 성능 Speedup 효율',
        ],
        ['exercise-fixed', '전체 코어 2개로 고정', 'TOTAL_EXECUTOR_CORES 자원 한도 8 Worker'],
        ['exercise-review', '측정 결과 해석과 종료', '중앙값 JVM 자원 경합 결과표 종료'],
      ],
    },
    {
      id: '04',
      title: 'Spark DataFrame 프로그래밍',
      sections: [
        [
          'orders',
          '주문 데이터와 처리 순서',
          'CSV 주문 order_id user_id product_id quantity price event_time 처리 순서',
        ],
        [
          'dataframe',
          'DataFrame과 실행 위치',
          'DataFrame Row Column Partition Task Driver Executor Pandas Python SparkSession',
        ],
        [
          'schema',
          'Schema와 자료형',
          'Schema StructType StructField DecimalType LongType IntegerType TimestampType inferSchema nullable',
        ],
        [
          'nested',
          '중첩된 데이터 구조',
          '중첩 Schema Struct Array Map JSON explode explode_outer containsNull',
        ],
        [
          'csv',
          'CSV 읽기와 입력 확인',
          'CSV header timestampFormat printSchema show columns getNumPartitions nullable',
        ],
        [
          'column',
          'Column 표현식과 열 선택',
          'Column expression F.col select alias Py4J JVM Python UDF',
        ],
        [
          'null-filter',
          '조건과 NULL 처리',
          'filter where NULL isNull isNotNull fillna nullable UnsafeRow bitset 조건 and',
        ],
        [
          'withcolumn',
          '금액 계산과 새 DataFrame',
          'withColumn immutable 불변 when otherwise amount',
        ],
        [
          'aggregate',
          '사용자별 집계와 Shuffle',
          'groupBy GroupedData agg count sum avg Shuffle Group Key 집계',
        ],
        [
          'sort-results',
          '정렬과 예상 결과 확인',
          'orderBy desc asc 예상 결과 정렬 total_amount 48000 35000',
        ],
        [
          'lazy',
          '실행계획과 Action',
          'Transformation Action Lazy Evaluation Logical Plan Physical Plan Job Stage count first show',
        ],
        ['collect', 'collect와 Driver 메모리', 'collect Driver memory Row Python List 대용량'],
        ['review', '코드 검토와 복습', 'AI 코드 검토 오류 복습 SQL 입력 정제 집계 실행 위치'],
      ],
    },
  ];
  site.chapters = chapters;
})();
