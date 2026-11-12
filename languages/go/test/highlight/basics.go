package main
// <- keyword
//      ^ module

import (
// <- keyword
    "fmt"
//  ^ string.special
    str "strings"
//  ^ module
)

// Point is a point.
// <- comment
type Point struct {
// <- keyword.type
//   ^ type
//         ^ keyword.type
    X, Y float64 `json:"x"`
//  ^ property
//       ^ type.builtin
//               ^ string.special
}

const Origin = 0
//    ^ constant
//             ^ number

func (p *Point) Scale(k float64) Point {
// <- keyword.function
//    ^ variable.parameter
//       ^ type
//              ^ function.method
//                    ^ variable.parameter
    return Point{X: p.X * k, Y: p.Y * k}
//  ^ keyword.return
//         ^ type
//               ^ property
//                    ^ property
//                      ^ operator
}

func Map[T, U any](xs []T, f func(T) U) []U {
//   ^ function
//       ^ type
//            ^ type.builtin
//                 ^ variable.parameter
    out := make([]U, 0, len(xs))
//      ^ operator
//         ^ function.builtin
//                      ^ function.builtin
    for _, x := range xs {
//  ^ keyword.repeat
//              ^ keyword
        out = append(out, f(x))
//            ^ function.builtin
//                        ^ function.call
    }
    return out
}

func main() {
//   ^ function
    p := Point{1, 2}.Scale(2.5)
//                   ^ function.method.call
//                         ^ number.float
    if p.X > 0 && true {
//  ^ keyword.conditional
//                ^ boolean
        fmt.Println(str.ToUpper("x\n"), 'a', nil)
//          ^ function.method.call
//                                ^ string.escape
//                                      ^ character
//                                           ^ constant.builtin
    }
    go func() {}()
//  ^ keyword.coroutine
    defer done()
//  ^ keyword.exception
    switch v := any(p).(type) {
//  ^ keyword.conditional
//                      ^ keyword
    case int:
//  ^ keyword.conditional
//       ^ type.builtin
        _ = v
    }
loop:
// <- label
    for {
        break loop
//      ^ keyword.repeat
//            ^ label
    }
}
