---
title: Python for DevOps 筆記 |【DevOps技能樹】
description: (尚未完成) 
tags:
  - DevOps
  - Python
categories: 學習筆記
aside: true
toc: true
abbrlink: 70fcdd32
date: 2024-11-06 09:20:47
cover: /img/devops/python/cover.jpg
---

# Basic Data Types

## data type
- 可以透過 `type()` 來獲取物件或變數的 data type

```
>>> var = "This is a string"
>>> print(type(var))
<class 'str'>
```

## Variables

- `x` valid
- `x_y` valid
- `x-y` invalid
- Python 變數並非 Case Sensitive
  - `VAR` 不等於 `var`
- 當你在輸入 `x=1` 的時候會發生什麼事？
  - 其實就是創造一個整數物件其value為1
  - 因此會在記憶體中分配一個固定大小的位址用來存放 1
  - 而 `x` 這個名稱會指向用於該物件的 reference

```
>>> x =123
>>> y =x
>>> print(id(x))
4298889392
>>> print(id(y))
4298889392
```
  - 在 Python 中，**變數是對物件的引用，這意味著變數名稱指向記憶體中的物件，但變數本身並不包含記憶體位址**
  - 所以當你把一個變數賦值給另一個變數時，兩者用的是相同的引用
- 多個變數若初始化的值一樣可以這樣宣告 `a = b = c = 1`

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
  - Python 中的一種排序，並且不可更動的元素組合，**簡單來說就是想在一個變數中包含多個item**
  - 他跟 list 最大的差異在 tuple 一旦建立後，裡頭的值就不可更動
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
- *如何迭代一個 List？*

```
for item in list:
    print(item)
``` 
- *如何透過 index 來迭代一個 list ?*

```python
for i , item in enumerate(list):
    print(i)
```
- *如何反向迭代一個 list?*

```python
for i reversed(list):
    print(i)
```
- *如何將兩個已排序的 list 合併？*  `sorted(list1, list2)`
- *什麼是 **List Comprehension** ?*
  - 他是一種更加簡潔方便的做法來建立List
  - 語法： `[expression for item in iterable if condition]`

```python
squares = [x**2 for x in range(10)]
print(sqaures) 
## Output  [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

> https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions

## Dictionaries

*如何建立一個 Dictionaries ?*

```
>>> my_dict = dict(x=1, y=2)
>>> print(my_dict)
{'x': 1, 'y': 2}
```

*如何刪除特定的 Key?* `dictName.pop(KEYNAME)`

```
>>> print(my_dict)
{'x': 1, 'y': 2, 'k': 3}
>>> my_dict.pop('y')
2
>>> print(my_dict)
{'x': 1, 'k': 3}
```

*如何 Merge 兩個 dictionaries*

```
dict1.update(dict2)
```

## Iterators



# OOP, Class


## Object

*What information an object in Python holds? or what attributes an object has? a. Explain each one of them*

物件會是作用在某個資料上的 **attributes** 和 **methods** 的集合
  - Attributes E.g. `self.name`, `self.age`
  - Methods E.g. `def greet(self):`
  - Class Variable: 在不同class之間共享的變數 E.g. `class_variable =0`
  - Special Methods(Magic Methods): `__init__`, `__str__`, `__repr__`
  - Docstring: 用來描述class或者method的字串: `"""This is a method"""`
  - Class Name: 用於存取物件所屬類別的名稱，可以透過 `__class__` 來存取，Example `object.__class__.__name__`
  - Module Name: 可以獲取物件所屬的class被定義在哪個 module，可以透過 `__module__` 來存取, Example `object.__module__`
  - Dictionary 包含一個物件中所有attributes 和 methods，可用於動態存取。 Example `object.__dict__` 

## Classes

### Python Built-In Functions

*解釋一下什麼是 `repr`, `any` 和 `all` 之間的差異?*

`__repr__()` 是在Python 當中的一種特殊 method，用於在告訴其他人，物件的內容

```python

class Person:
  def __init__(self, name, age):
      self.name = name
      self.age = age
     
p = Person("Kevin", 26)
print(p)
## output: <__main__.Person object at 0x102934370>
```

當上面的程式碼執行後會輸出物件的記憶體位址，而並不能描述物件本身，但透過 `repr` 則可以描述物件

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

`any()` 函數如果可迭代對象中的至少一個元素為 `True`，則返回 `True`。如果可迭代對象為空或所有元素均為 `False`，則返回 `False`。

`all()` 函數如果可迭代對象中的所有元素均為 `True`，則返回 `True`。如果可迭代對象為空或任何元素為 `False`，則返回 `False`。

### Inheritance
繼承是物件導向語言都有的特性，一個類別可以從另一個類別中繼承對應的屬性(attributes)和方法(methods)，


## Raises exception
- *What is an error? What is an exception? What types of exceptions are you familiar with?*
  -  錯誤可能會有的是 **Syntax Error** 跟 **Exception**
  -  Syntax Error 代表程式碼並沒有遵守 syntax rule，當 Python 的 Interpreter 在parsing 過程中檢查出，就會報錯
  -  Exception 則是程式碼在執行期間發生的錯誤，通常是有於一些非預期狀況，像是將一個整數除以 0，或是存取一個空的檔案，就可能出現錯誤
     -  但 Exception 可以透過 `try` 跟 `except` 來去發現跟處理
  - 常見的 Exception 
    - ZeroDivisionError
    - ValueError
    - TypeError
    - IndexError 
    - KeyError
    - FileNotFoundError
    - ArrtibuteError
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


> 同步跟非同步的概念可以參考 [這篇文章](https://jimmy-huang.medium.com/python-asyncio-%E5%8D%94%E7%A8%8B-d84b5b945b5b)

# Files Manipulation

*如何寫入檔案?*

```python
with open("example.txt",  'w') as file:
    file.write("This is a test file.")
```

*給定文字檔，每三行就印出來*

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

*給定文字檔，印出該檔案有幾行*


```python
def print_line(file_path) ->str:
    result = 0
    with open(file_path, 'r') as file:
        for i, line in enumerate(file):
            result = i
    return result
```

*給定文字檔，印出該檔案有幾個字彙(word)*

```python
def print_word(file_path) ->str:
    with open(file_path, 'r') as file:
        text =file.read()
        words = text.split()
    return len(words)
```

*將一段文字寫入到已開啟的檔案最末端*

```python
text = "A brown fox jumped over the lazy dog."
with open('example.txt', 'a') as file:
    file.write('\n' +text + '\n')
```

*如何將 dictionary 寫入一個檔案*

```python
import json

def write_dict(file_path) ->str:
    myDict = dict(x=1, y=2)
    with open(file_path, 'w') as file:
        file.write(json.dumps(myDict))
```

*讀取 json檔案*

```python
import json
from pprint import pprint

with open("example.json", "r") as file:
    data = json.load(file)
    pprint(data)
```

*寫入 json 檔案*

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


## 使用 Pathlib

*印出當前目錄下的檔案內容*

```python
import pathlib
import os

path = pathlib.Path(os.getcwd()+'/example.txt')
text = path.read_text()
print(text)
```

*寫入字串到檔案*

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


python 中的 `os` 模組提供了許多low level 的作業系統 system call，並且在多種作業系統中提供一個統一的調用介面。

*os module 提供的methods*

```python

os.listdir('DIRECTORY PATH')
os.rename('Bpple','Apple')
os.chmod('script.py', 0o777)
os.mkdir('/tmp/devops')
os.remove('script.py')
os.rmdir('/tmp/devops')
os.stat('/tmp/devops') # 取得檔案或目錄資訊，像是檔案權限、存取時間..etc
```


*如何印出當前目錄*

```python
import os

print(os.getcwd())
```

*給定檔案路徑 `/dir1/dir2/file1`，印出檔案名稱*

```python
import os
print(os.path.basename('/dir1/dir2/file1'))
```

*如何透過 Python 執行 Shell 命令?*

```python
import os
os.system("ls -l")
```

*如何將不同路徑串接在一起*

```python
import os
print(os.path.join(Dir_Path1, Dir_Path2))
```

## 使用 os.walk 遍歷資料夾

`os` 模組提供了一個好用的 method 叫做 `os.walk` 用來 traverse 整個檔案樹。這個函數每次都會回傳一個 generator，可以在每次迭代過程中傳回一個 tuple，該tuple 包含當前的目錄、目錄列表和檔案列表

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





# 正則表達式 

Python 提供 `re` 模組可以進行正則表達式操作

假設有個字串集合是 

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

今天想要查找 `kevin@amazon.com` 但假設你只知道你要找的人的信箱開頭是 `k` 那該怎麼找

```python
import re
print(re.search(r'[A-Za-z]+@[A-Za-z]+\.[a-z]+', mail_list))

## Output
# <re.Match object; span=(1, 17), match='kevin@amazon.com'>
```
這代表從字元集 `A-Z` 和 `a-z` 中任意的字母， 然後 `+` 代表前面的字元在比對過程中，出現一次到多次。由於 `.` 會是一種 wildcard 因此會需要透過反斜線 `\` 進行跳脫。

**re 模組將常用字元集 `[a-zA-Z0-9_]` 用  `\w` 來代表，而一般數字 `[0-9]` 則使用 `\d` 來代表**

所以上面程式碼可以替換成

```python
import re
print(re.search(r'\w+@\w+\.\w+', mail_list))

## Output
# <re.Match object; span=(1, 17), match='kevin@amazon.com'>
```

為的可以更好的存取返回的匹配物件，**可以透過括號來定義匹配結果的 Group**，回傳匹配的group 可以透過數值直接從回傳物件中取得結果

```python
import re

match = re.search(r'(\w+)@(\w+)\.(\w+)', mail_list)
print(match.group(0))

## Output
# kevin@amazon.com
```

為了更加方便存取返回的匹配物件，**可以透過 `?P<NAME>` 來去幫group命名**

```python
import re

match = re.search(r'(?P<name>\w+)@(?P<SLD>\w+)\.(?P<TLD>\w+)', mail_list)
print(match.group("name"))

## Output
# kevin
```



*如何在一個檔案中找到所有 IP Address?*

對於這樣的 input

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

一樣透過 re 模組來找到文章中的IP位址

# 發請求的各種用法

在 Python 中若要發送請求給Server，大多會用到 `requests` 模組。

```python
import requests

response = requests.get("https://google.com")
print(response.text)
```

可用的 HTTP Methods

|HTTP Method|Request|Description|
|---|---|---|
|GET| `requests.get(url)`| 可額外設定  `params` dictionary|
|POST|`requests.post(url)`| 可額外設定 `data` dictionary|
|PUT|`requests.put(url)`| 可額外設定 `data` dctionary|
|DELETE|`requests.delete(url)`|  刪除指定資源|
|HEAD|`requests.head(url)`| 僅請求資源 response header|
|OPTIONS|`requests.options(url)`| 請求回傳該資源所支援的所有HTTP 請求方法|


> 另外，也可以使用 `http.client` 模組來去發送請求，這個模組屬於 Python標準函式庫


# 加密資料

在 Python 中可以透過套件 `cryptography` 來幫文字資訊加密，另外也可以透過 `hashlib` 來進行雜湊處理

## 使用 Hashlib 進行雜湊

`hashlib` 提供多種雜湊函式: SHA1, SHA224, SHA384, SHA512 以及 MD5


```python
import hashlib

secret = "This is the message"
bsecrets = secret.encode()
m = hashlib.md5()
m.update(bsecrets)
print(m.hexdigest())
```

在對字進行雜湊前，需要先用 `encode` 方法將其轉換成二進位字串。接著建立 MD5 hash 物件，這個物件可以用來處理我們的訊習並計算出MD5 Hash值。

之後就是更新hash object，透過 `update` 方法傳入二進位字串進行hash處理，之後輸出長度為 16 bytes 的 MD5 hash

Output
```
87f77fdd7fa847899a10a7aab651bd75
```


# Misc Questions

*What do Python Interpreter do?*

![](/img/devops/python/python_flow.png)

- Parsing
  - Python 解釋器會在這階段將程式碼轉換成 AST(Abstract Syntax Tree)
    - 轉換過程中涉及： Lexical Analysis 以及 Syntax Analysis
    - 通常 Syntax Error 都是在這一階段發現的
- Compilation
    - AST 會被轉換為 Bytecode，可以被 Python 虛擬機(PVM)執行
- Execution
  - PVM 會解釋並執行這些 Bytecode
  - PVM 會是一種 Stack Machine，可以管理並逐行執行 Bytecode

> 詳細流程可以參考 [這篇文章](https://medium.com/citycoddee/python%E9%80%B2%E9%9A%8E%E6%8A%80%E5%B7%A7-5-python-%E5%88%B0%E5%BA%95%E6%80%8E%E9%BA%BC%E8%A2%AB%E5%9F%B7%E8%A1%8C-%E7%9B%B4%E8%AD%AF-%E7%B7%A8%E8%AD%AF-%E5%AD%97%E7%AF%80%E7%A2%BC-%E8%99%9B%E6%93%AC%E6%A9%9F%E7%9C%8B%E4%B8%8D%E6%87%82-553182101653)

*What is Python Global Interpreter Lock(GIL)?*
- Python GIL 是 Python Interpreter (僅在CPython中有) 當中的一種互斥鎖，用來保證同一時間，只有一個執行緒會執行Python 的 Bytecode，而這可以用來解決記憶體管理的問題 E.g. Race Condition

*How GIL effect the multi-threading application?*
- GIL 會限制多執行緒應用的併發能力(Concurrency)，在CPU密集的任務中效果不會很好，畢竟CPU有多顆核心可以分攤運算
- 可以使用多處理程序(multiprocessing)來繞過GIL的限制。或者改用沒有GIL的Python 來實現，像是 IronPython

> https://yhtechnote.com/global-interpreter-lock/
> https://chtseng.wordpress.com/2024/02/29/python%E9%9D%9E%E5%90%8C%E6%AD%A5%E8%88%87%E5%B9%B3%E8%A1%8C%E8%99%95%E7%90%86/

*請詳細解釋一下 Concurrency 以及 Parallelism 之間的差異*

**Concurrency** 為併發，代表在單一CPU/核心上的執行能力，多個Task彼此會在交錯執行
**Parallelism** 則為平行處理，代表多個CPU/和新的執行能力，可能會包含多個 Concurrency Tasks


# Reference
https://github.com/bregman-arie/python-exercises
