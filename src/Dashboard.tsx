import { useState } from "react";
import { Flex, Text } from "@radix-ui/themes";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

import AddGroupModal from "./AddGroupModal";
import Group from "./Group";
import { css } from "@emotion/css";
import { useStore, reset, clear } from "./store";

export default function Dashboard() {
  const data = useStore((state) => state.data);
  return (
    <div
      className={css({
        minHeight: "100%",
        position: "relative",
      })}
    >
      <Flex px="4" py="2" top="0" position="sticky" className="bg-white">
        <h1>Dashboard</h1>
      </Flex>
      <Flex p="2">
        <AddGroupModal />
        <Button variant="ghost" onClick={() => reset()}>reset storage</Button>
        <Button variant="ghost" onClick={() => clear()}>clear storage</Button>
      </Flex>
      {data.map((group) => (
        <Group key={group.id} groupId={group.id} />
      ))}
    </div>
  );
}
