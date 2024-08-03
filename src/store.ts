import { useMemo } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { produce } from "limu";
import { testData } from "./testData";
import { create as createMath, all } from 'mathjs'

const config = { }
const math = createMath(all, config)

type DependencyItem = {
  group: string;
  item: string;
};

export const getDependencyKey = (groupKey: string, itemKey: string) =>
  `${groupKey}::${itemKey}`;
export const getDependencyItem = (dependencyKey: string) => {
  const [groupKey, itemKey] = dependencyKey.split("::");
  if (!groupKey || !itemKey || dependencyKey.split("::").length !== 2) {
    throw new Error("Invalid dependency key");
  }
  return { groupKey, itemKey };
};

type Rule = {
  id: string;
};

export type Item = {
  id: string;
  groupId: string;
  name: string;
  expression: string;
  dependencies: DependencyItem[];
  rules?: Rule[];
};

export type Group = {
  id: string;
  name: string;
  items: Item[];
};

type Store = {
  data: Group[];
  cache: {
    [group: string]: {
      [item: string]: string | number;
    };
  };
};

export const useStore = create<Store>()(
  devtools(
    persist(
      () => ({
        data: testData,
        cache: {},
      }),
      {
        name: "store",
        partialize: (state) => ({ data: state.data }),
      }
    )
  )
);

export const reset = () => {
  useStore.setState({ data: testData, cache: {} });
};

export const clear = () => {
  useStore.setState({ data: [], cache: {} });
}

export const addGroup = (name: string) => {
  useStore.setState(
    produce((state) => {
      if (state.data.some((group) => group.name === name)) {
        throw new Error("Group name already exists");
      }
      state.data.push({
        id: nanoid(),
        name,
        items: [],
      });
    })
  );
};

export const editGroupName = (groupId: Group["id"], name: string) => {
  useStore.setState(
    produce((state) => {
      // if (state.data.some((group) => group.name === name)) {
      //   throw new Error("Group name already exists");
      // }
      // check if group name already exists and it's not the same group
      const group = state.data.find((group) => group.id === groupId);
      if (!group) {
        throw new Error("Group not found");
      }
      if (
        state.data.some((group) => group.name === name && group.id !== groupId)
      ) {
        throw new Error("Group name already exists");
      }
      group.name = name;
    })
  );
};

const findAllInserts = (text: string) => {
  const regex = /{([^}]+)}/g;
  return [...text.matchAll(regex)].sort((a, b) => b.index - a.index);
};

const stringSplice = (
  str: string,
  index: number,
  count: number,
  add?: string
) => {
  if (index < 0) {
    index += str.length;
    if (index < 0) index = 0;
  }
  return str.slice(0, index) + (add ?? "") + str.slice(index + count);
};

const getGroupItemByName = (
  groupName: Group["name"],
  itemName: Item["name"]
) => {
  const data = useStore.getState().data;
  const group = data.find((group) => group.name === groupName);
  if (!group) {
    throw new Error("Group not found");
  }
  const item = group.items.find((item) => item.name === itemName);
  if (!item) {
    throw new Error("Item not found");
  }
  return { group, item };
};

const getGroupItemById = (groupId: Group["id"], itemId: Item["id"]) => {
  const data = useStore.getState().data;
  const group = data.find((group) => group.id === groupId);
  if (!group) {
    throw new Error("Group not found");
  }
  const item = group.items.find((item) => item.id === itemId);
  if (!item) {
    throw new Error("Item not found");
  }
  return { group, item };
};

export const getGroupItemByIdNullable = (
  groupId: Group["id"],
  itemId: Item["id"]
) => {
  const data = useStore.getState().data;
  const group = data.find((group) => group.id === groupId);
  if (!group) {
    return undefined;
  }
  const item = group.items.find((item) => item.id === itemId);
  if (!item) {
    return undefined;
  }
  return { group, item };
};

export const transformExpression = (expressionWithName: string) => {
  console.log(expressionWithName);
  const inserts = findAllInserts(expressionWithName);
  console.log(inserts)
  let newExpression = expressionWithName.slice();
  for (const insert of inserts) {
    const { groupKey, itemKey } = getDependencyItem(insert[1]);
    const { group, item } = getGroupItemByName(groupKey, itemKey);

    newExpression = stringSplice(
      newExpression,
      insert.index,
      insert[0].length,
      `{${getDependencyKey(group.id, item.id)}}`
    );
  }
  return newExpression;
};

export const getExpressionDisplay = (expressionWithId: string) => {
  const inserts = findAllInserts(expressionWithId);
  let newExpression = expressionWithId.slice();
  for (const insert of inserts) {
    const { groupKey, itemKey } = getDependencyItem(insert[1]);
    const { group, item } = getGroupItemById(groupKey, itemKey);

    newExpression = stringSplice(
      newExpression,
      insert.index,
      insert[0].length,
      `{${getDependencyKey(group.name, item.name)}}`
    );
  }
  return newExpression;
};

const isEqualDependency = (a: DependencyItem, b: DependencyItem) => {
  return a.group === b.group && a.item === b.item;
};

export const dedupDependencies = (dependencies: DependencyItem[]) => {
  const deduped: DependencyItem[] = [];
  for (const dep of dependencies) {
    if (!deduped.some((d) => isEqualDependency(d, dep))) {
      deduped.push(dep);
    }
  }
  return deduped;
};

export const parseDependency = (expressionWithId: string) => {
  const inserts = findAllInserts(expressionWithId);
  const dependencies: DependencyItem[] = [];
  for (const insert of inserts) {
    const { groupKey, itemKey } = getDependencyItem(insert[1]);
    const { group, item } = getGroupItemById(groupKey, itemKey);

    dependencies.push({
      group: group.id,
      item: item.id,
    });
  }
  return dedupDependencies(dependencies);
};

type ItemForDependency = Pick<Item, "id" | "groupId" | "dependencies">;
const isRingDependency = (
  item: Omit<ItemForDependency, "dependencies">,
  dependencies: DependencyItem[]
) => {
  return dependencies.some(
    (dep) => dep.group === item.groupId && dep.item === item.id
  );
};

export const hasRootRingDependency = (item: ItemForDependency) => {
  try {
    getRootDependencies(item);
    return false;
  } catch (e) {
    return true;
  }
};

export const getRootDependencies = (item: ItemForDependency) => {
  let toDetermine = [...item.dependencies];
  const rootDependencies: DependencyItem[] = [];

  while (toDetermine.length) {
    if (isRingDependency(item, toDetermine)) {
      throw new Error("Ring dependency");
    }

    const nextToDetermine: DependencyItem[] = [];
    for (const dep of toDetermine) {
      const { item } = getGroupItemById(dep.group, dep.item);
      if (!item.dependencies.length) {
        rootDependencies.push(dep);
      } else {
        nextToDetermine.push(...item.dependencies);
      }
    }
    toDetermine = dedupDependencies(nextToDetermine);
  }

  return dedupDependencies(rootDependencies);
};

const validateExpression = (expressionWithId: string) => {
  let newExpression = expressionWithId.slice();
  const inserts = findAllInserts(newExpression);
  for (const insert of inserts) {

    newExpression = stringSplice(
      newExpression,
      insert.index,
      insert[0].length,
      Math.random().toString()
    );
  }

  try {
    math.evaluate(newExpression);
  } catch (e) {
    throw new Error("Invalid expression");
  }
}

export const addItem = (
  groupId: Group["id"],
  name: string,
  expression: string
) =>
  useStore.setState(
    produce((state) => {
      const group = state.data.find((group) => group.id === groupId);
      if (!group) {
        throw new Error("Group not found");
      }
      if (group.items.some((item) => item.name === name)) {
        throw new Error("Item name already exists");
      }
      const expressionWithId = transformExpression(expression);
      const dependencies = parseDependency(expressionWithId);
      if (hasRootRingDependency({ id: "new_dummy", groupId, dependencies })) {
        throw new Error("Ring dependency");
      }
      validateExpression(expressionWithId);
      group.items.push({
        id: nanoid(),
        groupId: groupId,
        name,
        expression: expressionWithId,
        dependencies,
      });
    })
  );

export const editItem = (
  groupId: Group["id"],
  itemId: Item["id"],
  name: string,
  expression: string
) =>
  useStore.setState(
    produce((state) => {
      const group = state.data.find((group) => group.id === groupId);
      if (!group) {
        throw new Error("Group not found");
      }
      const item = group.items.find((item) => item.id === itemId);
      if (!item) {
        throw new Error("Item not found");
      }
      if (group.items.some((item) => item.name === name && item.id !== itemId)) {
        throw new Error("Item name already exists");
      }
      const expressionWithId = transformExpression(expression);
      const dependencies = parseDependency(expressionWithId);
      if (hasRootRingDependency({ id: itemId, groupId, dependencies })) {
        throw new Error("Ring dependency");
      }
      validateExpression(expressionWithId);
      item.name = name;
      item.expression = expressionWithId;
      item.dependencies = dependencies;
      removeCache(groupId, itemId);
    })
  );

export const addCache = (
  groupId: Group["id"],
  itemId: Item["id"],
  value: string
) => {
  useStore.setState(
    produce((state) => {
      if (!state.cache[groupId]) {
        state.cache[groupId] = {};
      }
      if (state.cache[groupId][itemId] !== value) {
        state.cache[groupId][itemId] = value;
      }
    })
  );
};

const removeCache = (groupId: Group["id"], itemId?: Item["id"]) => {
  useStore.setState(
    produce((state) => {
      if (itemId) {
        delete state.cache[groupId][itemId];
      } else {
        delete state.cache[groupId];
      }
    })
  );
}

const formatItemValue = (exp: string) => {
  return parseFloat(exp).toFixed(2);
};

const evaluateExpression = (expressionWithId: string) => {
  const inserts = findAllInserts(expressionWithId);
  let newExpression = expressionWithId.slice();
  const cache = useStore.getState().cache;
  for (const insert of inserts) {
    const { groupKey, itemKey } = getDependencyItem(insert[1]);
    const value = cache[groupKey]?.[itemKey];
    if (value === undefined) {
      return undefined;
    }
    newExpression = stringSplice(
      newExpression,
      insert.index,
      insert[0].length,
      value.toString()
    );
  }
  return math.evaluate(newExpression);
};

const getGroupItemDependency = (
  group: Group | undefined,
  item: Item | undefined,
  cache: Store["cache"]
) => {
  if (!group || !item) {
    return undefined;
  }

  if (!item.dependencies.length) {
    return [];
  }

  const dependencies = item.dependencies.map(
    (dep) => cache[dep.group]?.[dep.item]
  );
  if (dependencies.some((dep) => dep === undefined)) {
    return undefined;
  }
  return dependencies;
};

export const useItemValue = (groupId: Group["id"], itemId: Item["id"]) => {
  const data = useStore((state) => state.data);
  const cache = useStore((state) => state.cache);
  const group = data.find((g) => g.id === groupId);
  const item = group?.items?.find((i) => i.id === itemId);

  const dependencies = useMemo(
    () => getGroupItemDependency(group, item, cache),
    [group, item, cache]
  );

  const value = useMemo(() => {
    if (!dependencies || !item) {
      return undefined;
    }

    const value = evaluateExpression(item.expression)
    addCache(groupId, itemId, value.toString());

    return formatItemValue(value);
  }, [dependencies, item]);


  return value;
};
