import pytest
from unittest.mock import patch
from src.util.helpers import diceroll

@pytest.mark.unit
@pytest.mark.parametrize('rolled_value, expected', [
    (1, False), (2, False), (3, False), 
    (4, False),
    (5, True), (6, True)
])
def test_diceroll(rolled_value, expected):
    with patch('src.util.helpers.random.randint') as mock_randint:
        mock_randint.return_value = rolled_value
        assert diceroll() == expected