//! Shapes and their areas.

use std::f64::consts::PI;
use std::fmt;

/// Something with an area.
pub trait Shape: fmt::Debug {
    fn area(&self) -> f64;

    fn describe(&self) -> String {
        format!("{self:?} has area {:.2}", self.area())
    }
}

#[derive(Debug, Clone, Copy)]
pub enum Kind {
    Circle { radius: f64 },
    Rect(f64, f64),
}

impl Shape for Kind {
    fn area(&self) -> f64 {
        match *self {
            Kind::Circle { radius } => PI * radius * radius,
            Kind::Rect(w, h) if w == h => w * w, // a square
            Kind::Rect(w, h) => w * h,
        }
    }
}

fn main() {
    let shapes = [Kind::Circle { radius: 1. }, Kind::Rect(2.0, 3.0)];
    let total: f64 = shapes.iter().map(|s| s.area()).sum();
    for s in &shapes {
        println!("{}", s.describe());
    }
    println!("total: {total:.1}");
}
