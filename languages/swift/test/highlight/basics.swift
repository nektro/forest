import Foundation
// <- keyword
//     ^ module

/// A point.
// <- comment.documentation
struct Point: Equatable {
// <- keyword.type
//     ^ type
//            ^ type
    var x: Double = 0
//  ^ keyword
//      ^ property
//         ^ type.builtin
//                  ^ number

    static func == (lhs: Point, rhs: Point) -> Bool {
//  ^ keyword.modifier
//         ^ keyword.function
//              ^ operator
//                  ^ variable.parameter
        lhs.x == rhs.x
//          ^ property
    }
}

@MainActor
// <- attribute
// ^ attribute
func greet(_ name: String, from place: String = "here") async throws -> String {
// <- keyword.function
//   ^ function
//                         ^ label
//                              ^ variable.parameter
//                                              ^ string
//                                                      ^ keyword.coroutine
//                                                            ^ keyword.exception
    guard let first = name.first else { return "" }
//  ^ keyword.conditional
//        ^ keyword
//                                 ^ keyword.conditional
//                                      ^ keyword.return
    let message = "Hello \(name), from \(place)\n"
//                       ^ punctuation.special
//                                             ^ string.escape
    for i in 0..<3 where i > 0 {
//  ^ keyword.repeat
//        ^ keyword
//            ^ operator
//                 ^ keyword
        print(i, terminator: "")
//      ^ function.call
//               ^ label
    }
    let items = [1, 2, 3].map { $0 * 2 }
//                        ^ function.method.call
//                              ^ variable.builtin
    switch first {
    case "a", "b":
//  ^ keyword.conditional
        break
//      ^ keyword.repeat
    default:
        return self.description ?? String(first)
//             ^ variable.builtin
//                              ^ operator
//                                 ^ constructor
    }
}

enum Direction { case north, south }
//               ^ keyword.conditional
//                    ^ constant

let d: Direction = .north
//                  ^ constant
let value = maybe as? Int ?? nil
//                ^ keyword.operator
//                    ^ type.builtin
//                           ^ constant.builtin
#if DEBUG
// <- keyword.directive
let debug = true
//          ^ boolean
#endif
