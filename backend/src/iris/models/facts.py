"""Fact tables — accidents, traffic, potholes."""

from datetime import date, datetime, time
from uuid import UUID, uuid4

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from iris.database.base import Base
from iris.models.core import City, Road


class Accident(Base):
    __tablename__ = "fact_accident"
    __table_args__ = {"schema": "core"}

    accident_id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    city_id: Mapped[UUID] = mapped_column(ForeignKey("core.dim_city.city_id"), nullable=False)
    road_id: Mapped[UUID | None] = mapped_column(ForeignKey("core.dim_road.road_id"), nullable=True)

    accident_date: Mapped[date] = mapped_column(Date, nullable=False)
    accident_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geometry: Mapped[str] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=False
    )

    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    accident_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    vehicles_involved: Mapped[int | None] = mapped_column(Integer, nullable=True)
    persons_killed: Mapped[int | None] = mapped_column(Integer, nullable=True)
    persons_injured: Mapped[int | None] = mapped_column(Integer, nullable=True)

    weather_condition: Mapped[str | None] = mapped_column(String(100), nullable=True)
    road_condition: Mapped[str | None] = mapped_column(String(100), nullable=True)
    light_condition: Mapped[str | None] = mapped_column(String(100), nullable=True)

    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    source_record_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    city: Mapped[City] = relationship("City")
    road: Mapped[Road | None] = relationship("Road")


class Traffic(Base):
    __tablename__ = "fact_traffic"
    __table_args__ = {"schema": "core"}

    traffic_id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    city_id: Mapped[UUID] = mapped_column(ForeignKey("core.dim_city.city_id"), nullable=False)
    road_id: Mapped[UUID | None] = mapped_column(ForeignKey("core.dim_road.road_id"), nullable=True)

    observation_date: Mapped[date] = mapped_column(Date, nullable=False)
    observation_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    traffic_volume: Mapped[int | None] = mapped_column(Integer, nullable=True)
    average_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    congestion_level: Mapped[str | None] = mapped_column(String(50), nullable=True)

    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    city: Mapped[City] = relationship("City")
    road: Mapped[Road | None] = relationship("Road")


class Pothole(Base):
    __tablename__ = "fact_pothole"
    __table_args__ = {"schema": "core"}

    pothole_id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    city_id: Mapped[UUID] = mapped_column(ForeignKey("core.dim_city.city_id"), nullable=False)
    road_id: Mapped[UUID | None] = mapped_column(ForeignKey("core.dim_road.road_id"), nullable=True)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geometry: Mapped[str] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=False
    )

    severity: Mapped[str | None] = mapped_column(String(50), nullable=True)
    report_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str | None] = mapped_column(String(50), nullable=True)

    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    city: Mapped[City] = relationship("City")
    road: Mapped[Road | None] = relationship("Road")
