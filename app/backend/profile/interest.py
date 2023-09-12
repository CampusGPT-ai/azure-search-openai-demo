class Interest():
    def __init__(self, interest: str, isApplicable: bool):
        self.interest = interest
        self.isApplicable = isApplicable

    def to_json(self):
        return {
            "interest": self.interest,
            "isApplicable": self.isApplicable
        }
    
class InterestHelper():
    def loadAllInterests():
        return []
    
    def loadUserInterests(user: str):
        return []
    
    def count_vowels(x):
        ...
        i = 0
        while i <= s
            if (x[i] in vowels):
                #increase count
            # else is not necessary, since nothing to do 
            return count 