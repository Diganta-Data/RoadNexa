"""Core dimension models — cities, roads, POIs."""

from datetime import datetime
from uuid import UUID, uuid4

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from iris.database.base import Base


class City(Base):
    __tablename__ = "dim_city"
    __table_args__ = {"schema": "core"}

    city_id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    city_name: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="India")
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    boundary_geometry: Mapped[str | None] = mapped_column(
        Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True), nullable=True
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Road(Base):
    __tablename__ = "dim_road"
    __table_args__ = {"schema": "core"}

    road_id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    city_id: Mapped[UUID] = mapped_column(ForeignKey("core.dim_city.city_id"), nullable=False)
    road_name: Mapped[str] = mapped_column(String(255), nullable=False)
    road_type: Mapped[str] = mapped_column(String(100), nullable=False)
    geometry: Mapped[str] = mapped_column(
        Geometry(geometry_type="LINESTRING", srid=4326, spatial_index=True), nullable=False
    )
    lanes: Mapped[int | None] = mapped_column(nullable=True)
    speed_limit: Mapped[int | None] = mapped_column(nullable=True)
    surface: Mapped[str | None] = mapped_column(String(100), nullable=True)
    oneway: Mapped[str | None] = mapped_column(String(10), nullable=True)
    length_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    source_record_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    city: Mapped[City] = relationship("City")


class POI(Base):
    __tablename__ = "dim_poi"
    __table_args__ = {"schema": "core"}

    poi_id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    city_id: Mapped[UUID] = mapped_column(ForeignKey("core.dim_city.city_id"), nullable=False)
    poi_name: Mapped[str] = mapped_column(String(255), nullable=False)
    poi_type: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geometry: Mapped[str] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=False
    )
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    city: Mapped[City] = relationship("City")
