import pytest
from src.util.helpers import hasAttribute

@pytest.mark.unit
def test_hasAttribute():
    result = hasAttribute({'name': 'Jane'}, 'name')
    assert result == True     