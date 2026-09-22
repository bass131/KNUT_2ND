/* Ubuntu / POSIX, C17: 한 클라이언트의 바이트를 그대로 돌려준다. */
#include <arpa/inet.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <unistd.h>

static int send_all(int fd, const char *data, size_t size)
{
    size_t sent = 0;

    /* send() 한 번이 전체 데이터를 처리한다는 보장은 없다. */
    while (sent < size) {
        /* 이미 보낸 부분을 건너뛰고 남은 바이트만 다시 보낸다.
           MSG_NOSIGNAL: 상대가 닫아도 SIGPIPE 대신 오류 반환으로 처리한다. */
        ssize_t n = send(fd, data + sent, size - sent, MSG_NOSIGNAL);

        /* 신호로 중단된 호출은 재시도하고, 다른 실패는 호출자에게 알린다. */
        if (n < 0 && errno == EINTR) {
            continue;
        }

        if (n <= 0) {
            return -1;
        }

        /* 실제로 보낸 길이만 누적한다. */
        sent += (size_t)n;
    }

    return 0;
}

int main(void)
{
    /* 1. IPv4(AF_INET)용 TCP 스트림 소켓을 만든다.
       성공하면 0 이상의 파일 디스크립터, 실패하면 -1을 반환한다. */
    int server = socket(AF_INET, SOCK_STREAM, 0);
    if (server == -1) {
        perror("socket");
        return EXIT_FAILURE;
    }

    /* 2. 종료 후 주소를 다시 바인딩하기 쉽게 한다.
       이미 대기 중인 다른 서버와 같은 주소·포트를 공유하는 옵션은 아니다. */
    int reuse = 1;
    if (setsockopt(server, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof reuse) == -1) {
        perror("setsockopt");
        close(server);
        return EXIT_FAILURE;
    }

    /* 3. 접속을 받을 주소를 지정한다. {0}은 구조체 전체를 0으로 초기화한다.
       htons/htonl은 정수를 네트워크 바이트 순서로 변환한다.
       루프백 127.0.0.1에만 바인딩하므로 같은 Ubuntu 안에서 접속한다. */
    struct sockaddr_in address = {0};
    address.sin_family = AF_INET;
    address.sin_port = htons(9000);
    address.sin_addr.s_addr = htonl(INADDR_LOOPBACK);

    /* 4. 소켓에 주소를 연결한다. 실제 구조체 크기는 sizeof로 알려 준다. */
    if (bind(server, (struct sockaddr *)&address, sizeof address) == -1) {
        perror("bind");
        close(server);
        return EXIT_FAILURE;
    }

    /* 5. 접속 대기 상태로 전환한다. 두 번째 인자는 연결 대기열의 힌트다.
       한 클라이언트만 처리하는 이유는 accept()를 한 번만 하기 때문이다. */
    if (listen(server, 1) == -1) {
        perror("listen");
        close(server);
        return EXIT_FAILURE;
    }

    puts("Listening on 127.0.0.1:9000 (Ctrl+C to stop)");
    fflush(stdout);

    /* 6. 연결이 올 때까지 기다리고 새 통신용 소켓을 받는다.
       NULL 두 개는 상대 주소 정보를 받지 않겠다는 뜻이다. */
    int client;
    do {
        client = accept(server, NULL, NULL);
    } while (client == -1 && errno == EINTR);

    if (client == -1) {
        perror("accept");
        close(server);
        return EXIT_FAILURE;
    }

    puts("Client connected");

    /* 7. 받은 바이트를 그대로 돌려준다. TCP 메시지 경계를 가정하지 않는다. */
    char buffer[1024];
    int result = EXIT_SUCCESS;

    for (;;) {
        /* n > 0: 받은 길이 / n == 0: 상대의 송신 종료 / n < 0: 오류 */
        ssize_t n = recv(client, buffer, sizeof buffer, 0);

        if (n == 0) {
            break;
        }

        if (n < 0 && errno == EINTR) {
            continue;
        }

        if (n < 0) {
            perror("recv");
            result = EXIT_FAILURE;
            break;
        }

        /* n이 양수인지 확인한 뒤 unsigned 타입인 size_t로 변환한다. */
        if (send_all(client, buffer, (size_t)n) == -1) {
            perror("send");
            result = EXIT_FAILURE;
            break;
        }
    }

    /* 8. 통신용 소켓과 대기용 소켓은 서로 다른 자원이므로 각각 닫는다. */
    close(client);
    close(server);

    puts("Connection closed; server finished");
    return result;
}
