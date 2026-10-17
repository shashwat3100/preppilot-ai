export const STARTER_TEMPLATES = {
  'prob-two-sum': {
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

    // TODO: Find the two indices in nums whose values sum to target.
    // Print the 0-indexed indices separated by space, e.g., "0 1".

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
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

    // TODO: Find the two indices in nums whose values sum to target.
    // Print the 0-indexed indices separated by space, e.g., "0 1".

    return 0;
}`,
    python: `import sys

def solve():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())

    # TODO: Find the two indices in nums whose values sum to target.
    # Print the 0-indexed indices separated by space, e.g., "0 1".
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line1 = sc.nextLine().trim();
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();

        String[] parts = line1.split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        // TODO: Find the two indices in nums whose values sum to target.
        // Print the 0-indexed indices separated by space, e.g., "0 1".

    }
}`
  },

  'prob-valid-parentheses': {
    c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

int main() {
    char s[10005];
    if (scanf("%s", s) != 1) return 0;

    // TODO: Determine if the bracket string \`s\` is valid.
    // Print "true" or "false".

    return 0;
}`,
    cpp: `#include <iostream>
#include <string>
#include <stack>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // TODO: Determine if the bracket string \`s\` is valid.
    // Print "true" or "false".

    return 0;
}`,
    python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        return

    # TODO: Determine if the bracket string \`s\` is valid.
    # Print "true" or "false".
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // TODO: Determine if the bracket string \`s\` is valid.
        // Print "true" or "false".

    }
}`
  },

  'prob-binary-search': {
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

    // TODO: Implement Binary Search in O(log n) time.
    // Print the index of target if found, or -1 otherwise.

    return 0;
}`,
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
    int val;
    while (ss >> val) nums.push_back(val);
    int target = stoi(l2);

    // TODO: Implement Binary Search in O(log n) time.
    // Print the index of target if found, or -1 otherwise.

    return 0;
}`,
    python: `import sys

def solve():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())

    # TODO: Implement Binary Search in O(log n) time.
    # Print the index of target if found, or -1 otherwise.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String l1 = sc.nextLine().trim();
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();

        String[] parts = l1.split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        // TODO: Implement Binary Search in O(log n) time.
        // Print the index of target if found, or -1 otherwise.

    }
}`
  },

  'prob-max-subarray': {
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

    // TODO: Find the contiguous subarray which has the largest sum (Kadane's Algorithm).
    // Print the maximum subarray sum.

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;

    stringstream ss(line);
    vector<int> nums;
    int val;
    while (ss >> val) nums.push_back(val);

    // TODO: Find the contiguous subarray which has the largest sum (Kadane's Algorithm).
    // Print the maximum subarray sum.

    return 0;
}`,
    python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    nums = list(map(int, line.split()))

    # TODO: Find the contiguous subarray which has the largest sum (Kadane's Algorithm).
    # Print the maximum subarray sum.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();

        String[] parts = line.split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        // TODO: Find the contiguous subarray which has the largest sum (Kadane's Algorithm).
        // Print the maximum subarray sum.

    }
}`
  },

  'prob-palindrome-string': {
    c: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main() {
    char s[10005];
    if (!fgets(s, sizeof(s), stdin)) return 0;

    // TODO: Check if string \`s\` is a palindrome (ignoring non-alphanumeric characters and case).
    // Print "true" or "false".

    return 0;
}`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    if (!getline(cin, s)) return 0;

    // TODO: Check if string \`s\` is a palindrome (ignoring non-alphanumeric characters and case).
    // Print "true" or "false".

    return 0;
}`,
    python: `import sys

def solve():
    s = sys.stdin.read().rstrip('\\r\\n')

    # TODO: Check if string \`s\` is a palindrome (ignoring non-alphanumeric characters and case).
    # Print "true" or "false".
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String s = sc.nextLine();

        // TODO: Check if string \`s\` is a palindrome (ignoring non-alphanumeric characters and case).
        // Print "true" or "false".

    }
}`
  },

  'prob-longest-substring': {
    c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[10005];
    if (!fgets(s, sizeof(s), stdin)) return 0;

    // TODO: Find the length of the longest substring without repeating characters.
    // Print the integer length.

    return 0;
}`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    if (!getline(cin, s)) return 0;

    // TODO: Find the length of the longest substring without repeating characters.
    // Print the integer length.

    return 0;
}`,
    python: `import sys

def solve():
    s = sys.stdin.read().rstrip('\\r\\n')

    # TODO: Find the length of the longest substring without repeating characters.
    # Print the integer length.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String s = sc.nextLine();

        // TODO: Find the length of the longest substring without repeating characters.
        // Print the integer length.

    }
}`
  },

  'prob-buy-sell-stock': {
    c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int prices[10005];
    int n = 0;
    while (scanf("%d", &prices[n]) == 1) {
        n++;
        char c = getchar();
        if (c == '\\n' || c == EOF) break;
    }

    // TODO: Maximize profit by choosing a single day to buy and a different future day to sell.
    // Print the maximum profit (or 0 if no profit is possible).

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;

    stringstream ss(line);
    vector<int> prices;
    int p;
    while (ss >> p) prices.push_back(p);

    // TODO: Maximize profit by choosing a single day to buy and a different future day to sell.
    // Print the maximum profit (or 0 if no profit is possible).

    return 0;
}`,
    python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    prices = list(map(int, line.split()))

    # TODO: Maximize profit by choosing a single day to buy and a different future day to sell.
    # Print the maximum profit (or 0 if no profit is possible).
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();

        String[] parts = line.split("\\\\s+");
        int[] prices = new int[parts.length];
        for (int i = 0; i < parts.length; i++) prices[i] = Integer.parseInt(parts[i]);

        // TODO: Maximize profit by choosing a single day to buy and a different future day to sell.
        // Print the maximum profit (or 0 if no profit is possible).

    }
}`
  },

  'prob-climbing-stairs': {
    c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // TODO: Calculate how many distinct ways you can climb \`n\` stairs taking 1 or 2 steps.
    // Print the total number of distinct ways.

    return 0;
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;

    // TODO: Calculate how many distinct ways you can climb \`n\` stairs taking 1 or 2 steps.
    // Print the total number of distinct ways.

    return 0;
}`,
    python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)

    # TODO: Calculate how many distinct ways you can climb \`n\` stairs taking 1 or 2 steps.
    # Print the total number of distinct ways.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        // TODO: Calculate how many distinct ways you can climb \`n\` stairs taking 1 or 2 steps.
        // Print the total number of distinct ways.

    }
}`
  },

  'prob-container-with-most-water': {
    c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int height[10005];
    int n = 0;
    while (scanf("%d", &height[n]) == 1) {
        n++;
        char c = getchar();
        if (c == '\\n' || c == EOF) break;
    }

    // TODO: Find two lines forming a container that holds the most water.
    // Print the maximum area.

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;

    stringstream ss(line);
    vector<int> height;
    int h;
    while (ss >> h) height.push_back(h);

    // TODO: Find two lines forming a container that holds the most water.
    // Print the maximum area.

    return 0;
}`,
    python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    height = list(map(int, line.split()))

    # TODO: Find two lines forming a container that holds the most water.
    # Print the maximum area.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();

        String[] parts = line.split("\\\\s+");
        int[] height = new int[parts.length];
        for (int i = 0; i < parts.length; i++) height[i] = Integer.parseInt(parts[i]);

        // TODO: Find two lines forming a container that holds the most water.
        // Print the maximum area.

    }
}`
  },

  'prob-tcs-array-rotation': {
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
    int k;
    if (scanf("%d", &k) != 1) return 0;

    // TODO: Rotate the array to the right by \`k\` steps.
    // Print the rotated array elements separated by spaces.

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
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
    int k = stoi(line2);

    // TODO: Rotate the array to the right by \`k\` steps.
    // Print the rotated array elements separated by spaces.

    return 0;
}`,
    python: `import sys

def solve():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    k = int(lines[1].strip())

    # TODO: Rotate the array to the right by \`k\` steps.
    # Print the rotated array elements separated by spaces.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line1 = sc.nextLine().trim();
        if (!sc.hasNextInt()) return;
        int k = sc.nextInt();

        String[] parts = line1.split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        // TODO: Rotate the array to the right by \`k\` steps.
        // Print the rotated array elements separated by spaces.

    }
}`
  },

  'prob-infy-missing-number': {
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

    // TODO: Find the only number in the range [0, n] that is missing from the array.
    // Print the missing number.

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;

    stringstream ss(line);
    vector<int> nums;
    int val;
    while (ss >> val) nums.push_back(val);

    // TODO: Find the only number in the range [0, n] that is missing from the array.
    // Print the missing number.

    return 0;
}`,
    python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    nums = list(map(int, line.split()))

    # TODO: Find the only number in [0, n] missing from array.
    # Print the missing number.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();

        String[] parts = line.split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        // TODO: Find the only number in [0, n] missing from array.
        // Print the missing number.

    }
}`
  },

  'prob-wipro-reverse-words': {
    c: `#include <stdio.h>
#include <string.h>

int main() {
    char line[10005];
    if (!fgets(line, sizeof(line), stdin)) return 0;

    // TODO: Reverse the order of words in the string.
    // Print the reversed string.

    return 0;
}`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;

    // TODO: Reverse the order of words in the string.
    // Print the reversed string.

    return 0;
}`,
    python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return

    # TODO: Reverse the order of words in the string.
    # Print the reversed string.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();

        // TODO: Reverse the order of words in the string.
        // Print the reversed string.

    }
}`
  },

  'prob-accenture-move-zeroes': {
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

    // TODO: Move all 0's to the end of the array while maintaining the relative order of non-zero elements.
    // Print the modified array elements separated by spaces.

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;

    stringstream ss(line);
    vector<int> nums;
    int val;
    while (ss >> val) nums.push_back(val);

    // TODO: Move all 0's to the end of the array while maintaining the relative order of non-zero elements.
    // Print the modified array elements separated by spaces.

    return 0;
}`,
    python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    nums = list(map(int, line.split()))

    # TODO: Move all 0's to the end while maintaining relative order of non-zero elements.
    # Print the modified array elements separated by spaces.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();

        String[] parts = line.split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        // TODO: Move all 0's to the end of the array.
        // Print the modified array elements separated by spaces.

    }
}`
  },

  'prob-capgemini-merge-sorted': {
    c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int a[10005], b[10005];
    int na = 0, nb = 0;
    while (scanf("%d", &a[na]) == 1) {
        na++;
        char c = getchar();
        if (c == '\\n' || c == EOF) break;
    }
    while (scanf("%d", &b[nb]) == 1) {
        nb++;
        char c = getchar();
        if (c == '\\n' || c == EOF) break;
    }

    // TODO: Merge the two sorted arrays into one sorted array.
    // Print the merged array elements separated by spaces.

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string l1, l2;
    if (!getline(cin, l1)) return 0;
    getline(cin, l2);

    stringstream ss1(l1), ss2(l2);
    vector<int> a, b;
    int val;
    while (ss1 >> val) a.push_back(val);
    while (ss2 >> val) b.push_back(val);

    // TODO: Merge the two sorted arrays into one sorted array.
    // Print the merged array elements separated by spaces.

    return 0;
}`,
    python: `import sys

def solve():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    a = list(map(int, lines[0].split()))
    b = list(map(int, lines[1].split()))

    # TODO: Merge the two sorted arrays into one sorted array.
    # Print the merged array elements separated by spaces.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String l1 = sc.nextLine().trim();
        if (!sc.hasNextLine()) return;
        String l2 = sc.nextLine().trim();

        // TODO: Merge the two sorted arrays into one sorted array.
        // Print the merged array elements separated by spaces.

    }
}`
  },

  'prob-cognizant-subarray-sum': {
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

    // TODO: Find a contiguous subarray which sums to target.
    // Print the 1-indexed start and end indices separated by space, or -1 if none exists.

    return 0;
}`,
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
    int val;
    while (ss >> val) nums.push_back(val);
    int target = stoi(l2);

    // TODO: Find a contiguous subarray which sums to target.
    // Print the 1-indexed start and end indices separated by space, or -1 if none exists.

    return 0;
}`,
    python: `import sys

def solve():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())

    # TODO: Find a contiguous subarray which sums to target.
    # Print the 1-indexed start and end indices separated by space, or -1 if none exists.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String l1 = sc.nextLine().trim();
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();

        String[] parts = l1.split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        // TODO: Find a contiguous subarray which sums to target.
        // Print the 1-indexed start and end indices separated by space, or -1 if none exists.

    }
}`
  },

  'prob-deloitte-majority-element': {
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

    // TODO: Find the majority element that appears more than ⌊n / 2⌋ times.
    // Print the majority element.

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;

    stringstream ss(line);
    vector<int> nums;
    int val;
    while (ss >> val) nums.push_back(val);

    // TODO: Find the majority element that appears more than ⌊n / 2⌋ times.
    // Print the majority element.

    return 0;
}`,
    python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    nums = list(map(int, line.split()))

    # TODO: Find the majority element that appears more than ⌊n / 2⌋ times.
    # Print the majority element.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();

        String[] parts = line.split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);

        // TODO: Find the majority element that appears more than ⌊n / 2⌋ times.
        // Print the majority element.

    }
}`
  },

  'prob-msft-invert-tree': {
    c: `#include <stdio.h>
#include <string.h>

int main() {
    char line[10005];
    if (!fgets(line, sizeof(line), stdin)) return 0;

    // TODO: Invert the binary tree represented by level-order traversal.
    // Print the level-order traversal of the inverted tree separated by spaces.

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;

    stringstream ss(line);
    vector<string> tree;
    string node;
    while (ss >> node) tree.push_back(node);

    // TODO: Invert the binary tree represented by level-order traversal.
    // Print the level-order traversal of the inverted tree separated by spaces.

    return 0;
}`,
    python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    tree = line.split()

    # TODO: Invert the binary tree represented by level-order traversal.
    # Print the level-order traversal of the inverted tree separated by spaces.
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();

        String[] tree = line.split("\\\\s+");

        // TODO: Invert the binary tree represented by level-order traversal.
        // Print the level-order traversal of the inverted tree separated by spaces.

    }
}`
  },

  'prob-google-merge-intervals': {
    c: `#include <stdio.h>
#include <stdlib.h>

typedef struct { int s, e; } Interval;

int main() {
    Interval inv[10005];
    int n = 0;
    int s, e;
    while (scanf("%d %d", &s, &e) == 2) {
        inv[n].s = s;
        inv[n].e = e;
        n++;
    }
    if (n == 0) return 0;

    // TODO: Merge all overlapping intervals.
    // Print merged intervals formatted as space-separated pairs: start1 end1 start2 end2 ...

    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int, int>> intervals;
    int s, e;
    while (cin >> s >> e) {
        intervals.push_back({s, e});
    }

    if (intervals.empty()) return 0;

    // TODO: Merge all overlapping intervals.
    // Print merged intervals formatted as space-separated pairs: start1 end1 start2 end2 ...

    return 0;
}`,
    python: `import sys

def solve():
    raw = sys.stdin.read().strip().split()
    if not raw:
        return

    intervals = []
    for i in range(0, len(raw), 2):
        intervals.append([int(raw[i]), int(raw[i+1])])

    # TODO: Merge all overlapping intervals.
    # Print merged intervals formatted as space-separated pairs: start1 end1 start2 end2 ...
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<int[]> intervals = new ArrayList<>();
        while (sc.hasNextInt()) {
            int s = sc.nextInt();
            if (sc.hasNextInt()) {
                int e = sc.nextInt();
                intervals.add(new int[]{s, e});
            }
        }

        if (intervals.isEmpty()) return;

        // TODO: Merge all overlapping intervals.
        // Print merged intervals formatted as space-separated pairs: start1 end1 start2 end2 ...

    }
}`
  }
};
