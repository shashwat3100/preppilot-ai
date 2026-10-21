/**
 * PrepPilot AI — Comprehensive Programming Questions Bank
 * 105 Unique, High-Yield Technical Interview Questions
 * Zero Duplicates | Verified Correct Answers | In-Depth Explanations
 */

export function generateProgrammingBank() {
  const bank = [
    // --- 1. Arrays, Two Pointers & Sliding Window (q-prog-001 to q-prog-015) ---
    {
      id: 'q-prog-001',
      question: 'What is the optimal time complexity of Kadane\'s algorithm for finding the maximum contiguous subarray sum in an array of size n containing both positive and negative integers?',
      subject_id: 'sub-dsa',
      topic_id: 'top-arrays',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'Kadane\'s algorithm maintains a current running sum and global maximum in a single pass through the array, running in O(n) time and O(1) auxiliary space.',
      tags: ['Arrays', 'Kadane', 'Dynamic Programming', 'Optimal Substructure'],
      options: [
        { key: 'A', text: 'O(n log n) time and O(n) space' },
        { key: 'B', text: 'O(n) time and O(1) space' },
        { key: 'C', text: 'O(n^2) time and O(1) space' },
        { key: 'D', text: 'O(log n) time and O(n) space' }
      ]
    },
    {
      id: 'q-prog-002',
      question: 'In the Two-Pointer technique applied to find a pair with target sum in an array, what prerequisite condition must be satisfied to guarantee an O(n) scan?',
      subject_id: 'sub-dsa',
      topic_id: 'top-arrays',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'The Two-Pointer approach relies on monotonic ordering of elements; the array must be sorted so that sum < target moves left pointer right, and sum > target moves right pointer left.',
      tags: ['Arrays', 'Two Pointers', 'Searching', 'Sorting'],
      options: [
        { key: 'A', text: 'The array must contain only positive integers' },
        { key: 'B', text: 'All elements in the array must be unique' },
        { key: 'C', text: 'The array must be sorted in non-decreasing order' },
        { key: 'D', text: 'The array size must be an exact power of 2' }
      ]
    },
    {
      id: 'q-prog-003',
      question: 'The Dutch National Flag problem partitions an array of 0s, 1s, and 2s in-place. What three pointers are maintained, and what is its optimal time complexity?',
      subject_id: 'sub-dsa',
      topic_id: 'top-arrays',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'Dijkstra\'s Dutch National Flag algorithm uses low, mid, and high pointers, sorting 3 distinct keys in exactly 1 pass (O(n) time and O(1) space).',
      tags: ['Arrays', 'Partitioning', 'Dijkstra', 'Sorting'],
      options: [
        { key: 'A', text: 'low, mid, and high in O(n) time and O(1) space' },
        { key: 'B', text: 'start, center, and end in O(n log n) time and O(n) space' },
        { key: 'C', text: 'head, tail, and pivot in O(n^2) time and O(1) space' },
        { key: 'D', text: 'left and right with two passes in O(2n) time and O(n) space' }
      ]
    },
    {
      id: 'q-prog-004',
      question: 'Which data structure allows computing range sum queries in O(1) time after an O(n) preprocessing step on a static array?',
      subject_id: 'sub-dsa',
      topic_id: 'top-arrays',
      difficulty: 'Easy',
      correct_answer: 'D',
      explanation: 'A Prefix Sum array pref[i] = pref[i-1] + arr[i] allows query(L, R) = pref[R] - pref[L-1] in strictly O(1) time after O(n) construction.',
      tags: ['Arrays', 'Prefix Sum', 'Range Queries', 'Preprocessing'],
      options: [
        { key: 'A', text: 'Binary Indexed Tree (Fenwick Tree)' },
        { key: 'B', text: 'Segment Tree' },
        { key: 'C', text: 'Monotonic Queue' },
        { key: 'D', text: 'Prefix Sum Array' }
      ]
    },
    {
      id: 'q-prog-005',
      question: 'When finding the longest substring without repeating characters using the Sliding Window algorithm, how is the left boundary updated upon encountering a duplicate character c?',
      subject_id: 'sub-dsa',
      topic_id: 'top-sliding-window',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'The left boundary is moved to max(left, lastSeenIndex[c] + 1) to ensure the current window contains only distinct characters without moving backwards.',
      tags: ['Sliding Window', 'Strings', 'Hash Map', 'Two Pointers'],
      options: [
        { key: 'A', text: 'Reset left boundary to 0 unconditionally' },
        { key: 'B', text: 'left = max(left, lastSeenIndex[c] + 1)' },
        { key: 'C', text: 'left is incremented by 1 sequentially until duplicate count is 0' },
        { key: 'D', text: 'right boundary is decremented backwards to left' }
      ]
    },
    {
      id: 'q-prog-006',
      question: 'What is the minimum number of swaps required to sort an array of n distinct elements?',
      subject_id: 'sub-dsa',
      topic_id: 'top-arrays',
      difficulty: 'Hard',
      correct_answer: 'C',
      explanation: 'By decomposing the array into disjoint permutation cycles, the minimum swaps required is sum of (cycle_length - 1) across all cycles, which equals n - (number of cycles).',
      tags: ['Arrays', 'Cycles', 'Graph Theory', 'Permutations'],
      options: [
        { key: 'A', text: 'n - 1' },
        { key: 'B', text: 'n / 2' },
        { key: 'C', text: 'n - (number of disjoint permutation cycles)' },
        { key: 'D', text: 'Inversion count divided by 2' }
      ]
    },
    {
      id: 'q-prog-007',
      question: 'In Moore\'s Voting Algorithm for finding the majority element (element appearing more than n/2 times), what does the algorithm do when the count drops to 0?',
      subject_id: 'sub-dsa',
      topic_id: 'top-arrays',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'When count == 0, the previous candidate is canceled out by differing elements, so the current element becomes the new candidate and count is reset to 1.',
      tags: ['Arrays', 'Moore Voting', 'Majority Element', 'Optimal Algorithms'],
      options: [
        { key: 'A', text: 'Picks the current element as the new candidate and sets count = 1' },
        { key: 'B', text: 'Terminates early because no majority element exists' },
        { key: 'C', text: 'Rolls back to the first element of the array' },
        { key: 'D', text: 'Increments the candidate by 1' }
      ]
    },
    {
      id: 'q-prog-008',
      question: 'What is the time complexity to find the median of two sorted arrays of lengths m and n using binary search partition?',
      subject_id: 'sub-dsa',
      topic_id: 'top-searching-sorting',
      difficulty: 'Hard',
      correct_answer: 'B',
      explanation: 'By partitioning the smaller array of size min(m, n) via binary search, the partition condition is checked in O(1), yielding O(log(min(m, n))) time complexity.',
      tags: ['Binary Search', 'Arrays', 'Median', 'Divide and Conquer'],
      options: [
        { key: 'A', text: 'O(m + n)' },
        { key: 'B', text: 'O(log(min(m, n)))' },
        { key: 'C', text: 'O(log(m + n) * log(m + n))' },
        { key: 'D', text: 'O(min(m, n))' }
      ]
    },
    {
      id: 'q-prog-009',
      question: 'In the Next Greater Element problem for an array of size n, which data structure achieves an optimal O(n) total time complexity?',
      subject_id: 'sub-dsa',
      topic_id: 'top-stack-queue',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'A monotonic decreasing stack maintains candidate elements. Each element is pushed and popped at most once, resulting in amortized O(1) per element and O(n) overall.',
      tags: ['Stacks', 'Monotonic Stack', 'Next Greater Element', 'Linear Time'],
      options: [
        { key: 'A', text: 'Binary Search Tree' },
        { key: 'B', text: 'Max Heap' },
        { key: 'C', text: 'Monotonic Decreasing Stack' },
        { key: 'D', text: 'Circular Queue' }
      ]
    },
    {
      id: 'q-prog-010',
      question: 'What is the maximum number of trapped rainwater units between elevation bars represented by an array, and what is the optimal space complexity using two pointers?',
      subject_id: 'sub-dsa',
      topic_id: 'top-arrays',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'The Trapping Rain Water problem can be solved in O(n) time and O(1) auxiliary space using two pointers (left and right) with leftMax and rightMax variables.',
      tags: ['Two Pointers', 'Trapping Rain Water', 'Arrays', 'Space Optimization'],
      options: [
        { key: 'A', text: 'O(n) time with O(1) auxiliary space' },
        { key: 'B', text: 'O(n log n) time with O(n) auxiliary space' },
        { key: 'C', text: 'O(n^2) time with O(1) auxiliary space' },
        { key: 'D', text: 'O(n) time with strictly O(n) auxiliary space' }
      ]
    },
    {
      id: 'q-prog-011',
      question: 'In a circular array, how is the index of the next element after index i calculated in zero-based indexing for an array of size n?',
      subject_id: 'sub-dsa',
      topic_id: 'top-arrays',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'Modulo arithmetic (i + 1) % n wraps index n-1 back to 0 seamlessly for circular traversal.',
      tags: ['Arrays', 'Modulo Arithmetic', 'Circular Buffer'],
      options: [
        { key: 'A', text: '(i + 1) / n' },
        { key: 'B', text: '(i + n) * 2' },
        { key: 'C', text: '(i + 1) % n' },
        { key: 'D', text: 'i == n ? 0 : i + 1' }
      ]
    },
    {
      id: 'q-prog-012',
      question: 'Which algorithm finds all anagrams of a pattern string P of length m inside a text string T of length n in O(n) time?',
      subject_id: 'sub-dsa',
      topic_id: 'top-sliding-window',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'A fixed-size sliding window of length m maintains character frequency counts. Sliding the window updates one entry on entry and exit, running in O(n) time with O(alphabet) space.',
      tags: ['Sliding Window', 'Strings', 'Anagrams', 'Frequency Array'],
      options: [
        { key: 'A', text: 'Brute force sorting of every substring in O(n * m log m)' },
        { key: 'B', text: 'Fixed-size Sliding Window of size m with character frequency diff' },
        { key: 'C', text: 'Rabin-Karp hash matching with prime modulo' },
        { key: 'D', text: 'Trie-based suffix matching' }
      ]
    },
    {
      id: 'q-prog-013',
      question: 'What is the time complexity of building a Prefix XOR array and querying the XOR sum of any subarray arr[L..R]?',
      subject_id: 'sub-dsa',
      topic_id: 'top-bit-manipulation',
      difficulty: 'Easy',
      correct_answer: 'D',
      explanation: 'Building the prefix XOR takes O(n) time. Because x ^ x = 0, query(L, R) = pref[R] ^ pref[L-1] takes strictly O(1) time.',
      tags: ['Bit Manipulation', 'Prefix XOR', 'Range Query', 'Invertible Operations'],
      options: [
        { key: 'A', text: 'O(log n) build and O(log n) query' },
        { key: 'B', text: 'O(n) build and O(n) query' },
        { key: 'C', text: 'O(n log n) build and O(1) query' },
        { key: 'D', text: 'O(n) build and O(1) query' }
      ]
    },
    {
      id: 'q-prog-014',
      question: 'In an array where all elements appear twice except two distinct elements that appear once, what bitwise operation separates the two unique numbers in O(n) time and O(1) space?',
      subject_id: 'sub-dsa',
      topic_id: 'top-bit-manipulation',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'XORing all elements yields (X ^ Y). Finding any set bit (e.g. lowest set bit: diff & -diff) divides elements into two groups, isolating X and Y in two O(n) passes.',
      tags: ['Bit Manipulation', 'XOR Trick', 'Two Unique Numbers', 'Optimal Space'],
      options: [
        { key: 'A', text: 'XOR all elements, then partition array by the rightmost set bit of the result' },
        { key: 'B', text: 'Bitwise AND all elements together' },
        { key: 'C', text: 'Bitwise NOT each element and sum up modulo 2' },
        { key: 'D', text: 'Left shift elements until an overflow occurs' }
      ]
    },
    {
      id: 'q-prog-015',
      question: 'Given an array representing stock prices where prices[i] is the price on day i, what is the maximum profit achievable with at most 1 transaction (buy once, sell once)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-arrays',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'Maintain minPrice seen so far and update maxProfit = max(maxProfit, price - minPrice) in a single pass of O(n) time and O(1) space.',
      tags: ['Arrays', 'Greedy', 'Stock Buy Sell', 'Linear Scan'],
      options: [
        { key: 'A', text: 'O(n^2) nested loop checking every buy and sell pair' },
        { key: 'B', text: 'Sorting prices in O(n log n) and subtracting minimum from maximum' },
        { key: 'C', text: 'Single pass O(n) tracking the minimum buying price seen so far' },
        { key: 'D', text: 'Recursive divide and conquer with O(n log n) overhead' }
      ]
    },

    // --- 2. Linked Lists & Pointer Manipulation (q-prog-016 to q-prog-030) ---
    {
      id: 'q-prog-016',
      question: 'In Floyd\'s Cycle Detection Algorithm (Tortoise and Hare), if a loop exists in a singly linked list, at what rate does the distance between the fast and slow pointers decrease?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'The fast pointer advances 2 steps while slow advances 1 step per iteration, closing the gap inside the loop by exactly 1 node per iteration, guaranteeing intersection within the loop length.',
      tags: ['Linked Lists', 'Floyd Cycle', 'Pointers', 'Tortoise and Hare'],
      options: [
        { key: 'A', text: 'By 2 nodes per step' },
        { key: 'B', text: 'By 1 node per step' },
        { key: 'C', text: 'By half the loop length per step' },
        { key: 'D', text: 'By 0 nodes because their speeds are constant' }
      ]
    },
    {
      id: 'q-prog-017',
      question: 'Once the fast and slow pointers meet inside a linked list cycle, how is the exact starting node of the cycle located?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'Reset one pointer to the head of the list while keeping the other at the meeting point. Advance both by 1 step simultaneously; the node where they collide is mathematically the start of the loop.',
      tags: ['Linked Lists', 'Cycle Detection', 'Floyd Mathematical Proof'],
      options: [
        { key: 'A', text: 'Reset one pointer to head; advance both 1 step at a time until they collide' },
        { key: 'B', text: 'Reverse the entire list from the meeting point' },
        { key: 'C', text: 'Count the nodes in the loop and subtract from list length' },
        { key: 'D', text: 'Advance fast by 3 steps and slow by 2 steps' }
      ]
    },
    {
      id: 'q-prog-018',
      question: 'How do you find the n-th node from the end of a singly linked list in a single pass without computing total length first?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'Advance a fast pointer n steps ahead. Then advance both fast and slow pointers one step at a time until fast reaches null. Slow will point to the n-th node from the end.',
      tags: ['Linked Lists', 'Two Pointers', 'One Pass', 'Offset Pointers'],
      options: [
        { key: 'A', text: 'Use recursion with an array of size n' },
        { key: 'B', text: 'Reverse the list twice' },
        { key: 'C', text: 'Advance first pointer by n nodes, then advance both pointers together until first reaches the end' },
        { key: 'D', text: 'Use a doubly linked list conversion' }
      ]
    },
    {
      id: 'q-prog-019',
      question: 'What is the optimal time complexity to merge k sorted linked lists having a total of N nodes?',
      subject_id: 'sub-dsa',
      topic_id: 'top-heaps-priority',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'Using a min-heap of size k containing the head of each list, extracting minimum and pushing the next node takes O(log k) per node, yielding O(N log k) total time.',
      tags: ['Linked Lists', 'Min Heap', 'Priority Queue', 'Merge K Sorted'],
      options: [
        { key: 'A', text: 'O(N * k)' },
        { key: 'B', text: 'O(N log k)' },
        { key: 'C', text: 'O(k log N)' },
        { key: 'D', text: 'O(N^2)' }
      ]
    },
    {
      id: 'q-prog-020',
      question: 'In-place iterative reversal of a singly linked list requires maintaining how many pointer references?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'Reversing in-place requires three pointers: prev (initially null), curr (current node), and nextNode (to preserve the forward link before curr->next = prev).',
      tags: ['Linked Lists', 'Reversal', 'Pointers', 'In-Place'],
      options: [
        { key: 'A', text: 'Three pointers: prev, curr, and nextNode' },
        { key: 'B', text: 'Two pointers: head and tail' },
        { key: 'C', text: 'One pointer with arithmetic XOR' },
        { key: 'D', text: 'Four pointers: prev, curr, next, and pivot' }
      ]
    },
    {
      id: 'q-prog-021',
      question: 'What is an XOR Linked List (Memory Efficient Doubly Linked List)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Hard',
      correct_answer: 'D',
      explanation: 'An XOR linked list stores the bitwise XOR of the memory addresses of previous and next nodes (npx = prev ^ next) in each node, saving memory by using one pointer field instead of two.',
      tags: ['Linked Lists', 'Bit Manipulation', 'Memory Efficiency', 'Pointers'],
      options: [
        { key: 'A', text: 'A list where nodes store boolean parity bits' },
        { key: 'B', text: 'A circular linked list with encrypted data payloads' },
        { key: 'C', text: 'A skip list that uses XOR hashing for levels' },
        { key: 'D', text: 'A doubly linked list node storing address(prev) ^ address(next) in a single pointer field' }
      ]
    },
    {
      id: 'q-prog-022',
      question: 'How can you detect whether two singly linked lists intersect at a common node without modifying node values?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'Traverse list A and list B simultaneously. When a pointer reaches the end of its list, redirect it to the head of the other list. They will travel equal distance (lenA + lenB) and meet at the intersection node.',
      tags: ['Linked Lists', 'Intersection', 'Two Pointers', 'Cycle-Free'],
      options: [
        { key: 'A', text: 'Compare the values of the first node of each list' },
        { key: 'B', text: 'Two pointers traverse list A then B, and list B then A; they meet at the intersection node in O(m + n) time' },
        { key: 'C', text: 'Sort both linked lists and binary search for common addresses' },
        { key: 'D', text: 'Reverse list A and check if list B becomes circular' }
      ]
    },
    {
      id: 'q-prog-023',
      question: 'What is the auxiliary space complexity of reversing a singly linked list recursively vs iteratively?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'Iterative reversal uses O(1) auxiliary space, whereas recursive reversal consumes O(n) auxiliary space on the call stack due to n nested activation records.',
      tags: ['Linked Lists', 'Call Stack', 'Recursion', 'Space Complexity'],
      options: [
        { key: 'A', text: 'Iterative is O(n), Recursive is O(1)' },
        { key: 'B', text: 'Both are strictly O(1)' },
        { key: 'C', text: 'Iterative is O(1), Recursive is O(n) call stack space' },
        { key: 'D', text: 'Both are O(n log n)' }
      ]
    },
    {
      id: 'q-prog-024',
      question: 'When deleting a node in a singly linked list given only a pointer to that node (and no pointer to head), what trick is performed?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'Copy the data from node->next into node, then bypass node->next by setting node->next = node->next->next and deleting the copied node. Note: This cannot be used if node is the last node.',
      tags: ['Linked Lists', 'In-place Deletion', 'Pointers', 'Corner Cases'],
      options: [
        { key: 'A', text: 'Copy next node\'s data into current node, then delete next node' },
        { key: 'B', text: 'Traverse backwards using pointer arithmetic' },
        { key: 'C', text: 'Set current node pointer to null' },
        { key: 'D', text: 'Recursively swap values with head' }
      ]
    },
    {
      id: 'q-prog-025',
      question: 'In a Skip List with n elements, what is the expected search, insert, and delete time complexity?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Hard',
      correct_answer: 'D',
      explanation: 'Skip lists use randomized multi-level linked lists (coin flipping for express lane levels) achieving O(log n) expected time for search, insertion, and deletion with O(n) space.',
      tags: ['Skip List', 'Probabilistic Data Structures', 'Linked Lists', 'Search Complexity'],
      options: [
        { key: 'A', text: 'O(1) worst case' },
        { key: 'B', text: 'O(n) expected and O(log n) worst case' },
        { key: 'C', text: 'O(sqrt(n)) expected' },
        { key: 'D', text: 'O(log n) expected time with O(n) space' }
      ]
    },
    {
      id: 'q-prog-026',
      question: 'What is the purpose of using a Sentinel (Dummy) Head node in linked list insertion and deletion algorithms?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'A dummy head eliminates special conditional checks for empty lists or modifications at the head (e.g., removing head node), making code uniform and bug-free.',
      tags: ['Linked Lists', 'Dummy Node', 'Code Cleanliness', 'Edge Cases'],
      options: [
        { key: 'A', text: 'To encrypt data stored in the linked list' },
        { key: 'B', text: 'To eliminate special-case edge handling for operations at the head of the list' },
        { key: 'C', text: 'To turn singly linked lists into doubly linked lists automatically' },
        { key: 'D', text: 'To prevent buffer overflow in operating system registers' }
      ]
    },
    {
      id: 'q-prog-027',
      question: 'How do you check if a singly linked list is a palindrome in O(n) time and O(1) auxiliary space?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: '1) Find middle using fast/slow pointers. 2) Reverse second half in-place. 3) Compare first half with second half. 4) Optionally restore second half. Runs in O(n) time and O(1) space.',
      tags: ['Linked Lists', 'Palindrome', 'In-Place Reversal', 'Two Pointers'],
      options: [
        { key: 'A', text: 'Find middle, reverse the second half in-place, compare both halves, and restore list' },
        { key: 'B', text: 'Push all node values to a stack and pop them' },
        { key: 'C', text: 'Convert all node values into an integer string' },
        { key: 'D', text: 'Recursive reversal storing pointers in a hash table' }
      ]
    },
    {
      id: 'q-prog-028',
      question: 'Which sorting algorithm is most naturally suited for sorting a singly linked list in O(n log n) time and O(1) auxiliary space?',
      subject_id: 'sub-dsa',
      topic_id: 'top-searching-sorting',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'Merge Sort is optimal for linked lists because finding the midpoint (fast/slow) takes O(n) and merging two sorted lists takes O(n) without requiring random access or auxiliary arrays.',
      tags: ['Merge Sort', 'Linked Lists', 'Sorting', 'Optimal Algorithms'],
      options: [
        { key: 'A', text: 'Quick Sort with Hoare partition' },
        { key: 'B', text: 'Heap Sort' },
        { key: 'C', text: 'Merge Sort' },
        { key: 'D', text: 'Binary Insertion Sort' }
      ]
    },
    {
      id: 'q-prog-029',
      question: 'When deep-copying a linked list with random pointers (where each node has a next and a random pointer), what is the O(1) space trick without using a hash map?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Hard',
      correct_answer: 'D',
      explanation: 'Weave copied nodes directly next to original nodes (curr->next = copy, copy->next = originalNext). Set copy->random = original->random->next. Finally, unweave the two lists in O(n) time and O(1) space.',
      tags: ['Linked Lists', 'Deep Copy', 'Interleaving', 'Random Pointer'],
      options: [
        { key: 'A', text: 'Store random pointers in an adjacency matrix' },
        { key: 'B', text: 'Sort nodes by address' },
        { key: 'C', text: 'Use an XOR checksum of node values' },
        { key: 'D', text: 'Interleave cloned nodes directly between original nodes, populate random pointers, then unweave' }
      ]
    },
    {
      id: 'q-prog-030',
      question: 'In reordering a linked list L0 -> L1 -> ... -> Ln-1 -> Ln into L0 -> Ln -> L1 -> Ln-1 -> L2 -> ..., what sequence of operations is used?',
      subject_id: 'sub-dsa',
      topic_id: 'top-linked-lists',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'Find middle -> split into two halves -> reverse the second half -> merge the two halves alternately. Runs in O(n) time and O(1) auxiliary space.',
      tags: ['Linked Lists', 'Reorder List', 'Middle Node', 'Interleaving'],
      options: [
        { key: 'A', text: 'Bubble sort pointers based on index parity' },
        { key: 'B', text: 'Find middle with slow/fast, reverse second half, and merge the two halves alternately' },
        { key: 'C', text: 'Recursively swap pairs from front to back' },
        { key: 'D', text: 'Use a circular doubly linked list rotation' }
      ]
    },

    // --- 3. Trees, Binary Search Trees & Heaps (q-prog-031 to q-prog-045) ---
    {
      id: 'q-prog-031',
      question: 'In a binary search tree (BST), which tree traversal visits all nodes in strictly ascending sorted order?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'Inorder traversal visits Left Subtree -> Root -> Right Subtree. Since BST definition ensures Left < Root < Right, inorder traversal produces values in non-decreasing sorted order.',
      tags: ['Trees', 'BST', 'Inorder Traversal', 'Sorting Property'],
      options: [
        { key: 'A', text: 'Preorder traversal (Root, Left, Right)' },
        { key: 'B', text: 'Inorder traversal (Left, Root, Right)' },
        { key: 'C', text: 'Postorder traversal (Left, Right, Root)' },
        { key: 'D', text: 'Level order traversal (BFS)' }
      ]
    },
    {
      id: 'q-prog-032',
      question: 'What is Morris Traversal, and what are its time and auxiliary space complexities for traversing a binary tree?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Hard',
      correct_answer: 'A',
      explanation: 'Morris Traversal uses threaded binary trees (creating temporary links from inorder predecessor to current node), achieving O(n) time and strictly O(1) auxiliary space without recursion or stack.',
      tags: ['Trees', 'Morris Traversal', 'Threaded Binary Tree', 'O(1) Space'],
      options: [
        { key: 'A', text: 'O(n) time and strictly O(1) auxiliary space without recursion or stack' },
        { key: 'B', text: 'O(n log n) time and O(n) space using a min-heap' },
        { key: 'C', text: 'O(n) time and O(log n) space using explicit call stack' },
        { key: 'D', text: 'O(n^2) time and O(1) space using breadth-first markers' }
      ]
    },
    {
      id: 'q-prog-033',
      question: 'In an AVL tree, what is the maximum allowed difference between the heights of the left and right subtrees for any node (Balance Factor)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'An AVL tree is a self-balancing binary search tree where the balance factor (height(left) - height(right)) must be in {-1, 0, +1}. Any deviation triggers tree rotations.',
      tags: ['Trees', 'AVL Tree', 'Balance Factor', 'Self Balancing'],
      options: [
        { key: 'A', text: '0 strictly' },
        { key: 'B', text: 'At most 2' },
        { key: 'C', text: 'At most 1 (Balance Factor in {-1, 0, +1})' },
        { key: 'D', text: 'Log2(n)' }
      ]
    },
    {
      id: 'q-prog-034',
      question: 'When an insertion in an AVL tree occurs into the left subtree of the right child of an unbalanced node, which rotation restores balance?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Medium',
      correct_answer: 'D',
      explanation: 'This is the Right-Left (RL) case. It requires a double rotation: first a Right rotation on the right child, followed by a Left rotation on the unbalanced node.',
      tags: ['AVL Tree', 'Rotations', 'Right-Left Case', 'Balance Restoration'],
      options: [
        { key: 'A', text: 'Single Left Rotation (LL)' },
        { key: 'B', text: 'Single Right Rotation (RR)' },
        { key: 'C', text: 'Left-Right Double Rotation (LR)' },
        { key: 'D', text: 'Right-Left Double Rotation (RL)' }
      ]
    },
    {
      id: 'q-prog-035',
      question: 'What is the Lowest Common Ancestor (LCA) of two nodes p and q in a Binary Search Tree (BST)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'In a BST, the LCA is the first node whose value lies between p and q (min(p, q) <= node->val <= max(p, q)). If both are smaller, go left; if both are larger, go right.',
      tags: ['BST', 'Lowest Common Ancestor', 'Trees', 'Divide and Conquer'],
      options: [
        { key: 'A', text: 'The root node unconditionally' },
        { key: 'B', text: 'The first node where values of p and q split (one <= node->val <= other)' },
        { key: 'C', text: 'The node with the deeper level among p and q' },
        { key: 'D', text: 'The node whose height equals depth of p plus depth of q' }
      ]
    },
    {
      id: 'q-prog-036',
      question: 'What is the diameter of a binary tree?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'The diameter (or width) of a tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root.',
      tags: ['Trees', 'Tree Diameter', 'Recursion', 'Tree Height'],
      options: [
        { key: 'A', text: 'The length of the longest path between any two leaf or internal nodes in the tree' },
        { key: 'B', text: 'The total number of leaf nodes in the tree' },
        { key: 'C', text: 'The maximum degree of any node in the tree' },
        { key: 'D', text: 'Twice the height of the root node' }
      ]
    },
    {
      id: 'q-prog-037',
      question: 'How much time does it take to build a Binary Heap of n elements from an unsorted array using bottom-up heapify (buildHeap)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-heaps-priority',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'Bottom-up buildHeap runs in O(n) time, proven by the summation sum_{h=0}^{log n} (n / 2^(h+1)) * O(h) which converges to O(n), unlike inserting n elements individually which takes O(n log n).',
      tags: ['Heaps', 'Build Heap', 'Time Complexity', 'Mathematical Proof'],
      options: [
        { key: 'A', text: 'O(n log n)' },
        { key: 'B', text: 'O(n)' },
        { key: 'C', text: 'O(n^2)' },
        { key: 'D', text: 'O(log n)' }
      ]
    },
    {
      id: 'q-prog-038',
      question: 'In a complete binary max-heap stored as a 0-indexed array, for an element at index i, what are the indices of its left child, right child, and parent?',
      subject_id: 'sub-dsa',
      topic_id: 'top-heaps-priority',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'In 0-indexed array representation: left child = 2*i + 1, right child = 2*i + 2, parent = floor((i - 1) / 2).',
      tags: ['Heaps', 'Array Representation', 'Complete Binary Tree', 'Formulas'],
      options: [
        { key: 'A', text: 'Left = 2*i + 1, Right = 2*i + 2, Parent = (i - 1) / 2' },
        { key: 'B', text: 'Left = 2*i, Right = 2*i + 1, Parent = i / 2' },
        { key: 'C', text: 'Left = i + 1, Right = i + 2, Parent = i - 1' },
        { key: 'D', text: 'Left = 2*i - 1, Right = 2*i, Parent = (i + 1) / 2' }
      ]
    },
    {
      id: 'q-prog-039',
      question: 'Which of the following conditions is required for a Red-Black Tree to remain valid?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Hard',
      correct_answer: 'C',
      explanation: 'Red-Black tree properties: 1) Every node is red or black. 2) Root is black. 3) Leaves (NIL) are black. 4) If a node is red, both children are black. 5) Every path from a node to its descendant NIL leaves contains the same number of black nodes (black-height).',
      tags: ['Red-Black Tree', 'Self Balancing', 'Invariants', 'Black Height'],
      options: [
        { key: 'A', text: 'Every leaf node must be colored Red' },
        { key: 'B', text: 'The root node must always be Red' },
        { key: 'C', text: 'Every path from a node to descendant NIL leaves must contain the exact same number of black nodes' },
        { key: 'D', text: 'Two adjacent red nodes are permitted as long as total red count is even' }
      ]
    },
    {
      id: 'q-prog-040',
      question: 'How do you serialize and deserialize a binary tree efficiently?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'Using preorder traversal (or level-order BFS) with a sentinel marker (like "#" or "null") for null pointers allows unambiguous reconstruction of the exact binary tree topology in O(n) time.',
      tags: ['Trees', 'Serialization', 'BFS', 'Preorder Traversal'],
      options: [
        { key: 'A', text: 'Inorder traversal alone without null markers is sufficient' },
        { key: 'B', text: 'Preorder traversal storing a sentinel symbol for null nodes enables unambiguous O(n) reconstruction' },
        { key: 'C', text: 'Storing only the height and leaf count' },
        { key: 'D', text: 'Serializing memory pointers directly to binary file' }
      ]
    },
    {
      id: 'q-prog-041',
      question: 'A Trie (Prefix Tree) has n keys with maximum length L over an alphabet of size Sigma. What is the time complexity to search for a word of length k?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trie',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'Searching for a word of length k in a Trie checks one node per character, taking exactly O(k) time regardless of the total number of words n in the dictionary.',
      tags: ['Trie', 'Prefix Tree', 'Search Complexity', 'String Matching'],
      options: [
        { key: 'A', text: 'O(k) where k is the length of the query string' },
        { key: 'B', text: 'O(n * k)' },
        { key: 'C', text: 'O(log n)' },
        { key: 'D', text: 'O(Sigma^k)' }
      ]
    },
    {
      id: 'q-prog-042',
      question: 'What is a Segment Tree, and what are its update and range query time complexities for an array of size n?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Hard',
      correct_answer: 'D',
      explanation: 'A segment tree is a full binary tree where each node represents an interval segment. It supports point/range updates in O(log n) and range queries (sum, min, gcd) in O(log n) time with O(n) space.',
      tags: ['Segment Tree', 'Range Queries', 'Point Updates', 'Tree Structures'],
      options: [
        { key: 'A', text: 'O(1) query and O(n) update' },
        { key: 'B', text: 'O(n) query and O(1) update' },
        { key: 'C', text: 'O(sqrt(n)) query and O(1) update' },
        { key: 'D', text: 'O(log n) query and O(log n) update with O(n) space' }
      ]
    },
    {
      id: 'q-prog-043',
      question: 'What property must hold true for an array of integers to represent the preorder traversal of a valid Binary Search Tree?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'For any node acting as root, after elements smaller than root (left subtree) finish, all subsequent elements (right subtree) must be strictly greater than root. Monotonic stacks verify this in O(n) time.',
      tags: ['Trees', 'BST Validation', 'Preorder Traversal', 'Monotonic Stack'],
      options: [
        { key: 'A', text: 'The array must be strictly alternating between even and odd' },
        { key: 'B', text: 'All leaves must appear in the second half of the array' },
        { key: 'C', text: 'Once an element greater than root appears, no subsequent element can be smaller than root' },
        { key: 'D', text: 'The array must be completely symmetric around its midpoint' }
      ]
    },
    {
      id: 'q-prog-044',
      question: 'What is the maximum number of nodes at level L in a binary tree (assuming the root is at level 0)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'At level 0, there is 2^0 = 1 node. At level 1, 2^1 = 2 nodes. By induction, level L contains at most 2^L nodes.',
      tags: ['Trees', 'Binary Tree Properties', 'Math Formulations'],
      options: [
        { key: 'A', text: '2^L' },
        { key: 'B', text: '2^(L + 1) - 1' },
        { key: 'C', text: '2^(L - 1)' },
        { key: 'D', text: 'L^2' }
      ]
    },
    {
      id: 'q-prog-045',
      question: 'Which tree traversal is equivalent to a Breadth-First Search (BFS) on a tree using a FIFO Queue?',
      subject_id: 'sub-dsa',
      topic_id: 'top-trees',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'Level Order Traversal explores the tree level by level using a queue, which is identical to Breadth-First Search on a directed tree graph.',
      tags: ['Trees', 'BFS', 'Level Order Traversal', 'Queues'],
      options: [
        { key: 'A', text: 'Postorder traversal' },
        { key: 'B', text: 'Level Order traversal' },
        { key: 'C', text: 'Inorder traversal' },
        { key: 'D', text: 'Preorder traversal' }
      ]
    },

    // --- 4. Graphs, Disjoint Sets & Shortest Path (q-prog-046 to q-prog-060) ---
    {
      id: 'q-prog-046',
      question: 'What is the time complexity of Dijkstra\'s algorithm on a graph with V vertices and E edges using a binary min-heap priority queue?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'Extract-min takes O(log V) for each of the V vertices, and decrease-key (or adding adjacent edges) takes O(log V) for each of the E edges, resulting in O((V + E) log V).',
      tags: ['Graphs', 'Dijkstra', 'Shortest Path', 'Min Heap'],
      options: [
        { key: 'A', text: 'O(V^2)' },
        { key: 'B', text: 'O(V * E)' },
        { key: 'C', text: 'O((V + E) log V)' },
        { key: 'D', text: 'O(V + E)' }
      ]
    },
    {
      id: 'q-prog-047',
      question: 'Why does Dijkstra\'s algorithm fail on graphs containing negative edge weights?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'Dijkstra assumes that adding edges to a path can never decrease the total path length (greedy choice property). Negative weights violate this assumption because a visited node\'s shortest path can become smaller later.',
      tags: ['Graphs', 'Dijkstra Limitations', 'Greedy Invariant', 'Negative Edges'],
      options: [
        { key: 'A', text: 'Because heaps cannot store negative floating-point numbers' },
        { key: 'B', text: 'Because its greedy choice property assumes path weights are monotonically non-decreasing' },
        { key: 'C', text: 'Because negative cycles cause a stack overflow in DFS' },
        { key: 'D', text: 'Because adjacency matrices cannot store signed integers' }
      ]
    },
    {
      id: 'q-prog-048',
      question: 'Which algorithm finds single-source shortest paths in a directed graph with negative weights and detects negative weight cycles?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'The Bellman-Ford algorithm relaxes all edges V-1 times in O(V * E) time. A V-th iteration that successfully relaxes any edge proves the existence of a reachable negative-weight cycle.',
      tags: ['Graphs', 'Bellman-Ford', 'Negative Cycles', 'Dynamic Programming'],
      options: [
        { key: 'A', text: 'Bellman-Ford algorithm in O(V * E) time' },
        { key: 'B', text: 'Floyd-Warshall algorithm in O(V^4) time' },
        { key: 'C', text: 'Kruskal\'s algorithm in O(E log E) time' },
        { key: 'D', text: 'Tarjan\'s bridge detection algorithm' }
      ]
    },
    {
      id: 'q-prog-049',
      question: 'What is the nearly constant amortized time complexity of Disjoint Set Union (DSU / Union-Find) operations when using both Path Compression and Union by Rank?',
      subject_id: 'sub-dsa',
      topic_id: 'top-dsu',
      difficulty: 'Medium',
      correct_answer: 'D',
      explanation: 'Combining path compression with union by rank/size yields an amortized time complexity of O(alpha(n)) per operation, where alpha is the inverse Ackermann function (alpha(n) < 5 for all practical universe values).',
      tags: ['DSU', 'Union Find', 'Inverse Ackermann', 'Path Compression'],
      options: [
        { key: 'A', text: 'O(log n)' },
        { key: 'B', text: 'O(n)' },
        { key: 'C', text: 'O(1) strict worst-case' },
        { key: 'D', text: 'O(alpha(n)) amortized, where alpha is the Inverse Ackermann function' }
      ]
    },
    {
      id: 'q-prog-050',
      question: 'In Kahn\'s algorithm for Topological Sorting of a Directed Acyclic Graph (DAG), what vertices are placed into the initial queue?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'Kahn\'s algorithm begins by placing all vertices with in-degree == 0 into the queue. Removing a vertex decrements the in-degrees of its neighbors, simulating task dependency resolution.',
      tags: ['Graphs', 'Topological Sort', 'DAG', 'In-Degree'],
      options: [
        { key: 'A', text: 'Vertices with out-degree == 0' },
        { key: 'B', text: 'Vertices with in-degree == 0' },
        { key: 'C', text: 'Vertices with the highest edge weight' },
        { key: 'D', text: 'The root vertex chosen arbitrarily' }
      ]
    },
    {
      id: 'q-prog-051',
      question: 'How do you detect a cycle in a directed graph using Depth First Search (DFS)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'A directed graph contains a cycle if and only if DFS encounters a Back Edge to an ancestor node that is currently in the active recursion call stack (commonly tracked using 3-color coloring: unvisited, visiting, visited).',
      tags: ['Graphs', 'Cycle Detection', 'DFS', 'Back Edge', '3-Coloring'],
      options: [
        { key: 'A', text: 'Whenever an edge leads to any node that was previously visited' },
        { key: 'B', text: 'If total edges E >= V' },
        { key: 'C', text: 'If DFS encounters an edge pointing to a node currently in the active recursion stack (Back Edge)' },
        { key: 'D', text: 'If any node has in-degree == 0' }
      ]
    },
    {
      id: 'q-prog-052',
      question: 'What is the all-pairs shortest path time complexity using the Floyd-Warshall dynamic programming algorithm?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'Floyd-Warshall tests every intermediate vertex k for every pair (i, j): dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]), executing three nested loops over V in O(V^3) time and O(V^2) space.',
      tags: ['Graphs', 'Floyd-Warshall', 'All-Pairs Shortest Path', 'Dynamic Programming'],
      options: [
        { key: 'A', text: 'O(V^3) time and O(V^2) space' },
        { key: 'B', text: 'O(V^2 log V) time and O(V) space' },
        { key: 'C', text: 'O(V * E log V) time and O(E) space' },
        { key: 'D', text: 'O(V^4) time and O(V^3) space' }
      ]
    },
    {
      id: 'q-prog-053',
      question: 'What is a Minimum Spanning Tree (MST) for an undirected weighted graph with V vertices, and how many edges does it contain?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'An MST connects all V vertices without any cycles with minimal total edge weight; any spanning tree on V vertices contains exactly V - 1 edges.',
      tags: ['Graphs', 'MST', 'Spanning Tree', 'Tree Properties'],
      options: [
        { key: 'A', text: 'V edges' },
        { key: 'B', text: 'V * (V - 1) / 2 edges' },
        { key: 'C', text: 'V - 1 edges' },
        { key: 'D', text: '2 * V edges' }
      ]
    },
    {
      id: 'q-prog-054',
      question: 'What is the primary difference between Kruskal\'s and Prim\'s algorithms for finding a Minimum Spanning Tree?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'Kruskal\'s sorts all edges globally and adds them greedily using DSU to prevent cycles (edge-centric). Prim\'s grows a single connected tree from an arbitrary starting vertex using a priority queue (vertex-centric).',
      tags: ['Graphs', 'Kruskal', 'Prim', 'MST Comparison'],
      options: [
        { key: 'A', text: 'Kruskal works only on directed graphs; Prim works on undirected graphs' },
        { key: 'B', text: 'Kruskal processes edges globally sorted by weight via DSU; Prim grows a single tree vertex-by-vertex using a priority queue' },
        { key: 'C', text: 'Kruskal produces an MST with cycles; Prim produces an acyclic tree' },
        { key: 'D', text: 'Kruskal is dynamic programming; Prim is divide and conquer' }
      ]
    },
    {
      id: 'q-prog-055',
      question: 'In graph theory, what is an articulation point (or cut vertex)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Hard',
      correct_answer: 'A',
      explanation: 'An articulation point is a vertex whose removal (along with incident edges) increases the number of connected components in the graph. Tarjan\'s DFS algorithm finds all articulation points in O(V + E) using discovery and low times.',
      tags: ['Graphs', 'Articulation Points', 'Tarjan Algorithm', 'Biconnectivity'],
      options: [
        { key: 'A', text: 'A vertex whose removal increases the number of connected components' },
        { key: 'B', text: 'The node with maximum degree in the graph' },
        { key: 'C', text: 'A vertex that is part of every simple path from source to sink' },
        { key: 'D', text: 'Any leaf node with degree 1' }
      ]
    },
    {
      id: 'q-prog-056',
      question: 'What is a Bipartite Graph, and how can you check if an undirected graph is bipartite in O(V + E) time?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Medium',
      correct_answer: 'D',
      explanation: 'A bipartite graph\'s vertices can be partitioned into two sets such that no two adjacent vertices share the same set. A graph is bipartite if and only if it contains no odd-length cycles, verifiable via 2-color BFS/DFS in O(V + E).',
      tags: ['Graphs', 'Bipartite', 'Odd Cycles', '2-Coloring'],
      options: [
        { key: 'A', text: 'A graph where every node has degree 2' },
        { key: 'B', text: 'A graph with no negative edges; tested via Dijkstra' },
        { key: 'C', text: 'A tree with exactly two leaves' },
        { key: 'D', text: 'A graph whose vertices can be 2-colored without adjacent nodes sharing a color (contains no odd-length cycle)' }
      ]
    },
    {
      id: 'q-prog-057',
      question: 'What algorithm finds Strongly Connected Components (SCCs) in a directed graph in O(V + E) time by performing two DFS passes?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Hard',
      correct_answer: 'B',
      explanation: 'Kosaraju\'s algorithm finds SCCs by: 1) DFS on original graph to push vertices to a stack by finish time. 2) Reverse all edges (transpose graph). 3) DFS on transposed graph in stack order.',
      tags: ['Graphs', 'SCC', 'Kosaraju', 'Transpose Graph'],
      options: [
        { key: 'A', text: 'Floyd-Warshall' },
        { key: 'B', text: 'Kosaraju\'s Algorithm' },
        { key: 'C', text: 'A* Search' },
        { key: 'D', text: 'Hierholzer\'s Eulerian circuit algorithm' }
      ]
    },
    {
      id: 'q-prog-058',
      question: 'What condition guarantees that an undirected connected graph contains an Eulerian Circuit (a closed walk visiting every edge exactly once)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'Euler\'s Theorem proves that an undirected connected graph contains an Eulerian Circuit if and only if every single vertex has an even degree.',
      tags: ['Graphs', 'Eulerian Circuit', 'Graph Theory', 'Vertex Degree'],
      options: [
        { key: 'A', text: 'The graph must be a tree' },
        { key: 'B', text: 'Exactly two vertices must have odd degrees' },
        { key: 'C', text: 'Every vertex in the graph must have an even degree' },
        { key: 'D', text: 'Total number of edges must equal V^2' }
      ]
    },
    {
      id: 'q-prog-059',
      question: 'In the 0-1 BFS algorithm for graphs where edge weights are restricted to strictly 0 or 1, which data structure achieves O(V + E) shortest path time?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'A double-ended queue (deque) allows pushing 0-weight edge relaxations to the front (push_front) and 1-weight edges to the back (push_back), maintaining monotonic order without heap overhead.',
      tags: ['Graphs', '0-1 BFS', 'Deque', 'Linear Time'],
      options: [
        { key: 'A', text: 'Double-ended queue (std::deque / ArrayDeque)' },
        { key: 'B', text: 'Fibonacci Heap' },
        { key: 'C', text: 'Red-Black Tree' },
        { key: 'D', text: 'Monotonic Stack' }
      ]
    },
    {
      id: 'q-prog-060',
      question: 'What is the maximum number of edges in a simple undirected graph with V vertices?',
      subject_id: 'sub-dsa',
      topic_id: 'top-graphs',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'In a complete graph K_V, every pair of distinct vertices has an edge, giving V * (V - 1) / 2 edges.',
      tags: ['Graphs', 'Complete Graph', 'Combinatorics', 'Edge Bounds'],
      options: [
        { key: 'A', text: 'V * V' },
        { key: 'B', text: 'V * (V - 1) / 2' },
        { key: 'C', text: '2^V' },
        { key: 'D', text: 'V - 1' }
      ]
    },

    // --- 5. Dynamic Programming, Recursion & Greedy (q-prog-061 to q-prog-075) ---
    {
      id: 'q-prog-061',
      question: 'What are the two foundational properties a problem must possess to be solvable via Dynamic Programming?',
      subject_id: 'sub-dsa',
      topic_id: 'top-dp',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'Dynamic Programming requires: 1) Overlapping Subproblems (subproblems are computed repeatedly) and 2) Optimal Substructure (optimal solution to the problem contains optimal solutions to its subproblems).',
      tags: ['Dynamic Programming', 'Optimal Substructure', 'Overlapping Subproblems', 'Core Principles'],
      options: [
        { key: 'A', text: 'Optimal Substructure and Overlapping Subproblems' },
        { key: 'B', text: 'Greedy Choice Property and Independence' },
        { key: 'C', text: 'Associativity and Commutativity' },
        { key: 'D', text: 'Tail recursion and Memoization without caching' }
      ]
    },
    {
      id: 'q-prog-062',
      question: 'What is the difference between Top-Down Memoization and Bottom-Up Tabulation in Dynamic Programming?',
      subject_id: 'sub-dsa',
      topic_id: 'top-dp',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'Top-down starts from the original problem and solves subproblems recursively on-demand while caching results. Bottom-up fills an iterative DP table starting from the smallest base cases.',
      tags: ['Dynamic Programming', 'Memoization', 'Tabulation', 'Recursion'],
      options: [
        { key: 'A', text: 'Top-down is always iterative; bottom-up is always recursive' },
        { key: 'B', text: 'Top-down runs in exponential time; bottom-up runs in polynomial time' },
        { key: 'C', text: 'Top-down solves subproblems on-demand recursively with cache; bottom-up solves all subproblems iteratively starting from base cases' },
        { key: 'D', text: 'Bottom-up uses call stack memory; top-down uses heap memory only' }
      ]
    },
    {
      id: 'q-prog-063',
      question: 'In the 0/1 Knapsack problem with n items and capacity W, what are the time and space complexities of the standard bottom-up DP solution?',
      subject_id: 'sub-dsa',
      topic_id: 'top-dp',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: '0/1 Knapsack builds an n x W table, running in O(n * W) pseudo-polynomial time. Space can be optimized to O(W) using a 1D array traversed backwards.',
      tags: ['Dynamic Programming', '0/1 Knapsack', 'Space Optimization', 'Pseudo-polynomial'],
      options: [
        { key: 'A', text: 'O(2^n) time and O(n) space' },
        { key: 'B', text: 'O(n * W) time and O(W) optimized space' },
        { key: 'C', text: 'O(n log W) time and O(n) space' },
        { key: 'D', text: 'O(W^2) time and O(W) space' }
      ]
    },
    {
      id: 'q-prog-064',
      question: 'Why must the 1D DP array be traversed backwards (from W down to weight[i]) in the space-optimized 0/1 Knapsack algorithm?',
      subject_id: 'sub-dsa',
      topic_id: 'top-dp',
      difficulty: 'Medium',
      correct_answer: 'D',
      explanation: 'Traversing backwards ensures dp[w - weight[i]] represents the value from the previous item (iteration i-1) rather than the current item. Forward traversal would allow an item to be picked multiple times (Unbounded Knapsack).',
      tags: ['Dynamic Programming', 'Knapsack Invariant', 'Space Optimization'],
      options: [
        { key: 'A', text: 'To avoid array index out of bounds on w = 0' },
        { key: 'B', text: 'To allow compiler auto-vectorization' },
        { key: 'C', text: 'Because memory cache lines are loaded backwards in x86 architectures' },
        { key: 'D', text: 'To prevent reusing the same item multiple times in the current state' }
      ]
    },
    {
      id: 'q-prog-065',
      question: 'What is the time complexity of finding the Longest Increasing Subsequence (LIS) of an array of length n using Patience Sorting (Binary Search)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-dp',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'By maintaining an array of tails and placing each element via binary search (std::lower_bound), LIS runs in O(n log n) time and O(n) space, compared to standard O(n^2) DP.',
      tags: ['LIS', 'Binary Search', 'Patience Sorting', 'Optimal DP'],
      options: [
        { key: 'A', text: 'O(n log n) time and O(n) space' },
        { key: 'B', text: 'O(n^2) time and O(1) space' },
        { key: 'C', text: 'O(n) time and O(n) space' },
        { key: 'D', text: 'O(log n) time and O(1) space' }
      ]
    },
    {
      id: 'q-prog-066',
      question: 'In the Edit Distance (Levenshtein Distance) problem between string S1 of length m and S2 of length n, if S1[i] == S2[j], what is the DP state transition?',
      subject_id: 'sub-dsa',
      topic_id: 'top-dp',
      difficulty: 'Medium',
      correct_answer: 'B',
      explanation: 'When characters match, no edit operation (insert, delete, replace) is needed. The cost is inherited directly from the diagonal: dp[i][j] = dp[i-1][j-1].',
      tags: ['Edit Distance', 'Strings', 'DP Recurrence', 'Levenshtein'],
      options: [
        { key: 'A', text: 'dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1])' },
        { key: 'B', text: 'dp[i][j] = dp[i-1][j-1]' },
        { key: 'C', text: 'dp[i][j] = dp[i-1][j] + dp[i][j-1]' },
        { key: 'D', text: 'dp[i][j] = 0' }
      ]
    },
    {
      id: 'q-prog-067',
      question: 'What is the recurrence relation for the Coin Change problem (finding minimum number of coins to make amount A given coins {c1, c2, ... ck})?',
      subject_id: 'sub-dsa',
      topic_id: 'top-dp',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'dp[a] = 1 + min_{c in coins, c <= a}(dp[a - c]), with base case dp[0] = 0. If amount cannot be formed, dp[a] = infinity.',
      tags: ['Coin Change', 'Dynamic Programming', 'Unbounded Knapsack', 'Recurrence'],
      options: [
        { key: 'A', text: 'dp[a] = 1 + min(dp[a - c]) for all c in coins where c <= a' },
        { key: 'B', text: 'dp[a] = sum(dp[a - c])' },
        { key: 'C', text: 'dp[a] = dp[a - 1] * dp[a - 2]' },
        { key: 'D', text: 'dp[a] = max(dp[a - c]) - 1' }
      ]
    },
    {
      id: 'q-prog-068',
      question: 'What is the time complexity of Matrix Chain Multiplication with n matrices using dynamic programming?',
      subject_id: 'sub-dsa',
      topic_id: 'top-dp',
      difficulty: 'Hard',
      correct_answer: 'C',
      explanation: 'MCM computes dp[i][j] by trying every split point k between i and j. There are O(n^2) states, and each state takes O(n) loop over k, yielding O(n^3) time and O(n^2) space.',
      tags: ['Matrix Chain Multiplication', 'Interval DP', 'Time Complexity', 'Catalan Numbers'],
      options: [
        { key: 'A', text: 'O(n!)' },
        { key: 'B', text: 'O(n^2)' },
        { key: 'C', text: 'O(n^3)' },
        { key: 'D', text: 'O(2^n)' }
      ]
    },
    {
      id: 'q-prog-069',
      question: 'In the Interval Scheduling Greedy problem (maximizing the number of non-overlapping intervals), what greedy sorting criterion is optimal?',
      subject_id: 'sub-dsa',
      topic_id: 'top-greedy',
      difficulty: 'Easy',
      correct_answer: 'D',
      explanation: 'Sorting intervals by earliest finish time (end time) leaves the maximum remaining time available for subsequent intervals, proven optimal by exchange arguments.',
      tags: ['Greedy', 'Interval Scheduling', 'Activity Selection', 'Optimal Proof'],
      options: [
        { key: 'A', text: 'Sort by shortest interval duration' },
        { key: 'B', text: 'Sort by earliest start time' },
        { key: 'C', text: 'Sort by fewest overlaps with other intervals' },
        { key: 'D', text: 'Sort intervals by earliest finish time (end time)' }
      ]
    },
    {
      id: 'q-prog-070',
      question: 'What is the time complexity of Fractional Knapsack using the Greedy algorithm?',
      subject_id: 'sub-dsa',
      topic_id: 'top-greedy',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'Fractional Knapsack sorts items by value-to-weight ratio in O(n log n) time, then greedily takes as much of the highest-ratio item as possible in O(n), running in O(n log n) overall.',
      tags: ['Fractional Knapsack', 'Greedy', 'Sorting', 'Value to Weight'],
      options: [
        { key: 'A', text: 'O(n * W)' },
        { key: 'B', text: 'O(n log n)' },
        { key: 'C', text: 'O(2^n)' },
        { key: 'D', text: 'O(n^2)' }
      ]
    },
    {
      id: 'q-prog-071',
      question: 'In the N-Queens problem on an N x N chessboard, what is the best technique to check column and diagonal safety in O(1) time during backtracking?',
      subject_id: 'sub-dsa',
      topic_id: 'top-recursion-backtrack',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'Use boolean arrays or bitmasks: cols[col], diag1[row - col + N - 1], and diag2[row + col]. This replaces linear loops with strictly O(1) safety checks.',
      tags: ['Backtracking', 'N-Queens', 'Bitmasking', 'Safety Checks'],
      options: [
        { key: 'A', text: 'Scan all previous N rows and columns sequentially' },
        { key: 'B', text: 'Calculate the matrix determinant' },
        { key: 'C', text: 'Use boolean arrays/bitmasks for cols, main diagonals (r - c), and anti-diagonals (r + c)' },
        { key: 'D', text: 'Use a Disjoint Set Union structure' }
      ]
    },
    {
      id: 'q-prog-072',
      question: 'What is the maximum number of recursive calls made by the standard Euclidean algorithm for finding the Greatest Common Divisor gcd(a, b)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-asymptotic',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'Lamé\'s Theorem proves that the number of steps in Euclid\'s algorithm never exceeds 5 times the number of digits in the smaller number in base 10, running in O(log(min(a, b))). Worst case occurs with consecutive Fibonacci numbers.',
      tags: ['Euclidean Algorithm', 'GCD', 'Lame Theorem', 'Time Complexity'],
      options: [
        { key: 'A', text: 'O(log(min(a, b))) steps (worst case on consecutive Fibonacci numbers)' },
        { key: 'B', text: 'O(min(a, b)) steps' },
        { key: 'C', text: 'O(sqrt(a * b)) steps' },
        { key: 'D', text: 'O(1) steps' }
      ]
    },
    {
      id: 'q-prog-073',
      question: 'What does the Master Theorem state for the recurrence T(n) = 2T(n/2) + O(n)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-asymptotic',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'Here a = 2, b = 2, f(n) = n. Since n^(log_b a) = n^(log_2 2) = n^1, this is Case 2 of Master Theorem: T(n) = Theta(n^(log_b a) * log n) = Theta(n log n). This is standard Merge Sort.',
      tags: ['Master Theorem', 'Asymptotic Complexity', 'Recurrence Relations', 'Merge Sort'],
      options: [
        { key: 'A', text: 'T(n) = Theta(n)' },
        { key: 'B', text: 'T(n) = Theta(n log n)' },
        { key: 'C', text: 'T(n) = Theta(n^2)' },
        { key: 'D', text: 'T(n) = Theta(log n)' }
      ]
    },
    {
      id: 'q-prog-074',
      question: 'What is the solution to the recurrence relation T(n) = T(n-1) + O(1) with T(1) = O(1)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-asymptotic',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'Expanding the recurrence: T(n) = T(n-1) + c = T(n-2) + 2c = ... = T(1) + (n-1)c = O(n). Example: linear search or iterating an array.',
      tags: ['Recurrence Relations', 'Asymptotic Complexity', 'Linear Scan'],
      options: [
        { key: 'A', text: 'O(n)' },
        { key: 'B', text: 'O(log n)' },
        { key: 'C', text: 'O(n log n)' },
        { key: 'D', text: 'O(1)' }
      ]
    },
    {
      id: 'q-prog-075',
      question: 'What is the asymptotic relation between O(2^n) and O(3^n)?',
      subject_id: 'sub-dsa',
      topic_id: 'top-asymptotic',
      difficulty: 'Medium',
      correct_answer: 'D',
      explanation: 'lim_{n->inf} (2^n / 3^n) = lim (2/3)^n = 0. Therefore, 2^n = o(3^n) (little-o). 2^n is strictly asymptotically smaller than 3^n, and 3^n is NOT in O(2^n).',
      tags: ['Big-O', 'Little-o', 'Asymptotics', 'Exponentials'],
      options: [
        { key: 'A', text: '2^n is Theta(3^n) because both are exponential' },
        { key: 'B', text: '3^n is O(2^n)' },
        { key: 'C', text: 'There is no well-defined asymptotic relationship' },
        { key: 'D', text: '2^n is strictly smaller than 3^n (2^n = o(3^n)); 3^n is NOT O(2^n)' }
      ]
    },

    // --- 6. Object Oriented Programming (C++, Java, Python) (q-prog-076 to q-prog-090) ---
    {
      id: 'q-prog-076',
      question: 'What happens when a base class pointer pointing to a derived class object is deleted if the base class destructor is NOT declared virtual in C++?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'Without a virtual destructor, the compiler uses static binding. Only the base class destructor is called; the derived class destructor is skipped, causing undefined behavior and resource/memory leaks.',
      tags: ['OOP', 'C++', 'Virtual Destructor', 'Memory Leaks', 'Polymorphism'],
      options: [
        { key: 'A', text: 'Both base and derived destructors are called in reverse order' },
        { key: 'B', text: 'Only the derived class destructor is called' },
        { key: 'C', text: 'Only the base class destructor is called, resulting in undefined behavior and memory leaks' },
        { key: 'D', text: 'The program fails at compile time' }
      ]
    },
    {
      id: 'q-prog-077',
      question: 'What is the Diamond Problem in C++ multiple inheritance, and how is it resolved?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'When class D inherits from both B and C, which both inherit from A, D gets two copies of A\'s members (ambiguity). Using "virtual public A" in B and C ensures only one shared instance of A is inherited.',
      tags: ['OOP', 'Multiple Inheritance', 'Diamond Problem', 'Virtual Base Class'],
      options: [
        { key: 'A', text: 'Multiple copies of the base class are inherited; resolved using virtual inheritance ("virtual public Base")' },
        { key: 'B', text: 'Circular class dependencies; resolved using header guards' },
        { key: 'C', text: 'Private members becoming inaccessible; resolved using friend classes' },
        { key: 'D', text: 'Destructor collision; resolved using inline virtual functions' }
      ]
    },
    {
      id: 'q-prog-078',
      question: 'What is the vtable (Virtual Method Table) and vptr in C++?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Hard',
      correct_answer: 'B',
      explanation: 'The vtable is a static array of function pointers created by the compiler for any class with virtual functions. Each object has a hidden pointer (vptr) pointing to its class\'s vtable for runtime dynamic dispatch.',
      tags: ['OOP', 'vtable', 'vptr', 'Dynamic Dispatch', 'Runtime Polymorphism'],
      options: [
        { key: 'A', text: 'A hash table in heap memory storing variable names' },
        { key: 'B', text: 'A compiler-generated table of virtual function pointers; each object contains a vptr pointing to this table for dynamic dispatch' },
        { key: 'C', text: 'An operating system page table mapping virtual memory addresses' },
        { key: 'D', text: 'A debugger symbol table discarded during production builds' }
      ]
    },
    {
      id: 'q-prog-079',
      question: 'What is the difference between Function Overloading and Function Overriding?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'Overloading (compile-time polymorphism) defines functions with same name but different signatures in same scope. Overriding (runtime polymorphism) redefines a base class virtual function in a derived class with identical signature.',
      tags: ['OOP', 'Polymorphism', 'Overloading', 'Overriding'],
      options: [
        { key: 'A', text: 'Overloading is compile-time (different parameters); Overriding is runtime (same signature in derived class)' },
        { key: 'B', text: 'Overloading is runtime; Overriding is compile-time' },
        { key: 'C', text: 'Overloading requires the virtual keyword; Overriding does not' },
        { key: 'D', text: 'Overloading changes return type only; Overriding changes access specifier only' }
      ]
    },
    {
      id: 'q-prog-080',
      question: 'In Java, why are String objects immutable?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Medium',
      correct_answer: 'D',
      explanation: 'Immutability enables String Pool caching (saving memory), thread safety without synchronization, security for network connections/classloaders, and safe hashcode caching for HashMaps.',
      tags: ['Java', 'String Immutability', 'String Pool', 'Thread Safety'],
      options: [
        { key: 'A', text: 'Because memory allocation in the JVM cannot resize arrays' },
        { key: 'B', text: 'Because strings are primitive data types in Java' },
        { key: 'C', text: 'To prevent programmers from changing string values' },
        { key: 'D', text: 'For String Pool caching, thread safety without synchronization, security parameters, and hashcode caching' }
      ]
    },
    {
      id: 'q-prog-081',
      question: 'What is the difference between Shallow Copy and Deep Copy of an object containing pointer/reference fields?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'Shallow copy copies primitive values and raw pointer addresses, causing both objects to point to the same heap memory. Deep copy allocates new memory and copies the actual referenced data.',
      tags: ['OOP', 'Shallow Copy', 'Deep Copy', 'Copy Constructor', 'Pointers'],
      options: [
        { key: 'A', text: 'Shallow copy clones heap memory; deep copy clones stack memory' },
        { key: 'B', text: 'Shallow copy copies pointers (shared underlying memory); deep copy allocates new memory and copies referenced data' },
        { key: 'C', text: 'Shallow copy is used for immutable objects; deep copy is for primitive types' },
        { key: 'D', text: 'Deep copy is automatic; shallow copy requires user implementation' }
      ]
    },
    {
      id: 'q-prog-082',
      question: 'What does the "final" keyword signify when applied to a class, method, and variable in Java?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'In Java: final class cannot be subclassed/extended; final method cannot be overridden; final variable cannot be reassigned once initialized.',
      tags: ['Java', 'Final Keyword', 'Immutability', 'Inheritance Restrictions'],
      options: [
        { key: 'A', text: 'Class cannot be extended; Method cannot be overridden; Variable cannot be reassigned' },
        { key: 'B', text: 'Class cannot be instantiated; Method has no body; Variable is stored in ROM' },
        { key: 'C', text: 'Class is private; Method runs in separate thread; Variable is volatile' },
        { key: 'D', text: 'Class has static methods; Method is garbage collected immediately; Variable is global' }
      ]
    },
    {
      id: 'q-prog-083',
      question: 'In object-oriented design, what does the Liskov Substitution Principle (the "L" in SOLID) require?',
      subject_id: 'sub-oop',
      topic_id: 'top-design-pat',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'LSP states that objects of a superclass should be replaceable with objects of a subclass without breaking application correctness, contracts, or invariants.',
      tags: ['SOLID Principles', 'Liskov Substitution', 'Design Patterns', 'Architecture'],
      options: [
        { key: 'A', text: 'Every class must have only one reason to change' },
        { key: 'B', text: 'Classes should be open for modification and closed for extension' },
        { key: 'C', text: 'Subtypes must be substitutable for their base types without altering program correctness' },
        { key: 'D', text: 'Clients should not be forced to depend on interfaces they do not use' }
      ]
    },
    {
      id: 'q-prog-084',
      question: 'Which design pattern restricts the instantiation of a class to one single object and provides a global point of access?',
      subject_id: 'sub-oop',
      topic_id: 'top-design-pat',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'The Singleton pattern ensures a class has only one instance, typically using a private constructor, a static instance variable, and a public static getInstance() method (often with double-checked locking).',
      tags: ['Design Patterns', 'Singleton', 'Creational Patterns', 'Thread Safety'],
      options: [
        { key: 'A', text: 'Factory Pattern' },
        { key: 'B', text: 'Singleton Pattern' },
        { key: 'C', text: 'Observer Pattern' },
        { key: 'D', text: 'Adapter Pattern' }
      ]
    },
    {
      id: 'q-prog-085',
      question: 'What is the Global Interpreter Lock (GIL) in CPython, and what impact does it have on multi-threaded programs?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'The GIL is a mutex protecting access to Python objects, preventing multiple native threads from executing Python bytecode simultaneously. Consequently, CPU-bound multi-threaded Python programs do not achieve true parallelism across multi-core processors.',
      tags: ['Python', 'GIL', 'Concurrency', 'Multithreading', 'CPython Internals'],
      options: [
        { key: 'A', text: 'A mutex that allows only one thread to execute Python bytecode at a time, preventing multi-core speedup for CPU-bound tasks' },
        { key: 'B', text: 'A mechanism that encrypts global variables' },
        { key: 'C', text: 'A garbage collection algorithm that runs periodically' },
        { key: 'D', text: 'A security sandbox preventing Python scripts from accessing disk storage' }
      ]
    },
    {
      id: 'q-prog-086',
      question: 'What is the difference between an Interface and an Abstract Class in modern Java (Java 8+)?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Medium',
      correct_answer: 'D',
      explanation: 'A class can implement multiple interfaces but can only extend one abstract class. Abstract classes can have state (instance fields) and constructors; interfaces cannot have instance fields or constructors (though they support default/static methods).',
      tags: ['Java', 'Interfaces', 'Abstract Classes', 'Multiple Inheritance'],
      options: [
        { key: 'A', text: 'Abstract classes support multiple inheritance; interfaces do not' },
        { key: 'B', text: 'Interfaces cannot contain any method implementations whatsoever' },
        { key: 'C', text: 'Abstract classes cannot have constructors' },
        { key: 'D', text: 'A class can implement multiple interfaces but extend only one class; abstract classes can maintain state/instance variables and constructors' }
      ]
    },
    {
      id: 'q-prog-087',
      question: 'In C++, what is a "friend" function or "friend" class?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'A friend declaration grants an external function or class full access to the private and protected members of the class granting friendship. Friendship is neither inherited nor transitive.',
      tags: ['C++', 'Friend Function', 'Encapsulation', 'Access Control'],
      options: [
        { key: 'A', text: 'A function that automatically creates an alias pointer' },
        { key: 'B', text: 'A non-member function granted access to the private and protected members of a class' },
        { key: 'C', text: 'A function that executes automatically before main()' },
        { key: 'D', text: 'A class that inherits all methods without code compilation' }
      ]
    },
    {
      id: 'q-prog-088',
      question: 'What is the purpose of the "volatile" keyword in C/C++ and Java?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Hard',
      correct_answer: 'C',
      explanation: 'In C/C++, volatile tells the compiler that a variable can be modified by hardware or ISRs, preventing aggressive register caching. In Java, volatile guarantees memory visibility across threads and establishes a happens-before relationship.',
      tags: ['Volatile', 'Memory Model', 'Concurrency', 'Compiler Optimizations'],
      options: [
        { key: 'A', text: 'Allocates memory in high-speed GPU registers' },
        { key: 'B', text: 'Marks variables to be deleted immediately after use' },
        { key: 'C', text: 'Prevents compiler optimizations like register caching and ensures reads/writes access main memory directly' },
        { key: 'D', text: 'Enforces strict atomic increment operations on 64-bit integers' }
      ]
    },
    {
      id: 'q-prog-089',
      question: 'In Python, what is the key difference between a List and a Tuple?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'Lists are mutable (can append, insert, mutate in-place) and cannot be dictionary keys. Tuples are immutable, have smaller memory footprint, and can be used as dictionary keys if all elements are hashable.',
      tags: ['Python', 'List vs Tuple', 'Immutability', 'Hashability'],
      options: [
        { key: 'A', text: 'Lists are mutable; Tuples are immutable and hashable (if elements are hashable)' },
        { key: 'B', text: 'Lists use 0-indexing; Tuples use 1-indexing' },
        { key: 'C', text: 'Tuples store only integer values' },
        { key: 'D', text: 'Lists are stored on the GPU; Tuples are on CPU' }
      ]
    },
    {
      id: 'q-prog-090',
      question: 'Which design pattern decouples an abstraction from its implementation so that the two can vary independently?',
      subject_id: 'sub-oop',
      topic_id: 'top-design-pat',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'The Bridge pattern uses composition over inheritance, placing the implementation into a separate hierarchy so client code and concrete platform implementations can evolve independently.',
      tags: ['Design Patterns', 'Bridge Pattern', 'Structural Patterns', 'Decoupling'],
      options: [
        { key: 'A', text: 'Decorator Pattern' },
        { key: 'B', text: 'Facade Pattern' },
        { key: 'C', text: 'Bridge Pattern' },
        { key: 'D', text: 'Composite Pattern' }
      ]
    },

    // --- 7. Memory, Pointers & System Programming (q-prog-091 to q-prog-105) ---
    {
      id: 'q-prog-091',
      question: 'What is a Dangling Pointer in C/C++?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'A dangling pointer points to a memory location that has already been deallocated (freed) or has gone out of scope. Dereferencing it causes undefined behavior.',
      tags: ['C/C++', 'Pointers', 'Dangling Pointer', 'Memory Safety'],
      options: [
        { key: 'A', text: 'A pointer initialized to NULL' },
        { key: 'B', text: 'A pointer that points to deallocated or out-of-scope memory' },
        { key: 'C', text: 'A pointer that has not been initialized to any value (wild pointer)' },
        { key: 'D', text: 'A pointer pointing to a read-only code segment' }
      ]
    },
    {
      id: 'q-prog-092',
      question: 'What is the fundamental difference between malloc() and calloc() in C?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'malloc(size) allocates uninitialized raw memory containing garbage values. calloc(num, size) allocates memory and initializes all allocated bytes to zero.',
      tags: ['C Memory', 'malloc vs calloc', 'Dynamic Memory', 'Initialization'],
      options: [
        { key: 'A', text: 'malloc() leaves memory uninitialized (garbage values); calloc() zero-initializes all allocated bytes' },
        { key: 'B', text: 'malloc() allocates from heap; calloc() allocates from stack' },
        { key: 'C', text: 'calloc() cannot be freed with free()' },
        { key: 'D', text: 'malloc() takes two arguments; calloc() takes one argument' }
      ]
    },
    {
      id: 'q-prog-093',
      question: 'What causes a Memory Leak in a C/C++ program?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Easy',
      correct_answer: 'D',
      explanation: 'A memory leak occurs when dynamically allocated heap memory (via malloc or new) is not deallocated when no longer needed, and all pointers to that block are lost.',
      tags: ['C/C++', 'Memory Leak', 'Heap Allocation', 'Resource Management'],
      options: [
        { key: 'A', text: 'Calling free() twice on the same pointer' },
        { key: 'B', text: 'Allocating too many variables on the stack' },
        { key: 'C', text: 'Dereferencing a null pointer' },
        { key: 'D', text: 'Failing to deallocate dynamically allocated heap memory when all references to it are lost' }
      ]
    },
    {
      id: 'q-prog-094',
      question: 'In C/C++, why does structure padding occur, and what is the effect of "#pragma pack(1)"?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Hard',
      correct_answer: 'C',
      explanation: 'Processors fetch data faster when memory is aligned to word boundaries (e.g. 4 or 8 bytes), so compilers insert padding bytes. "#pragma pack(1)" disables padding to make structures byte-aligned (compact, but may cause unaligned access penalties).',
      tags: ['C/C++', 'Structure Padding', 'Alignment', 'Pragma Pack'],
      options: [
        { key: 'A', text: 'Padding protects against buffer overflows; #pragma pack(1) enables encryption' },
        { key: 'B', text: 'Padding aligns code in cache; #pragma pack(1) compiles to assembly' },
        { key: 'C', text: 'Compilers insert unused bytes to align data on hardware word boundaries; #pragma pack(1) enforces 1-byte alignment without padding' },
        { key: 'D', text: 'Padding occurs only on 16-bit microcontrollers' }
      ]
    },
    {
      id: 'q-prog-095',
      question: 'What is the output of the following C code snippet?\nint a = 5;\nprintf("%d %d %d", a++, a, ++a);',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Medium',
      correct_answer: 'D',
      explanation: 'In C/C++, modifying a variable more than once between sequence points (or in unsequenced function argument evaluation) is Undefined Behavior. The compiler can evaluate arguments in any order.',
      tags: ['C Tracing', 'Sequence Points', 'Undefined Behavior', 'Pre/Post Increment'],
      options: [
        { key: 'A', text: '5 6 7' },
        { key: 'B', text: '7 7 7' },
        { key: 'C', text: '6 6 6' },
        { key: 'D', text: 'Undefined Behavior (unsequenced modification of a variable in function arguments)' }
      ]
    },
    {
      id: 'q-prog-096',
      question: 'What is the difference between "const int* p", "int* const p", and "const int* const p" in C/C++?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Medium',
      correct_answer: 'A',
      explanation: 'Read from right to left: const int* p = pointer to constant int (data cannot change); int* const p = constant pointer to int (pointer address cannot change); const int* const p = constant pointer to constant int (neither can change).',
      tags: ['C/C++', 'Const Pointers', 'Clockwise Spiral Rule', 'Type Qualifiers'],
      options: [
        { key: 'A', text: 'Pointer to const data | Const pointer to mutable data | Const pointer to const data' },
        { key: 'B', text: 'All three syntax variants are identical in C++20' },
        { key: 'C', text: 'Const pointer to volatile | Volatile pointer to const | Atomic pointer' },
        { key: 'D', text: 'Array pointer | Function pointer | Reference pointer' }
      ]
    },
    {
      id: 'q-prog-097',
      question: 'In modern C++ (C++11 and later), which smart pointer represents exclusive ownership of a dynamically allocated object?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'std::unique_ptr has exclusive ownership semantics (non-copyable, only movable) and automatically deletes the managed object when the pointer goes out of scope with zero runtime overhead over raw pointers.',
      tags: ['Modern C++', 'Smart Pointers', 'unique_ptr', 'RAII'],
      options: [
        { key: 'A', text: 'std::shared_ptr' },
        { key: 'B', text: 'std::unique_ptr' },
        { key: 'C', text: 'std::weak_ptr' },
        { key: 'D', text: 'std::auto_ptr' }
      ]
    },
    {
      id: 'q-prog-098',
      question: 'How does std::weak_ptr solve circular reference problems that occur with std::shared_ptr?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'std::weak_ptr holds a non-owning reference to an object managed by shared_ptr without incrementing the strong reference count. This breaks circular reference cycles that would otherwise prevent memory deallocation.',
      tags: ['Modern C++', 'Smart Pointers', 'weak_ptr', 'Circular Reference'],
      options: [
        { key: 'A', text: 'By converting circular graphs into doubly linked lists' },
        { key: 'B', text: 'By forcing mark-and-sweep garbage collection in C++' },
        { key: 'C', text: 'By observing the object without incrementing its strong reference count, preventing cyclical ownership deadlocks' },
        { key: 'D', text: 'By deallocating memory whenever two pointers point to the same address' }
      ]
    },
    {
      id: 'q-prog-099',
      question: 'What is RAII (Resource Acquisition Is Initialization) in C++?',
      subject_id: 'sub-oop',
      topic_id: 'top-pillars',
      difficulty: 'Easy',
      correct_answer: 'A',
      explanation: 'RAII binds the lifecycle of a resource (heap memory, file handles, mutex locks) to the lifetime of a stack-allocated object. Constructor acquires the resource, and destructor automatically releases it upon scope exit (even during exceptions).',
      tags: ['C++', 'RAII', 'Resource Management', 'Exception Safety'],
      options: [
        { key: 'A', text: 'A design idiom where resource acquisition occurs in constructors and release occurs in destructors automatically' },
        { key: 'B', text: 'A compiler flag that enables AddressSanitizer' },
        { key: 'C', text: 'An operating system kernel driver for virtual memory swap' },
        { key: 'D', text: 'A design pattern that forces all classes to inherit from an Object root' }
      ]
    },
    {
      id: 'q-prog-100',
      question: 'What is a Segmentation Fault (SIGSEGV) in C/C++?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'A segmentation fault is a specific hardware signal raised when a process attempts to access a memory segment without permission (e.g. dereferencing NULL, accessing unmapped pages, or writing to read-only string literals).',
      tags: ['C/C++', 'Segmentation Fault', 'Memory Protection', 'OS Signals'],
      options: [
        { key: 'A', text: 'A syntax error caught by the compiler preprocessor' },
        { key: 'B', text: 'A signal raised when a program accesses memory outside its allocated virtual address space or violates permissions' },
        { key: 'C', text: 'A division by zero exception handled by the ALU' },
        { key: 'D', text: 'An infinite loop running for more than 10 seconds' }
      ]
    },
    {
      id: 'q-prog-101',
      question: 'What does the "static" storage class specifier mean when applied to a global variable in C?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Medium',
      correct_answer: 'C',
      explanation: 'A static global variable has internal linkage, meaning its scope is restricted strictly to the translation unit (.c file) in which it is declared, making it invisible to other source files.',
      tags: ['C', 'Static Storage Class', 'Internal Linkage', 'Scope'],
      options: [
        { key: 'A', text: 'The variable cannot be modified (read-only)' },
        { key: 'B', text: 'The variable is stored on the call stack' },
        { key: 'C', text: 'The variable has internal linkage and is visible only within its declaration source file' },
        { key: 'D', text: 'The variable is allocated in dynamic heap memory' }
      ]
    },
    {
      id: 'q-prog-102',
      question: 'In C, what is the size of a pointer on a 64-bit operating system architecture?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Easy',
      correct_answer: 'B',
      explanation: 'On any 64-bit architecture, regardless of the data type it points to (char*, int*, double*, void*), every memory address is 64 bits wide, which equals 8 bytes.',
      tags: ['C/C++', 'Pointer Size', '64-bit Architecture', 'Memory Addressing'],
      options: [
        { key: 'A', text: '4 bytes' },
        { key: 'B', text: '8 bytes' },
        { key: 'C', text: 'Depends on the pointed data type (char* is 1 byte, double* is 8 bytes)' },
        { key: 'D', text: '16 bytes' }
      ]
    },
    {
      id: 'q-prog-103',
      question: 'What is a memory alignment buffer overflow attack (Stack Smashing), and how do modern compilers protect against it?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Hard',
      correct_answer: 'A',
      explanation: 'Stack smashing overwrites local buffers to corrupt the function return address. Compilers place a Stack Canary (guard value) before the return address; if modified on return, __stack_chk_fail terminates execution immediately.',
      tags: ['Security', 'Stack Canary', 'Buffer Overflow', 'Compiler Defenses'],
      options: [
        { key: 'A', text: 'Writing beyond stack buffer boundaries to overwrite return addresses; prevented by Stack Canaries (-fstack-protector)' },
        { key: 'B', text: 'Filling heap memory to cause OOM; prevented by swap space' },
        { key: 'C', text: 'Modifying CPU registers; prevented by ECC RAM' },
        { key: 'D', text: 'Corrupting disk files; prevented by RAID mirroring' }
      ]
    },
    {
      id: 'q-prog-104',
      question: 'What is the purpose of the "extern" keyword in C/C++?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Easy',
      correct_answer: 'D',
      explanation: 'The extern keyword declares a variable or function without defining it (allocating memory), telling the compiler and linker that the actual definition exists in another translation unit.',
      tags: ['C/C++', 'Extern Keyword', 'External Linkage', 'Header Files'],
      options: [
        { key: 'A', text: 'Forces variable storage in an external SSD' },
        { key: 'B', text: 'Enables external multi-threading' },
        { key: 'C', text: 'Declares an inline virtual method' },
        { key: 'D', text: 'Declares a variable or function with external linkage whose definition exists in another translation unit' }
      ]
    },
    {
      id: 'q-prog-105',
      question: 'What happens when you pass an array to a function in C (e.g. void foo(int arr[]))?',
      subject_id: 'sub-dsa',
      topic_id: 'top-memory-mgmt',
      difficulty: 'Easy',
      correct_answer: 'C',
      explanation: 'Arrays decay into a pointer to their first element (int* arr) when passed to a function. As a consequence, sizeof(arr) inside foo returns the pointer size (8 bytes on 64-bit) rather than the array length.',
      tags: ['C Pointers', 'Array Decay', 'Function Parameters', 'Sizeof Trick'],
      options: [
        { key: 'A', text: 'The entire array is deep-copied onto the function call stack' },
        { key: 'B', text: 'The array size is automatically passed as a hidden parameter' },
        { key: 'C', text: 'The array decays into a pointer to its first element; sizeof(arr) inside the function evaluates to pointer size' },
        { key: 'D', text: 'A compile error occurs unless passed by reference' }
      ]
    }
  ];

  return bank;
}
