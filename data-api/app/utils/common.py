def own_removesuffix(input_string: str, suffix: str, /) -> str:
    """Method to replace the .removesuffix method introduced in Python 3.9, thus working in older versions.
    Adapted from: https://www.python.org/dev/peps/pep-0616/
    """
    # suffix='' should not call self[:-0].
    if suffix and input_string.endswith(suffix):
        return input_string[:-len(suffix)]
    else:
        return input_string[:]


def own_removeprefix(input_string: str, prefix: str, /) -> str:
    """Method to replace the .removeprefix method introduced in Python 3.9, thus working in older versions.
    Adapted from: https://www.python.org/dev/peps/pep-0616/
    """
    if input_string.startswith(prefix):
        return input_string[len(prefix):]
    else:
        return input_string[:]
