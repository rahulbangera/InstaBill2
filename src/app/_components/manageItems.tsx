"use client"

import { Pencil1Icon } from "@radix-ui/react-icons"
import { Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "~/trpc/react"

interface ProductsSchema {
  name: string
  id: string
  productCode: string | null
  createdAt: Date
  shopId: string
  price: number
  image: string | null
  shortcut: number
}

const ManageItems = ({
  itemsData,
  fetchProdData,
  shopId,
}: {
  itemsData: ProductsSchema[]
  fetchProdData: () => void
  shopId: string
}) => {
  const [filteredItems, setFilteredItems] = useState<ProductsSchema[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [prodName, setProdName] = useState("")
  const [prodPrice, setProdPrice] = useState<number | "">(0)
  const [prodShortcut, setProdShortcut] = useState<number | "">(0)
  const [prodImage, setProdImage] = useState("")
  const { mutate: deleteProduct } = api.products.deleteProduct.useMutation()
  const [productDeleteId, setProductDeleteId] = useState<string>("")
  const [prodCode, setProdCode] = useState<string>("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [prodEditName, setProdEditName] = useState("")
  const [prodEditPrice, setProdEditPrice] = useState<number | "">(0)
  const [prodEditShortcut, setProdEditShortcut] = useState<number | "">(0)
  const { mutate: createProduct } = api.products.createProduct.useMutation()
  const { mutate: updateProduct } = api.products.updateProduct.useMutation()

  useEffect(() => {
    setFilteredItems(itemsData)
  }, [itemsData])

  const handleProdAdd = async () => {
    // Validate product name
    if (!prodName.trim()) {
      toast.error("Product name is required")
      return
    }

    // Validate product price
    if (prodPrice === "" || prodPrice <= 0) {
      toast.error("Product price must be greater than 0")
      return
    }

    // Validate product shortcut
    if (prodShortcut === "" || prodShortcut <= 0) {
      toast.error("Product shortcut must be greater than 0")
      return
    }

    // Check for duplicate shortcut
    const existingShortcut = itemsData.find((item) => item.shortcut === prodShortcut)
    if (existingShortcut) {
      toast.error(`Shortcut ${prodShortcut} is already used by product "${existingShortcut.name}"`)
      return
    }

    // All validations passed, create product
    createProduct(
      {
        name: prodName,
        price: prodPrice,
        shortcut: prodShortcut,
        shopId: shopId,
        image: prodImage,
      },
      {
        onSuccess: () => {
          toast.success("Product added successfully")
          fetchProdData()
          setProdName("")
          setProdPrice(0)
          setProdShortcut(0)
        },
        onError: (error) => {
          toast.error(error.message || "Failed to add product")
        },
      },
    )
  }

  const handleItemDeletion = async (item: ProductsSchema) => {
    setProductDeleteId(item.id)
    setShowDeleteModal(true)
  }

  const removeItem = () => {
    deleteProduct(productDeleteId, {
      onSuccess: () => {
        toast.success("Item deleted successfully")
        fetchProdData()
      },
    })
    setShowDeleteModal(false)
  }

  const handleItemEdit = (item: ProductsSchema) => {
    if (!item) return
    if (!item.id) return
    setProdCode(item.id)
    setShowEditModal(true)
    setProdEditName(item.name)
    setProdEditPrice(item.price)
    setProdEditShortcut(item.shortcut)
  }
  const handleConfirmEdit = () => {
    // Validate product name
    if (!prodEditName.trim()) {
      toast.error("Product name is required")
      return
    }

    // Validate product price
    if (prodEditPrice === "" || prodEditPrice <= 0) {
      toast.error("Product price must be greater than 0")
      return
    }

    // Validate product shortcut
    if (prodEditShortcut === "" || prodEditShortcut <= 0) {
      toast.error("Product shortcut must be greater than 0")
      return
    }

    // Check for duplicate shortcut (excluding the current product)
    const existingShortcut = itemsData.find((item) => item.shortcut === prodEditShortcut && item.id !== prodCode)
    if (existingShortcut) {
      toast.error(`Shortcut ${prodEditShortcut} is already used by product "${existingShortcut.name}"`)
      return
    }

    // All validations passed, update product
    updateProduct(
      {
        id: prodCode,
        name: prodEditName,
        price: prodEditPrice,
        shortcut: prodEditShortcut,
      },
      {
        onSuccess: () => {
          toast.success("Product updated successfully")
          fetchProdData()
          setShowEditModal(false)
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update product")
        },
      },
    )
  }
  return (
    <div className="mx-auto flex h-screen max-w-[2200px] justify-between p-4">
      <div className="mb-[200px] mr-2 flex max-w-[800px] flex-1 flex-col justify-center px-14">
        <h1 className="mb-4 text-center text-2xl">Add Item</h1>
        <div className="h-fit min-h-[400px] w-full rounded-lg border-2 border-gray-400 bg-transparent p-4">
          <form className="flex h-full flex-col justify-between space-y-8">
            <div>
              <label htmlFor="itemName" className="block pl-1 text-sm font-medium text-gray-200">
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
              <label htmlFor="itemPrice" className="block pl-1 text-sm font-medium text-gray-200">
                Item Price
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₹</span>
                <input
                  type="number"
                  id="itemPrice"
                  onChange={(e) => {
                    const value = e.target.value
                    const parsedValue = Number.parseFloat(value)
                    setProdPrice(isNaN(parsedValue) ? "" : parsedValue)
                  }}
                  value={prodPrice}
                  name="itemPrice"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-600 p-3 pl-8 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter item price"
                />
              </div>
            </div>
            <div>
              <label htmlFor="shortcutNo" className="block pl-1 text-sm font-medium text-gray-200">
                shortcut No
              </label>
              <input
                type="text"
                id="shortcutNo"
                onChange={(e) => {
                  const value = e.target.value
                  const parsedValue = Number.parseInt(value)
                  setProdShortcut(isNaN(parsedValue) ? "" : parsedValue)
                }}
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
            <label htmlFor="search" className="block pl-1 text-sm font-medium text-gray-200">
              Search Items
            </label>
            <input
              type="text"
              id="search"
              name="search"
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-500/80 p-3 shadow-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search items"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase()
                const filteredItems = itemsData.filter(
                  (item) =>
                    item.name.toLowerCase().includes(searchTerm) || item.shortcut.toString().includes(searchTerm),
                )
                setFilteredItems(filteredItems)
              }}
            />
          </div>

          <hr className="my-4 border-gray-400" />

          <div className="flex-1 space-y-4 overflow-y-auto">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded-lg bg-gray-700 p-4 shadow-md">
                <div className="flex justify-between">
                  <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                  <span className="text-gray-300">{item.productCode}</span>
                </div>
                <p className="text-gray-300">Price: ₹{item.price}</p>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-400">shortcut No: {item.shortcut}</p>
                  <div className="flex items-center gap-4">
                    <div className="cursor-pointer flex items-center">
                      {" "}
                      <Pencil1Icon onClick={() => handleItemEdit(item)} className="scale-[1.35]" />
                    </div>{" "}
                    <div>
                      <Trash2Icon onClick={() => handleItemDeletion(item)} className="scale-[0.85]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-1/4 rounded-lg bg-gray-700 p-5">
                <h2 className="mb-4 text-xl">Remove Item</h2>
                <p>Are you sure you want to remove this item?</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="rounded bg-gray-400 px-3 py-1 text-white"
                  >
                    Cancel
                  </button>
                  <button onClick={() => removeItem()} className="rounded bg-red-500 px-3 py-1 text-white">
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
              <div className="w-1/3 rounded-lg bg-gray-800 p-5">
                <h2 className="text-2xl mb-4 text-center">Edit Item</h2>
                <div className="mb-4">
                  <label htmlFor="itemName" className="block pl-1 text-md font-medium text-gray-200">
                    Item Name
                  </label>
                  <input
                    type="text"
                    id="itemName"
                    onChange={(e) => setProdEditName(e.target.value)}
                    value={prodEditName}
                    name="itemName"
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-600 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm md:text-md"
                    placeholder="Enter item name"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="itemPrice" className="block pl-1 text-sm font-medium text-gray-200">
                    Item Price
                  </label>
                  <div className="relative mb-4">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₹</span>
                    <input
                      type="number"
                      id="itemPrice"
                      onChange={(e) => {
                        const value = e.target.value
                        const parsedValue = Number.parseFloat(value)
                        setProdEditPrice(isNaN(parsedValue) ? "" : parsedValue)
                      }}
                      value={prodEditPrice}
                      name="itemPrice"
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-600 p-3 pl-8 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm md:text-md"
                      placeholder="Enter item price"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="shortcutNo" className="block pl-1 text-sm font-medium text-gray-200">
                    shortcut No
                  </label>
                  <input
                    type="text"
                    id="shortcutNo"
                    onChange={(e) => {
                      const value = e.target.value
                      const parsedValue = Number.parseInt(value)
                      setProdEditShortcut(isNaN(parsedValue) ? "" : parsedValue)
                    }}
                    value={prodEditShortcut}
                    name="shortcutNo"
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-600 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm md:text-md"
                    placeholder="Enter shortcut No"
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setShowEditModal(false)} className="rounded bg-gray-400 px-3 py-1 text-white">
                    Cancel
                  </button>
                  <button onClick={() => handleConfirmEdit()} className="rounded bg-green-600 px-3 py-1 text-white">
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageItems
