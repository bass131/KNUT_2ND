/* C17 보충 실습: 바이트 해석, 구조체, 비트 연산, 메모리 수명. */
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_PAYLOAD 1024U

typedef struct {
    uint8_t flags;
    uint16_t length;
} MessageHeader;

/* 학습용 형식: [flags 1바이트][길이 2바이트, big-endian][본문].
 * 실제 TCP/IP 헤더가 아니다. 구조체로 캐스팅하지 않고 값을 조립한다. */
static bool decode_header(const unsigned char *data, size_t size,
                          MessageHeader *out)
{
    if (data == NULL || out == NULL || size < 3) {
        return false;
    }

    out->flags = data[0];
    out->length = (uint16_t)(((unsigned int)data[1] << 8) | data[2]);
    return true;
}

static bool process_message(const unsigned char *data, size_t size)
{
    MessageHeader header;
    if (!decode_header(data, size, &header)) {
        puts("Rejected: incomplete header");
        return false;
    }

    /* 길이 검증을 먼저 하므로 size - 3이 음수처럼 언더플로하지 않는다.
     * 이 예제는 정확히 한 메시지가 들어 있는 배열을 처리한다. */
    if (header.length == 0 || header.length > MAX_PAYLOAD ||
        (size_t)header.length != size - 3) {
        puts("Rejected: invalid payload length");
        return false;
    }

    /* 할당 책임과 해제 책임을 이 함수가 함께 갖는다. */
    unsigned char *payload = malloc(header.length);
    if (payload == NULL) {
        fputs("Allocation failed\n", stderr);
        return false;
    }

    memcpy(payload, data + 3, header.length);
    printf("flags=0x%02X, length=%u\n",
           (unsigned int)header.flags, (unsigned int)header.length);
    printf("payload:");
    for (size_t i = 0; i < header.length; i++) {
        printf(" %02X", (unsigned int)payload[i]);
    }
    putchar('\n');

    /* 본문에 NUL이 있어도 길이로 처리한다. 문자열 함수는 쓰지 않는다. */
    free(payload);
    return true;
}

int main(void)
{
    const unsigned char message[] = {0x12, 0x00, 0x03, 0x41, 0x00, 0x42};
    if (!process_message(message, sizeof message)) {
        return EXIT_FAILURE;
    }

    /* 버퍼가 짧거나 헤더가 과도한 길이를 요구하면 거부하는지 확인한다. */
    const unsigned char too_large[] = {0x12, 0x04, 0x01};
    if (process_message(message, 2) ||
        process_message(message, sizeof message - 1) ||
        process_message(too_large, sizeof too_large)) {
        return EXIT_FAILURE;
    }

    /* TCP의 SYN/ACK 마스크를 수치로 관찰하는 별도 예시다.
     * 앞의 학습용 메시지나 실제 소켓 상태를 변경하지 않는다. */
    unsigned int flags = 0x12U;
    printf("SYN=%d, ACK=%d\n", (flags & 0x02U) != 0U,
           (flags & 0x10U) != 0U);
    flags |= 0x01U;
    flags &= ~0x02U;
    printf("after set FIN / clear SYN: 0x%02X\n", flags);

    const unsigned int version_ihl = 0x45U;
    printf("IPv4 version=%u, header bytes=%u\n",
           version_ihl >> 4, (version_ihl & 0x0FU) * 4U);
    return EXIT_SUCCESS;
}
