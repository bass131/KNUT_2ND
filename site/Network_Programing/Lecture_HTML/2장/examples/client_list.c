/* C17 보충 실습: 실제 소켓 대신 가상의 fd 숫자를 저장한다. */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct ClientNode {
    int socket_fd;
    struct ClientNode *next;
} ClientNode;

static bool add_client(ClientNode **head, int fd)
{
    ClientNode *node = malloc(sizeof *node);
    if (node == NULL) {
        return false;
    }

    node->socket_fd = fd;
    node->next = *head;
    *head = node;
    return true;
}

static bool remove_client(ClientNode **head, int fd)
{
    /* link는 현재 노드를 가리키는 연결 자체의 주소다.
     * 첫 노드에서는 head, 이후에는 앞 노드의 next를 가리킨다. */
    ClientNode **link = head;
    while (*link != NULL) {
        ClientNode *node = *link;
        if (node->socket_fd == fd) {
            *link = node->next;
            free(node);
            return true;
        }
        link = &node->next;
    }
    return false;
}

static void clear_clients(ClientNode **head)
{
    while (*head != NULL) {
        ClientNode *node = *head;
        *head = node->next;
        free(node);
    }
}

static void print_clients(const ClientNode *head)
{
    printf("head");
    for (const ClientNode *node = head; node != NULL; node = node->next) {
        printf(" -> %d", node->socket_fd);
    }
    puts(" -> NULL");
}

int main(void)
{
    ClientNode *head = NULL;
    if (!add_client(&head, 4) || !add_client(&head, 7)) {
        fputs("Allocation failed\n", stderr);
        clear_clients(&head);
        return EXIT_FAILURE;
    }

    print_clients(head);
    printf("remove 4: %s\n", remove_client(&head, 4) ? "OK" : "missing");
    print_clients(head);
    printf("remove 99: %s\n", remove_client(&head, 99) ? "OK" : "missing");

    clear_clients(&head);
    print_clients(head);
    return EXIT_SUCCESS;
}
