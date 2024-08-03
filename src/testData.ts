import type { Group } from "./store";

export const testData: Group[] = [
  {
    id: "W2f6j6wujIkCMUNyCWvGN",
    name: "test",
    items: [
      {
        id: "KvkVRJ75csDSJ2RwWrqV6",
        groupId: "W2f6j6wujIkCMUNyCWvGN",
        name: "test",
        expression: "1234",
        dependencies: [],
      },
      {
        id: "7-xZXzviktxAmnwQ9kyCI",
        groupId: "W2f6j6wujIkCMUNyCWvGN",
        name: "test * 2",
        expression: "{W2f6j6wujIkCMUNyCWvGN::KvkVRJ75csDSJ2RwWrqV6} * 2",
        dependencies: [
          {
            group: "W2f6j6wujIkCMUNyCWvGN",
            item: "KvkVRJ75csDSJ2RwWrqV6",
          },
        ],
      },
      {
        id: "LyUCtdS0ih3FOAoGxU6Tf",
        groupId: "W2f6j6wujIkCMUNyCWvGN",
        name: "test * 2 + 1",
        expression: "{W2f6j6wujIkCMUNyCWvGN::KvkVRJ75csDSJ2RwWrqV6} * 2 + 1",
        dependencies: [
          {
            group: "W2f6j6wujIkCMUNyCWvGN",
            item: "KvkVRJ75csDSJ2RwWrqV6",
          },
        ],
      },
    ],
  },
  {
    id: "wrqA4kgvnSCjLg5nn2TfB",
    name: "test2",
    items: [
      {
        id: "IFTBNMcxu10YbacRm3Bi3",
        groupId: "wrqA4kgvnSCjLg5nn2TfB",
        name: "test.test + 100",
        expression: "{W2f6j6wujIkCMUNyCWvGN::KvkVRJ75csDSJ2RwWrqV6} + 100",
        dependencies: [
          {
            group: "W2f6j6wujIkCMUNyCWvGN",
            item: "KvkVRJ75csDSJ2RwWrqV6",
          },
        ],
      },
      {
        id: "XHu-qzo8ex4C2UZsVPJG-",
        groupId: "wrqA4kgvnSCjLg5nn2TfB",
        name: "test2",
        expression:
          "{W2f6j6wujIkCMUNyCWvGN::7-xZXzviktxAmnwQ9kyCI} + {W2f6j6wujIkCMUNyCWvGN::LyUCtdS0ih3FOAoGxU6Tf}",
        dependencies: [
          {
            group: "W2f6j6wujIkCMUNyCWvGN",
            item: "LyUCtdS0ih3FOAoGxU6Tf",
          },
          {
            group: "W2f6j6wujIkCMUNyCWvGN",
            item: "7-xZXzviktxAmnwQ9kyCI",
          },
        ],
      },
    ],
  },
];
