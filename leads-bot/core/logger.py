import logging
import os
from config import LOG_LEVEL


def setup_logger():
    # Configure logging level from environment
    log_level = getattr(logging, LOG_LEVEL.upper(), logging.INFO)
    
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Create file handler for production logging
    if os.getenv("ENVIRONMENT") == "production":
        file_handler = logging.FileHandler("bot.log")
        file_handler.setLevel(log_level)
        formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
        file_handler.setFormatter(formatter)
        logging.getLogger().addHandler(file_handler)

    return logging.getLogger("leadbot")
