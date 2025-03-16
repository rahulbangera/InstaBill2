"use client";

import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

interface Todo {
  id?: string;
  description: string;
  userId: string;
  done?: boolean;
}

const page = () => {
  const [newTodo, setNewTodo] = React.useState<string>("");
  const { data: todos, refetch: getTodos } = api.todo.getTodos.useQuery();
  const { mutate: createTodo } = api.todo.create.useMutation();
  const { mutate: deleteTodo } = api.todo.removetodo.useMutation();
  const { mutate: toggleTodo } = api.todo.toggleTodo.useMutation();
  const [allTodos, setAllTodos] = React.useState<Todo[]>([]);
  const { data: session } = useSession();

  const addTodo = () => {
    if (session) {
      if (newTodo.trim() !== "") {
        toast.loading("Adding todo...", { position: "top-right" });
        createTodo(newTodo, {
          onSuccess: () => {
            getTodos();
            setNewTodo("");
            toast.success("Todo added successfully");
          },
        });
      }
    }
  };

  useEffect(() => {
    console.log(allTodos);
  }, [allTodos]);

  useEffect(() => {
    if (todos) {
      setAllTodos(todos);
    }
  }, [todos]);

  const handleTodoDelete = (todo: Todo) => {
    console.log("came", todo);
    if (todo.id) {
      deleteTodo(todo.id);
      setAllTodos(allTodos.filter((t) => t.id !== todo.id));
    }
  };

  const updateTodo = (todo: Todo) => {
    if (todo.id) {
      toggleTodo({ id: todo.id, done: !todo.done });
      setAllTodos(
        allTodos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
      );
    }
  };

  return (
    <div
      style={{ padding: "20px" }}
      className="flex flex-col items-center justify-center"
    >
      <h1 className="text-xl font-semibold">Todo List</h1>
      <input
        className="rounded-xl text-black"
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add a new todo"
        style={{ padding: "10px", width: "80%" }}
      />
      <button
        className="mt-2 border-2 border-yellow-400 bg-black px-8 py-2"
        onClick={addTodo}
      >
        Add
      </button>
      <ul style={{ listStyleType: "none", padding: 0 }} className="w-1/2">
        <h2 className="mb-4 mt-8 text-center text-2xl font-bold">
          Upcoming Todos:{" "}
        </h2>
        {allTodos
          .filter((t) => t.done === false)
          .map((todo, index) => (
            <li
              key={index}
              className="flex items-center justify-between text-lg"
              style={{ padding: "10px 0", borderBottom: "1px solid #ccc" }}
            >
              <span>{todo.description}</span>

              <div>
                <button
                  className="ml-4 border-2 border-green-400 bg-black px-3 py-[10px]"
                  onClick={() => {
                    updateTodo(todo);
                  }}
                >
                  <CheckIcon />
                </button>
                <button
                  className="ml-4 border-2 border-red-400 bg-black px-4 py-1"
                  onClick={() => {
                    handleTodoDelete(todo);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
      </ul>
      <ul style={{ listStyleType: "none", padding: 0 }} className="w-1/2">
        <h2 className="mb-4 mt-8 text-center text-2xl font-bold">
          Completed Todos:{" "}
        </h2>
        {allTodos
          .filter((t) => t.done === true)
          .map((todo, index) => (
            <li
              key={index}
              className="flex items-center justify-between text-lg"
              style={{ padding: "10px 0", borderBottom: "1px solid #ccc" }}
            >
              <span>{todo.description}</span>
              <button
                className="ml-4 border-2 border-red-400 bg-black px-3 py-[10px]"
                onClick={() => {
                  updateTodo(todo);
                }}
              >
                <Cross1Icon />
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default page;
