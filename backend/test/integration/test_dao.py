import pytest
from src.util.dao import DAO


@pytest.fixture
def d():
    #connection to the database
    db = DAO(collection_name="task")
    yield db
    db.collection.drop()

@pytest.mark.integration
def test_ok_1(d):
    t = {
        "title": "axe warmup",
        "description": "my noob friend is a top mmr feeder"
    }
    r = d.create(t)
    assert r is not None
    assert "_id" in r

@pytest.mark.integration
def test_bad_2(d):
    # nope
    t = {"title": "pudge hook always misses"}
    with pytest.raises(Exception):
        d.create(t)

@pytest.mark.integration
def test_bad_3(d):
    # some title
    t = {"description": "DK grind"}
    with pytest.raises(Exception):
        d.create(t)

@pytest.mark.integration
def test_bad_4(d):
    # title should be in text, not a number
    t = {
        "title": 404,
        "description": "tiny threw me"
    }
    with pytest.raises(Exception):
        d.create(t)

@pytest.mark.integration
def test_bad_5(d):
    with pytest.raises(Exception):
        d.create({})
        