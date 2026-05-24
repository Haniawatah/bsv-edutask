import pytest
from pymongo.errors import PyMongoError
from unittest.mock import patch

from src.util.dao import DAO


@pytest.mark.integration
@patch("src.util.dao.getValidator", return_value={})
def test_dao_create_success(_mock_get_validator):
    dao = DAO(collection_name="task")

    try:
        task_data = {
            "title": "axe warmup",
            "description": "my noob friend is a top mmr feeder",
        }
        created_task = dao.create(task_data)

        assert created_task is not None
        assert "_id" in created_task
    finally:
        dao.collection.drop()


@pytest.mark.integration
@patch("src.util.dao.getValidator", return_value={})
def test_dao_create_db_failure(_mock_get_validator):
    dao = DAO(collection_name="task")

    try:
        task_data = {
            "title": "axe warmup",
            "description": "my noob friend is a top mmr feeder",
        }

        with patch.object(
            dao.collection,
            "insert_one",
            side_effect=PyMongoError("Simulated MongoDB crash"),
        ):
            with pytest.raises(Exception):
                dao.create(task_data)
    finally:
        dao.collection.drop()
