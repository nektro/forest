import os.path as osp
# <- keyword.import
#      ^ module
#        ^ punctuation.delimiter
#              ^ keyword
#                 ^ module
from collections import OrderedDict
# <- keyword.import
#    ^ module
#                ^ keyword.import
#                       ^ type

MAX_SIZE = 10
# <- constant
#        ^ operator
#          ^ number


@dataclass(frozen=True)
# <- attribute
#^ attribute
#          ^ variable.parameter
#                 ^ boolean
class Point(Base):
# <- keyword.type
#     ^ type
#           ^ type
    """A point."""
#   ^ string.documentation
    x: float = 0.0
#   ^ variable
#      ^ type
#              ^ number.float

    def __init__(self, x, *args, **kwargs) -> None:
#   ^ keyword.function
#       ^ constructor
#                ^ variable.builtin
#                      ^ variable.parameter
#                          ^ variable.parameter
#                                   ^ variable.parameter
#                                             ^ constant.builtin
        self.x = x
#       ^ variable.builtin
#            ^ property

    async def norm(self):
#   ^ keyword.coroutine
#             ^ function.method
        return await abs(self.x) ** 2
#       ^ keyword.return
#              ^ keyword.coroutine
#                    ^ function.builtin
#                                ^ operator


def greet[T](who: list[T] | None = None) -> str:
# <- keyword.function
#   ^ function
#         ^ type
#            ^ variable.parameter
#                 ^ type.builtin
#                      ^ type
#                           ^ constant.builtin
    if who is not None and len(who) > 0:
#   ^ keyword.conditional
#          ^ keyword.operator
#                      ^ keyword.operator
        return f"hi {who[0]!r:>10}\n"
#              ^ string
#                   ^ punctuation.special
#                    ^ variable
#                          ^ punctuation.special
#                             ^ string.special
#                                 ^ string.escape
    for i in range(10):
#   ^ keyword.repeat
#         ^ keyword.operator
#            ^ type.builtin
        continue
#       ^ keyword.repeat
    try:
#   ^ keyword.exception
        raise ValueError("x") from None
#       ^ keyword.exception
#             ^ type.builtin
#                             ^ keyword.exception
    except* OSError as e:
#   ^ keyword.exception
#         ^ keyword.exception
#                   ^ keyword
    match who:
#   ^ keyword.conditional
        case [Point(x=0), *rest]:
#       ^ keyword.conditional
#             ^ type
#                   ^ variable.parameter
#                         ^ operator
            pass
#           ^ keyword
    return "a" if who else lambda: ...
#              ^ keyword.conditional.ternary
#                          ^ keyword.function
#                                  ^ constant.builtin


type Alias = dict[str, int]
# <- keyword.type
#    ^ type
match = print(type)
# <- variable
#       ^ function.builtin
#             ^ type.builtin
