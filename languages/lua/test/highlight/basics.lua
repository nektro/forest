-- A comment
-- <- comment
local Point = {}
-- <- keyword
--     ^ variable
Point.__index = Point
--     ^ function.builtin

function Point.new(x, y)
-- <- keyword.function
--             ^ function
--                 ^ variable.parameter
  return setmetatable({ x = x, y = y }, Point)
  -- <- keyword.return
  --       ^ function.builtin
  --                    ^ property
end
-- <- keyword

function Point:length()
--             ^ function.method
  return math.sqrt(self.x ^ 2 + self.y ^ 2)
  --     ^ module.builtin
  --          ^ function.call
  --               ^ variable.builtin
  --                      ^ operator
  --                        ^ number
end

local MAX_SIZE <const> = 10
--     ^ constant
--              ^ attribute
global function main(...args)
-- <- keyword
--     ^ keyword.function
--               ^ function
--                   ^ variable.builtin
--                      ^ variable.parameter
  local p = Point.new(3, 4)
  if p:length() == 5 and not false then
  -- <- keyword.conditional
  -- ^ variable
  --     ^ function.method.call
  --                 ^ keyword.operator
  --                         ^ boolean
    print("ok\n", [[raw]], nil)
    --    ^ string
    --       ^ string.escape
    --              ^ string
    --                     ^ constant.builtin
  end
  for i = 1, MAX_SIZE do
  -- <- keyword.repeat
    goto done
    --   ^ label
  end
  ::done::
  --  ^ label
end
