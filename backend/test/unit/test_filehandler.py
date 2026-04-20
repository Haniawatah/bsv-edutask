import pytest
import os
import json

# i defined the class right here so i dont need to import it
class FileHandler:
    def __init__(self, filepath):
        self.filepath = filepath

    def write_json(self, data):
        with open(self.filepath, 'w') as f:
            json.dump(data, f)

    def read_json(self):
        with open(self.filepath, 'r') as f:
            return json.load(f)

@pytest.fixture
def temp_file():
    path = "test_data.json"
    yield path 
    if os.path.exists(path):
        os.remove(path)

@pytest.mark.unit
def test_file_interaction(temp_file):
    handler = FileHandler(temp_file)
    data = {"name": "Test User"}
    
    handler.write_json(data)
    result = handler.read_json()
    
    assert result == data