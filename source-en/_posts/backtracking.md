---
title: 'Problem-Solving Notes | Backtracking & Recursion'
tags:
  - Backtracking
  - Algorithms
  - LeetCode
  - C++
categories: LeetCode Notes
aside: true
abbrlink: "48f553b3"
date: 2024-09-15 18:54:56
cover: /img/LeetCode/backtracking/cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/48f553b3.html)

# Recursion

When solving backtracking problems you can usually implement them with recursion, so it's best to first understand the idea of recursion. The core idea of recursion is **"break a big problem into several small problems, and the small problems can be split the same way into even smaller problems"** and **"except for the smallest problem, every level is solved the same way".**

![](/img/LeetCode/backtracking/recursion.png)

## Tower of Hanoi

![](/img/LeetCode/backtracking/tower1.png)

The Tower of Hanoi is the classic recursion problem. The problem is: **there are three rods, and N disks stacked on the leftmost rod (N = 4 in the figure above). Now we want to move them all to the rightmost rod. What is the minimum number of moves needed?**

{% note info %}
1. Each move you pick one rod and move its topmost disk; you can only move one at a time
2. A larger disk can't be placed on top of a smaller one
{% endnote %}

Here we need to follow the recursive mindset, **solving a big problem by solving several small problems.** The big problem here is **how many steps does it take to move four disks to the right?** and the small problem is **how many steps to move three disks?**

> The problem is essentially the same, just with a smaller scope. Here, assuming we already know the answer for moving two disks, we can picture the problem like the figure below.

![](/img/LeetCode/backtracking/tower2.png)

1. Move the top three disks from the left to the middle (never mind how for now; the current result is three disks stacked in the middle)
2. Move the leftmost disk to the right
3. Move the three disks in the middle to the right (never mind how for now; the current result is three disks stacked on the rightmost disk)

Because the problem cares about **the number of moves,** first assume moving the three disks on the left to the middle takes $K$ steps, moving the remaining one disk to the right takes 1 step, and finally moving the three middle disks to the right takes $K$ steps, so the total is $2*K +1$.

From the relation between the big and small problems we get the relation: $ F(N) = 2*F(N-1)+1$, where $F(N)$ is the number of steps to move $N$ disks. Of course, in implementation we also need to consider the smallest problem, which here is the number of steps to move one disk, which is obviously 1. So we can write the algorithm like this:

```cpp
int HanoiTower(int n){
    if n==1 return 1;
    return 2* HaniTower(n-1) +1;
}
```

> In summary, when you hit recursion always think about these three points: (1) what are the big and small problems, (2) how to write the relation between the big and small problems, (3) what is the smallest problem?

# Introduction to Backtracking

> Backtracking is a kind of exhaustive algorithm. Its core idea is **"if a path doesn't work, go back".** That is, when you want to search for some data, if a particular data path doesn't work out, you step back to the previous step and try another path. So there must be a condition to judge whether a path is the one to take, and if it doesn't meet the condition, you back off.




**Backtracking is usually implemented with recursion.**

# Core concepts

## Enumerate
   - List every possible next step
## Pruning
   - When something doesn't meet the condition, skip the next step and don't keep enumerating
   - This is actually more advanced; essentially it lets the search end early

> Honestly, when solving Tree-related concepts earlier I'd already used the backtracking idea, like DFS: at the start you set a termination condition (e.g. reaching a leaf), then each time you recursively call the next DFS function to visit the next node.




# Categories of Backtracking problems

## Permutations

A lot of online explanations of the backtracking concept use Permutations as the example. The problem is roughly **guessing a password**, for example, given 1, 2, 3, how many non-repeating password combinations are there, or arranging symbols to see how many combinations exist. **The common idea is to solve with recursion, exhausting all possibilities and backing off wrong answers.**

![](/img/LeetCode/backtracking/backt.png)

Here we can also view it as different levels. In the figure above, each recursive call goes down one level. At first there's no number at all, so there's no value, which you can think of as level 0, and going down one level means starting to explore the possible digits: the first digit of the password could be `1`, `2`, or `3`. Then we again recursively call the next level: for the case where the first digit is `1`, the second digit could also be `1`, `2`, or `3`, with the new digit appended after the old one, so we currently have `1,1`, `1,2`, `1,3`; and for the case where the second digit is `2`, its next level is `2,1`, `2,2`, `2,3`, and for `3` the next level could be `3,1`, `3,2`, `3,3`. Then we recursively call the next level again. The termination condition of the recursion is reaching the required number of levels, finding the password.

Below is a simple implementation:

```cpp
#include <iostream>
#include <vector>
using namespace std;

void permutate(vector<int>& nums, vector<int>& password, vector<bool>& used) {
    if (password.size() == nums.size()) {
        for (int i = 0; i < password.size(); i++) {
            cout << password[i] << " ";
        }
        cout << endl;
        return;
    }

    for (int i = 0; i < nums.size(); i++) {
        if (!used[i]) {
            used[i] = true;
            password.push_back(nums[i]);
            permutate(nums, password, used); 
            password.pop_back();
            used[i] = false;
        }
    }
}

int main() {
    vector<int> nums = {1, 2, 3}; 
    vector<int> passList;
    vector<bool> used(nums.size(), false);

    permutate(nums, passList, used);
    return 0;
}

```

The snippet above is the termination condition: once we reach the maximum depth we stop searching further
```cpp
 if(depth == MAX_DEPTH){
      for(auto i = 0; i < password.size(); i++){
         cout << password[i] <<" ";
      }
      cout << endl;
      return;
   };
```

Below, at each node we try inserting `1`, `2`, or `3` before advancing to the next level, and if we reach the maximum depth we back off. After backing off one level, we clear the digit that was occupying the last position of `password`.

```cpp
for (int i = 0; i < nums.size(); i++) {
    if (!used[i]) {
        used[i] = true;
        password.push_back(nums[i]);
        permutate(nums, password, used); 
        password.pop_back();
        used[i] = false;
    }
}
```




Output:
```
1 2 3 
1 3 2 
2 1 3 
2 3 1 
3 1 2 
3 2 1 
```

## Subsets

> This kind of problem usually gives an integer set with no duplicate numbers and asks you to find all possible subsets

{% note info %}
For the integer set `[1,2,3]`, all possible subsets are:
{ `[]`,`[1]`,`[2]`,`[3]`,`[1,2]`,`[1,3]`,`[2,3]`,`[1,2,3]`}
- `[1,2]` = `[2,1]`
- `[1]` = `[1,1]`
{% endnote %}

This type of problem can be solved with backtracking, **and at each step you can choose whether to include a given element.**

```cpp
#include <iostream>
#include <vector>

using namespace std;

vector<int> nums = {1, 2, 3};
vector<int> result; 


void subsets(vector<int> &sets, int index) {
    if (index == sets.size()) { 
        cout << "{ ";
        for (int i = 0; i < result.size(); i++) {
            cout << result[i] << " ";
        }
        cout << "}" << endl;
        return;
    }
    
    // exclude the current element
    subsets(sets, index + 1);
    
    // include the current element
    result.push_back(sets[index]);
    subsets(sets, index + 1);
    
    // back off the previous choice
    result.pop_back();
}

int main() {
    subsets(nums, 0);
    return 0;
}
```

Output:

```
{ }
{ 3 }
{ 2 }
{ 2 3 }
{ 1 }
{ 1 3 }
{ 1 2 }
{ 1 2 3 }
```

Its call logic is also a classic tree structure

```
                             subsets(nums, 0)
                          /                      \
               subsets(nums, 1)               subsets(nums, 1)
               (exclude 1)                        (include 1)
             /             \                   /           \
  subsets(nums, 2)  subsets(nums, 2)   subsets(nums, 2)   subsets(nums, 2)
   (exclude 2)       (include 2)         (exclude 2)        (include 2)
   /       \          /      \           /      \            /     \
subsets   subsets  subsets  subsets   subsets  subsets  subsets  subsets
(nums, 3) (nums, 3) (nums, 3) (nums, 3) (nums, 3) (nums, 3) (nums, 3) (nums, 3)
 (exclude 3) (include 3) (exclude 3) (include 3) (exclude 3)(include 3)(exclude 3)(include 3)

```

When we reach a leaf node (`index == nums.size()`), we've made all the decisions at this point and formed a complete subset, which is then output.

## Combinations
> This is like high-school permutations and combinations: given integers 1 to N, choose K numbers and find all possible combinations.

{% note info %}
`N=4`, `K=2`
then the output is:
`{[1,2],[2,3],[3,4],[1,3],[1,4],[2,4]}`
{% endnote %}

**The solution to this type of problem is similar to subsets: you need to give a starting index and stop once K numbers are chosen.**

```cpp
#include <iostream>
#include <vector>
using namespace std;

vector<int> result; 

void combinations(int N, int K, int index, int start) {
    if (index == K) {  // if the subset length reaches K, output the current subset
        cout << "{ ";
        for (int i = 0; i < result.size(); i++) {
            cout << result[i] << " ";
        }
        cout << "}" << endl;
        return;
    }
    
    // iterate over all remaining possible choices
    for (int i = start; i <= N; i++) {
        result.push_back(i);  // add the current number
        combinations(N, K, index + 1, i + 1); // go to the next level
        result.pop_back();  // backtrack, remove the current number
    }
}

int main() {
    int N = 4;
    int K = 2; 
    combinations(N, K, 0, 1);
    return 0;
}
```

Output:
```
{ 1 2 }
{ 1 3 }
{ 1 4 }
{ 2 3 }
{ 2 4 }
{ 3 4 }
```

Below, a tree structure illustrates the recursive process of finding the output (N=4, K=2):

`From 1 ~ 4`
```
                          combinations(N=4, K=2, index=0, start=1)
                               /                                \
          combinations(N=4, K=2, index=1, start=2)       (skip 1, start at 2)
            (choose 1)                         /                     \
                         combinations(N=4, K=2, index=2, start=3)    (skip 2)
                           (choose 2)                     /                     \
                             {1,2}           combinations(N=4, K=2, index=2, start=4)
                                                      (choose 3)           \
                                                        {1,3}        combinations(N=4, K=2, index=2, start=5)
                                                                             (choose 4) 
                                                                               {1,4}

```

`From 2 ~ 4`
```
                          combinations(N=4, K=2, index=0, start=2)
                               /                                \
          combinations(N=4, K=2, index=1, start=3)       (skip 2, start at 3)
            (choose 2)                         /                     \
                         combinations(N=4, K=2, index=2, start=4)    (skip 3)
                           (choose 3)                     /                     \
                             {2,3}           combinations(N=4, K=2, index=2, start=5)
                                                      (choose 4)             
                                                        {2,4}

```

`From 3 ~ 4`
```
                          combinations(N=4, K=2, index=0, start=3)
                               /                                \
          combinations(N=4, K=2, index=1, start=4)       (skip 3, start at 4)
            (choose 3)                         /                     \
                         combinations(N=4, K=2, index=2, start=5)    
                           (choose 4)                               
                             {3,4}

```

## Palindrome Partitioning

> Cut a string into a group of palindromic substrings, where every substring is a palindrome, and list all the ways to cut it


```cpp
#include <iostream>
#include <vector>
#include <string>

using namespace std;

string input = "aab"; 
vector<vector<string>> result;  
vector<string> currentPartition; 

// check whether a substring is a palindrome
bool isPalindrome(const string& s, int start, int end) {
    while (start < end) {
        if (s[start] != s[end]) {
            return false;
        }
        start++;
        end--;
    }
    return true;
}

// Backtracking: cut palindromes out of the string
void Palindrome(const string& s, int start) {
    // if we've cut to the end of the string, store the current partition
    if (start == s.size()) {
        result.push_back(currentPartition);
        return;
    }

    // starting from the current index, try every possible substring
    for (int i = start; i < s.size(); i++) {
        if (isPalindrome(s, start, i)) {
            // add the palindromic substring to the current partition
            currentPartition.push_back(s.substr(start, i - start + 1));
            // keep recursively cutting the remaining string
            Palindrome(s, i + 1);
            // back off, remove the last added substring
            currentPartition.pop_back();
        }
    }
}

int main() {
    Palindrome(input, 0); 
    
    for (const auto& partition : result) {
        cout << "{ ";
        for (const auto& p : partition) {
            cout << p << " ";
        }
        cout << "}" << endl;
    }
    return 0;
}

```

Here we take the string `aab` as an example

``` 
                                [""]           # 'aab'
                                 |
                               ["a"]           # 'ab'
                              /     \
                       ["a","a"]   ["aa"]      # 'b'
                         /             \
            ["a","a","b"]              ["aa","b"]

```

- First the returned vector is empty, then comes the first level
- The first level cuts starting from `a`, treating it as the first palindromic substring, then recursively handles the remaining `ab`
- Besides cutting out just `a`, we can also cut `aa` and treat it as a palindrome, then handle the remaining `b`
- Then comes the second level: after choosing `a`, we cut another `a` from the remaining `a`, then handle the remaining string `b`
- If we chose `aa`, only `b` is left to handle
- Third level: when we reach `b`, since `b` itself is a palindrome, it can be a single cut.

> First path: **`["a", "a", "b"]`**, cut as **`"a" → "a" → "b"`**
> Second path: **`["aa", "b"]`**, cut as **`"aa" → "b"`**

# When to use Backtracking

Because the amount of computation is huge, it's usually used for cases where you need to find all solutions, but the downside is also the huge amount of computation, which can further increase time complexity. **You can usually use the pruning mentioned earlier to reduce the number of searches.**

# Backtracking-related LeetCode problems

Medium
- **[17. Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[77. Combinations](https://leetcode.com/problems/combinations/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[46. Permutations](https://leetcode.com/problems/permutations/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[39. Combination Sum](https://leetcode.com/problems/combination-sum/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[22. Generate Parentheses](https://leetcode.com/problems/generate-parentheses/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[79. Word Search](https://leetcode.com/problems/word-search/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[688. Knight Probability in Chessboard](https://leetcode.com/problems/knight-probability-in-chessboard/description/?ref=secondlife.tw)**

Hard
- **[51. N-Queens](https://leetcode.com/problems/n-queens/description/)**
- **[52. N-Queens II](https://leetcode.com/problems/n-queens-ii/description/?envType=study-plan-v2&envId=top-interview-150)**

# Reference
[1] https://www.secondlife.tw/algorithms-backtracking/
[2] https://web.ntnu.edu.tw/~algo/Backtracking.html
[3] https://medium.com/@ralph-tech/%E6%BC%94%E7%AE%97%E6%B3%95%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-%E5%9B%9E%E6%BA%AF%E6%B3%95-backtracking-%E5%88%86%E6%94%AF%E5%AE%9A%E7%95%8C%E6%B3%95-branch-and-bound-29165391c377
[4] https://wiki.csie.ncku.edu.tw/acm/course/Backtracking
[5] https://www.javatpoint.com/backtracking-introduction
[6] https://willrosenbaum.com/teaching/2021s-cosc-112/notes/recursive-image/
[7] https://www.javatpoint.com/backtracking-introduction
[8] https://ithelp.ithome.com.tw/articles/10273084?ref=secondlife.tw
