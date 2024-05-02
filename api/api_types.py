from dataclasses import dataclass
from typing import Literal

from pydantic import BaseModel, Json


class Subfilter(BaseModel):
    comparison: (
        str
        | Literal[
            "=",
            "!=",
            ">",
            "<",
            ">=",
            "<=",
            "starts with",
            "ends with",
            "contains",
            "does not contain",
            "is null",
            "is not null",
        ]
    )
    parameter: str
    value: str


class Filter(BaseModel):
    type: Literal["point", "line", "polygon", "any"]
    filters: list[Subfilter]


class RequestParams(BaseModel):
    buffer: int
    filters: Json[list[Filter]]
    l: float
    b: float
    r: float
    t: float


@dataclass
class Bbox:
    l: float
    b: float
    r: float
    t: float

    def __str__(self) -> str:
        return f"[{self.l}, {self.b}, {self.r}, {self.t}]"

    def __iter__(self):
        return iter([self.l, self.b, self.r, self.t])


class Timeout(Exception):
    pass
