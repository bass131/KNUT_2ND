/* C17 보충 실습: 5칸 중 한 칸을 비워 최대 4개를 저장한다. */
#include <stdbool.h>
#include <stdio.h>

#define SIZE 5

typedef struct {
    int values[SIZE];
    size_t front;
    size_t rear;
} RingQueue;

static bool enqueue(RingQueue *queue, int value)
{
    size_t next = (queue->rear + 1) % SIZE;
    if (next == queue->front) {
        return false;
    }

    queue->values[queue->rear] = value;
    queue->rear = next;
    return true;
}

static bool dequeue(RingQueue *queue, int *out)
{
    if (queue->front == queue->rear) {
        return false;
    }

    *out = queue->values[queue->front];
    queue->front = (queue->front + 1) % SIZE;
    return true;
}

static void print_queue(const RingQueue *queue)
{
    printf("front=%zu, rear=%zu |", queue->front, queue->rear);
    for (size_t i = queue->front; i != queue->rear; i = (i + 1) % SIZE) {
        printf(" %d", queue->values[i]);
    }
    putchar('\n');
}

int main(void)
{
    RingQueue queue = {0};
    for (int value = 10; value <= 50; value += 10) {
        printf("enqueue %d: %s\n", value,
               enqueue(&queue, value) ? "OK" : "FULL");
    }
    print_queue(&queue);

    int value;
    for (int i = 0; i < 2; i++) {
        if (dequeue(&queue, &value)) {
            printf("dequeue: %d\n", value);
        }
    }

    /* 50은 인덱스 4, 60은 인덱스 0에 저장된다. */
    printf("enqueue 50: %s\n", enqueue(&queue, 50) ? "OK" : "FULL");
    printf("enqueue 60: %s\n", enqueue(&queue, 60) ? "OK" : "FULL");
    print_queue(&queue);

    while (dequeue(&queue, &value)) {
        printf("dequeue: %d\n", value);
    }
    printf("dequeue again: %s\n", dequeue(&queue, &value) ? "OK" : "EMPTY");
    return 0;
}
