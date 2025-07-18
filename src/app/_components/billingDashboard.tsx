/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
"use client";

import React, { type SetStateAction, useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import type { Bill, Product, Shop } from "@prisma/client";
import {
	Calculator,
	CalculatorIcon,
	CalendarCheck,
	CalendarCheck2Icon,
	CalendarCheckIcon,
	LucideCalculator,
	LucideCalendarCheck,
	LucideCalendarCheck2,
	Trash2Icon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PaymentMethod } from "@prisma/client";
import { type Expense } from "@prisma/client";

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

type BillingState = {
	inputItem: string;
	discount: number;
	itemsData: Item[];
	paymentMethod: PaymentMethod;
};

const BillingDashboard = ({
	setCollapsed,
	collapsed,
	billState,
	setBillState,
}: {
	setCollapsed: React.Dispatch<SetStateAction<boolean>>;
	collapsed: boolean;
	billState: BillingState;
	setBillState: (newState: Partial<BillingState>) => void;
}) => {
	const { data } = api.products.getProductsForBilling.useQuery();
	// const [itemsData, setItemsData] = useState<Item[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [activeIndex, setActiveIndex] = useState<number>(-1);
	const [billDone, setBillDone] = useState<boolean>(false);
	const [shopData, setShopData] = useState<Shop | null>(null);
	const [showDiscountModal, setShowDiscountModal] = useState(false);
	const [discountAmount, setDiscountAmount] = useState<number>(0);
	const [discountPercent, setDiscountPercent] = useState<number>(0);
	const [maxDiscount, setMaxDiscount] = useState<number>(50);
	const [discountNotes, setDiscountNotes] = useState<string>("");

	const [expenseData, setExpenseData] = useState<Expense[]>([]);

	const { data: expenses, refetch: refetchExpenses } =
		api.billing.getExpensesForDate.useQuery(
			{
				shopId: shopData?.id ?? "",
			},
			{
				enabled: !!shopData?.id,
			},
		);

	useEffect(() => {
		if (expenses) {
			setExpenseData(expenses);
		}
	}, [expenses]);

	const [expenseDescription, setExpenseDescription] = useState<string>("");
	const [expenseAmount, setExpenseAmount] = useState<number>(0);
	const modalRef = useRef<HTMLDivElement>(null);

	const { mutate: createExpense } = api.billing.createExpense.useMutation();
	const { mutate: deleteExpense } = api.billing.deleteExpense.useMutation();

	const [showExpenseModal, setShowExpenseModal] = useState(false);

	const quantityRefs = useRef<Record<string, HTMLInputElement | null>>({});
	const [noInvoice, setNoInvoice] = useState<boolean>(false);
	const [billId, setBillId] = useState<string | null>(null);
	const [printModal, setPrintModal] = useState<boolean>(false);
	// const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
	//   PaymentMethod.CASH,
	// );
	const { mutate: createBill } = api.billing.createBilling.useMutation();
	const getInvoice = api.invoice.createInvoice.useMutation();

	const router = useRouter();
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
		const newItems2 = [...billState.itemsData];
		if (newItems2[index]) {
			newItems2[index].name = e.target.value;
		}
		setBillState({ itemsData: newItems2 });
	};

	const handleQuantityChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number,
	) => {
		const newItems2 = [...billState.itemsData];
		if (newItems2[index]) {
			if (Number(e.target.value) >= 0) {
				newItems2[index].quantity = Number(e.target.value);
			} else {
				newItems2[index].quantity = 0;
			}
		}
		setBillState({ itemsData: newItems2 });
	};

	const handlePriceChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number,
	) => {
		const newItems2 = [...billState.itemsData];
		if (newItems2[index]) {
			if (Number(e.target.value) >= 0) {
				newItems2[index].price = Number(e.target.value);
			} else {
				newItems2[index].price = 0;
			}
		}
		setBillState({ itemsData: newItems2 });
	};

	const handleAddToBill = (
		itemName: string,
		itemPrice: number,
		itemQuantity: number,
	) => {
		if (!itemName.trim()) {
			toast.error("Item name cannot be empty");
			return;
		}

		const allItems = [...billState.itemsData];
		const existingItem = allItems.find((item) => item.name === itemName);

		if (existingItem) {
			const newItems = allItems.map((item) =>
				item.name === itemName
					? { ...item, quantity: item.quantity + 1 }
					: item,
			);
			setBillState({ itemsData: newItems });
			setBillState({ inputItem: "" });
			return;
		}

		const newItem = {
			name: itemName,
			quantity: itemQuantity,
			price: itemPrice,
		};

		setBillState({
			itemsData: [...allItems, newItem],
		});

		setBillState({ inputItem: "" });
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const filteredProducts = products.filter(
			(product) =>
				product.name
					.toLowerCase()
					.includes(billState.inputItem.toLowerCase()) ||
				product.shortcut?.toString().toLowerCase() ===
					billState.inputItem.toLowerCase(),
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
				setBillState({ inputItem: "" });
				setTimeout(() => {
					quantityRefs.current[selectedProduct.name]?.focus();
				}, 0);
			}
		}
	};

	useEffect(() => {
		const filteredProducts = products.filter(
			(product) =>
				product.name
					.toLowerCase()
					.includes(billState.inputItem.toLowerCase()) ||
				product.shortcut?.toString().toLowerCase() ===
					billState.inputItem.toLowerCase(),
		);

		if (filteredProducts.length > 0) {
			setActiveIndex(0);
		} else {
			setActiveIndex(-1);
		}
	}, [billState.inputItem, products]);

	const inputRef = React.useRef<HTMLInputElement>(null);

	const handleDeleteItem = (item: Item) => {
		const allItems = [...billState.itemsData];
		const newItems = allItems.filter((i) => i.name !== item.name);
		setBillState({ itemsData: newItems });
	};

	function handlePaymentMethodChange(value: string): void {
		setBillState({ paymentMethod: value as PaymentMethod });
	}

	// const saveToLocal = () => {
	//   const bill = {
	//     shopId: shopData?.id,
	//     paymentMethod: paymentMethod,
	//     total: itemsData.reduce(
	//       (total, item) => total + item.quantity * item.price,
	//       0,
	//     ),
	//     discount: 0,
	//     items: itemsData.map((item) => {
	//       return {
	//         name: item.name,
	//         price: item.price,
	//         quantity: item.quantity,
	//         productId:
	//           products.find(
	//             (product) =>
	//               product.name === item.name && product.price === item.price,
	//           )?.id ?? undefined,
	//       };
	//     }),
	//   };
	//   if (typeof window !== "undefined") {
	//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	//     const bills: BillType[] = JSON.parse(
	//       localStorage.getItem("bills") ?? "[]",
	//     );
	//     bills.push(bill);
	//     localStorage.setItem("bills", JSON.stringify(bills));
	//     setItemsData([]);
	//     toast.success("Saved to local storage");
	//   }
	// };

	// useEffect(() => {
	//   if (typeof window !== "undefined") {
	//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	//     const bills: BillType[] = JSON.parse(
	//       localStorage.getItem("bills") ?? "[]",
	//     );
	//     if (bills && bills.length > 0) {
	//       setItemsData(bills[bills.length - 1]?.items ?? []);
	//     }
	//   }
	// }, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains((event.target as Node))
			) {
				setShowDiscountModal(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		const total = billState.itemsData.reduce(
			(sum, item) => sum + item.quantity * item.price,
			0,
		);

		let discount = 0;

		if (discountPercent > 0) {
			discount = Math.floor((discountPercent / 100) * total);
		}

		discount = Math.min(discount, maxDiscount);

		if (discountAmount > 0) {
			discount += discountAmount;
		}

		setBillState({
			discount: Math.min(discount, total),
		});
	}, [discountAmount, discountPercent, billState.itemsData, maxDiscount]);

	const handleConfirmBill = () => {
		const allItems = [...billState.itemsData];

		if (allItems.length === 0) {
			toast.error("No items in the bill");
			return;
		}

		// Validate all items have valid prices
		const hasInvalidPrice = allItems.some((item) => item.price <= 0);
		if (hasInvalidPrice) {
			toast.error(
				"Some items have a price of 0 or less. Please correct them before confirming the bill.",
			);
			return;
		}

		// Validate all items have valid quantities
		const hasInvalidQuantity = allItems.some((item) => item.quantity <= 0);
		if (hasInvalidQuantity) {
			toast.error(
				"Some items have a quantity of 0 or less. Please correct them before confirming the bill.",
			);
			return;
		}

		// Validate all items have names
		const hasInvalidName = allItems.some((item) => item.name === "");
		if (hasInvalidName) {
			toast.error(
				"Some items have no name. Please correct them before confirming the bill.",
			);
			return;
		}

		const total = allItems.reduce(
			(total, item) => total + item.quantity * item.price,
			0,
		);
		toast.loading("Creating Bill");

		if (shopData?.id) {
			createBill(
				{
					shopId: shopData?.id,
					paymentMethod: billState.paymentMethod,
					total: total,
					discount: billState.discount,
					items: allItems.map((item) => {
						return {
							name: item.name,
							price: item.price,
							quantity: item.quantity,
							productId:
								products.find((product) => product.name === item.name)?.id ??
								undefined,
						};
					}),
				},
				{
					onSuccess: (bill: Bill) => {
						toast.dismiss();
						toast.success("Bill created successfully", { duration: 2000 });
						setBillId(bill.id);
						setBillDone(true);
						if (!noInvoice) {
							setPrintModal(true);
						} else {
							clearItems();
						}
					},
					onError: (error) => {
						toast.dismiss();
						toast.error(
							error.message || "Network Error, don't worry bills are safe",
						);
					},
				},
			);
		} else {
			toast.dismiss();
			toast.error("Error fetching, Shop not found");
		}
	};

	const handlePrintBill = async () => {
		await getInvoice.mutateAsync(shopData?.id + "-" + billId, {
			onSuccess: (response) => {
				window.location.href = response;
			},
			onError: (error) => {
				console.error("PDF generation failed:", error);
			},
		});
	};

	const clearItems = () => {
		setBillState({
			itemsData: [],
			discount: 0,
			inputItem: "",
			paymentMethod: PaymentMethod.CASH,
		});
		setDiscountPercent(0);
		setDiscountAmount(0);
		setMaxDiscount(50);
		setPrintModal(false);
		setBillDone(false);
	};

	const handleExpenseCalculator = () => {
		setShowExpenseModal(true);
	};

	const handleCloseExpenseModal = () => {
		setShowExpenseModal(false);
	};

	useEffect(() => {
		console.log("Expense Data", expenseData);
	}, [expenseData]);

	const handleCreateExpense = () => {
		if (shopData?.id) {
			if (!expenseDescription || expenseAmount <= 0) {
				toast.error("Please enter a valid expense description and amount");
				return;
			}
			toast.loading("Creating Expense");
			createExpense(
				{
					shopId: shopData.id,
					amount: expenseAmount,
					description: expenseDescription,
				},
				{
					onSuccess: () => {
						setExpenseDescription("");
						setExpenseAmount(0);
						toast.dismiss();
						toast.success("Expense added successfully");
						void refetchExpenses();
					},
					onError: (error) => {
						toast.error(error.message || "Failed to add expense");
					},
				},
			);
		} else {
			toast.error("Error fetching, Shop not found");
		}
	};

	const handleDeleteExpense = (expenseId: string) => {
		deleteExpense(expenseId, {
			onSuccess: () => {
				toast.success("Expense deleted successfully");
				void refetchExpenses();
			},
			onError: (error) => {
				toast.error(error.message || "Failed to delete expense");
			},
		});
	};

	return (
		<div className="scrollbar-hide flex h-screen w-full flex-col overflow-auto bg-gray-800 pb-4">
			<div className="flex max-h-screen w-full justify-between border-b-2 border-gray-500 bg-gray-900 p-4">
				<div>
					<CalculatorIcon onClick={handleExpenseCalculator} />
				</div>
				<h1 className="text-center">
					{shopData ? shopData.name + " Billing" : ""}
				</h1>
				<div className="float-right flex items-center gap-6">
					<label
						htmlFor="no-invoice-toggle"
						className="flex items-center gap-2"
					>
						<span>No Invoice Mode</span>
						<input
							id="no-invoice-toggle"
							type="checkbox"
							checked={noInvoice}
							onChange={() => {
								setNoInvoice((prev) => !prev);
								if (!noInvoice) {
									toast.success("No Invoice Mode Enabled");
								} else {
									toast.info("No Invoice Mode Disabled");
								}
							}}
							className="sr-only"
						/>
						<Button
							tabIndex={-1}
							aria-hidden="true"
							className={`relative h-6 w-12 rounded-full transition-colors ${
								noInvoice ? "bg-green-500" : "bg-gray-400"
							}`}
							onClick={() => {
								setNoInvoice((prev) => !prev);
								if (!noInvoice) {
									toast.success("No Invoice Mode Enabled");
								} else {
									toast.info("No Invoice Mode Disabled");
								}
							}}
						>
							<span
								className={`absolute left-1 top-1 h-4 w-4 transform rounded-full bg-white transition-transform ${
									noInvoice ? "translate-x-6" : ""
								}`}
							></span>
						</Button>
					</label>
					<label
						htmlFor="advanced-mode-toggle"
						className="flex items-center gap-2"
					>
						<span>Advanced Mode</span>
						<input
							id="advanced-mode-toggle"
							type="checkbox"
							checked={collapsed}
							onChange={() => {
								setCollapsed((prev) => !prev);
								if (!collapsed) {
									toast.success("Advanced Mode Enabled");
								} else {
									toast.info("Advanced Mode Disabled");
								}
							}}
							className="sr-only"
						/>
						<Button
							tabIndex={-1}
							aria-hidden="true"
							className={`relative h-6 w-12 rounded-full transition-colors ${
								collapsed ? "bg-green-500" : "bg-gray-400"
							}`}
							onClick={() => {
								setCollapsed((prev) => !prev);
								if (!collapsed) {
									toast.success("Advanced Mode Enabled");
								} else {
									toast.info("Advanced Mode Disabled");
								}
							}}
						>
							<span
								className={`absolute left-1 top-1 h-4 w-4 transform rounded-full bg-white transition-transform ${
									collapsed ? "translate-x-6" : ""
								}`}
							></span>
						</Button>
					</label>
				</div>
			</div>
			<div className="flex w-full gap-3 p-12">
				<div className="w-4/5">
					<input
						value={billState.inputItem}
						ref={inputRef}
						className="h-10 w-full rounded-lg bg-gray-300 p-4 text-black outline-none"
						type="text"
						autoComplete="off"
						onChange={(e) => setBillState({ inputItem: e.target.value })}
						onKeyDown={handleKeyDown}
						placeholder="Type Item Name"
					/>
					{billState.inputItem && (
						<div
							className="absolute z-10 max-h-40 overflow-y-auto rounded-lg bg-gray-300 text-black shadow-lg"
							style={{ width: `${inputRef.current?.clientWidth}px` }}
						>
							{products
								.filter(
									(product) =>
										product.name
											.toLowerCase()
											.includes(billState.inputItem.toLowerCase()) ||
										product.shortcut?.toString().toLowerCase() ===
											billState.inputItem.toLowerCase(),
								)
								.map((product, index) => (
									<button
										key={product.id}
										type="button"
										onClick={() => {
											handleAddToBill(product.name, product.price, 1);
											setActiveIndex(-1);
										}}
										className={`w-full text-left cursor-pointer px-4 py-2 ${
											index === activeIndex
												? "bg-gray-400"
												: "hover:bg-gray-400"
										}`}
									>
										{product.shortcut + ". " + product.name}
									</button>
								))}
						</div>
					)}
				</div>
				<div className="w-1/5">
					<button
						type="button"
						onClick={() => {
							handleAddToBill(billState.inputItem, 0, 0);
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
									{billState.itemsData.map((item, index) => (
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
													autoComplete="off"
													onChange={(e) => handleNameChange(e, index)}
													className="block h-full w-full bg-transparent px-4 py-4 pl-14 text-center outline-none hover:bg-gray-800 focus:bg-gray-800"
												/>
											</td>
											<td className="w-1/5 border-gray-500 p-0 focus:border-b-[1px] focus:border-gray-400">
												<input
													type="text"
													name="quantity"
													ref={(el) => {
														quantityRefs.current[item.name] = el;
													}}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															inputRef.current?.focus();
														}
													}}
													autoComplete="off"
													value={item.quantity || ""}
													min={0}
													onChange={(e) => handleQuantityChange(e, index)}
													className={`block h-full w-full px-4 py-4 text-center outline-none ${
														item.quantity > 0
															? "bg-transparent hover:bg-gray-800 focus:bg-gray-600"
															: "bg-red-400/60 hover:bg-gray-800 focus:bg-gray-800"
													}`}
												/>
											</td>
											<td className="relative w-1/5 border-gray-500 p-0 focus:border-b-[1px]">
												<input
													type="text"
													value={item.price || ""}
													name="price"
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															inputRef.current?.focus();
														}
													}}
													min={0}
													autoComplete="off"
													onChange={(e) => handlePriceChange(e, index)}
													className={`block h-full w-full px-4 py-4 text-center outline-none ${
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
						{billState.itemsData.reduce(
							(total, item) => total + item.quantity,
							0,
						)}
					</h2>
					<div className="flex w-full flex-col items-center relative">
						<Button
							className="w-3/4 mt-4 bg-blue-900 text-white hover:bg-blue-800 rounded-lg py-3 font-semibold"
							onClick={() => setShowDiscountModal(true)}
						>
							Add Discount
						</Button>
						<div className="mt-2 text-center text-lg text-blue-400 font-bold">
							{billState.discount > 0 && <>Discount: ₹{billState.discount}</>}
						</div>
						{showDiscountModal && (
							<div
								className="absolute right-full top-0 z-50 flex items-center justify-center"
								style={{ minHeight: "100%" }}
							>
								<div
									ref={modalRef} // 👈 this is the magic anchor
									className="w-72 rounded-lg bg-gray-800 p-4 shadow-lg border border-gray-600"
								>
									<h3 className="mb-2 text-lg font-semibold text-white">
										Discount Details
									</h3>
									<div className="flex flex-col gap-3">
										<label className="text-gray-300">
											Discount Percentage (%):
											<input
												type="number"
												className="mt-1 w-full rounded bg-gray-700 p-2 text-white"
												value={discountPercent}
												min={0}
												max={100}
												onChange={(e) =>
													setDiscountPercent(Number(e.target.value))
												}
											/>
										</label>
										<label className="text-gray-300">
											Max Discount (₹):
											<input
												type="number"
												className="mt-1 w-full rounded bg-gray-700 p-2 text-white"
												value={maxDiscount}
												min={0}
												onChange={(e) => setMaxDiscount(Number(e.target.value))}
											/>
										</label>
										<label className="text-gray-300">
											Extra Discount (₹):
											<input
												type="number"
												className="mt-1 w-full rounded bg-gray-700 p-2 text-white"
												value={discountAmount}
												min={0}
												onChange={(e) =>
													setDiscountAmount(Number(e.target.value))
												}
											/>
										</label>
									</div>
								</div>
							</div>
						)}
					</div>
					<div className="bg-gray-700">
						<h2 className="mt-5 p-3 text-center text-xl font-bold text-green-500">
							Final Price:{" "}
							{billState.itemsData.reduce(
								(total, item) => total + item.quantity * item.price,
								0,
							) - billState.discount}
							rs
						</h2>
					</div>
					<div className="mt-5 p-4">
						<h2 className="text-center text-xl font-bold">Payment Method</h2>
						<div className="flex w-full justify-center">
							<div className="mt-4 flex w-3/4 flex-col gap-3">
								{[
									{
										method: PaymentMethod.CASH,
										label: "Cash",
										icon: "/cash.png",
									},
									{ method: PaymentMethod.UPI, label: "UPI", icon: "/upi.svg" },
								].map(({ method, label, icon }) => (
									<Button
										key={method}
										onClick={() => handlePaymentMethodChange(method)}
										className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-all ${
											billState.paymentMethod === method
												? "border-green-500 bg-green-600 text-white"
												: "border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
										}`}
									>
										<span className="flex items-center gap-2 text-base font-medium">
											{label}
											<img
												src={icon || "/placeholder.svg"}
												alt={label}
												className="h-6 w-6"
											/>
										</span>
									</Button>
								))}
							</div>
						</div>
					</div>
					<div className="flex w-full justify-center gap-4">
						<Button
							onClick={handleConfirmBill}
							className="mt-4"
							disabled={billDone}
							variant="secondary"
						>
							Confirm Bill{" "}
						</Button>
					</div>
				</div>
			</div>
			{printModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div className="flex h-fit w-1/4 flex-col items-end rounded-lg bg-gray-700 p-5">
						<div className="w-full text-left">
							{" "}
							<h2 className="mb-4 text-xl">
								Do you want to print the invoice?
							</h2>
						</div>
						<div className="flex gap-3">
							<Button className="bg-blue-800" onClick={handlePrintBill}>
								Yes
							</Button>
							<Button className="bg-red-700" onClick={clearItems}>
								No
							</Button>
						</div>
					</div>
				</div>
			)}
			{showExpenseModal && (
				<div
					className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm "
					onClick={handleCloseExpenseModal}
				>
					<div
						className="flex w-full max-w-5xl rounded-xl bg-gray-900 p-6 shadow-xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="w-2/3 pr-6 border-r border-gray-700 flex flex-col justify-around min-h-[50vh]">
							<div>
								<h2 className="mb-4 text-2xl font-semibold text-white">
									Expense Tracker - {new Date().toLocaleDateString()} Total - ₹
									{expenseData.reduce(
										(acc, expense) => acc + expense.amount,
										0,
									)}
								</h2>

								<form className="space-y-4 h-full flex flex-col">
									<input
										type="text"
										placeholder="Expense Description"
										onChange={(e) => setExpenseDescription(e.target.value)}
										value={expenseDescription}
										className="w-full max-h-[60px] flex-grow rounded-md bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<input
										type="number"
										placeholder="Amount"
										onChange={(e) => setExpenseAmount(Number(e.target.value))}
										value={expenseAmount || ""}
										min={0}
										className="w-full max-h-[60px]  flex-grow rounded-md bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</form>
							</div>

							<div className="flex justify-end gap-3 pt-4 self-end">
								<button
									type="button"
									onClick={() => setShowExpenseModal(false)}
									className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"
								>
									Close
								</button>
								<button
									type="button"
									onClick={() => handleCreateExpense()}
									className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
								>
									Add Expense
								</button>
							</div>
						</div>

						<div
							className="w-1/3 pl-6 max-h-[50vh] overflow-y-auto "
							style={{ scrollbarGutter: "stable", scrollbarWidth: "thin" }}
						>
							<h3 className="mb-3 text-xl font-semibold text-white">
								Your Expenses
							</h3>
							<div className="space-y-3">
								{expenseData
									?.sort(
										(a, b) =>
											new Date(b.createdAt).getTime() -
											new Date(a.createdAt).getTime(),
									)
									.map((expense, idx) => (
										<div
											key={idx}
											className="rounded-lg bg-gray-800 p-3 text-white shadow-sm"
										>
											<div className="flex justify-between items-center">
												<span className="font-medium">
													{expense.description}
												</span>
												<span className="text-green-400">
													₹{expense.amount}
												</span>
											</div>
											<div className="text-sm text-gray-400 flex justify-between items-center">
												{new Date(expense.createdAt).toLocaleDateString()}{" "}
												{new Date(expense.createdAt).toLocaleTimeString()}
												<Trash2Icon
													className="cursor-pointer text-red-500 scale-75"
													onClick={() => {
														const confirmDelete = window.confirm(
															"Are you sure you want to delete this expense?",
														);
														if (confirmDelete) {
															handleDeleteExpense(expense.id);
														}
													}}
												/>
											</div>
										</div>
									))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BillingDashboard;
