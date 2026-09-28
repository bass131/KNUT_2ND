#include <winsock2.h>
#include <windows.h>
#include <stdio.h>

/* MSVC는 pragma, MinGW/Dev-C++는 빌드 명령의 -lws2_32로 링크한다. */
#ifdef _MSC_VER
#pragma comment(lib, "ws2_32.lib")
#endif

/* 오류 코드를 먼저 저장한 뒤 전달한다. 이 함수는 종료하지 않는다. */
static void report_error(const char *where, int error)
{
    char *message = NULL;
    DWORD length = FormatMessageA(
        FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM
            | FORMAT_MESSAGE_IGNORE_INSERTS,
        NULL, (DWORD)error, 0, (LPSTR)&message, 0, NULL);

    if (length != 0 && message != NULL) {
        fprintf(stderr, "%s: %d (%s)\n", where, error, message);
    } else {
        fprintf(stderr, "%s: %d (message unavailable)\n", where, error);
    }

    if (message != NULL) {
        LocalFree(message);
    }
}

int main(void)
{
    WSADATA wsa;
    int status = 0;

    /* 실패 코드는 WSAStartup의 반환값 자체에 있다. */
    int result = WSAStartup(MAKEWORD(2, 2), &wsa);
    if (result != 0) {
        report_error("WSAStartup", result);
        return 1;
    }

    printf("Winsock %u.%u initialized\n",
        (unsigned)LOBYTE(wsa.wVersion), (unsigned)HIBYTE(wsa.wVersion));

    /* 이 예제는 Winsock 2.2를 사용한다. 성공한 초기화는 정리한다. */
    if (LOBYTE(wsa.wVersion) != 2 || HIBYTE(wsa.wVersion) != 2) {
        fprintf(stderr, "Winsock 2.2 is required\n");
        status = 1;
    } else {
        /* 소켓 자원만 생성한다. 연결이나 데이터 송수신은 하지 않는다. */
        SOCKET sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock == INVALID_SOCKET) {
            int error = WSAGetLastError();
            report_error("socket", error);
            status = 1;
        } else {
            puts("TCP socket created (not connected)");

            /* 생성에 성공한 소켓만 닫는다. 오류는 즉시 저장한다. */
            if (closesocket(sock) == SOCKET_ERROR) {
                int error = WSAGetLastError();
                report_error("closesocket", error);
                status = 1;
            } else {
                puts("Socket closed");
            }
        }
    }

    /* 초기화가 성공한 모든 경로는 이곳에서 한 번 정리한다. */
    if (WSACleanup() == SOCKET_ERROR) {
        int error = WSAGetLastError();
        report_error("WSACleanup", error);
        status = 1;
    } else {
        puts("Winsock cleaned up");
    }

    return status;
}
