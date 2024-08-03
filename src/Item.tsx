import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddItemModal from "./AddItemModal";
import EditItemModal from "./EditItemModal";
import cx from "clsx";

import { useStore, useItemValue } from "./store";
import type { Item } from "./store";

const CardContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Card className={cx("min-w-[180px] min-h-[120px] relative", className)}>
      {children}
    </Card>
  );
};

export const ItemCard = ({ item }: { item: Item }) => {
  const value = useItemValue(item.groupId, item.id);
  return (
    <CardContainer>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value ?? "loading"}</div>
      </CardContent>
      <div className="absolute right-0 bottom-0">
        <EditItemModal data={item} groupId={item.groupId} itemId={item.id} />
      </div>
    </CardContainer>
  );
};

export const ItemAddCard = ({ groupId }: { groupId: string }) => {
  return (
    <CardContainer className="flex items-center justify-center">
      <AddItemModal groupId={groupId} />
    </CardContainer>
  );
};
