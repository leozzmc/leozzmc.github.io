import hashlib
import json

dict1 = {"key1": "value1", "key2": "value2"}
dict2 = {"key1": "value1", "key2": "value2"}


         
def hash_dict(dictionary):
    dictStr = json.dumps(dictionary, sort_keys=True)
    bdictStr = dictStr.encode()
    return hashlib.md5(bdictStr).hexdigest()
    
if hash_dict(dict1) == hash_dict(dict2):
    print("Equail")
else:
    print("Not equal")