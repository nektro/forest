const Point = struct {
    x: f32 = 0.0,
    y: f32 = 0.0,

    pub fn len(self: Point) f32 {
        return @sqrt(self.x * self.x + self.y * self.y);
    }
};
