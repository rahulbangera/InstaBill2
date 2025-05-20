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
  <div className="mx-auto max-w-[2200px] p-6 lg:p-8">
    <div className="flex flex-col gap-6 md:flex-row md:justify-between md:gap-4">
      {/* Add Item Form */}
      <div className="flex-1 rounded-xl border border-gray-600 bg-gray-800 p-6 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-semibold text-white">Add Item</h1>
        <form className="flex flex-col space-y-6">
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-200">
              Item Name
            </label>
            <input
              type="text"
              id="itemName"
              onChange={(e) => setProdName(e.target.value)}
              value={prodName}
              name="itemName"
              className="mt-1 w-full rounded-md bg-gray-700 p-3 text-white shadow focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter item name"
            />
          </div>
          <div>
            <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-200">
              Item Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                id="itemPrice"
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value)
                  setProdPrice(isNaN(parsed) ? "" : parsed)
                }}
                value={prodPrice}
                name="itemPrice"
                className="mt-1 w-full rounded-md bg-gray-700 p-3 pl-8 text-white shadow focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter item price"
              />
            </div>
          </div>
          <div>
            <label htmlFor="shortcutNo" className="block text-sm font-medium text-gray-200">
              Shortcut No
            </label>
            <input
              type="text"
              id="shortcutNo"
              onChange={(e) => {
                const parsed = parseInt(e.target.value)
                setProdShortcut(isNaN(parsed) ? "" : parsed)
              }}
              value={prodShortcut}
              name="shortcutNo"
              className="mt-1 w-full rounded-md bg-gray-700 p-3 text-white shadow focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter shortcut No"
            />
          </div>
          <button
            type="button"
            onClick={handleProdAdd}
            className="rounded-md bg-yellow-700 px-4 py-2 text-white hover:bg-yellow-800"
          >
            Add Item
          </button>
        </form>
      </div>

      {/* Added Items */}
      <div className="flex-1 rounded-xl border border-gray-600 bg-gray-800 p-6 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-semibold text-white">Added Items</h1>
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-200">
            Search Items
          </label>
          <input
            type="text"
            id="search"
            name="search"
            className="mt-1 w-full rounded-md bg-gray-700 p-3 text-white shadow focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Search items"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase()
              const filtered = itemsData.filter(
                (item) =>
                  item.name.toLowerCase().includes(searchTerm) ||
                  item.shortcut.toString().includes(searchTerm)
              )
              setFilteredItems(filtered)
            }}
          />
        </div>

        <hr className="my-4 border-gray-600" />

        <div className="max-h-[500px] space-y-4 overflow-y-auto">
          {filteredItems.map((item) => (
            <div key={item.id} className="rounded-lg bg-gray-700 p-4 shadow-md">
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                <span className="text-gray-300">{item.productCode}</span>
              </div>
              <p className="text-gray-300">Price: ₹{item.price}</p>
              <div className="mt-2 flex justify-between">
                <p className="text-sm text-gray-400">Shortcut No: {item.shortcut}</p>
                <div className="flex items-center gap-4">
                  <Pencil1Icon
                    onClick={() => handleItemEdit(item)}
                    className="cursor-pointer text-white hover:text-indigo-400"
                  />
                  <Trash2Icon
                    onClick={() => handleItemDeletion(item)}
                    className="cursor-pointer text-red-400 hover:text-red-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Delete Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-[90%] max-w-md rounded-lg bg-gray-700 p-5">
          <h2 className="mb-4 text-xl text-white">Remove Item</h2>
          <p className="text-gray-300">Are you sure you want to remove this item?</p>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowDeleteModal(false)} className="rounded bg-gray-500 px-4 py-1 text-white">
              Cancel
            </button>
            <button onClick={removeItem} className="rounded bg-red-500 px-4 py-1 text-white">
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Modal */}
    {showEditModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-[90%] max-w-lg rounded-lg bg-gray-800 p-5">
          <h2 className="mb-4 text-center text-2xl text-white">Edit Item</h2>
          <div className="mb-4">
            <label htmlFor="editName" className="block text-sm font-medium text-gray-200">
              Item Name
            </label>
            <input
              type="text"
              id="editName"
              onChange={(e) => setProdEditName(e.target.value)}
              value={prodEditName}
              className="mt-1 w-full rounded-md bg-gray-700 p-3 text-white shadow"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="editPrice" className="block text-sm font-medium text-gray-200">
              Item Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                id="editPrice"
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value)
                  setProdEditPrice(isNaN(parsed) ? "" : parsed)
                }}
                value={prodEditPrice}
                className="mt-1 w-full rounded-md bg-gray-700 p-3 pl-8 text-white shadow"
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="editShortcut" className="block text-sm font-medium text-gray-200">
              Shortcut No
            </label>
            <input
              type="text"
              id="editShortcut"
              onChange={(e) => {
                const parsed = parseInt(e.target.value)
                setProdEditShortcut(isNaN(parsed) ? "" : parsed)
              }}
              value={prodEditShortcut}
              className="mt-1 w-full rounded-md bg-gray-700 p-3 text-white shadow"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowEditModal(false)} className="rounded bg-gray-500 px-4 py-1 text-white">
              Cancel
            </button>
            <button onClick={handleConfirmEdit} className="rounded bg-green-600 px-4 py-1 text-white">
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)

}

export default ManageItems
