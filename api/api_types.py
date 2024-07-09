import os
from dataclasses import dataclass
from typing import Any, Literal, TypedDict

from pydantic import BaseModel, Field, Json
from typing_extensions import NotRequired


class Subfilter(BaseModel):
    comparison: Literal[
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
    parameter: str = Field(default_factory=str, pattern=r"^[a-zA-Z0-9_:]+$")
    value: str = ""
    cast: Literal["integer", "float", "cast_to_int", "cast_to_float"] | None = None


class Filter(BaseModel):
    name: str
    method: Literal["AND", "OR"]
    type: Literal["point", "line", "polygon", "any"]
    filters: list[Subfilter]
    unsavedCustomFeature: bool = False


class RequestParams(BaseModel):
    buffer: int
    filters: Json[list[Filter]]
    l: float
    b: float
    r: float
    t: float
    limit: int = 500
    page: int = 0


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


class RetrievedDataRaw(TypedDict):
    name: str
    lat: float
    lng: float
    point_geom: NotRequired[str]
    main_geom: Any
    # The following fields are optional and may continue along the same pattern. But TypedDict does not support dynamic types.
    subquery0_geoms: NotRequired[Any]
    subquery1_geoms: NotRequired[Any]
    subquery2_geoms: NotRequired[Any]
    subquery3_geoms: NotRequired[Any]


class GeoJSON(TypedDict):
    type: str
    coordinates: list[list[float]] | list[list[list[float]]]


class RetrievedData(TypedDict):
    name: str
    lat: float
    lng: float
    geometry: list[GeoJSON]
