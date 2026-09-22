/* C17 보충 실습: 원본의 포트 기반 체이닝 해시 테이블.
 * fd는 가상 숫자다. 실제 연결 식별에는 주소 등 추가 정보가 필요하다. */
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#define TABLE_SIZE 100

typedef struct Bucket {
    uint16_t port;
    int socket_fd;
    struct Bucket *next;
} Bucket;

static Bucket *table[TABLE_SIZE] = {0};

static size_t hash(uint16_t port)
{
    return port % TABLE_SIZE;
}

static bool insert(uint16_t port, int fd)
{
    size_t index = hash(port);
    for (Bucket *node = table[index]; node != NULL; node = node->next) {
        if (node->port == port) {
            node->socket_fd = fd;
            return true;
        }
    }

    Bucket *node = malloc(sizeof *node);
    if (node == NULL) {
        return false;
    }

    node->port = port;
    node->socket_fd = fd;
    node->next = table[index];
    table[index] = node;
    return true;
}

static bool search(uint16_t port, int *out)
{
    for (const Bucket *node = table[hash(port)]; node != NULL; node = node->next) {
        /* 해시 인덱스가 같아도 원래 키가 같은지 다시 비교한다. */
        if (node->port == port) {
            *out = node->socket_fd;
            return true;
        }
    }
    return false;
}

static bool remove_port(uint16_t port)
{
    Bucket **link = &table[hash(port)];
    while (*link != NULL) {
        Bucket *node = *link;
        if (node->port == port) {
            *link = node->next;
            free(node);
            return true;
        }
        link = &node->next;
    }
    return false;
}

static void free_table(void)
{
    for (size_t i = 0; i < TABLE_SIZE; i++) {
        while (table[i] != NULL) {
            Bucket *node = table[i];
            table[i] = node->next;
            free(node);
        }
    }
}

static void print_bucket(uint16_t port)
{
    printf("bucket[%zu]", hash(port));
    for (const Bucket *node = table[hash(port)]; node != NULL; node = node->next) {
        printf(" -> %u:%d", (unsigned int)node->port, node->socket_fd);
    }
    puts(" -> NULL");
}

int main(void)
{
    /* 80과 8080은 같은 버킷 80에 들어간다. */
    if (!insert(80, 10) || !insert(8080, 11) || !insert(443, 12)) {
        fputs("Allocation failed\n", stderr);
        free_table();
        return EXIT_FAILURE;
    }
    print_bucket(80);

    int fd;
    if (search(8080, &fd)) {
        printf("search 8080: %d\n", fd);
    }
    if (!insert(8080, 20)) {
        free_table();
        return EXIT_FAILURE;
    }
    if (search(8080, &fd)) {
        printf("updated 8080: %d\n", fd);
    }

    printf("remove 8080: %s\n", remove_port(8080) ? "OK" : "missing");
    print_bucket(80);
    printf("search 8080: %s\n", search(8080, &fd) ? "found" : "missing");
    printf("search 443: %s\n", search(443, &fd) ? "found" : "missing");

    free_table();
    return EXIT_SUCCESS;
}
