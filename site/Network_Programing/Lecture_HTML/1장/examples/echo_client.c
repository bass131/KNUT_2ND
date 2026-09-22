/* Ubuntu / POSIX, C17: 송신을 끝내고 서버의 에코를 EOF까지 읽는다. */
#include <arpa/inet.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <unistd.h>

int main(void)
{
    /* 1. 서버와 같은 IPv4/TCP 방식의 소켓을 만든다. */
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd == -1) {
        perror("socket");
        return EXIT_FAILURE;
    }

    /* 2. 연결할 서버의 주소·포트를 정한다. 클라이언트 자신의 포트가 아니다.
       주소와 포트는 네트워크 바이트 순서로 저장한다. */
    struct sockaddr_in address = {0};
    address.sin_family = AF_INET;
    address.sin_port = htons(9000);
    address.sin_addr.s_addr = htonl(INADDR_LOOPBACK);

    /* 3. 서버가 먼저 실행되어 있어야 한다. 로컬 임시 포트는 OS가 고른다. */
    if (connect(fd, (struct sockaddr *)&address, sizeof address) == -1) {
        perror("connect");
        close(fd);
        return EXIT_FAILURE;
    }

    /* 4. C 문자열 끝의 NUL은 보내지 않고 줄바꿈까지의 바이트만 보낸다.
       message는 배열이므로 sizeof message에 NUL 한 바이트도 포함된다. */
    const char message[] = "Hello, network!\n";
    size_t sent = 0;

    while (sent < sizeof message - 1) {
        /* 부분 송신에 대비해 전송 위치와 남은 길이를 매번 갱신한다. */
        ssize_t n = send(fd, message + sent, sizeof message - 1 - sent, MSG_NOSIGNAL);

        /* EINTR는 신호로 중단된 경우다. 그 외의 실패는 정리 후 종료한다. */
        if (n < 0 && errno == EINTR) {
            continue;
        }

        if (n <= 0) {
            perror("send");
            close(fd);
            return EXIT_FAILURE;
        }

        sent += (size_t)n;
    }

    /* 5. 더 보낼 데이터가 없음을 알린다. 수신 방향은 계속 열려 있다.
       서버는 남은 바이트를 읽은 뒤 EOF를 받아 종료 절차로 들어간다. */
    if (shutdown(fd, SHUT_WR) == -1) {
        perror("shutdown");
        close(fd);
        return EXIT_FAILURE;
    }

    /* 6. 서버가 돌려주는 데이터를 여러 번에 나누어 받을 수도 있다. */
    char buffer[1024];

    for (;;) {
        ssize_t n = recv(fd, buffer, sizeof buffer, 0);

        /* 서버가 송신을 끝냈고 더 읽을 바이트가 없으면 수신을 마친다. */
        if (n == 0) {
            break;
        }

        if (n < 0 && errno == EINTR) {
            continue;
        }

        if (n < 0) {
            perror("recv");
            close(fd);
            return EXIT_FAILURE;
        }

        /* recv()는 NUL을 붙이지 않는다. 문자열이 아닌 받은 길이로 출력한다. */
        if (fwrite(buffer, 1, (size_t)n, stdout) != (size_t)n) {
            perror("fwrite");
            close(fd);
            return EXIT_FAILURE;
        }
    }

    /* 7. 수신까지 마쳤으므로 소켓 자원을 해제한다. */
    close(fd);

    return EXIT_SUCCESS;
}
