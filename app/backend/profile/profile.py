import uuid

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

    def __init__(self, id, user_id, institution_id, full_name, major, minor, semester, interests):
        self.id = id
        self.user_id = user_id
        self.institution_id = institution_id
        self.full_name = full_name
        self.major = major
        self.minor = minor
        self.semester = semester
        self.interests = interests

    @classmethod
    def configure(self, host, database, master_key):
        Profile._cosmos_client = cosmos_client.CosmosClient(host, {'masterKey': master_key})
        Profile._cosmos_db = Profile._cosmos_client.create_database_if_not_exists(id=database)
        Profile._cosmos_container = Profile._cosmos_db.create_container_if_not_exists(id=CONTAINER_ID, partition_key=PartitionKey(path='/id', kind='Hash'))

    @classmethod
    def create_if_not_exists(cls, user_id, institution_id):
        # first see if we can load by the user_id, if not create a new one
        # this is a workaround since unique indexes are not working
        profile = Profile.load_by_user_id(user_id)
        if profile is None:
            profile = Profile(str(uuid.uuid4()), user_id, institution_id, None, None, None, None, [])
        return profile
    

    @classmethod
    def load_by_id(cls, id):
        p = None
        try:
            p = Profile._cosmos_container.read_item(item=id, partition_key=id)
        except exceptions.CosmosResourceNotFoundError:
            # leave profile as none
            p = None


        #results = Profile._cosmos_container.query_items(
        #    query="SELECT * FROM profiles WHERE profiles.id=@id",
        #    parameters=[
         #       {"name": "@id", "value": id}
         #   ],
         #   enable_cross_partition_query=True
        #)
        #p = results.next() if results else None
        return cls(
            p.get("id"), 
            p.get("user_id"),
            p.get("institution_id"),
            p.get("full_name"),
            p.get("major"),
            p.get("minor"),
            p.get("semester"),
            p.get("interests")
        ) if p else None

    @classmethod
    def load_by_user_id(cls, user_id):
        results = Profile._cosmos_container.query_items(
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
        
        return cls(
            p.get("id"), 
            p.get("user_id"),
            p.get("institution_id"),
            p.get("full_name"),
            p.get("major"),
            p.get("minor"),
            p.get("semester"),
            p.get("interests")
        ) if p is not None else None
    
    def save(self):
        #validate institution
        inst = Institution.load_by_id(self.institution_id)
        if inst is None:
            msg = "Invalid institution '{inst}' specified in profile '{profile_id}'".format(profile_id=self.id, inst=self.institution_id)
            raise Exception(msg)
        
        Profile._cosmos_container.upsert_item(self.__dict__)

    #def delete(self):
    #  Profile._cosmos_container.delete_item(item=self.id, partition_key="/id")
       

