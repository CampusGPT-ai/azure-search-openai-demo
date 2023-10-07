from profile.profile import Profile

class ProfileAugmentations:
    def __init__(self, profile: Profile):
        self.profile = profile

    def generate_search_filter(self):
        if self.profile is None:
            return ""
        filterExTemplate = "tags/any(t: t eq '{tag}') or"
        filter_conditions = ""
        demo_tags = self.__get_demographic_tags()
        for tag in demo_tags:
            filter_conditions += filterExTemplate.format(tag=tag)
         
        if filter_conditions == "":
            return ""
        
        return "{filters} not tags/any()".format(filters=filter_conditions)
    
    def generate_profile_few_shot(self) -> list[dict[str, str]]:
        if self.profile is None:
            return []
        return ProfileAugmentations.replace_profile_placeholder(self.profile.academics.get("Major"),
                                                                self.profile.academics.get("Academic Year"),
                                                                ProfileAugmentations.list_to_string(self.profile.courses))





    @staticmethod
    def replace_profile_placeholder(major_value, year_value, classes_value) ->list[dict[str, str]]:
       profile_info = [
           {'role' : 'user', 'content' : 'My major is [MAJOR] and I am in year [YEAR]' },

           {'role' : 'user', 'content' : 'I have already taken the following classes [CLASSES]' }
       ]
       for item in profile_info:
            item['content'] = item['content'].replace("[MAJOR]", major_value).replace("[CLASSES]", classes_value).replace("[YEAR]", year_value)
       return profile_info
    
    @staticmethod
    def list_to_string(lst):
       # Check if the list is empty
       if not lst:
           return ""

       # Convert the list to a single comma-separated string
       return ", ".join(map(str, lst))
    
    def __get_demographic_tags(self):
        tags = []
        if self.profile.demographics is None:
            return tags
        
        for k, v in self.profile.demographics.items():
            key = k.lower()
            value = v.lower()

            if key == "gender" and value == "female":
                tags.append("Women")
            if key == "first_generation" and value == "true":
                tags.append("FirstGen")
            if key == "ethnicity" and value != "white":
                tags.append("Ethnic")
            if key == "lgbtq" and value == "true":
                tags.append("LGBTQ")
            if key == "disability" and value == "true":
                tags.append("Disability")   
            if key == "low_income" and value == "true":
                tags.append("LowIncome")
            if key == "military" and value == "true":
                tags.append("Military")
            if key == "transfer" and value == "true":
                tags.append("Transfer")
            if key == "international" and value == "true":
                tags.append("International")
            if key == "nontraditional" and value == "true":
                tags.append("NonTraditional")
            if key == "foster_care" and value == "true":
                tags.append("Foster")
            if key == "single_parent" and value == "true":
                tags.append("SingleParent")
    
        return tags 
    
        
