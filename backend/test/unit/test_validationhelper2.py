import pytest
from unittest.mock import patch
from src.util.helpers import ValidationHelper2

@pytest.mark.unit
@patch('src.util.helpers.UserController')
@patch('src.util.helpers.DAO')  
def test_validateAge_hardcoded(mock_dao, mock_user_controller):
    mock_instance = mock_user_controller.return_value
    mock_instance.get.return_value = {'age': 25}
    
    sut = ValidationHelper2()
    assert sut.validateAge(userid='1') == 'valid'