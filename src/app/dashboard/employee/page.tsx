"use client";

import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import type { Product, Shop } from "@prisma/client";
import { Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

interface Item {
  name: string;
  quantity: number;
  price: number;
}

interface BillType {
  shopId: string | undefined;
  paymentMethod: PaymentMethod;
  total: number;
  discount: number;
  items: {
    name: string;
    price: number;
    quantity: number;
    productId: string | undefined;
  }[];
}

enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  UPI = "UPI",
}

const EmployeeDashboard = () => {
  const { data } = api.products.getProductsForBilling.useQuery();
  const [inputItem, setInputItem] = useState<string>("");
  const [itemsData, setItemsData] = useState<Item[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [shopData, setShopData] = useState<Shop | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH,
  );
  const { mutate: createBill } = api.billing.createBilling.useMutation();

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

  const handleAddToBill = (
    itemName: string,
    itemPrice: number,
    itemQuantity: number,
  ) => {
    if (inputItem === "") return;
    const existingItem = itemsData.find((item) => item.name === itemName);
    if (existingItem) {
      const newItems = itemsData.map((item) =>
        item.name === itemName
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
      setItemsData(newItems);

      setInputItem("");
      return;
    }
    setItemsData((prev) => [
      ...prev,
      {
        name: itemName,
        quantity: itemQuantity,
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

    if (filteredProducts.length === 0) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, filteredProducts.length - 1));
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      const selectedProduct = filteredProducts[activeIndex];
      if (selectedProduct) {
        handleAddToBill(selectedProduct.name, selectedProduct.price, 1);
        setActiveIndex(-1);
        setInputItem(""); // Clear input after selection
      }
    }
  };

  useEffect(() => {
    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(inputItem.toLowerCase()) ||
        product.shortcut?.toString().toLowerCase() === inputItem.toLowerCase(),
    );

    if (filteredProducts.length > 0) {
      setActiveIndex(0);
    } else {
      setActiveIndex(-1);
    }
  }, [inputItem, products]);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDeleteItem = (item: Item) => {
    const newItems = itemsData.filter((i) => i.name !== item.name);
    setItemsData(newItems);
  };

  function handlePaymentMethodChange(value: string): void {
    setPaymentMethod(value as PaymentMethod);
  }

  const saveToLocal = () => {
    const bill = {
      shopId: shopData?.id,
      paymentMethod: paymentMethod,
      total: itemsData.reduce(
        (total, item) => total + item.quantity * item.price,
        0,
      ),
      discount: 0,
      items: itemsData.map((item) => {
        return {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          productId:
            products.find(
              (product) =>
                product.name === item.name && product.price === item.price,
            )?.id ?? undefined,
        };
      }),
    };
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const bills: BillType[] = JSON.parse(
        localStorage.getItem("bills") ?? "[]",
      );
      bills.push(bill);
      localStorage.setItem("bills", JSON.stringify(bills));
      setItemsData([]);
      toast.success("Saved to local storage");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const bills: BillType[] = JSON.parse(
        localStorage.getItem("bills") ?? "[]",
      );
      if (bills && bills.length > 0) {
        setItemsData(bills[bills.length - 1]?.items ?? []);
      }
    }
  }, []);

  const handleConfirmBill = () => {
    if (itemsData.length === 0) {
      alert("No items in the bill");
      return;
    }
    const hasInvalidPrice = itemsData.some((item) => item.price <= 0);
    if (hasInvalidPrice) {
      alert(
        "Some items have a price of 0 or less. Please correct them before confirming the bill.",
      );
      return;
    }
    const hasInvalidQuantity = itemsData.some((item) => item.quantity <= 0);
    if (hasInvalidQuantity) {
      alert(
        "Some items have a quantity of 0 or less. Please correct them before confirming the bill.",
      );
      return;
    }
    const hasInvalidName = itemsData.some((item) => item.name === "");
    if (hasInvalidName) {
      alert(
        "Some items have no name. Please correct them before confirming the bill.",
      );
      return;
    }
    const total = itemsData.reduce(
      (total, item) => total + item.quantity * item.price,
      0,
    );
    toast.loading("Creating Bill");

    if (shopData?.id) {
      createBill(
        {
          shopId: shopData?.id,
          paymentMethod: paymentMethod,
          total: total,
          discount: 0,
          items: itemsData.map((item) => {
            return {
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              productId:
                products.find(
                  (product) =>
                    product.name === item.name && product.price === item.price,
                )?.id ?? undefined,
            };
          }),
        },
        {
          onSuccess: () => {
            setItemsData([]);
            toast.dismiss();
            toast.success("Bill created successfully");
          },
          onError: () => {
            toast.error("Network Error, don't worry bills are safe");
            saveToLocal();
          },
        },
      );
    } else {
      toast.error("Error fetching, Shop not found, still bill created locally");
    }
  };
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
                      handleAddToBill(product.name, product.price, 1);
                      setActiveIndex(-1);
                    }}
                    className={`cursor-pointer px-4 py-2 ${
                      index === activeIndex
                        ? "bg-gray-400"
                        : "hover:bg-gray-400"
                    }`}
                  >
                    {product.shortcut + ". " + product.name}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="w-1/5">
          <button
            type="button"
            onClick={() => {
              handleAddToBill(inputItem, 0, 0);
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
                    <th className="px-4 py-2 pl-14">Item Name</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsData.map((item, index) => (
                    <tr key={index} className="border-b-[1px] border-gray-700">
                      <td className="relative max-w-[200px] overflow-hidden truncate whitespace-nowrap border-gray-500 p-0 focus:border-b-[1px] focus:border-gray-400">
                        <div className="absolute left-4 translate-y-1/2">
                          <Trash2Icon
                            className="cursor-pointer"
                            onClick={() => handleDeleteItem(item)}
                          />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={item.name}
                          onChange={(e) => handleNameChange(e, index)}
                          className="block h-full w-full bg-transparent px-4 py-4 pl-14 text-center outline-none hover:bg-gray-800 focus:bg-gray-800"
                        />
                      </td>
                      <td className="w-1/5 border-gray-500 p-0 focus:border-b-[1px] focus:border-gray-400">
                        <input
                          type="text"
                          name="quantity"
                          value={item.quantity || 0}
                          onChange={(e) => handleQuantityChange(e, index)}
                          className={`block h-full w-full px-4 py-4 text-center outline-none ${
                            item.quantity > 0
                              ? "bg-transparent hover:bg-gray-800 focus:bg-gray-800"
                              : "bg-red-400/60 hover:bg-gray-800 focus:bg-gray-800"
                          }`}
                        />
                      </td>
                      <td className="relative w-1/5 border-gray-500 p-0 focus:border-b-[1px] focus:border-gray-400">
                        <input
                          type="text"
                          value={`${item.price}`}
                          name="price"
                          onChange={(e) => handlePriceChange(e, index)}
                          className={`block h-full w-full px-4 py-4 text-center outline-none hover:bg-gray-800 focus:bg-gray-800 ${
                            item.price !== 0
                              ? "bg-transparent hover:bg-gray-800 focus:bg-gray-800"
                              : "bg-red-400/60 hover:bg-gray-800 focus:bg-gray-800"
                          }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 transform">
                          ₹
                        </span>
                      </td>
                      <td className="relative w-1/5 border-gray-500 p-0 text-center focus:border-b-[1px] focus:border-gray-400">
                        <div className="block h-full w-full cursor-default bg-transparent px-4 py-4 text-center">
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
        <div className="w-1/5 rounded-lg bg-gray-900">
          <h1 className="mt-4 text-center text-2xl font-bold underline">
            Summary
          </h1>
          <h2 className="mt-7 text-center text-xl">
            Total Items:{" "}
            {itemsData.reduce((total, item) => total + item.quantity, 0)}
          </h2>
          <div className="bg-gray-700">
            <h2 className="mt-5 p-3 text-center text-xl font-bold text-green-500">
              Final Price:{" "}
              {itemsData.reduce(
                (total, item) => total + item.quantity * item.price,
                0,
              )}
              rs
            </h2>
          </div>
          <div className="mt-5 p-4">
            <h2 className="text-center text-xl font-bold">Payment Method</h2>
            <div className="mt-4 flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={PaymentMethod.CASH}
                  defaultChecked
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  className="h-4 w-4"
                />
                <span className="flex gap-1">
                  Cash{" "}
                  <img
                    src="/cash.png"
                    className="flex h-6 w-6 -translate-y-[2px] items-center"
                  />
                </span>{" "}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={PaymentMethod.CARD}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  className="h-4 w-4"
                />
                <span className="flex gap-1">
                  Card{" "}
                  <img
                    src="/debitcard.png"
                    className="flex h-6 w-6 items-center"
                  />
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={PaymentMethod.UPI}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  className="h-4 w-4"
                />
                <span className="flex">
                  UPI{" "}
                  <img src="/upi.svg" className="flex h-6 w-6 items-center" />
                </span>
              </label>
            </div>
          </div>
          <div className="flex w-full justify-center">
            <Button
              onClick={handleConfirmBill}
              className="mt-4"
              variant="secondary"
            >
              Confirm Bill{" "}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
