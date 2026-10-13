import db, { initDb, saveDb } from './db.js';

export const codingProblemsList = [
  {
    id: 'prob-two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    subject_id: 'sub-dsa',
    topic_id: 'top-arrays',
    tags: ['Arrays', 'Hash Table', 'Amazon', 'TCS Ninja', 'Top 50'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, find the two numbers in the array such that they add up to \`target\`.

Return their indices formatted as space-separated 0-indexed integers in ascending order.

You may assume that each input will have exactly one solution, and you may not use the same element twice.`,
    constraints: `2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.`,
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      "A brute force approach checks every pair of elements in O(n^2) time. Can you do it faster using extra space?",
      "For each element x in the array, what complementary value are you looking for? (target - x)",
      "Can you store numbers you have already visited in a hash map mapping value -> index so lookups take O(1) time?"
    ],
    editorial: {
      approach: "One-Pass Hash Table",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation: "Iterate through the array once while maintaining a hash map of numbers seen so far and their indices. For each number, compute complement = target - num. If complement is already in the map, we have found our answer in O(1) lookup time."
    },
    starterCode: {
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int nums[10005];
    int n = 0;
    while (scanf("%d", &nums[n]) == 1) {
        n++;
        char c = getchar();
        if (c == '\\n' || c == EOF) break;
    }
    int target;
    if (scanf("%d", &target) != 1) return 0;

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                return 0;
            }
        }
    }
    return 0;
}`,
      python: `import sys

def two_sum():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())
    
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[num] = i

if __name__ == '__main__':
    two_sum()`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>
using namespace std;

int main() {
    string line1, line2;
    if (!getline(cin, line1)) return 0;
    getline(cin, line2);

    stringstream ss(line1);
    vector<int> nums;
    int val;
    while (ss >> val) nums.push_back(val);
    int target = stoi(line2);

    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int comp = target - nums[i];
        if (seen.count(comp)) {
            cout << seen[comp] << " " << i << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}`,
      java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line1 = sc.nextLine().trim();
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();

        String[] parts = line1.split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                System.out.println(map.get(comp) + " " + i);
                return;
            }
            map.put(nums[i], i);
        }
    }
}`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prob-valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    branch_id: 'branch-cse',
    company_id: 'comp-infosys',
    subject_id: 'sub-dsa',
    topic_id: 'top-stack-queue',
    tags: ['Stack', 'Strings', 'Infosys', 'TCS', 'Accenture'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print \`true\` if the string is valid, or \`false\` otherwise.`,
    constraints: `1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.`,
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      "Brackets have a Last-In, First-Out (LIFO) relationship. Which data structure naturally supports this?",
      "When encountering an opening bracket, push it onto the stack. When encountering a closing bracket, check if it matches the top element.",
      "Remember edge cases: an empty string is valid, but unmatched opening brackets remaining at the end make it invalid."
    ],
    editorial: {
      approach: "Stack Evaluation",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation: "Iterate through the string. Push open brackets onto a stack. When a closing bracket is seen, verify the stack is non-empty and pop the top element. If it doesn't match the required opening bracket, return false. At the end, return true only if the stack is completely empty."
    },
    starterCode: {
      c: `#include <stdio.h>
#include <stdbool.h>
#include <string.h>

int main() {
    char s[10005];
    if (scanf("%s", s) != 1) return 0;

    char stack[10005];
    int top = -1;

    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top == -1) {
                printf("false\\n");
                return 0;
            }
            char open = stack[top--];
            if ((c == ')' && open != '(') ||
                (c == '}' && open != '{') ||
                (c == ']' && open != '[')) {
                printf("false\\n");
                return 0;
            }
        }
    }

    if (top == -1) {
        printf("true\\n");
    } else {
        printf("false\\n");
    }
    return 0;
}`,
      python: `import sys

def is_valid():
    s = sys.stdin.read().strip()
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    
    for ch in s:
        if ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                print("false")
                return
            stack.pop()
        else:
            stack.append(ch)
            
    print("true" if len(stack) == 0 else "false")

if __name__ == '__main__':
    is_valid()`,
      cpp: `#include <iostream>
#include <stack>
#include <unordered_map>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    stack<char> st;
    unordered_map<char, char> pairs = {{')', '('}, {'}', '{'}, {']', '['}};

    for (char c : s) {
        if (pairs.count(c)) {
            if (st.empty() || st.top() != pairs[c]) {
                cout << "false" << endl;
                return 0;
            }
            st.pop();
        } else {
            st.push(c);
        }
    }

    cout << (st.empty() ? "true" : "false") << endl;
    return 0;
}`,
      java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next().trim();

        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else {
                if (stack.isEmpty() || stack.pop() != c) {
                    System.out.println("false");
                    return;
                }
            }
        }
        System.out.println(stack.isEmpty() ? "true" : "false");
    }
}`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prob-binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    branch_id: 'branch-it',
    company_id: 'comp-wipro',
    subject_id: 'sub-dsa',
    topic_id: 'top-searching-sorting',
    tags: ['Binary Search', 'Algorithms', 'Wipro', 'Cognizant'],
    description: `Given a sorted array of distinct integers \`nums\` in ascending order and a target value \`target\`, search for \`target\` in \`nums\`.

If \`target\` exists in the array, print its 0-based index. Otherwise, print \`-1\`.

Your algorithm must have \`O(log n)\` runtime complexity.`,
    constraints: `1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll integers in nums are unique and sorted in ascending order.`,
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      "The input array is already sorted. What property allows you to discard half the search space at each step?",
      "Calculate mid = left + (right - left) // 2 to avoid potential integer overflow.",
      "If nums[mid] < target, target must lie in the right half (left = mid + 1). Otherwise, look in the left half."
    ],
    editorial: {
      approach: "Divide and Conquer (Binary Search)",
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
      explanation: "Maintain left and right boundary pointers. While left <= right, find the middle index. If nums[mid] equals target, return mid immediately. If nums[mid] is smaller, shift left to mid + 1. Otherwise, shift right to mid - 1. If left exceeds right, return -1."
    },
    starterCode: {
      c: `#include <stdio.h>

int main() {
    int nums[10005];
    int n = 0;
    while (scanf("%d", &nums[n]) == 1) {
        n++;
        char c = getchar();
        if (c == '\\n' || c == EOF) break;
    }
    int target;
    if (scanf("%d", &target) != 1) return 0;

    int left = 0, right = n - 1, ans = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    printf("%d\\n", ans);
    return 0;
}`,
      python: `import sys

def binary_search():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())

    left, right = 0, len(nums) - 1
    ans = -1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            ans = mid
            break
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    print(ans)

if __name__ == '__main__':
    binary_search()`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string l1, l2;
    if (!getline(cin, l1)) return 0;
    getline(cin, l2);

    stringstream ss(l1);
    vector<int> nums;
    int v;
    while (ss >> v) nums.push_back(v);
    int target = stoi(l2);

    int left = 0, right = nums.size() - 1, ans = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    cout << ans << endl;
    return 0;
}`,
      java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line1 = sc.nextLine().trim();
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();

        String[] parts = line1.split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        int left = 0, right = nums.length - 1, ans = -1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                ans = mid;
                break;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        System.out.println(ans);
    }
}`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prob-max-subarray',
    title: 'Maximum Subarray (Kadane’s Algorithm)',
    difficulty: 'Medium',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    subject_id: 'sub-dsa',
    topic_id: 'top-dp',
    tags: ['Dynamic Programming', 'Kadane', 'Arrays', 'Amazon', 'TCS Digital'],
    description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum, and return its sum.

Print the single maximum sum integer to standard output.`,
    constraints: `1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4`,
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      "Can negative prefix sums ever contribute positively to subsequent subarrays?",
      "At each step, decide whether to append the current element to the existing running sum or restart a new subarray from the current element.",
      "Kadane's algorithm maintains currSum = max(num, currSum + num) and updates maxSum = max(maxSum, currSum)."
    ],
    editorial: {
      approach: "Kadane's Algorithm (Dynamic Programming)",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation: "Iterate through the array. Keep a running sum of the current contiguous subarray. If the running sum falls below the current number, reset the running sum to the current number. Keep track of the global maximum sum across the entire traversal."
    },
    starterCode: {
      c: `#include <stdio.h>

int main() {
    int nums[100005];
    int n = 0;
    while (scanf("%d", &nums[n]) == 1) {
        n++;
    }
    if (n == 0) return 0;

    long long max_sum = nums[0];
    long long curr_sum = nums[0];
    for (int i = 1; i < n; i++) {
        if (curr_sum + nums[i] > nums[i]) {
            curr_sum = curr_sum + nums[i];
        } else {
            curr_sum = nums[i];
        }
        if (curr_sum > max_sum) {
            max_sum = curr_sum;
        }
    }
    printf("%lld\\n", max_sum);
    return 0;
}`,
      python: `import sys

def max_subarray():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    nums = list(map(int, raw.split()))
    
    max_sum = nums[0]
    curr_sum = nums[0]
    for x in nums[1:]:
        curr_sum = max(x, curr_sum + x)
        max_sum = max(max_sum, curr_sum)
        
    print(max_sum)

if __name__ == '__main__':
    max_subarray()`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;
    stringstream ss(line);
    vector<int> nums;
    int v;
    while (ss >> v) nums.push_back(v);

    if (nums.empty()) return 0;
    long long maxSum = nums[0], currSum = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        currSum = max((long long)nums[i], currSum + nums[i]);
        maxSum = max(maxSum, currSum);
    }
    cout << maxSum << endl;
    return 0;
}`,
      java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();
        String[] parts = line.split("\\\\s+");
        if (parts.length == 0 || parts[0].isEmpty()) return;

        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        long maxSum = nums[0], currSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currSum = Math.max(nums[i], currSum + nums[i]);
            maxSum = Math.max(maxSum, currSum);
        }
        System.out.println(maxSum);
    }
}`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prob-palindrome-string',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    branch_id: 'branch-it',
    company_id: 'comp-tcs',
    subject_id: 'sub-dsa',
    topic_id: 'top-strings',
    tags: ['Two Pointers', 'Strings', 'TCS NQT', 'Cognizant'],
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, print \`true\` if it is a palindrome, or \`false\` otherwise.`,
    constraints: `1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.`,
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      "Filter the string to keep only alphanumeric characters and convert them to lowercase.",
      "Use two pointers: one starting from the beginning and one from the end.",
      "Move them inwards and verify characters match at every step."
    ],
    editorial: {
      approach: "Two Pointers Traversal",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation: "Place left pointer at index 0 and right pointer at length - 1. Move inwards, skipping non-alphanumeric characters. Compare lowercased characters. If any mismatch occurs, print false. If pointers cross without mismatch, print true."
    },
    starterCode: {
      c: `#include <stdio.h>
#include <ctype.h>
#include <stdbool.h>
#include <string.h>

int main() {
    char s[200005];
    if (!fgets(s, sizeof(s), stdin)) return 0;

    int left = 0;
    int right = (int)strlen(s) - 1;

    while (left < right) {
        while (left < right && !isalnum((unsigned char)s[left])) left++;
        while (left < right && !isalnum((unsigned char)s[right])) right--;
        if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) {
            printf("false\\n");
            return 0;
        }
        left++;
        right--;
    }
    printf("true\\n");
    return 0;
}`,
      python: `import sys

def is_palindrome():
    s = sys.stdin.read().strip()
    cleaned = ''.join(ch.lower() for ch in s if ch.isalnum())
    print("true" if cleaned == cleaned[::-1] else "false")

if __name__ == '__main__':
    is_palindrome()`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    string cleaned = "";
    for (char c : s) {
        if (isalnum(c)) cleaned += tolower(c);
    }
    int l = 0, r = (int)cleaned.size() - 1;
    bool ok = true;
    while (l < r) {
        if (cleaned[l++] != cleaned[r--]) {
            ok = false;
            break;
        }
    }
    cout << (ok ? "true" : "false") << endl;
    return 0;
}`,
      java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isLetterOrDigit(c)) sb.append(Character.toLowerCase(c));
        }
        String clean = sb.toString();
        String rev = sb.reverse().toString();
        System.out.println(clean.equals(rev) ? "true" : "false");
    }
}`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prob-longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    subject_id: 'sub-dsa',
    topic_id: 'top-strings',
    tags: ['Sliding Window', 'Hash Table', 'Amazon', 'Infosys HackWithInfy'],
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.

Print the single integer length to standard output.`,
    constraints: `0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.`,
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      "Can you maintain a sliding window [left, right] of characters that are currently distinct?",
      "Use a hash map or array to store the last seen position of each character.",
      "If a character is already inside the current window, advance the left pointer past its previous index."
    ],
    editorial: {
      approach: "Sliding Window with Hash Map",
      timeComplexity: "O(n)",
      spaceComplexity: "O(min(n, m))",
      explanation: "Maintain two pointers representing the window. As right expands, if the character was already seen inside [left, right], advance left to lastSeen[ch] + 1. Update lastSeen[ch] = right and update maxLen = max(maxLen, right - left + 1)."
    },
    starterCode: {
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[50005];
    if (!fgets(s, sizeof(s), stdin)) {
        printf("0\\n");
        return 0;
    }
    int len = (int)strlen(s);
    while (len > 0 && (s[len - 1] == '\\n' || s[len - 1] == '\\r')) {
        s[--len] = '\\0';
    }

    int last[256];
    for (int i = 0; i < 256; i++) last[i] = -1;

    int left = 0, max_len = 0;
    for (int right = 0; right < len; right++) {
        unsigned char c = (unsigned char)s[right];
        if (last[c] >= left) {
            left = last[c] + 1;
        }
        last[c] = right;
        int cur_len = right - left + 1;
        if (cur_len > max_len) max_len = cur_len;
    }
    printf("%d\\n", max_len);
    return 0;
}`,
      python: `import sys

def length_of_longest_substring():
    s = sys.stdin.read().rstrip('\\r\\n')
    char_map = {}
    left = 0
    max_len = 0
    for right, ch in enumerate(s):
        if ch in char_map and char_map[ch] >= left:
            left = char_map[ch] + 1
        char_map[ch] = right
        max_len = max(max_len, right - left + 1)
    print(max_len)

if __name__ == '__main__':
    length_of_longest_substring()`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

int main() {
    string s;
    if (!getline(cin, s)) {
        cout << 0 << endl;
        return 0;
    }
    unordered_map<char, int> lastIdx;
    int left = 0, maxLen = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        char c = s[right];
        if (lastIdx.count(c) && lastIdx[c] >= left) {
            left = lastIdx[c] + 1;
        }
        lastIdx[c] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    cout << maxLen << endl;
    return 0;
}`,
      java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        System.out.println(maxLen);
    }
}`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prob-buy-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    subject_id: 'sub-dsa',
    topic_id: 'top-arrays',
    tags: ['Arrays', 'Dynamic Programming', 'Amazon', 'TCS', 'Accenture'],
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Print the maximum profit you can achieve from this transaction. If you cannot achieve any profit, print \`0\`.`,
    constraints: `1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4`,
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      "You cannot sell a stock before you buy it. The buy day must come strictly before the sell day.",
      "As you iterate through the days, track the lowest price observed so far.",
      "The maximum profit on day i is prices[i] - minPriceSoFar."
    ],
    editorial: {
      approach: "One-Pass Minimum Tracking",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation: "Maintain minPrice initialized to infinity and maxProfit to 0. For each price, update minPrice = min(minPrice, price), and compute profit = price - minPrice. If profit > maxProfit, update maxProfit. Output maxProfit."
    },
    starterCode: {
      c: `#include <stdio.h>

int main() {
    int prices[100005];
    int n = 0;
    while (scanf("%d", &prices[n]) == 1) {
        n++;
    }
    if (n <= 1) {
        printf("0\\n");
        return 0;
    }

    int min_price = prices[0];
    int max_profit = 0;
    for (int i = 1; i < n; i++) {
        if (prices[i] < min_price) {
            min_price = prices[i];
        } else if (prices[i] - min_price > max_profit) {
            max_profit = prices[i] - min_price;
        }
    }
    printf("%d\\n", max_profit);
    return 0;
}`,
      python: `import sys

def max_profit():
    raw = sys.stdin.read().strip()
    if not raw:
        print(0)
        return
    prices = list(map(int, raw.split()))
    min_price = float('inf')
    max_profit = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > max_profit:
            max_profit = p - min_price
    print(max_profit)

if __name__ == '__main__':
    max_profit()`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) {
        cout << 0 << endl;
        return 0;
    }
    stringstream ss(line);
    int p;
    int minPrice = 1e9, maxProfit = 0;
    while (ss >> p) {
        if (p < minPrice) minPrice = p;
        else if (p - minPrice > maxProfit) maxProfit = p - minPrice;
    }
    cout << maxProfit << endl;
    return 0;
}`,
      java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) {
            System.out.println(0);
            return;
        }
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        while (sc.hasNextInt()) {
            int p = sc.nextInt();
            if (p < minPrice) minPrice = p;
            else if (p - minPrice > maxProfit) maxProfit = p - minPrice;
        }
        System.out.println(maxProfit);
    }
}`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prob-climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    branch_id: 'branch-cse',
    company_id: 'comp-infosys',
    subject_id: 'sub-dsa',
    topic_id: 'top-dp',
    tags: ['Dynamic Programming', 'Math', 'Infosys', 'Cognizant', 'TCS'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

Print the number of distinct ways to standard output.`,
    constraints: `1 <= n <= 45`,
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      "To reach step n, you could have arrived from either step n-1 (by taking 1 step) or step n-2 (by taking 2 steps).",
      "ways(n) = ways(n-1) + ways(n-2). This is identical to the Fibonacci sequence!",
      "You only need to store the previous two values instead of an entire array."
    ],
    editorial: {
      approach: "Fibonacci Dynamic Programming",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation: "Base cases: ways(1) = 1, ways(2) = 2. For i from 3 to n, current = prev1 + prev2. Update pointers iteratively in O(1) space."
    },
    starterCode: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    if (n <= 2) {
        printf("%d\\n", n);
        return 0;
    }
    long long a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        long long c = a + b;
        a = b;
        b = c;
    }
    printf("%lld\\n", b);
    return 0;
}`,
      python: `import sys

def climb_stairs():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    n = int(raw)
    if n <= 2:
        print(n)
        return
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    print(b)

if __name__ == '__main__':
    climb_stairs()`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    if (n <= 2) {
        cout << n << endl;
        return 0;
    }
    long long a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        long long c = a + b;
        a = b;
        b = c;
    }
    cout << b << endl;
    return 0;
}`,
      java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n <= 2) {
            System.out.println(n);
            return;
        }
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        System.out.println(b);
    }
}`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prob-container-with-most-water',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    branch_id: 'branch-cse',
    company_id: 'comp-amazon',
    subject_id: 'sub-dsa',
    topic_id: 'top-arrays',
    tags: ['Two Pointers', 'Greedy', 'Amazon', 'Microsoft'],
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store. Print the integer answer.`,
    constraints: `2 <= n <= 10^5\n0 <= height[i] <= 10^4`,
    timeLimit: 2000,
    memoryLimit: 256,
    hints: [
      "The area is limited by min(height[left], height[right]) * (right - left).",
      "Start with the widest container using two pointers at the ends (left = 0, right = n-1).",
      "Which pointer should you move inwards? Moving the taller line cannot increase the area because width decreases and the height was bottlenecked by the shorter line anyway. Always move the shorter pointer!"
    ],
    editorial: {
      approach: "Two Pointers Greedy",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation: "Place pointers at left = 0 and right = n - 1. Calculate area = min(height[left], height[right]) * (right - left). Compare with maxArea. Move the pointer pointing to the shorter vertical bar inward, because keeping the shorter bar with a reduced width cannot possibly yield a larger area."
    },
    starterCode: {
      c: `#include <stdio.h>

int main() {
    int h[100005];
    int n = 0;
    while (scanf("%d", &h[n]) == 1) {
        n++;
    }
    int l = 0, r = n - 1;
    long long max_water = 0;
    while (l < r) {
        int height = h[l] < h[r] ? h[l] : h[r];
        long long water = (long long)height * (r - l);
        if (water > max_water) max_water = water;
        if (h[l] < h[r]) l++;
        else r--;
    }
    printf("%lld\\n", max_water);
    return 0;
}`,
      python: `import sys

def max_area():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    height = list(map(int, raw.split()))
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        h = min(height[left], height[right])
        max_water = max(max_water, h * (right - left))
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    print(max_water)

if __name__ == '__main__':
    max_area()`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;
    stringstream ss(line);
    vector<int> h;
    int v;
    while (ss >> v) h.push_back(v);

    int l = 0, r = (int)h.size() - 1;
    long long maxW = 0;
    while (l < r) {
        long long currentH = min(h[l], h[r]);
        maxW = max(maxW, currentH * (r - l));
        if (h[l] < h[r]) l++;
        else r--;
    }
    cout << maxW << endl;
    return 0;
}`,
      java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int l = 0, r = list.size() - 1;
        long maxW = 0;
        while (l < r) {
            long h = Math.min(list.get(l), list.get(r));
            maxW = Math.max(maxW, h * (r - l));
            if (list.get(l) < list.get(r)) l++;
            else r--;
        }
        System.out.println(maxW);
    }
}`
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const codingTestCasesList = [
  // Two Sum
  {
    id: 'tc-two-sum-1',
    problem_id: 'prob-two-sum',
    input: "2 7 11 15\n9",
    expectedOutput: "0 1",
    isHidden: false,
    explanation: "nums[0] + nums[1] == 2 + 7 == 9, indices are 0 1",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-two-sum-2',
    problem_id: 'prob-two-sum',
    input: "3 2 4\n6",
    expectedOutput: "1 2",
    isHidden: false,
    explanation: "nums[1] + nums[2] == 2 + 4 == 6, indices are 1 2",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-two-sum-3',
    problem_id: 'prob-two-sum',
    input: "3 3\n6",
    expectedOutput: "0 1",
    isHidden: false,
    explanation: "nums[0] + nums[1] == 3 + 3 == 6, indices are 0 1",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-two-sum-4',
    problem_id: 'prob-two-sum',
    input: "1 5 8 10 14\n19",
    expectedOutput: "1 4",
    isHidden: true,
    explanation: "5 + 14 == 19",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-two-sum-5',
    problem_id: 'prob-two-sum',
    input: "-3 4 3 90\n0",
    expectedOutput: "0 2",
    isHidden: true,
    explanation: "-3 + 3 == 0",
    created_at: new Date().toISOString()
  },

  // Valid Parentheses
  {
    id: 'tc-vp-1',
    problem_id: 'prob-valid-parentheses',
    input: "()",
    expectedOutput: "true",
    isHidden: false,
    explanation: "Single matching round brackets pair",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-vp-2',
    problem_id: 'prob-valid-parentheses',
    input: "()[]{}",
    expectedOutput: "true",
    isHidden: false,
    explanation: "Consecutive valid pairs",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-vp-3',
    problem_id: 'prob-valid-parentheses',
    input: "(]",
    expectedOutput: "false",
    isHidden: false,
    explanation: "Mismatched bracket types",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-vp-4',
    problem_id: 'prob-valid-parentheses',
    input: "([{}])",
    expectedOutput: "true",
    isHidden: true,
    explanation: "Nested bracket sequences correctly closed",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-vp-5',
    problem_id: 'prob-valid-parentheses',
    input: "[(])",
    expectedOutput: "false",
    isHidden: true,
    explanation: "Interleaved incorrect closure order",
    created_at: new Date().toISOString()
  },

  // Binary Search
  {
    id: 'tc-bs-1',
    problem_id: 'prob-binary-search',
    input: "-1 0 3 5 9 12\n9",
    expectedOutput: "4",
    isHidden: false,
    explanation: "9 exists in nums and its index is 4",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-bs-2',
    problem_id: 'prob-binary-search',
    input: "-1 0 3 5 9 12\n2",
    expectedOutput: "-1",
    isHidden: false,
    explanation: "2 does not exist in nums, return -1",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-bs-3',
    problem_id: 'prob-binary-search',
    input: "5\n5",
    expectedOutput: "0",
    isHidden: true,
    explanation: "Single element matching target",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-bs-4',
    problem_id: 'prob-binary-search',
    input: "1 3 5 7 9 11 13\n13",
    expectedOutput: "6",
    isHidden: true,
    explanation: "Target is the last element at index 6",
    created_at: new Date().toISOString()
  },

  // Max Subarray
  {
    id: 'tc-ms-1',
    problem_id: 'prob-max-subarray',
    input: "-2 1 -3 4 -1 2 1 -5 4",
    expectedOutput: "6",
    isHidden: false,
    explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-ms-2',
    problem_id: 'prob-max-subarray',
    input: "1",
    expectedOutput: "1",
    isHidden: false,
    explanation: "Single element array max sum is 1",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-ms-3',
    problem_id: 'prob-max-subarray',
    input: "5 4 -1 7 8",
    expectedOutput: "23",
    isHidden: false,
    explanation: "The subarray [5,4,-1,7,8] has the largest sum 23",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-ms-4',
    problem_id: 'prob-max-subarray',
    input: "-5 -2 -8 -1",
    expectedOutput: "-1",
    isHidden: true,
    explanation: "All negative numbers: maximum is least negative element -1",
    created_at: new Date().toISOString()
  },

  // Valid Palindrome
  {
    id: 'tc-pal-1',
    problem_id: 'prob-palindrome-string',
    input: "A man, a plan, a canal: Panama",
    expectedOutput: "true",
    isHidden: false,
    explanation: "amanaplanacanalpanama is a palindrome",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-pal-2',
    problem_id: 'prob-palindrome-string',
    input: "race a car",
    expectedOutput: "false",
    isHidden: false,
    explanation: "raceacar is not a palindrome",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-pal-3',
    problem_id: 'prob-palindrome-string',
    input: "Was it a car or a cat I saw?",
    expectedOutput: "true",
    isHidden: true,
    explanation: "wasitacaroracatisaw is a palindrome",
    created_at: new Date().toISOString()
  },

  // Longest Substring
  {
    id: 'tc-ls-1',
    problem_id: 'prob-longest-substring',
    input: "abcabcbb",
    expectedOutput: "3",
    isHidden: false,
    explanation: "The answer is 'abc', with the length of 3.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-ls-2',
    problem_id: 'prob-longest-substring',
    input: "bbbbb",
    expectedOutput: "1",
    isHidden: false,
    explanation: "The answer is 'b', with the length of 1.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-ls-3',
    problem_id: 'prob-longest-substring',
    input: "pwwkew",
    expectedOutput: "3",
    isHidden: false,
    explanation: "The answer is 'wke', with length of 3.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-ls-4',
    problem_id: 'prob-longest-substring',
    input: "abcdef",
    expectedOutput: "6",
    isHidden: true,
    explanation: "All distinct characters, length 6.",
    created_at: new Date().toISOString()
  },

  // Buy and Sell Stock
  {
    id: 'tc-bss-1',
    problem_id: 'prob-buy-sell-stock',
    input: "7 1 5 3 6 4",
    expectedOutput: "5",
    isHidden: false,
    explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-bss-2',
    problem_id: 'prob-buy-sell-stock',
    input: "7 6 4 3 1",
    expectedOutput: "0",
    isHidden: false,
    explanation: "In this case, no transactions are done and max profit = 0.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-bss-3',
    problem_id: 'prob-buy-sell-stock',
    input: "2 4 1",
    expectedOutput: "2",
    isHidden: true,
    explanation: "Buy at 2, sell at 4 = profit 2.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-bss-4',
    problem_id: 'prob-buy-sell-stock',
    input: "1 2 3 4 5",
    expectedOutput: "4",
    isHidden: true,
    explanation: "Buy at 1, sell at 5 = profit 4.",
    created_at: new Date().toISOString()
  },

  // Climbing Stairs
  {
    id: 'tc-cs-1',
    problem_id: 'prob-climbing-stairs',
    input: "2",
    expectedOutput: "2",
    isHidden: false,
    explanation: "There are two ways: 1+1 or 2 steps.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-cs-2',
    problem_id: 'prob-climbing-stairs',
    input: "3",
    expectedOutput: "3",
    isHidden: false,
    explanation: "Three ways: 1+1+1, 1+2, or 2+1 steps.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-cs-3',
    problem_id: 'prob-climbing-stairs',
    input: "5",
    expectedOutput: "8",
    isHidden: true,
    explanation: "Fibonacci sequence step 5 = 8 ways.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-cs-4',
    problem_id: 'prob-climbing-stairs',
    input: "10",
    expectedOutput: "89",
    isHidden: true,
    explanation: "10 steps has 89 ways.",
    created_at: new Date().toISOString()
  },

  // Container With Most Water
  {
    id: 'tc-cwm-1',
    problem_id: 'prob-container-with-most-water',
    input: "1 8 6 2 5 4 8 3 7",
    expectedOutput: "49",
    isHidden: false,
    explanation: "Between index 1 (height 8) and index 8 (height 7), min(8,7) * (8-1) = 49.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-cwm-2',
    problem_id: 'prob-container-with-most-water',
    input: "1 1",
    expectedOutput: "1",
    isHidden: false,
    explanation: "min(1,1) * (1-0) = 1.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-cwm-3',
    problem_id: 'prob-container-with-most-water',
    input: "4 3 2 1 4",
    expectedOutput: "16",
    isHidden: true,
    explanation: "Endpoints 4 and 4 with width 4 = 16.",
    created_at: new Date().toISOString()
  },
  {
    id: 'tc-cwm-4',
    problem_id: 'prob-container-with-most-water',
    input: "1 2 1",
    expectedOutput: "2",
    isHidden: true,
    explanation: "Width 2 between 1 and 1 gives 2.",
    created_at: new Date().toISOString()
  }
];

export const codingAssessmentsList = [
  {
    id: 'asmt-tcs-nqt-round1',
    title: 'TCS NQT Hands-on Coding Round',
    description: 'Simulated 45-minute assessment reflecting the TCS National Qualifier Test (NQT) coding section. Emphasizes foundational logic, string formatting, and array search algorithms.',
    company: 'TCS',
    duration_minutes: 45,
    difficulty: 'Easy',
    total_marks: 100,
    problem_ids: ['prob-palindrome-string', 'prob-two-sum'],
    tags: ['TCS NQT', 'National Qualifier', 'Arrays', 'Strings'],
    created_at: new Date().toISOString()
  },
  {
    id: 'asmt-amazon-oa',
    title: 'Amazon SDE-1 Online Assessment',
    description: 'Amazon SDE-1 OA Simulation. Tests algorithmic optimization, contiguous subarray optimization, and sliding window string patterns under strict timing.',
    company: 'Amazon',
    duration_minutes: 60,
    difficulty: 'Medium',
    total_marks: 100,
    problem_ids: ['prob-max-subarray', 'prob-longest-substring'],
    tags: ['Amazon', 'SDE-1', 'Dynamic Programming', 'Sliding Window'],
    created_at: new Date().toISOString()
  },
  {
    id: 'asmt-infosys-dse',
    title: 'Infosys DSE Coding Challenge',
    description: 'Infosys Digital Specialist Engineer (DSE) hands-on coding assessment. Evaluates stack LIFO invariants, bracket matching, and binary search logarithmic algorithms.',
    company: 'Infosys',
    duration_minutes: 50,
    difficulty: 'Easy - Medium',
    total_marks: 100,
    problem_ids: ['prob-valid-parentheses', 'prob-binary-search'],
    tags: ['Infosys', 'DSE', 'Stack', 'Binary Search'],
    created_at: new Date().toISOString()
  }
];

export async function seedCoding() {
  await initDb();
  console.log('[Seed] Seeding PrepPilot AI Coding Arena problems with C, C++, Python, Java...');

  for (const prob of codingProblemsList) {
    const existing = db.get('codingProblems', prob.id);
    if (existing) {
      db.update('codingProblems', prob.id, prob);
    } else {
      db.insert('codingProblems', prob);
    }
  }

  for (const tc of codingTestCasesList) {
    const existing = db.get('codingTestCases', tc.id);
    if (existing) {
      db.update('codingTestCases', tc.id, tc);
    } else {
      db.insert('codingTestCases', tc);
    }
  }

  for (const asmt of codingAssessmentsList) {
    const existing = db.get('codingAssessments', asmt.id);
    if (existing) {
      db.update('codingAssessments', asmt.id, asmt);
    } else {
      db.insert('codingAssessments', asmt);
    }
  }

  saveDb();
  console.log(`[Seed] Seeded ${codingProblemsList.length} problems with C starter codes, ${codingTestCasesList.length} test cases, and ${codingAssessmentsList.length} assessments!`);
}

if (process.argv[1] && process.argv[1].endsWith('seedCodingProblems.js')) {
  seedCoding().then(() => process.exit(0));
}
