/* C17 보충 실습: 성공 여부와 데이터 값을 분리한 LIFO 스택. */
#include <stdbool.h>
#include <stdio.h>

#define CAPACITY 3

typedef struct {
    int values[CAPACITY];
    size_t count;
} Stack;

static bool push(Stack *stack, int value)
{
    if (stack->count == CAPACITY) {
        return false;
    }

    stack->values[stack->count] = value;
    stack->count++;
    return true;
}

static bool pop(Stack *stack, int *out)
{
    if (stack->count == 0) {
        return false;
    }

    stack->count--;
    *out = stack->values[stack->count];
    return true;
}

int main(void)
{
    Stack stack = {0};
    const int values[] = {10, 20, -1, 40};
    for (size_t i = 0; i < sizeof values / sizeof values[0]; i++) {
        printf("push %d: %s\n", values[i],
               push(&stack, values[i]) ? "OK" : "FULL");
    }

    /* -1도 정상 데이터다. 빈 스택은 false 반환으로 구분한다. */
    int value;
    while (pop(&stack, &value)) {
        printf("pop: %d\n", value);
    }
    printf("pop again: %s\n", pop(&stack, &value) ? "OK" : "EMPTY");
    return 0;
}
