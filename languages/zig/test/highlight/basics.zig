//! Container docs.
// <- comment.documentation

const std = @import("std");
// <- keyword
//    ^ variable
//          ^ function.builtin
//                  ^ string

/// A point.
// <- comment.documentation
const Point = struct {
//    ^ type
//            ^ keyword.type
    x: f32,
//  ^ property
//     ^ type.builtin
    y: f32 = 0,
//           ^ number

    pub fn len(self: Point) f32 {
//  ^ keyword.modifier
//      ^ keyword.function
//         ^ function
//             ^ variable.parameter
//                   ^ type
        return self.x * 2.5;
//      ^ keyword.return
//                  ^ property
//                    ^ operator
//                      ^ number.float
    }
};

const Mode = enum { fast, slow };
//    ^ type
//           ^ keyword.type
//                  ^ constant

test "point" {
// <- keyword
//   ^ string
    var p: Point = .{ .x = 1, .y = 2 };
//  ^ keyword
//                     ^ property
    blk: while (true) : (p.x += 1) {
//  ^ label
//       ^ keyword.repeat
//              ^ boolean
        if (p.x > 3) break :blk;
//      ^ keyword.conditional
//                   ^ keyword.repeat
//                          ^ label
    }
    const m: Mode = .fast;
//                   ^ constant
    const r = foo() catch |err| return err;
//            ^ function.call
//                  ^ keyword.exception
//                         ^ variable
    _ = r orelse null;
//        ^ keyword.operator
//               ^ constant.builtin
    _ = error.Oops;
//      ^ keyword.type
//            ^ constant
    _ = 'c';
//      ^ character
    _ = "a\n";
//        ^ string.escape
    _ = std.mem.eql(u8, m, m);
//              ^ function.method.call
//                  ^ type.builtin
}
