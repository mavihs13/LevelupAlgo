import { Folders, Question, Sheets } from "@repo/database/db";
import type { Types } from "mongoose";

type Difficulty = "easy" | "medium" | "hard";
type Platform = "LeetCode" | "GeeksforGeeks";

type StarterQuestion = {
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  link: string;
};

type StarterCategory = {
  name: string;
  questions: StarterQuestion[];
};

export const STARTER_SHEET_NAME = "Popular DSA Questions";

const STARTER_CATEGORIES: StarterCategory[] = [
  {
    name: "Arrays and Hashing",
    questions: [
      {
        title: "Two Sum",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/two-sum/",
      },
      {
        title: "Contains Duplicate",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/contains-duplicate/",
      },
      {
        title: "Best Time to Buy and Sell Stock",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      },
      {
        title: "Product of Array Except Self",
        platform: "LeetCode",
        difficulty: "medium",
        link: "https://leetcode.com/problems/product-of-array-except-self/",
      },
      {
        title: "Missing Number in Array",
        platform: "GeeksforGeeks",
        difficulty: "easy",
        link: "https://www.geeksforgeeks.org/problems/missing-number-in-array1416/1",
      },
      {
        title: "Majority Element",
        platform: "GeeksforGeeks",
        difficulty: "medium",
        link: "https://www.geeksforgeeks.org/problems/majority-element-1587115620/1",
      },
    ],
  },
  {
    name: "Two Pointers and Sliding Window",
    questions: [
      {
        title: "Valid Palindrome",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/valid-palindrome/",
      },
      {
        title: "3Sum",
        platform: "LeetCode",
        difficulty: "medium",
        link: "https://leetcode.com/problems/3sum/",
      },
      {
        title: "Longest Substring Without Repeating Characters",
        platform: "LeetCode",
        difficulty: "medium",
        link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      },
    ],
  },
  {
    name: "Binary Search",
    questions: [
      {
        title: "Binary Search",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/binary-search/",
      },
      {
        title: "Search in Rotated Sorted Array",
        platform: "LeetCode",
        difficulty: "medium",
        link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
      },
    ],
  },
  {
    name: "Linked Lists",
    questions: [
      {
        title: "Reverse Linked List",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/reverse-linked-list/",
      },
      {
        title: "Merge Two Sorted Lists",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/merge-two-sorted-lists/",
      },
      {
        title: "Linked List Cycle",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/linked-list-cycle/",
      },
      {
        title: "Detect Loop in Linked List",
        platform: "GeeksforGeeks",
        difficulty: "medium",
        link: "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1",
      },
    ],
  },
  {
    name: "Stacks and Queues",
    questions: [
      {
        title: "Valid Parentheses",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/valid-parentheses/",
      },
      {
        title: "Parenthesis Checker",
        platform: "GeeksforGeeks",
        difficulty: "easy",
        link: "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1",
      },
    ],
  },
  {
    name: "Trees",
    questions: [
      {
        title: "Maximum Depth of Binary Tree",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
      },
      {
        title: "Binary Tree Level Order Traversal",
        platform: "LeetCode",
        difficulty: "medium",
        link: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
      },
    ],
  },
  {
    name: "Graphs",
    questions: [
      {
        title: "Number of Islands",
        platform: "LeetCode",
        difficulty: "medium",
        link: "https://leetcode.com/problems/number-of-islands/",
      },
      {
        title: "Course Schedule",
        platform: "LeetCode",
        difficulty: "medium",
        link: "https://leetcode.com/problems/course-schedule/",
      },
      {
        title: "Number of Islands",
        platform: "GeeksforGeeks",
        difficulty: "medium",
        link: "https://www.geeksforgeeks.org/problems/find-the-number-of-islands/1",
      },
    ],
  },
  {
    name: "Dynamic Programming",
    questions: [
      {
        title: "Climbing Stairs",
        platform: "LeetCode",
        difficulty: "easy",
        link: "https://leetcode.com/problems/climbing-stairs/",
      },
      {
        title: "Coin Change",
        platform: "LeetCode",
        difficulty: "medium",
        link: "https://leetcode.com/problems/coin-change/",
      },
      {
        title: "Longest Increasing Subsequence",
        platform: "LeetCode",
        difficulty: "medium",
        link: "https://leetcode.com/problems/longest-increasing-subsequence/",
      },
    ],
  },
];

export async function seedDefaultDsaSheet(userId: Types.ObjectId) {
  const sheet = await Sheets.findOneAndUpdate(
    { name: STARTER_SHEET_NAME, createdBy: userId },
    { $setOnInsert: { name: STARTER_SHEET_NAME, createdBy: userId } },
    { returnDocument: "after", upsert: true }
  );

  if (!sheet) {
    throw new Error("Could not create the starter DSA sheet");
  }

  let questionCount = 0;

  for (const [index, category] of STARTER_CATEGORIES.entries()) {
    const folder = await Folders.findOneAndUpdate(
      {
        name: category.name,
        sheetId: sheet._id,
        parentFolderId: null,
        createdBy: userId,
      },
      {
        $setOnInsert: {
          name: category.name,
          sheetId: sheet._id,
          parentFolderId: null,
          order: index,
          createdBy: userId,
        },
      },
      { returnDocument: "after", upsert: true }
    );

    if (!folder) {
      throw new Error(`Could not create the "${category.name}" folder`);
    }

    const operations = category.questions.map((question) => ({
      updateOne: {
        filter: {
          link: question.link,
          sheetId: sheet._id,
          folderId: folder._id,
          createdBy: userId,
        },
        update: {
          $setOnInsert: {
            ...question,
            type: "Normal" as const,
            sheetId: sheet._id,
            folderId: folder._id,
            createdBy: userId,
            notes: "",
            resourceLink: "",
            done: false,
          },
        },
        upsert: true,
      },
    }));

    await Question.bulkWrite(operations);
    questionCount += category.questions.length;
  }

  return { sheetId: sheet._id.toString(), questionCount };
}
