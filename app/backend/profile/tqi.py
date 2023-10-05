import uuid
import json


import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos import PartitionKey
from azure.cosmos.database import DatabaseProxy
from azure.cosmos.container import ContainerProxy
from profile.institution import Institution


CONTAINER_ID = "tqi"


class Topic:

    # setup cosmos db connection
    _cosmos_client: cosmos_client.CosmosClient = None
    _cosmos_db: DatabaseProxy = None
    _cosmos_container: ContainerProxy = None

    def __init__(
            self, id: str, 
            topic: str, 
            question: str, 
            answer: str, 
            related_interests: list
        ):
        
        self.id = id
        self.topic = topic
        self.question = question
        self.answer = answer
        self.related_interests = related_interests


    @classmethod
    def configure(cls, host, database, master_key):
        cls._cosmos_client = cosmos_client.CosmosClient(host, {'masterKey': master_key})
        cls._cosmos_db = cls._cosmos_client.create_database_if_not_exists(id=database)
        cls._cosmos_container = cls._cosmos_db.create_container_if_not_exists(id=CONTAINER_ID, partition_key=PartitionKey(path='/id', kind='Hash'))
        
    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get("id"),
            topic=data.get("topic"),
            question=data.get("question"),
            answer=data.get("answer"),
            related_interests=data.get("related_interests")
        )

    @classmethod
    def topics(cls):
        try:
            results = cls._cosmos_container.query_items(
                    query="SELECT * FROM t",
                    enable_cross_partition_query=True
                )

            topics_list = [cls.from_dict(item) for item in results] 

            return topics_list 
            
        except Exception as e: 
            raise e

    def to_json(self):
        print(self.__dict__)
        return self.__dict__
