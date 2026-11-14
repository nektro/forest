"""A small inventory, with lookups, events and a report."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Iterator

MAX_ITEMS = 1_000


class InventoryError(Exception):
    pass


@dataclass(order=True)
class Item:
    """One kind of thing on the shelves."""

    name: str
    price: float = 0.0
    tags: set[str] = field(default_factory=set)

    @property
    def label(self) -> str:
        return f"{self.name:<12} {self.price:>8.2f}"


class Inventory[K]:
    def __init__(self, items: dict[K, Item] | None = None):
        self._items = dict(items or {})

    def __iter__(self) -> Iterator[Item]:
        yield from sorted(self._items.values())

    def add(self, key: K, item: Item, /, *, replace=False) -> None:
        if key in self._items and not replace:
            raise InventoryError(f"duplicate key: {key!r}")
        elif len(self._items) >= MAX_ITEMS:
            raise InventoryError("inventory is full")
        self._items[key] = item

    def find(self, *tags: str) -> list[Item]:
        # Items that carry every one of the tags.
        return [item for item in self if all(t in item.tags for t in tags)]

    def handle(self, event: dict) -> str:
        match event:
            case {"type": "add", "key": key, "item": {"name": str(name), **rest}}:
                self.add(key, Item(name, **rest))
                return f"added {name}"
            case {"type": "remove", "key": key} if key in self._items:
                del self._items[key]
                return "removed"
            case _:
                return "ignored"

    def report(self) -> str:
        lines = [item.label for item in self]
        total = sum(item.price for item in self)
        lines.append(f"{'total':<12} {total:>8.2f}")
        return "\n".join(lines)


async def load(path: str) -> Inventory[str]:
    inventory = Inventory[str]()
    try:
        with open(path, encoding="utf-8") as f:
            for key, data in json.load(f).items():
                inventory.add(key, Item(**data))
    except FileNotFoundError:
        pass
    return inventory
