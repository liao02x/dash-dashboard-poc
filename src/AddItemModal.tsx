import { useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "./components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { addItem } from "./store";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "name must be at least 1 character.",
  }),
  expression: z.string().min(1, {
    message: "expression must be at least 1 character.",
  }),
});

export default function AddItemModal({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      expression: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    try {
      addItem(groupId, data.name, data.expression);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const msg = error.message;
      if (msg.includes("name")) {
        form.setError("name", {
          type: "manual",
          message: error.message,
        });
      } else {
        form.setError("expression", {
          type: "manual",
          message: error.message,
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <PlusIcon />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add item</DialogTitle>
          <DialogDescription>Add an item to your group</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="add-item-form">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Item name" {...field} />
                  </FormControl>
                  <FormDescription>This is your item name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expression"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expression</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Expression" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your item expression.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="add-item-form">
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
