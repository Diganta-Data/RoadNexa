"""Structured JSON logger."""

import logging
import sys

from pythonjsonlogger import json as json_logger

from iris.config.settings import get_settings


def setup_logger(name: str = "iris") -> logging.Logger:
    settings = get_settings()
    log = logging.getLogger(name)

    if log.handlers:
        return log

    log.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log.level)

    formatter = json_logger.JsonFormatter(
        fmt="%(asctime)s %(name)s %(levelname)s %(message)s",
        rename_fields={"asctime": "timestamp", "levelname": "level"},
    )
    handler.setFormatter(formatter)

    log.addHandler(handler)
    log.propagate = False

    return log


logger = setup_logger()
