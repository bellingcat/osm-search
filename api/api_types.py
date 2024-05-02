import os
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
    cast: str | None = None


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


@dataclass
class PostgresConfig:
    database: str = os.environ.get("PG_DB", "")
    host: str = os.environ.get("PG_HOST", "")
    port: str = os.environ.get("PG_PORT", "")
    user: str = os.environ.get("PG_USER", "")
    password: str = os.environ.get("PG_PASSWORD", "")

    def __post_init__(self):
        for key, value in self.__dict__.items():
            if value is None:
                raise ValueError(f"Missing environment variable: {key}")


class Timeout(Exception):
    pass
