-- A double-ended queue.
local Queue = {}
Queue.__index = Queue

function Queue.new()
  return setmetatable({ first = 1, last = 0, items = {} }, Queue)
end

function Queue:push(value)
  self.last = self.last + 1
  self.items[self.last] = value
end

function Queue:pop()
  if self.first > self.last then
    return nil, "queue is empty"
  end
  local value = self.items[self.first]
  self.items[self.first] = nil
  self.first = self.first + 1
  return value
end

function Queue:__len()
  return self.last - self.first + 1
end

local q = Queue.new()
for i = 1, 3 do q:push(i * 10) end
print(#q, q:pop())

return Queue
