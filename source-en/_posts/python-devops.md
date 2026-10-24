---
title: Python for DevOps Notes |【DevOps Skill Tree】
description: (not yet finished) 
tags:
  - DevOps
  - Python
categories: Study Notes
aside: true
toc: true
abbrlink: "70fcdd32"
date: 2024-11-06 09:20:47
cover: /img/devops/python/cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/70fcdd32.html)

# Basic Data Types

## data type
- You can get an object or variable's data type with `type()`

```
>>> var = "This is a string"
>>> print(type(var))
<class 'str'>
```

## Variables

- `x` valid
- `x_y` valid
- `x-y` invalid
- Python variables are case-sensitive
  - `VAR` is not equal to `var`
- What happens when you type `x=1`?
  - It creates an integer object with value 1
  - So a fixed-size address is allocated in memory to store 1
  - And the name `x` points to the reference for that object

```
>>> x =123
>>> y =x
>>> print(id(x))
4298889392
>>> print(id(y))
4298889392
```
  - In Python, **a variable is a reference to an object, meaning the variable name points to an object in memory, but the variable itself doesn't contain the memory address**
  - So when you assign one variable to another, both use the same reference
- Multiple variables initialized to the same value can be declared like `a = b = c = 1`

## Booleans

```
bool(0), bool(), bool("") -> False
bool(1), bool(456), bool("Hello") -> True
```

## Strings
- How to convert "2 0 1 7" to the list [2, 0, 1, 7]?
  - `int(i) for i in "2 0 1 7".split()`

## Lists & Tuples

-  *What is a tuple in Python? What is it used for?*
  - An ordered, immutable collection of elements in Python, **basically for holding multiple items in a single variable**
  - Its biggest difference from a list is that once a tuple is created, its values can't change
  - `coordinates = (120.5, 23.5 )`

List Basic Operations
 
```
>>> x = [1,2,3]
>>> y = [4,5,6]
>>> print(x[-1])
3
>>> x.append(4)
>>> print(x)
[1, 2, 3, 4]
>>> x[0:2] = []
>>> print(x)
[3, 4]
>>> y.extend(x)
>>> print(y)
[4, 5, 6, 3, 4]
>>> y.insert(0, 123)
>>> print(y)
[123, 4, 5, 6, 3, 4]
>>> y.sort()
>>> print(y)
[3, 4, 4, 5, 6, 123]
>>> y.sort(reverse=True)
>>> print(y)
[123, 6, 5, 4, 4, 3]
```
- *How do you iterate a list?*

```
for item in list:
    print(item)
``` 
- *How do you iterate a list by index?*

```python
for i , item in enumerate(list):
    print(i)
```
- *How do you iterate a list in reverse?*

```python
for i reversed(list):
    print(i)
```
- *How do you merge two sorted lists?*  `sorted(list1, list2)`
- *What is a **list comprehension**?*
  - A more concise, convenient way to build a list
  - Syntax: `[expression for item in iterable if condition]`

```python
squares = [x**2 for x in range(10)]
print(sqaures) 
## Output  [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

> https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions

## Dictionaries

*How do you create a dictionary?*

```
>>> my_dict = dict(x=1, y=2)
>>> print(my_dict)
{'x': 1, 'y': 2}
```

*How do you delete a specific key?* `dictName.pop(KEYNAME)`

```
>>> print(my_dict)
{'x': 1, 'y': 2, 'k': 3}
>>> my_dict.pop('y')
2
>>> print(my_dict)
{'x': 1, 'k': 3}
```

*How do you merge two dictionaries?*

```
dict1.update(dict2)
```

## Iterators



# OOP, Class


## Object

*What information an object in Python holds? or what attributes an object has? a. Explain each one of them*

An object is a collection of **attributes** and **methods** acting on some data.
  - Attributes E.g. `self.name`, `self.age`
  - Methods E.g. `def greet(self):`
  - Class Variable: a variable shared across instances of a class E.g. `class_variable =0`
  - Special Methods (Magic Methods): `__init__`, `__str__`, `__repr__`
  - Docstring: a string describing a class or method: `"""This is a method"""`
  - Class Name: the name of the class an object belongs to, accessible via `__class__`, e.g. `object.__class__.__name__`
  - Module Name: which module an object's class is defined in, accessible via `__module__`, e.g. `object.__module__`
  - Dictionary containing all an object's attributes and methods, usable for dynamic access, e.g. `object.__dict__` 

## Classes

### Python Built-In Functions

*Explain the difference between `repr`, `any`, and `all`?*

`__repr__()` is a special method in Python used to tell others about an object's contents.

```python

class Person:
  def __init__(self, name, age):
      self.name = name
      self.age = age
     
p = Person("Kevin", 26)
print(p)
## output: <__main__.Person object at 0x102934370>
```

When the code above runs, it prints the object's memory address, which doesn't describe the object itself, but `repr` can describe the object.

```python
class Person:
  def __init__(self, name, age):
      self.name = name
      self.age = age

  def __repr__(self):
     return f"Person(name='{self.name}', age={self.age})"
     
p = Person("Kevin", 26)
print(p)
## Output: Person(name='Kevin', age=26)
```

`any()` returns `True` if at least one element in the iterable is `True`. It returns `False` if the iterable is empty or all elements are `False`.

`all()` returns `True` if all elements in the iterable are `True`. It returns `False` if the iterable is empty or any element is `False`.

### Inheritance
Inheritance is a feature all object-oriented languages have: a class can inherit the corresponding attributes and methods from another class.

## Raises exception
- *What is an error? What is an exception? What types of exceptions are you familiar with?*
  - The errors you may get are **Syntax Error** and **Exception**
  - A Syntax Error means the code doesn't follow the syntax rules, which the Python interpreter catches during parsing and reports
  - An Exception is an error during execution, usually from unexpected situations, like dividing an integer by 0 or accessing an empty file
     - But exceptions can be caught and handled with `try` and `except`
  - Common exceptions
    - ZeroDivisionError
    - ValueError
    - TypeError
    - IndexError 
    - KeyError
    - FileNotFoundError
    - AttributeError
    - ImportError

*Example*
```python
try:
    result = 10/0
except ZeroDivisionError:
    print("Cannot divide zero")
else:
    print(f"Result:{result}")
finally:
    print("Completely")
```

``` 
Cannot divide zero
Completely
```


# Async && Concurrency


> For the concepts of synchronous and asynchronous, see [this article](https://jimmy-huang.medium.com/python-asyncio-%E5%8D%94%E7%A8%8B-d84b5b945b5b).

# Files Manipulation

*How do you write to a file?*

```python
with open("example.txt",  'w') as file:
    file.write("This is a test file.")
```

*Given a text file, print every third line*

```python
def print_3rd_line(file_path) ->str:
    result = []
    with open(file_path, 'r') as file:
        for i, line in enumerate(file):
            if (i+1)%3 == 0:
                print(line)
                result.append(line)
    return '\n'.join(result) 
```

*Given a text file, print how many lines it has*


```python
def print_line(file_path) ->str:
    result = 0
    with open(file_path, 'r') as file:
        for i, line in enumerate(file):
            result = i
    return result
```

*Given a text file, print how many words it has*

```python
def print_word(file_path) ->str:
    with open(file_path, 'r') as file:
        text =file.read()
        words = text.split()
    return len(words)
```

*Write a piece of text to the end of an already-open file*

```python
text = "A brown fox jumped over the lazy dog."
with open('example.txt', 'a') as file:
    file.write('\n' +text + '\n')
```

*How do you write a dictionary to a file?*

```python
import json

def write_dict(file_path) ->str:
    myDict = dict(x=1, y=2)
    with open(file_path, 'w') as file:
        file.write(json.dumps(myDict))
```

*Read a JSON file*

```python
import json
from pprint import pprint

with open("example.json", "r") as file:
    data = json.load(file)
    pprint(data)
```

*Write a JSON file*

```python
import json
from pprint import pprint

input = '''
{
    "user": {
      "id": 12345,
      "name": "Alice Johnson",
      "email": "alice.johnson@example.com",
      "isActive": true,
      "age": 29,
      "address": {
        "street": "123 Main St",
        "city": "Wonderland",
        "postalCode": "12345",
        "country": "Fantasyland"
      },
      "preferences": {
        "notifications": {
          "email": true,
          "sms": false
        },
        "theme": "dark"
      },
      ...
'''
# Convert to dictionary
data = json.loads(input)

with open("example.json", "w") as file:
   json.dump(data, file)

pprint(data)
```

## Using Pathlib

*Print the contents of a file in the current directory*

```python
import pathlib
import os

path = pathlib.Path(os.getcwd()+'/example.txt')
text = path.read_text()
print(text)
```

*Write a string to a file*

```python
import pathlib
import os

text = "A quick brown fox jumped over the dog."
path = pathlib.Path(os.getcwd() + '/example.txt')
path.write_text(text)
story = path.read_text()
print(story)
```


# OS operations 


Python's `os` module provides many low-level operating-system system calls, with a unified calling interface across multiple operating systems.

*Methods the os module provides*

```python

os.listdir('DIRECTORY PATH')
os.rename('Bpple','Apple')
os.chmod('script.py', 0o777)
os.mkdir('/tmp/devops')
os.remove('script.py')
os.rmdir('/tmp/devops')
os.stat('/tmp/devops') # get file or directory info, like permissions, access time, etc.
```


*How do you print the current directory?*

```python
import os

print(os.getcwd())
```

*Given the file path `/dir1/dir2/file1`, print the file name*

```python
import os
print(os.path.basename('/dir1/dir2/file1'))
```

*How do you run a shell command from Python?*

```python
import os
os.system("ls -l")
```

*How do you join different paths together?*

```python
import os
print(os.path.join(Dir_Path1, Dir_Path2))
```

## Traversing a folder with os.walk

The `os` module provides a handy method called `os.walk` to traverse an entire file tree. This function returns a generator that yields a tuple on each iteration, containing the current directory, the directory list, and the file list.

```python
def walk_dir(parent_path):
    for parent_path, dir, files in os.walk(parent_path):
        print(f"Checking: {parent_path}")
        for fileName in files:
            file_Path = os.path.join(parent_path, fileName)
            last_access = os.path.getatime(file_Path)
            size = os.path.getsize(file_Path)
            print(f"File: {file_Path}")
            print(f"Last accessed: {last_access}")
            print(f"Size: {size} bytes")
```


# Regular expressions

Python's `re` module provides regular-expression operations.

Suppose there's a collection of strings:

```python
mail-list =  '''
kevin@amazon.com,
kev.mgry@jabber.ru
kev.mgry@jabber.rualkhobar_boy@ayna.com
rami_moman@hotmail.com
hazeen@cam.com
waleed_97@hotmail.com
al_aned@hotmail.com
wldabooh@hotmail.com
b_m_attar@yahoo.com
mohscript@hotmail.com
malarifi@usa.com
salehsul@yahoo.com
aljwhra@hotmail.com
ethaer@hotmail.com
ben_njem@hotmail.com
maas2000@maktoob.com
aboa7med@yahoo.com
saud124@hotmail.com
hm_2002_ad@hotmail.com
hm2002ad@maktoob.com
dark_eyess@hotmail.com
wali999@hotmail.com
mateb_2001@ayna.com
devil2100@maktoob.com
ahmedshatoor@hotmail.com
faisal20o0@hotmail.com
m_sh4ever@hotmail.com
shaib2005@maktoob.com
f-tp@maktoob.com
kevin@amazon.com
smartstar_sa@yahoo.com
swaah99@hotmail.com
do7me2002@hotmail.com
bleaks20@hotmail.com
zaeem@ksatoday.com
sarah_21_ksa@hotmail.com
raheema@ayna.com
toyota@444.net
majeed97@hotmail.com
khabom2@hotmail.com
a2685@yahoo.com
ab_alraddadi@yahoo.com
turky_net2002@hotmail.com
abu_fahad22@hotmail.com
yah1418@maktoob.com
new_sa1@yahoo.com
anoooooooos@hotmail.com
fem_kinani@hotmail.com
albqaawi@ayna.com
alhazenh@hotmail.com
uea1@hotmail.com
azoo1ooz@hotmail.com
00@factmail.ca
love-1@maktoob.com
rami_shut@yahoo.com
the_husaam@hotmail.com
vip9999@ayna.com
noor_99_99@yahoo.com
alma7roomm@hotmail.com
jawad76ly@yahoo.com
hemdan_na@hotmail.com
i@stc.com
buok6977@ayna.come
hwaawy@yahoo.com
aseer2@maktoob.com
bin_000@hotmail.com
abeyr@ayna.com
al_maknun2001@maktoob.com
ahmsh@naseej.com
far_alsekak@hotmail.com
mos011@yahoo.com
saud1900@hotmail.com
essa1420@yahoo.com
almonta7er@hotmail.com
zayd2002-2000@maktoob.com
kh_mahfouz@hotmail.com
l3yonha@hotmail.com
hat1972@hotmail.com
mk8n@hotmail.com
soul_devil14@hotmail.com
khater_love@hotmail.com
mohdbahrawi@hotmail.com
naaader@hotmail.com
faisal_war@yahoo.com
arramalomari@hotmail.com
gmmare@hotmail.com
thamir5@hotmail.com
seilver@hotmail.com
aboghadi@hotmail.com
latte2001@maktoob.com
lotfy_s@hotmail.com
hamadah990@hotmail.com
'''
```

Say you want to find `kevin@amazon.com` but only know the email starts with `k`. How do you find it?

```python
import re
print(re.search(r'[A-Za-z]+@[A-Za-z]+\.[a-z]+', mail_list))

## Output
# <re.Match object; span=(1, 17), match='kevin@amazon.com'>
```
This means any letter from the character sets `A-Z` and `a-z`, then `+` means the preceding character appears one or more times in the match. Since `.` is a wildcard, it needs to be escaped with a backslash `\`.

**The re module represents the common character set `[a-zA-Z0-9_]` with `\w`, and ordinary digits `[0-9]` with `\d`.**

So the code above can be rewritten as:

```python
import re
print(re.search(r'\w+@\w+\.\w+', mail_list))

## Output
# <re.Match object; span=(1, 17), match='kevin@amazon.com'>
```

To access the returned match object better, **you can define groups of the match result with parentheses**, and get the matched group directly from the returned object by number.

```python
import re

match = re.search(r'(\w+)@(\w+)\.(\w+)', mail_list)
print(match.group(0))

## Output
# kevin@amazon.com
```

To access the returned match object even more conveniently, **you can name groups with `?P<NAME>`**.

```python
import re

match = re.search(r'(?P<name>\w+)@(?P<SLD>\w+)\.(?P<TLD>\w+)', mail_list)
print(match.group("name"))

## Output
# kevin
```

*How do you find all IP addresses in a file?*

For an input like this:

```
In the ever-evolving digital landscape, tracking online data often requires observing user interactions from various regions. For instance, a significant number of logins were recorded from IP addresses like 24.31.173.2 and 82.33.11.118, which reflect diverse user origins. Security teams frequently monitor these access points, noting unusual activity from IPs such as 45.56.148.51 and 99.116.96.74.

On an average day, they might encounter new sessions from endpoints like 24.15.139.93 or 67.166.35.191, each needing real-time analysis to ensure data protection. In one case, an IP address from the Asia-Pacific region, 180.215.121.104, demonstrated a high frequency of requests, which raised some flags in the system.

Europe is also represented in traffic logs, with IPs such as 64.130.155.78 and 186.176.159.218 originating from locations that maintain stringent data compliance regulations. The North American region had frequent logins from addresses like 71.239.86.182 and 69.43.251.147, where several were validated for secure access.

Moreover, a pattern was observed with IPs like 100.12.201.224 and 85.164.201.224 accessing confidential systems during peak hours. Meanwhile, analysts in cybersecurity teams often encounter unusual log requests from regions like 120.156.7.200, necessitating further investigation.

The logs also revealed consistent access from IPs like 24.61.142.106, which had been previously flagged for unauthorized attempts. Similarly, 99.58.40.206 and 70.15.237.26 showed a surge in activity, prompting immediate protocol checks. Another example is the IP 108.205.48.11, detected during an audit of high-value transactions.

Many more instances, such as connections from 72.168.129.149 and 189.224.44.46, add complexity to monitoring systems. Security teams must evaluate each source, even those with benign records like 68.60.26.228 or frequent accesses from 24.236.160.189.

Moreover, the system recorded remote sessions from addresses like 100.36.162.76 and 47.16.121.249, both requiring location verification steps. High-risk IPs, such as 184.4.175.60 and 62.19.65.98, were flagged during the latest vulnerability scan, which further highlighted global risks.

Unusual activity from Latin America was seen with addresses like 186.35.108.144, while other regions showed minimal access, as with 189.24.118.68. IPs from North America, like 71.75.81.146 and 72.89.236.44, represent legitimate access but require continuous monitoring. For example, sessions from 174.125.174.95 often triggered notifications, especially those attempting to access privileged systems.

A deeper look at international traffic unveiled access from IP 190.244.119.142, a significant address due to its activity level. Occasional spikes were noted from Europe, with entries from IP 84.26.122.138, which was scrutinized during regular audits.

Lastly, domestic IPs like 65.112.10.60 and overseas ones such as 108.71.92.240 reveal the complexity of maintaining cybersecurity in a global context. One user from an IP at 1.43.41.29 exhibited typical behavior but underscored the need for constant vigilance.
```

```python
import re

def find_IP(file_Path):
  with open(file_Path, "r") as file:
    text = file.read()
    match = re.findall(r'(\d+)\.(\d+).(\d+)\.(\d+)', text)
    ip_list = ['.'.join(ip) for ip in match] 
  return ip_list

print(find_IP('example.txt'))
```

Again using the re module to find the IP addresses in the text.

# Various ways to make requests

To send a request to a server in Python, you'll mostly use the `requests` module.

```python
import requests

response = requests.get("https://google.com")
print(response.text)
```

Available HTTP methods

|HTTP Method|Request|Description|
|---|---|---|
|GET| `requests.get(url)`| can additionally set a `params` dictionary|
|POST|`requests.post(url)`| can additionally set a `data` dictionary|
|PUT|`requests.put(url)`| can additionally set a `data` dictionary|
|DELETE|`requests.delete(url)`|  delete the specified resource|
|HEAD|`requests.head(url)`| request only the resource's response header|
|OPTIONS|`requests.options(url)`| request all HTTP methods the resource supports|

> You can also use the `http.client` module to send requests; this module is part of the Python standard library.

# Encrypting data

In Python you can encrypt text with the `cryptography` package, and hash with `hashlib`.

## Hashing with Hashlib

`hashlib` provides several hash functions: SHA1, SHA224, SHA384, SHA512, and MD5.

```python
import hashlib

secret = "This is the message"
bsecrets = secret.encode()
m = hashlib.md5()
m.update(bsecrets)
print(m.hexdigest())
```

Before hashing text, you first convert it to a binary string with `encode`. Then create an MD5 hash object, which processes our message and computes the MD5 hash value.

Then update the hash object, passing the binary string via `update` to hash, and output the 16-byte MD5 hash.

Output
```
87f77fdd7fa847899a10a7aab651bd75
```


# Misc Questions

*What do Python Interpreter do?*

![](/img/devops/python/python_flow.png)

- Parsing
  - In this phase the Python interpreter converts the code into an AST (Abstract Syntax Tree)
    - The conversion involves lexical analysis and syntax analysis
    - Syntax errors are usually caught in this phase
- Compilation
    - The AST is converted into bytecode that the Python Virtual Machine (PVM) can execute
- Execution
  - The PVM interprets and executes this bytecode
  - The PVM is a stack machine that manages and executes bytecode line by line

> For the detailed flow, see [this article](https://medium.com/citycoddee/python%E9%80%B2%E9%9A%8E%E6%8A%80%E5%B7%A7-5-python-%E5%88%B0%E5%BA%95%E6%80%8E%E9%BA%BC%E8%A2%AB%E5%9F%B7%E8%A1%8C-%E7%9B%B4%E8%AD%AF-%E7%B7%A8%E8%AD%AF-%E5%AD%97%E7%AF%80%E7%A2%BC-%E8%99%9B%E6%93%AC%E6%A9%9F%E7%9C%8B%E4%B8%8D%E6%87%82-553182101653).

*What is Python Global Interpreter Lock(GIL)?*
- The Python GIL is a mutex in the Python interpreter (only in CPython) that ensures only one thread executes Python bytecode at a time, which helps solve memory-management problems such as race conditions

*How GIL effect the multi-threading application?*
- The GIL limits the concurrency of multi-threaded applications; it doesn't help much with CPU-bound tasks, since a CPU has multiple cores to share the computation
- You can use multiprocessing to bypass the GIL's limitation, or switch to a Python without a GIL, like IronPython

> https://yhtechnote.com/global-interpreter-lock/
> https://chtseng.wordpress.com/2024/02/29/python%E9%9D%9E%E5%90%8C%E6%AD%A5%E8%88%87%E5%B9%B3%E8%A1%8C%E8%99%95%E7%90%86/

*Explain the difference between Concurrency and Parallelism in detail*

**Concurrency** means execution on a single CPU/core where multiple tasks run interleaved
**Parallelism** means execution on multiple CPUs/cores, possibly containing multiple concurrent tasks


# Reference
https://github.com/bregman-arie/python-exercises
