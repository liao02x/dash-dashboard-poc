import { Flex } from "@radix-ui/themes";
import { ItemCard, ItemAddCard } from "./Item";
import EditGroupModal from "./EditGroupModal";

import { useStore } from "./store";

export default function Group({ groupId }: { groupId: string }) {
  const group = useStore((state) => state.data.find((g) => g.id === groupId));
  if (!group) return null;

  return (
    <div className="p-2">
      <Flex justify="between" align="center">
        <div>{group.name}</div>
        <EditGroupModal groupId={group.id} data={group} />
      </Flex>
      <div className="flex gap-4 p-2 overflow-x-auto">
        {group.items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
        <ItemAddCard groupId={groupId} />
      </div>
    </div>
  );
}
