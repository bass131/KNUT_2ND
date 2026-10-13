#define _POSIX_C_SOURCE 200112L
#include <arpa/inet.h>
#include <inttypes.h>
#include <netdb.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>

static void print_bytes(const void *data, size_t length)
{
    const unsigned char *bytes = data;
    for (size_t i = 0; i < length; ++i) {
        printf("%s%02x", i ? " " : "", (unsigned int)bytes[i]);
    }
    putchar('\n');
}

int main(int argc, char **argv)
{
    const char *input = argc > 1 ? argv[1] : "127.0.0.1";
    struct sockaddr_in address = {0};
    address.sin_family = AF_INET;
    address.sin_port = htons(9000);

    int converted = inet_pton(AF_INET, input, &address.sin_addr);
    if (converted != 1) {
        if (converted == 0) {
            fprintf(stderr, "Invalid IPv4 address: %s\n", input);
        } else {
            perror("inet_pton IPv4");
        }
        return EXIT_FAILURE;
    }

    char text[INET_ADDRSTRLEN];
    if (inet_ntop(AF_INET, &address.sin_addr, text, sizeof(text)) == NULL) {
        perror("inet_ntop IPv4");
        return EXIT_FAILURE;
    }
    printf("IPv4: %s, port: %u\n", text, (unsigned int)ntohs(address.sin_port));
    printf("IPv4 bytes: ");
    print_bytes(&address.sin_addr, sizeof(address.sin_addr));
    printf("Port bytes: ");
    print_bytes(&address.sin_port, sizeof(address.sin_port));

    uint32_t host = UINT32_C(0x12345678);
    uint32_t network = htonl(host);
    printf("Host bytes: ");
    print_bytes(&host, sizeof(host));
    printf("Network bytes: ");
    print_bytes(&network, sizeof(network));
    printf("Round trip: 0x%08" PRIx32 "\n", ntohl(network));

    struct sockaddr_in6 address6 = {0};
    address6.sin6_family = AF_INET6;
    address6.sin6_port = htons(9000);
    if (inet_pton(AF_INET6, "::1", &address6.sin6_addr) != 1) {
        fputs("IPv6 conversion failed\n", stderr);
        return EXIT_FAILURE;
    }
    char text6[INET6_ADDRSTRLEN];
    if (inet_ntop(AF_INET6, &address6.sin6_addr, text6, sizeof(text6)) == NULL) {
        perror("inet_ntop IPv6");
        return EXIT_FAILURE;
    }
    printf("IPv6: %s\n", text6);

    /* Numeric input only: no DNS request or socket connection. */
    struct addrinfo hints = {0};
    struct addrinfo *result = NULL;
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_flags = AI_NUMERICHOST | AI_NUMERICSERV;
    int error = getaddrinfo(input, "9000", &hints, &result);
    if (error != 0) {
        fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(error));
        return EXIT_FAILURE;
    }

    size_t count = 0;
    for (const struct addrinfo *p = result; p != NULL; p = p->ai_next) {
        ++count;
    }
    printf("Numeric address candidates: %zu\n", count);
    freeaddrinfo(result);
    return EXIT_SUCCESS;
}
