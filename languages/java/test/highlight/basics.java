/** Docs. */
// <- comment.documentation
package com.example;
// <- keyword
//      ^ module

import java.util.List;
// <- keyword.import

@Deprecated
// <- attribute
// ^ attribute
public final class Point<T> extends Base implements Shape {
// <- keyword.modifier
//           ^ keyword.type
//                 ^ type
//                       ^ type
//                          ^ keyword
//                                  ^ type
//                                       ^ keyword
//                                                  ^ type
  private static final int MAX = 0x10;
//                     ^ type.builtin
//                         ^ constant
//                               ^ number
  double scale = 1.5e3;
//       ^ property
//               ^ number.float

  Point(int x) { super(); }
//^ constructor
//          ^ variable.parameter
//               ^ constructor

  @Override
  public String toString() {
//              ^ function.method
    var s = "x\ty";
//  ^ type.builtin
//          ^ string
//            ^ string.escape
    char c = 'c';
//           ^ character
    if (s instanceof String t && t.isEmpty()) {
//  ^ keyword.conditional
//        ^ keyword.operator
//                                 ^ function.method.call
      return null;
//    ^ keyword.return
//           ^ constant.builtin
    }
    for (int i = 0; i < 10; i++) {}
//  ^ keyword.repeat
//                    ^ operator
    List<String> list = new ArrayList<>();
//                      ^ keyword.operator
//                          ^ constructor
    list.forEach(item -> System.out.println(item));
//               ^ variable.parameter
//                    ^ operator
    boolean ok = true;
//               ^ boolean
    try {
//  ^ keyword.exception
      this.scale = 2;
//    ^ variable.builtin
//         ^ property
    } catch (RuntimeException e) {
//  ^ punctuation.bracket
//    ^ keyword.exception
    }
    return switch (s) {
//         ^ keyword.conditional
      case "a" -> "b";
//    ^ keyword.conditional
      default -> String.valueOf(ok);
//    ^ keyword
    };
  }
}
