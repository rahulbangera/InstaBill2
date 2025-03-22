import React from "react";

const manageItems = () => {
  const itemsData = [
    {
      id: 1,
      name: "Burger",
      price: 100,
      shortcutNo: 1,
    },
    {
      id: 2,
      name: "Pizza",
      price: 200,
      shortcutNo: 2,
    },
    {
      id: 3,
      name: "Pasta",
      price: 300,
      shortcutNo: 3,
    },
    {
      id: 4,
      name: "Sandwich",
      price: 400,
      shortcutNo: 4,
    },
    {
      id: 5,
      name: "Fries",
      price: 500,
      shortcutNo: 5,
    },
    {
      id: 6,
      name: "Salad",
      price: 600,
      shortcutNo: 6,
    },
    {
      id: 7,
      name: "Tacos",
      price: 700,
      shortcutNo: 7,
    },
    {
      id: 8,
      name: "Sushi",
      price: 800,
      shortcutNo: 8,
    },
    {
      id: 9,
      name: "Steak",
      price: 900,
      shortcutNo: 9,
    },
    {
      id: 10,
      name: "Ice Cream",
      price: 1000,
      shortcutNo: 10,
    },
  ];

  const [filteredItems, setFilteredItems] = React.useState(itemsData);

  return (
    <div className="flex h-screen justify-between pt-6">
      <div className="mr-2 flex-1 px-14 py-10">
        <h1 className="mb-4 text-center text-2xl">Add Item</h1>
        <div className="h-fit w-full rounded-lg border-2 border-gray-400 bg-transparent p-4">
          <form className="flex h-full flex-col justify-between space-y-4">
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
                name="shortcutNo"
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-600 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter shortcut No"
              />
            </div>
            <button
              type="submit"
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Item
            </button>
          </form>
        </div>
      </div>
      <div className="ml-2 flex-1">
        <h1 className="mb-4 text-center text-2xl">Added Items</h1>
        <div className="flex h-4/6 w-full flex-col rounded-lg border-2 border-gray-600 bg-transparent p-4">
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
                    item.shortcutNo.toString().includes(searchTerm),
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
                  shortcut No: {item.shortcutNo}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default manageItems;
