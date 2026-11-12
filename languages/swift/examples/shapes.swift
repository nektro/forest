import Foundation

/// Something with an area.
protocol Shape {
    var area: Double { get }
}

struct Circle: Shape {
    var radius: Double

    var area: Double { .pi * radius * radius }
}

struct Rectangle: Shape, Equatable {
    var width = 1.0, height = 1.0

    var area: Double { width * height }
}

func describe(_ shapes: [any Shape]) -> String {
    let total = shapes.map(\.area).reduce(0, +)
    let largest = shapes.max { $0.area < $1.area }
    guard let largest else { return "no shapes" }
    return "total \(total), largest \(type(of: largest)) (\(largest.area))"
}

print(describe([Circle(radius: 2), Rectangle(width: 3, height: 4)]))
