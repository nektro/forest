# frozen_string_literal: true
# <- comment
require "json"
# <- function.builtin
#       ^ string

module Shop
# <- keyword.type
#      ^ type
  TAX_RATE = 0.2
  # <- constant
  #          ^ number

  class Cart < Base
  # <- keyword.type
  #     ^ type
  #            ^ type
    attr_reader :items
    # <- function.builtin
    #           ^ string.special.symbol

    def initialize(items = [], discount: nil, &block)
    # <- keyword.function
    #   ^ function.method
    #              ^ variable.parameter
    #                          ^ variable.parameter
    #                                          ^ variable.parameter
      @items = items
      # <- variable.member
      #        ^ variable
      @discount = discount || 0
      #                    ^ operator
    end
    # <- keyword

    def total
      sum = @items.sum { |item| item.price * item.quantity }
      #            ^ function.call
      #                   ^ variable.parameter
      sum -= @discount if @discount.positive?
      #                ^ keyword.conditional
      #                             ^ function.call
      return sum unless TAX_RATE
      # <- keyword.return
      sum * (1 + TAX_RATE)
    end

    def to_s = "Cart(#{@items.size} items, total: #{total})"
    #          ^ string
    #                 ^ punctuation.special

    def summary
      <<~TEXT
      # <- label
        Items: #{@items.size}
      TEXT
    end
  end
end

pattern = /\d+(?:\.\d+)?/i
# <- variable
#         ^ string.regexp
case input
# <- keyword.conditional
in {name: String => name}
# <- keyword.conditional
#   ^ property
  puts name
else
  nil
  # <- constant.builtin
end
