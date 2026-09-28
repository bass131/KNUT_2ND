#include <sys/types.h>
#include <sys/socket.h>
#include <unistd.h>
#include <errno.h>
#include <stdio.h>
#include <string.h>

int main(void)
{
    /* Linux에서는 Winsock 초기화가 필요 없다. */
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd == -1) {
        int error = errno;
        fprintf(stderr, "socket: %d (%s)\n", error, strerror(error));
        return 1;
    }

    printf("TCP socket created: fd=%d (not connected)\n", fd);

    /* fd의 값은 실행마다 다를 수 있다. 한 번 닫은 번호는 재사용하지 않는다. */
    if (close(fd) == -1) {
        int error = errno;
        fprintf(stderr, "close: %d (%s)\n", error, strerror(error));
        return 1;
    }

    puts("Socket closed");
    return 0;
}
