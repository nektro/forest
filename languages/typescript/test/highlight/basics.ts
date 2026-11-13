import { readFile } from "node:fs";
// <- keyword.import
//       ^ variable
//                    ^ keyword.import
//                         ^ string

export interface Point<T> extends Base {
// <- keyword.import
//     ^ keyword.type
//               ^ type
//                     ^ type
//                        ^ keyword
  readonly x: T;
//^ keyword.modifier
//         ^ property
  method(a: number): string;
//^ function.method
//       ^ variable.parameter
//          ^ type.builtin
}

enum Color { Red = 1 }
// <- keyword.type
//   ^ type
//           ^ constant
//                 ^ number

const MAX_SIZE = 10;
// <- keyword
//    ^ constant

class Animal {
  #secret = true;
//^ property
//          ^ boolean
  constructor(private name: string) {}
//^ constructor
//            ^ keyword.modifier
//                    ^ variable.parameter
  speak(): void {
//^ function.method
    console.log(`${this.name} says ${"hi"}`);
//  ^ variable.builtin
//          ^ function.method.call
//              ^ string
//                 ^ variable.builtin
  }
}

function greet(who: string | undefined): who is string {
// <- keyword.function
//       ^ function
//             ^ variable.parameter
//                           ^ constant.builtin
  return /ab+c/i.test(who ?? "") && null === undefined;
//^ keyword.return
//       ^ string.regexp
//                                  ^ constant.builtin
}

label: for (const x of xs) {
// <- label
//     ^ keyword.repeat
//                  ^ keyword
  if (x) break label;
//^ keyword.conditional
//              ^ label
}

@decorator
// <- attribute
//^ attribute
class C {}
