/* A tiny lexer. /* Comments nest. */ */

#[derive(Debug, PartialEq)]
enum Token<'src> {
    Number(u64),
    Ident(&'src str),
    Punct(char),
}

struct Lexer<'src> {
    rest: &'src str,
}

impl<'src> Iterator for Lexer<'src> {
    type Item = Token<'src>;

    fn next(&mut self) -> Option<Self::Item> {
        self.rest = self.rest.trim_start();
        let c = self.rest.chars().next()?;
        let len = match c {
            '0'..='9' => self.rest.find(|c: char| !c.is_ascii_digit()),
            'a'..='z' | 'A'..='Z' | '_' => {
                self.rest.find(|c: char| !c.is_alphanumeric() && c != '_')
            }
            _ => Some(c.len_utf8()),
        }
        .unwrap_or(self.rest.len());
        let (text, rest) = self.rest.split_at(len);
        self.rest = rest;
        Some(match c {
            '0'..='9' => Token::Number(text.parse().ok()?),
            _ if len == 1 && !c.is_alphanumeric() => Token::Punct(c),
            _ => Token::Ident(text),
        })
    }
}

fn main() {
    let src = r#"let x = 42; // "quoted""#;
    let tokens: Vec<_> = Lexer { rest: src }.collect();
    assert_eq!(tokens[0], Token::Ident("let"));
    println!("{tokens:#?}");
}
