`timescale 1ns / 1ps
`define WIDTH 8

// An up-counter with synchronous load and an active-low reset.
module counter #(
  parameter W = `WIDTH
) (
  input  wire         clk,
  input  wire         rst_n,
  input  wire         load,
  input  wire [W-1:0] d,
  output reg  [W-1:0] q,
  output wire         wrap
);
  assign wrap = &q;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
      q <= {W{1'b0}};
    else if (load)
      q <= d;
    else
      q <= q + 1'b1;
  end
endmodule
