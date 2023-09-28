from profile.profile import Profile

class FilterGenerator:
    def __init__(self, profile: Profile):
        self.profile = profile

    def generate_search_filter(self):
        filterExTemplate = "tags/any(t: t eq '{tag}') or"
        filter_conditions = ""
        demo_tags = self.get_demographic_tags()
        for tag in demo_tags:
            filter_conditions += filterExTemplate.format(tag=tag)
         
        if filter_conditions == "":
            return ""
        
        return "{filters} not tags/any()".format(filters=filter_conditions)
    
    def get_demographic_tags(self):
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
    
        
