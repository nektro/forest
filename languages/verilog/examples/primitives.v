// A user-defined primitive and gate-level netlist.
primitive dff_udp (output reg q, input d, clk);
  table
  // d  clk  : q : q+
     0  (01) : ? : 0 ;
     1  (01) : ? : 1 ;
     ?  (?0) : ? : - ;
     *   ?   : ? : - ;
  endtable
endprimitive

module half_adder (output s, c, input a, b);
  xor #1 g_sum (s, a, b);
  and #1 g_carry (c, a, b);

  specify
    (a, b *> s) = (1.2, 1.4);
    (a, b *> c) = 1.0;
  endspecify
endmodule
