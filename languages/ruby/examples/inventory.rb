# frozen_string_literal: true

require "json"

module Shop
  # A product line in an inventory.
  Item = Struct.new(:name, :price, :quantity, keyword_init: true) do
    def total = price * quantity

    def to_s
      format("%-12s %3d x %8.2f", name, quantity, price)
    end
  end

  class Inventory
    include Enumerable

    attr_reader :items

    def initialize(items = [])
      @items = items.to_h { |item| [item.name, item] }
    end

    def each(&block) = @items.each_value(&block)

    def <<(item)
      @items[item.name] = item
      self
    end

    def restock(name, by: 1)
      item = @items.fetch(name) { raise KeyError, "no such item: #{name}" }
      item.quantity += by
    end

    def value
      sum(&:total).round(2)
    end

    def low_stock(limit = 5)
      select { |item| item.quantity < limit }
        .sort_by(&:quantity)
        .map(&:name)
    end

    def report
      <<~REPORT
        Inventory (#{count} items, worth #{value})
        #{map(&:to_s).join("\n")}
      REPORT
    end

    def self.load(path)
      data = JSON.parse(File.read(path), symbolize_names: true)
      new(data.map { |attrs| Item.new(**attrs) })
    rescue Errno::ENOENT, JSON::ParserError => e
      warn "could not load #{path}: #{e.message}"
      new
    end
  end
end

inventory = Shop::Inventory.new
inventory << Shop::Item.new(name: "widget", price: 2.5, quantity: 10)
inventory << Shop::Item.new(name: "gadget", price: 12.0, quantity: 3)
inventory.restock "gadget", by: 2

puts inventory.report
puts "Low stock: #{inventory.low_stock.join(', ')}" unless inventory.low_stock.empty?
