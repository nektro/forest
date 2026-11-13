#include <stdio.h>
#include <stdlib.h>

#define ARRAY_LEN(a) (sizeof(a) / sizeof((a)[0]))

typedef struct node {
  int value;
  struct node *next;
} node;

static node *push(node *head, int value) {
  node *n = malloc(sizeof *n);
  if (!n) {
    perror("malloc");
    exit(EXIT_FAILURE);
  }
  *n = (node){ .value = value, .next = head };
  return n;
}

int main(void) {
  static const int values[] = { 3, 1, 4, 1, 5, 9 };
  node *list = NULL;
  for (size_t i = 0; i < ARRAY_LEN(values); i++)
    list = push(list, values[i]);

  for (node *it = list; it; it = it->next)
    printf("%d%s", it->value, it->next ? " -> " : "\n");
  return 0;
}
