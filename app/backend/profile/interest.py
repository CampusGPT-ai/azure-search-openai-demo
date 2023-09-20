import json

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
    