---
title: Binary Search | Easy | LeetCode#704 Binary Search
toc: true
tags:
  - Search
  - LeetCode
  - Array
  - Easy
categories: LeetCode Notes
aside: true
abbrlink: "22bf447e"
date: 2024-05-28 19:10:28
cover: /img/LeetCode/BS_cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/22bf447e.html)

# Problem statement

![](/img/LeetCode/BS_Question.jpeg)

The problem gives an integer array `nums` that is sorted, and we want to find the index of the element `target` in it, returning -1 if it isn't found. It also requires that the algorithm run in $O(\log n)$ time.


# Solution

## My approach


```c=
int search(int* nums, int numsSize, int target) {
    
    // init
    int i,mid=0,low=0, high=numsSize-1;

    // Binary search
    // 1. find lower index and high index according to the length of array
    // 2  calculate middle value
    // 3. update low and high value
    // 4. again calcuate the new middle value until derive the target value or return -1
    
    while(low <= high){
    // needs to consider the situation that the middle number is not an even number
    mid = (int)((low + high)/2.0); 
    // need to find the lower section of array
    
    if(nums[mid] > target){ 
            high = mid-1;  
    }
    else if(nums[mid] < target){
        low = mid+1;
    }
    else {
        // find value
        return mid;
    }
    }
  
  return -1;
}
```

This uses the standard binary search approach. **First we set the middle value `mid` where we split, taking the average of `low` and `high` to find the midpoint.** Then we start judging the cases:
- When `nums[mid] > target`: the midpoint is greater than the target, **meaning we can discard the right half of `mid` and search only the left half**, so we adjust `high` to shrink the search range
   - ```high = mid -1;```
-   When `nums[mid] < target`: the midpoint is less than the target, **meaning we can discard the left half of `mid` and search only the right half**, so we adjust `low` to shrink the search range
   - ```low = mid +1;```
- The third case is finding the `target` value in the array, so we return `mid`
- The while loop's termination condition is `low > high`, meaning we've searched too many times and confirmed the array has no target value, so we end the loop and `return -1`

> Note: for the midpoint it's better to rewrite it as `mid = low + (high - low)/2`. Doing so avoids the overflow problem when both `high` and `low` are large numbers and their sum overflows.

## Execution result

![](/img/LeetCode/BS_Result.png)

## Another approach: finding the upper bound

![](/img/LeetCode/BS_upper.png)


This is another approach I saw in the LeetCode solutions section. Rather than finding the Target itself directly, **find the position where Target could be inserted into the array**.

This solution first defines the block that can be inserted into, as the picture describes: for an array like `[-7,-4,3,9,9,9,12]`, the largest position it could be inserted at is between `9` and `12`, and the smallest position it could be inserted at is between `3` and `9`.

First, same as before, we need to compute the midpoint position, then when judging we consider separately:

-   When `nums[mid] < target`: the midpoint is less than the target, so the possible insert position is to the right of `mid`, so we adjust the `low` range and keep looking for the upper bound
   - ```low = mid +1;```
-   When `nums[mid] == target`: the midpoint equals the target, so the possible insert position is to the right of `mid`, so we adjust the `low` range and keep looking for the upper bound
   - ```low = mid +1;```
- When `nums[mid] > target`: the midpoint is greater than the target, so the possible insert position is to the left of `mid`, so we adjust the `high` range and keep looking for the upper bound. Here `mid` might also be an insertable position, so we set `high` to `mid`
   - ```high = mid;```

Once the loop ends, **`high` represents the insert position, and `low - 1` represents the largest element not greater than `target`.** So after it ends we need to check whether `nums[low-1]` equals `target`; if so return `low-1`, otherwise return -1.


The algorithm is as follows:

```c=
int search(int* nums, int numsSize, int target) {
    
    // array init
    int i,mid=0,low=0, high=numsSize-1;

    
    // Approach-2 Find Upper Bound
    while (low < high){

        mid = low + (int)((high-low)/2.0);

        if (nums[mid] <= target){
            low = mid +1;
        }
        else {
            high = mid;
        }

    }

    if( low > 0 && target == nums[low-1]){
        return low -1;
    }
    else if( nums[low] == target && low ==0 ){ // edge case
        return low;
    }
    else if ( high == numsSize-1 && target == nums[high]){ //edge case
        return high;
    }
    else {
        return -1;
    }
}
```

### Why does this method find the target?

- **Merging conditions**: in this method we merge the two conditions `nums[mid] < target` and `nums[mid] == target`, because whether it's less than or equal, the target's insert position should be to the right of `mid`. So in both cases we set `left` to `mid + 1`.
- **Keeping the valid range**: if `nums[mid] > target`, the target should be at `mid` or to its left, so we set `right` to `mid` rather than `mid - 1`, keeping `mid` as a possible position.
- **Loop termination check**: when `left` and `right` are equal, the loop ends, and `left` is the target's insert position. If the target exists in the array, then `left - 1` is the last position of the target. At that point we just need to check whether `nums[left - 1]` equals the target.

### Special cases

- All elements in the array are greater than the target: in this case `left` ends up equal to 0, which means the target doesn't exist in the array.
- All elements in the array are less than the target: in this case `left` ends up equal to the array length, and the target should be inserted at the last position of the array.

### Execution result



![](/img/LeetCode/BS_upper_result.png)

## Time complexity

The number of steps N -> 1/2 N -> 1/4 N -> 1/8 N ... converges to a constant following the $\log n$ function.
