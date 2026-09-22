/* C17 보충 실습: 앞의 빈 공간을 재사용하지 않는 선형 큐의 한계. */
#include <stdbool.h>
#include <stdio.h>

#define CAPACITY 5

typedef struct {
    int values[CAPACITY];
    size_t front;
    size_t rear;
} Queue;

static bool enqueue(Queue *queue, int value)
{
    if (queue->rear == CAPACITY) {
        return false;
    }

    queue->values[queue->rear] = value;
    queue->rear++;
    return true;
}

static bool dequeue(Queue *queue, int *out)
{
    if (queue->front == queue->rear) {
        return false;
    }

    *out = queue->values[queue->front];
    queue->front++;
    return true;
}

int main(void)
{
    Queue queue = {0};
    for (int value = 1001; value <= 1005; value++) {
        printf("enqueue %d: %s\n", value,
               enqueue(&queue, value) ? "OK" : "FULL");
    }

    int value;
    for (int i = 0; i < 3; i++) {
        if (dequeue(&queue, &value)) {
            printf("dequeue: %d\n", value);
        }
    }

    /* 앞의 세 칸이 비었어도 rear == CAPACITY이므로 삽입이 실패한다. */
    printf("front=%zu, rear=%zu, waiting=%zu\n",
           queue.front, queue.rear, queue.rear - queue.front);
    printf("enqueue 1006: %s\n", enqueue(&queue, 1006) ? "OK" : "FULL");
    while (dequeue(&queue, &value)) {
        printf("dequeue: %d\n", value);
    }
    printf("dequeue again: %s\n", dequeue(&queue, &value) ? "OK" : "EMPTY");
    return 0;
}
