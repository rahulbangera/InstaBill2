"use client";

import React, { useEffect, useState } from "react";

interface Item {
  name: string;
  quantity: number;
  price: number;
}

const page = () => {
  const [inputItem, setInputItem] = useState<string>("");
  const [itemsData, setItemsData] = useState<Item[]>([
    {
      name: "Item 1",
      quantity: 2,
      price: 100,
    },
    {
      name: "Item 2",
      quantity: 2,
      price: 100,
    },
  ]);

  useEffect(() => {
    console.log(itemsData);
  }, [itemsData]);

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const newItems = [...itemsData];
    if (newItems[index]) {
      newItems[index].name = e.target.value;
    }
    setItemsData(newItems);
  };

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const newItems = [...itemsData];
    if (newItems[index]) {
      if (Number(e.target.value) >= 0) {
        newItems[index].quantity = Number(e.target.value);
      } else {
        newItems[index].quantity = 0;
      }
    }
    setItemsData(newItems);
  };

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const newItems = [...itemsData];
    if (newItems[index]) {
      if (Number(e.target.value) >= 0) {
        newItems[index].price = Number(e.target.value);
      } else {
        newItems[index].price = 0;
      }
    }
    setItemsData(newItems);
  };

  const handleAddToBill = () => {
    if (inputItem === "") return;
    setItemsData((prev) => [
      ...prev,
      {
        name: inputItem,
        quantity: 0,
        price: 0,
      },
    ]);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-800 pb-4">
      <div className="flex max-h-screen w-full justify-center border-b-2 border-gray-500 bg-gray-900 p-4">
        {" "}
        <h1 className="text-center">(Shop) Billing</h1>
      </div>
      <div className="flex w-full gap-3 p-12">
        <div className="w-4/5">
          <input
            value={inputItem}
            className="h-10 w-full rounded-lg bg-gray-600 p-4 outline-none"
            type="text"
            onChange={(e) => setInputItem(e.target.value)}
            placeholder="Type Item Name"
          />
        </div>
        <div className="w-1/5">
          <button
            type="button"
            onClick={handleAddToBill}
            className="h-10 w-full rounded-lg bg-green-700"
          >
            Add to Bill
          </button>
        </div>
      </div>
      <div className="mx-auto my-0 flex h-full w-[96%] flex-grow gap-3">
        <div className="h-screen w-4/5 rounded-lg bg-gray-900 p-4">
          <div className="h-[76%]">
            <div className="max-h-full overflow-y-auto">
              <table className="min-w-full table-auto">
                <thead className="sticky top-0 bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Item Name</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="">
                  {itemsData.map((item, index) => (
                    <tr key={index} className="border-b-[1px] border-gray-700">
                      <td className="max-w-[200px] overflow-hidden truncate whitespace-nowrap border-gray-500 p-0 focus:border-b-[1px] focus:border-gray-400">
                        <input
                          type="text"
                          name="name"
                          value={item.name}
                          onChange={(e) => handleNameChange(e, index)}
                          className="block h-full w-full bg-transparent px-4 py-4 text-center outline-none hover:bg-gray-800 focus:bg-gray-800"
                        />
                      </td>
                      <td className="w-1/5 border-gray-500 p-0 focus:border-b-[1px] focus:border-gray-400">
                        <input
                          type="text"
                          name="quantity"
                          value={item.quantity || 0}
                          onChange={(e) => handleQuantityChange(e, index)}
                          className={`block h-full w-full bg-transparent px-4 py-4 text-center outline-none ${item.quantity > 0 ? "hover:bg-gray-800 focus:bg-gray-800" : "bg-red-500/60 hover:bg-gray-800 focus:bg-gray-800"}`}
                        />
                      </td>
                      <td className="relative w-1/5 border-gray-500 p-0 focus:border-b-[1px] focus:border-gray-400">
                        <input
                          type="text"
                          value={`${item.price}`}
                          name="price"
                          onChange={(e) => handlePriceChange(e, index)}
                          className={`block h-full w-full bg-transparent px-4 py-4 text-center outline-none hover:bg-gray-800 focus:bg-gray-800 ${item.price > 0 ? "hover:bg-gray-800 focus:bg-gray-800" : "bg-red-500/60 hover:bg-gray-800 focus:bg-gray-800"}`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 transform">
                          ₹
                        </span>
                      </td>
                      <td className="relative w-1/5 border-gray-500 p-0 text-center focus:border-b-[1px] focus:border-gray-400">
                        <div className="block h-full w-full bg-transparent px-4 py-4 text-center">
                          {item.quantity * item.price}
                        </div>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 transform">
                          ₹
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="w-1/5 rounded-lg bg-gray-900 p-4"></div>
      </div>
    </div>
  );
};

export default page;
