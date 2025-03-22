"use client";

import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Product, Shop } from "@prisma/client";

interface Item {
  name: string;
  quantity: number;
  price: number;
}

const page = () => {
  const { data } = api.products.getProductsForBilling.useQuery();
  const [inputItem, setInputItem] = useState<string>("");
  const [itemsData, setItemsData] = useState<Item[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [shopData, setShopData] = useState<Shop | null>(null);

  useEffect(() => {
    if (data) {
      setProducts(data[0] as Product[]);
      setShopData(data[1] as Shop);
    }
  }, [data]);

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

  useEffect(() => {
    console.log(inputItem);
  }, [inputItem]);

  const handleAddToBill = (itemName: string, itemPrice: number) => {
    if (inputItem === "") return;
    const existingItem = itemsData.find((item) => item.name === itemName);
    if (existingItem) {
      console.log("Item already exists");
      const newItems = itemsData.map((item) =>
        item.name === itemName
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setItemsData(newItems);

      setInputItem("");
      return;
    }
    setItemsData((prev) => [
      ...prev,
      {
        name: itemName,
        quantity: 1,
        price: itemPrice,
      },
    ]);
    setInputItem("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(inputItem.toLowerCase()) ||
        product.shortcut?.toString().toLowerCase() === inputItem.toLowerCase(),
    );

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => (prev + 1) % filteredProducts.length);
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) =>
        prev === 0 ? filteredProducts.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      const selectedProduct = filteredProducts[activeIndex];
      if (selectedProduct) {
        console.log(selectedProduct);
        handleAddToBill(selectedProduct.name, selectedProduct.price);
        setActiveIndex(-1);
      }
    }
  };
  

  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-800 pb-4">
      <div className="flex max-h-screen w-full justify-center border-b-2 border-gray-500 bg-gray-900 p-4">
        <h1 className="text-center">
          {shopData ? shopData.name + " Billing" : ""}
        </h1>
      </div>
      <div className="flex w-full gap-3 p-12">
        <div className="w-4/5">
          <input
            value={inputItem}
            ref={inputRef}
            className="h-10 w-full rounded-lg bg-gray-300 p-4 text-black outline-none"
            type="text"
            onChange={(e) => setInputItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type Item Name"
          />
          {inputItem && (
            <div
              className="absolute z-10 max-h-40 overflow-y-auto rounded-lg bg-gray-300 text-black shadow-lg"
              style={{ width: `${inputRef.current?.clientWidth}px` }}
            >
              {products
                .filter(
                  (product) =>
                    product.name
                      .toLowerCase()
                      .includes(inputItem.toLowerCase()) ||
                    product.shortcut?.toString().toLowerCase() ===
                      inputItem.toLowerCase(),
                )
                .map((product, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      handleAddToBill(product.name, product.price);
                      setActiveIndex(-1);
                    }}
                    className={`cursor-pointer px-4 py-2 hover:bg-gray-400 ${
                      index === activeIndex ? "bg-gray-400" : ""
                    }`}
                  >
                    {product.name}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="w-1/5">
          <button
            type="button"
            onClick={() => {
              handleAddToBill(inputItem, 0);
            }}
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
                <tbody>
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
                          className={`block h-full w-full bg-transparent px-4 py-4 text-center outline-none ${
                            item.quantity > 0
                              ? "hover:bg-gray-800 focus:bg-gray-800"
                              : "bg-red-500/60 hover:bg-gray-800 focus:bg-gray-800"
                          }`}
                        />
                      </td>
                      <td className="relative w-1/5 border-gray-500 p-0 focus:border-b-[1px] focus:border-gray-400">
                        <input
                          type="text"
                          value={`${item.price}`}
                          name="price"
                          onChange={(e) => handlePriceChange(e, index)}
                          className={`block h-full w-full bg-transparent px-4 py-4 text-center outline-none hover:bg-gray-800 focus:bg-gray-800 ${
                            item.price > 0
                              ? "hover:bg-gray-800 focus:bg-gray-800"
                              : "bg-red-500/60 hover:bg-gray-800 focus:bg-gray-800"
                          }`}
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
