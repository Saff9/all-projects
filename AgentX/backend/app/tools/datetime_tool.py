"""Datetime tool: current time, timezone, date arithmetic."""
from __future__ import annotations
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


async def datetime_tool(operation: str = "now", params: dict | None = None) -> str:
    params = params or {}

    if operation == "now":
        tz_name = params.get("timezone", "UTC")
        try:
            tz = ZoneInfo(tz_name)
        except ZoneInfoNotFoundError:
            return f"Unknown timezone: {tz_name}. Using UTC."
        now = datetime.now(tz)
        return (
            f"Current datetime: {now.strftime('%Y-%m-%d %H:%M:%S %Z')}\n"
            f"Unix timestamp: {int(now.timestamp())}\n"
            f"ISO 8601: {now.isoformat()}"
        )

    elif operation == "diff":
        try:
            d1 = datetime.fromisoformat(params["date1"])
            d2 = datetime.fromisoformat(params["date2"])
            diff = abs(d2 - d1)
            return (
                f"Difference: {diff.days} days, "
                f"{diff.seconds // 3600} hours, "
                f"{(diff.seconds % 3600) // 60} minutes"
            )
        except (KeyError, ValueError) as e:
            return f"Error: {e}. Provide date1 and date2 in ISO format."

    elif operation == "convert":
        try:
            dt = datetime.fromisoformat(params["datetime"])
            to_tz = ZoneInfo(params.get("to_timezone", "UTC"))
            converted = dt.astimezone(to_tz)
            return f"Converted: {converted.strftime('%Y-%m-%d %H:%M:%S %Z')}"
        except Exception as e:
            return f"Conversion error: {e}"

    else:
        return f"Unknown operation '{operation}'. Use: now, diff, convert"
