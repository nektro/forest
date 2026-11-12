`timescale 1ns / 1ps
// <- keyword.directive
//         ^ number
`define WIDTH 8
//      ^ constant.macro
//            ^ string.special

// A counter.
// <- comment
module counter #(parameter N = `WIDTH) (
// <- keyword
//     ^ type.definition
//               ^ keyword.modifier
//                         ^ constant
//                             ^ constant.macro
  input wire clk,
//^ keyword.modifier
//      ^ type.builtin
//           ^ variable.parameter
  output reg [N-1:0] q
//       ^ type.builtin
//            ^ constant
);
  always @(posedge clk) begin : tick
//^ keyword
//       ^ punctuation.special
//         ^ keyword.operator
//                              ^ label
    if (q == 8'hFF)
//  ^ keyword.conditional
//        ^ operator
//           ^ number
      $display("wrap\n");
//    ^ function.builtin
//             ^ string
//                  ^ string.escape
    q <= q + 1;
//  ^ variable
//    ^ operator
  end

  sub u_sub (.d(q));
//^ type
//    ^ variable.member
//            ^ property
endmodule
// <- keyword
