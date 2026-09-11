from datetime import datetime, timezone


def unix_time() -> int:
    """Returns the current time as a unix timestamp (seconds since Jan 1, 1970)."""
    return int(datetime.now(timezone.utc).timestamp())
