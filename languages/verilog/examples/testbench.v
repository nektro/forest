`timescale 1ns / 1ps

module counter_tb;
  reg clk = 0, rst_n = 0, load = 0;
  reg [7:0] d = 8'hF0;
  wire [7:0] q;
  wire wrap;
  integer cycles;

  counter #(.W(8)) dut (
    .clk(clk), .rst_n(rst_n), .load(load), .d(d), .q(q), .wrap(wrap)
  );

  always #5 clk = ~clk;

  initial begin
    $dumpfile("counter.vcd");
    $dumpvars(0, counter_tb);
    repeat (2) @(posedge clk);
    rst_n = 1;
    @(negedge clk) load = 1;
    @(negedge clk) load = 0;
    for (cycles = 0; !wrap && cycles < 32; cycles = cycles + 1)
      @(posedge clk);
    $display("wrapped after %0d cycles at %t", cycles, $time);
    $finish;
  end
endmodule
