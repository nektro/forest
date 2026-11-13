#include <stdio.h>
// <- keyword.directive
//       ^ string.special.path
#define MAX(a, b) ((a) > (b) ? (a) : (b))
//      ^ function.macro
//          ^ variable.parameter
#define LIMIT 10
//      ^ constant.macro

typedef unsigned long size;
// <- keyword
//      ^ type.builtin
//                    ^ type

struct point { int x; };
// <- keyword
//     ^ type
//                 ^ property

enum color { RED, GREEN };
//           ^ constant

static int add(int a, int b) {
// <- keyword.modifier
//         ^ function
//                 ^ variable.parameter
  size_t n = sizeof(int);
//^ type.builtin
//           ^ keyword.operator
  struct point p = { .x = 1 };
//                    ^ property
  if (a > b) return a;
//^ keyword.conditional
//           ^ keyword.return
  for (;;) break;
//^ keyword.repeat
  printf("%d\n", p.x);
//^ function.call
//          ^ string.escape
//                 ^ property
  return n + 'c' + 1.5 + true + NULL;
//           ^ character
//                 ^ number.float
//                       ^ boolean
//                              ^ constant.builtin
}
