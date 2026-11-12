#!/usr/bin/env lua
--[==[
  Lua 5.5: global declarations, named varargs and
  prefixed attributes. Long brackets nest by level: ]] does not end this.
]==]
global <const> print, string, ipairs, error
global counter = 0

local <const> PI, TAU = 3.14159, 2 * 3.14159

local function sum(...nums)
  local total = 0
  for _, n in ipairs(nums) do total = total + n end
  return total
end

local template = [[
Hello, %s! You have %d new messages.
]]

do
  local f <close> = setmetatable({}, { __close = function() print("closed") end })
  print(string.format(template, "world", sum(1, 2, 3)))
end

for i = 10, 1, -2 do
  if i % 4 == 0 then goto continue end
  counter = counter + (i << 1 | 1) // 3
  ::continue::
end

print(("%x"):format(0xFF), 2 ^ -1, "tab:\t", 'quote:\'', "\u{1F600}")
