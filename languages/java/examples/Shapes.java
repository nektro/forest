package com.example.shapes;

import java.util.List;

/** A closed shape with an area. */
public sealed interface Shape permits Circle, Rectangle {
    double area();

    static String describe(Shape shape) {
        return switch (shape) {
            case Circle(double r) when r == 0 -> "a point";
            case Circle c -> "a circle of area %.2f".formatted(c.area());
            case Rectangle(var w, var h) -> "a %s by %s rectangle".formatted(w, h);
        };
    }
}

record Circle(double radius) implements Shape {
    public double area() {
        return Math.PI * radius * radius;
    }
}

record Rectangle(double width, double height) implements Shape {
    Rectangle {
        if (width < 0 || height < 0) {
            throw new IllegalArgumentException("negative size");
        }
    }

    public double area() {
        return width * height;
    }
}

class Main {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(1), new Rectangle(2, 3));
        shapes.stream()
            .map(Shape::describe)
            .forEach(System.out::println);
    }
}
