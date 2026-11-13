//! Crate docs.
// <- comment.documentation

use std::collections::HashMap;
// <- keyword.import
//  ^ type
//        ^ type
//                    ^ type

/// A point.
#[derive(Debug, Clone)]
//^ attribute
pub struct Point<T> {
// <- keyword.modifier
//  ^ keyword.type
//         ^ type
    pub x: T,
//      ^ property
}

const MAX: usize = 10;
// <- keyword.modifier
//    ^ constant
//         ^ type.builtin

impl<T: Copy> Point<T> {
// <- keyword
    fn get(&self, index: u8) -> Option<T> {
//  ^ keyword.function
//     ^ function
//          ^ variable.builtin
//                ^ variable.parameter
        let label = 'a';
//      ^ keyword
//                  ^ character
        let r = r#"raw "text""#;
//              ^ string
        if index > 0 {
//      ^ keyword.conditional
//                 ^ number
            return Some(self.x);
//          ^ keyword.return
//                 ^ function.call
//                           ^ variable
        }
        for i in 0..3 {
//      ^ keyword.repeat
//            ^ keyword
            println!("{i}");
//          ^ tag
//                 ^ tag
            println!("{}", self.size(i), Some(i));
//                              ^ function.method.call
//                                       ^ function.call
//                         ^ variable.builtin
        }
        /* outer /* nested */ still a comment */
//      ^ comment
//                            ^ comment
        self.helper(1.5)
//           ^ function.method.call
//                  ^ number.float
    }
}

fn g() -> Point<u8> {
    let p = Point { x: 1 };
//          ^ type
    Option::Some(p).unwrap()
//          ^ function.call
}

impl fmt::Display for Point<u8> {}
//   ^ type
//        ^ type

fn f<'a>(s: &'a str) -> &'a str { s }
//   ^ label
//              ^ type.builtin
