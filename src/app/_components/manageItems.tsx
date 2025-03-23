import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";

interface ProductsSchema {
  name: string;
  id: string;
  createdAt: Date;
  shopId: string;
  price: number;
  image: string | null;
  shortcut: number;
}

const ManageItems = ({
  itemsData,
  fetchProdData,
  shopId,
}: {
  itemsData: ProductsSchema[];
  fetchProdData: () => void;
  shopId: string;
}) => {
  const [filteredItems, setFilteredItems] = useState<ProductsSchema[]>([]);

  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState(0);
  const [prodShortcut, setProdShortcut] = useState(0);
  const [prodImage, setProdImage] = useState("");

  const { mutate: createProduct } = api.products.createProduct.useMutation();

  useEffect(() => {
    setFilteredItems(itemsData);
  }, [itemsData]);

  const handleProdAdd = async () => {
    createProduct(
      {
        name: prodName,
        price: prodPrice,
        shortcut: prodShortcut,
        shopId: shopId,
        image: prodImage,
      },
      { onSuccess: fetchProdData },
    );
    setProdName("");
    setProdPrice(0);
    setProdShortcut(0);
  };

  return (
    <div className="mx-auto flex h-screen max-w-[2200px] justify-between">
      <div className="mb-[200px] mr-2 flex max-w-[800px] flex-1 flex-col justify-center px-14">
        <h1 className="mb-4 text-center text-2xl">Add Item</h1>
        <div className="h-fit min-h-[400px] w-full rounded-lg border-2 border-gray-400 bg-transparent p-4">
          <form className="flex h-full flex-col justify-between space-y-8">
            <div>
              <label
                htmlFor="itemName"
                className="block pl-1 text-sm font-medium text-gray-200"
              >
                Item Name
              </label>
              <input
                type="text"
                id="itemName"
                onChange={(e) => setProdName(e.target.value)}
                value={prodName}
                name="itemName"
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-600 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter item name"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="itemPrice"
                className="block pl-1 text-sm font-medium text-gray-200"
              >
                Item Price
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  ₹
                </span>
                <input
                  type="number"
                  id="itemPrice"
                  onChange={(e) => setProdPrice(parseFloat(e.target.value))}
                  value={prodPrice}
                  name="itemPrice"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-600 p-3 pl-8 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter item price"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="shortcutNo"
                className="block pl-1 text-sm font-medium text-gray-200"
              >
                shortcut No
              </label>
              <input
                type="text"
                id="shortcutNo"
                onChange={(e) => setProdShortcut(parseInt(e.target.value))}
                value={prodShortcut}
                name="shortcutNo"
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-600 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter shortcut No"
              />
            </div>
            <button
              type="button"
              onClick={handleProdAdd}
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-yellow-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Item
            </button>
          </form>
        </div>
      </div>
      <div className="mb-[200px] ml-2 flex flex-1 flex-col justify-center">
        <h1 className="mb-4 text-center text-2xl">Added Items</h1>
        <div className="flex h-4/5 w-full flex-col rounded-lg border-2 border-gray-600 bg-transparent p-4">
          <div className="mb-4">
            <label
              htmlFor="search"
              className="block pl-1 text-sm font-medium text-gray-200"
            >
              Search Items
            </label>
            <input
              type="text"
              id="search"
              name="search"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-500/80 p-3 shadow-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search items"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredItems = itemsData.filter(
                  (item) =>
                    item.name.toLowerCase().includes(searchTerm) ||
                    item.shortcut.toString().includes(searchTerm),
                );
                setFilteredItems(filteredItems);
              }}
            />
          </div>

          <hr className="my-4 border-gray-400" />

          <div className="flex-1 space-y-4 overflow-y-auto">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg bg-gray-700 p-4 shadow-md"
              >
                <h2 className="text-lg font-semibold text-white">
                  {item.name}
                </h2>
                <p className="text-gray-300">Price: ₹{item.price}</p>
                <p className="text-sm text-gray-400">
                  shortcut No: {item.shortcut}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageItems;
