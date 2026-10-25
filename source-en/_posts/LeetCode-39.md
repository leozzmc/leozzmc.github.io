---
title: Combination Sum | Medium | LeetCode#39. Combination Sum
tags:
  - backtracking
  - combinations
  - recursion
  - LeetCode
  - Medium
  - C++
abbrlink: "e650f909"
date: 2024-09-23 22:14:30
cover: /img/LeetCode/39/cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/e650f909.html)

# Problem statement

![](/img/LeetCode/39/question1.png)

![](/img/LeetCode/39/question2.png)

- Difficulty: `Medium`
- Statement: given an integer array `candidates` and a target integer `target`, return all unique combinations of `candidates` where the numbers in each combination sum to `target`. You may return the combinations in any order.

{% note info %}
In this problem, each number in `candidates` can be chosen an unlimited number of times. Two combinations are unique if at least one number is chosen a different number of times.
E.g. `[2,2,3] != [2,2,2,2,3]`
The test cases guarantee that the total number of unique combinations summing to the target is fewer than 150 for the given input.
{% endnote %}

# Solution

## Initial idea

Since it's a combination problem, backtracking comes to mind immediately. Unlike [**77. Combinations**](/en/posts/eb632302.html), this one doesn't limit the depth, because the problem says numbers in `candidates` can be reused an unlimited number of times, so the termination condition isn't limited by depth as usual.

We may need a variable to store the value at each choice, pass it to the next level to accumulate, and finally check whether it equals `target`. If not, keep choosing numbers. Also, unlike usual, since the same number can be reused, when entering each level we don't skip the current number and can reselect it.

## My solution

```cpp
class Solution {
public:
    vector<vector<int>> result;
    void combinationHelper(int currentVal, vector<int> &candidate, int target, vector<int> &subResults, int start){
        if(currentVal == target){
            result.push_back(subResults);
            return;
        }
        else if(currentVal < target){
            for(int i=start; i< candidate.size();i++){
                subResults.push_back(candidate[i]);
                //currentVal += candidate[i];
                combinationHelper(currentVal + candidate[i], candidate, target,subResults, i);
                subResults.pop_back();
            }
        }
    }
    vector<vector<int>> combinationSum(vector<int>& candidates, int target){
        vector<int> sub;
        combinationHelper(0,candidates, target, sub, 0);
        return result;
    }

};
```

Here we again define a helper function to handle the main backtracking. Parameter explanation:

- `currentVal`: the current combination's running sum
- `candidate`: the list of numbers given
- `target`: the target value given
- `subResults`: the array holding the current combination
- `start`: controls the starting position of numbers

`if(currentVal == target)` is the recursion's termination condition, meaning we found a valid sum. If the current sum `currentVal` is less than `target`, keep choosing numbers from `candidate` to combine. A for loop iterates `candidate` starting from index `start`, to ensure no duplicate combinations appear.

```cpp
combinationHelper(currentVal + candidate[i], candidate, target, subResults, i)
```
After choosing a number `candidate[i]` each time, add it to the running sum `currentVal` and recurse to search the next number. **Here `i` is passed to the recursive function, meaning the same number can be chosen multiple times.**

> I made a mistake before this: writing `currentVal += candidate[i]` and passing `currentVal`. **But this accumulates the change to `currentVal` and can't correctly restore its value after the recursion returns, affecting the whole search.**
 
```cpp
subResults.pop_back()
```

Backtrack to the previous choice.

Once `target` is found, the array is added to `result`, and finally we return the result.

### Execution result

![](/img/LeetCode/39/result.png)

# Complexity

## Time complexity

At each recursion level, we can choose any candidate number, letting each number be chosen multiple times and forming a large number of combinations. Each choice to recurse produces two options: **choose this number or not.**
So considering all possible combinations, the time complexity can approach $O(2^n)$.

## Space complexity

- Recursive call
In the worst case, the recursion depth depends on the target value `target`. Each choice recurses, and as the sum keeps accumulating, the deepest recursion level can reach $O(target)$.
Each recursion stack level saves the current state (including parameters), so the worst-case stack space complexity is $O(target)$.
- Result storage
`result` stores all qualifying combinations. If the number of combinations found is `k` and each combination's average length is `m`, the space for result storage is $O(k * m)$.
In the worst case, the number of combinations k can approach $O(2^n)$, since each candidate can be chosen multiple times. Each combination's length m can also approach `target` in the worst case.

So the overall space complexity can be written as: $O(target+k⋅m)$
