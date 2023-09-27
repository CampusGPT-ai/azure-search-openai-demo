import json
import sys
import os
from profile.profile import Profile

class ProfileLoader:
    def __init__(self):
        self.file_path = "data/profiles.json"

    def load_profiles(self):
        #script_dir = os.path.dirname(__file__) #<-- absolute dir the script is in
        #abs_file_path = os.path.join(script_dir, self.file_path)
        with open(self.file_path, "r") as f:
            profiles_data = json.load(f)

        profiles = []
        for profile_data in profiles_data.get("profiles"):
            profile = Profile(
                id=profile_data["id"],
                user_id=profile_data["user_id"],
                institution_id=profile_data["institution_id"],
                full_name=profile_data["full_name"],
                avatar=profile_data["avatar"],
                interests=profile_data["interests"],
                demographics=profile_data["demographics"],
                academics=profile_data["academics"],
                courses=profile_data["courses"]
            )
            profiles.append(profile)

        return profiles

    def save_profiles(self):
        profiles = self.load_profiles()
        for profile in profiles:
            profile.save()

    @staticmethod
    def loadAndPersist():
        loader = ProfileLoader()
        loader.save_profiles()
        