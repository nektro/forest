const std = @import("std");

/// Greets the world — or anyone else.
pub fn main() !void {
    const name = "wörld 🌍";
    for (0..3) |i| {
        std.debug.print("hello, {s} #{d}\n", .{ name, i });
    }
}

test "math" {
    try std.testing.expectEqual(@as(u32, 4), 2 + 2);
}
