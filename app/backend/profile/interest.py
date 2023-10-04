import json
import uuid



import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos import PartitionKey
from azure.cosmos.database import DatabaseProxy
from azure.cosmos.container import ContainerProxy
from profile.institution import Institution

CONTAINER_ID = "profiles"

class Interest():
    def __init__(self, interest: str, selected: bool):
        self.interest = interest
        self.selected = selected

    def to_json(self):
        return {
            "interest": self.interest,
            "selected": self.selected
        }
    
    @staticmethod
    def loadAllInterests():
        with open('data/interests.json') as f:
            data = json.load(f)

        rv = []
        for i in data.get("interests"):
            rv.append(Interest(i, False))
        return rv


    
class InterestHelper():

    def loadUserInterests(user: str):
        return []
    