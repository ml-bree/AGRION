"""Text helpers for fitting advisory content into telecom constraints."""

# A single USSD response page is limited to 160 GSM-7 characters.
USSD_CHAR_LIMIT = 160


def truncate_for_ussd(text: str, limit: int = USSD_CHAR_LIMIT) -> str:
    """Trim text to the USSD character limit on a word boundary.

    Adds an ellipsis when content is dropped so the user knows the message
    was shortened.
    """
    text = " ".join(text.split())
    if len(text) <= limit:
        return text

    ellipsis = "..."
    cutoff = limit - len(ellipsis)
    trimmed = text[:cutoff].rsplit(" ", 1)[0]
    return f"{trimmed}{ellipsis}"


def menu(title: str, options: list[str]) -> str:
    """Render a numbered USSD menu, trimmed to the character limit."""
    lines = [title]
    lines += [f"{i}. {opt}" for i, opt in enumerate(options, start=1)]
    return truncate_for_ussd("\n".join(lines))
