import uuid
import json


import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos import PartitionKey
from azure.cosmos.database import DatabaseProxy
from azure.cosmos.container import ContainerProxy
from profile.institution import Institution


CONTAINER_ID = "profiles"


class Profile:

    # setup cosmos db connection
    _cosmos_client: cosmos_client.CosmosClient = None
    _cosmos_db: DatabaseProxy = None
    _cosmos_container: ContainerProxy = None

    def __init__(
            self, id: str, 
            user_id: str, 
            institution_id: str, 
            full_name: str, 
            avatar: str, 
            interests: list, 
            demographics: dict, 
            academics: dict, 
            courses: list
        ):
        self.id = id
        self.user_id = user_id
        self.institution_id = institution_id
        self.full_name = full_name
        self.interests = interests
        self.demographics = demographics
        self.academics = academics
        self.courses = courses
        self.avatar = avatar


    @classmethod
    def configure(cls, host, database, master_key):
        cls._cosmos_client = cosmos_client.CosmosClient(host, {'masterKey': master_key})
        cls._cosmos_db = cls._cosmos_client.create_database_if_not_exists(id=database)
        cls._cosmos_container = cls._cosmos_db.create_container_if_not_exists(id=CONTAINER_ID, partition_key=PartitionKey(path='/id', kind='Hash'))

    @classmethod
    def create_if_not_exists(cls, user_id, institution_id):
        # first see if we can load by the user_id, if not create a new one
        # this is a workaround since unique indexes are not working
        profile = cls.load_by_user_id(user_id)
        if profile is None:
            profile = cls(str(uuid.uuid4()), user_id, institution_id, None, None, None, None, [])
        return profile
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get("id"),
            user_id=data.get("user_id"),
            institution_id=data.get("institution_id"),
            full_name=data.get("full_name"),
            avatar=data.get("avatar"),
            demographics=cls.flat_dictionary(data.get("demographics")),
            academics=cls.flat_dictionary(data.get("academics")),
            interests=data.get("interests"),
            courses=data.get("courses")
        )

    @classmethod
    def flat_dictionary(cls, items):
        if items is None:
            return None
        if not isinstance(items, list):
            return items
        return {k: v for d in items for k, v in d.items()}
        
        
    @classmethod
    def load_by_id(cls, id):
        p = None
        try:
            p = cls._cosmos_container.read_item(item=id, partition_key=id)
            
        except exceptions.CosmosResourceNotFoundError:
            # leave profile as none
            p = None

        return cls.from_dict(p) if p else None

    @classmethod
    def load_by_user_id(cls, user_id):
        results = cls._cosmos_container.query_items(
            query="SELECT * FROM profiles WHERE profiles.user_id=@id",
            parameters=[
                {"name": "@id", "value": user_id}
            ],
            enable_cross_partition_query=True
        )

        p = None
        for item in results:
           p = item
           break
        
        return cls.from_dict(p) if p is not None else None
    
    @classmethod
    def load_by_institution_id(cls, institution_id):
        results = cls._cosmos_container.query_items(
            query="SELECT * FROM profiles WHERE profiles.institution_id=@id",
            parameters=[
                {"name": "@id", "value": institution_id}
            ],
            enable_cross_partition_query=True
        )

        profiles = []
        for item in results:
            profile = cls.from_dict(item)
            profiles.append(profile)

        return profiles
    
    def save(self):
        #validate institution
        inst = Institution.load_by_id(self.institution_id)
        if inst is None:
            msg = "Invalid institution '{inst}' specified in profile '{profile_id}'".format(profile_id=self.id, inst=self.institution_id)
            raise Exception(msg)
        
        Profile._cosmos_container.upsert_item(self.__dict__)

    def to_json(self):
        return self.__dict__