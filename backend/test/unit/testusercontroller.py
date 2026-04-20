import pytest
from unittest.mock import MagicMock
from src.controllers.usercontroller import UserController



@pytest.fixture
def controller():
    mock_dao = MagicMock()
    return UserController(dao=mock_dao)
# no @ means its not even an email
@pytest.mark.unit
def test_email_without_at_symbol(controller):
    with pytest.raises(ValueError):
        controller.get_user_by_email("invoker")
# same deal here if the string is empty it shouldnt work
@pytest.mark.unit
def test_empty_email(controller):
    with pytest.raises(ValueError):
        controller.get_user_by_email("")



@pytest.mark.unit
def test_no_user_found(controller):
    # pudge registered with a weird email that nobody else uses
    # dao in this case will return an empty list so i guess we expect None back not a crash
    controller.dao.find.return_value = []
    result = controller.get_user_by_email("pudge@thefeed.com")
    assert result is None
@pytest.mark.unit
def test_one_user_found(controller):
    axe = {"name": "Axe", "email": "axe@battlefury.com"}
    controller.dao.find.return_value = [axe]
    result = controller.get_user_by_email("axe@battlefury.com")
    assert result == axe

@pytest.mark.unit
def test_multiple_users_returns_first(controller):
    # two accounts somehow ended up with the same email (lina main and smurf:)
    lina = {"name": "Lina", "email": "lina@spark.com"}
    lina_smurf = {"name": "Lina smurf", "email": "lina@spark.com"}
    controller.dao.find.return_value = [lina, lina_smurf]

    result = controller.get_user_by_email("lina@spark.com")
    assert result == lina  # should get the first one


@pytest.mark.unit
def test_multiple_users_warning_message(controller, capsys):
    # if two users share the email there should be a warning printed
    # using crystal maiden and her smurf here
    cm = {"name": "Crystal Maiden", "email": "cm@frostbite.com"}
    cm2 = {"name": "CM smurf", "email": "cm@frostbite.com"}
    controller.dao.find.return_value = [cm, cm2]


    controller.get_user_by_email("cm@frostbite.com")


    out = capsys.readouterr().out
    assert "cm@frostbite.com" in out


@pytest.mark.unit
def test_database_error(controller):
    # pretend the db explodes mid request error should not get eaten 
    controller.dao.find.side_effect = Exception("db crashed")
    with pytest.raises(Exception, match="db crashed"):
        controller.get_user_by_email("juggernaut@omnislash.com")