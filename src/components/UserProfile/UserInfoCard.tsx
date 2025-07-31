import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axios from "axios";
import { useEffect, useState } from "react";

interface CheckoutData {
  id: number;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  city: string;
  checkin: string;
  checkout: string;
  code: string;
  currentDate: string;
  children: string;
  guests: string;
  night: string;
  totalprice: string;
  price: string;
  paymentID: string;
  roomname: string;
}

export default function UserInfoCard() {
  const apiBase = import.meta.env.VITE_API_URL;
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };

  const [checkoutData, setCheckoutData] = useState<CheckoutData[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiBase}/api/chekoutview`);
        setCheckoutData(response.data.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching checkout data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="px-4 sm:px-0">
      {checkoutData
        .sort(
          (start, end) =>
            new Date(end.currentDate).getTime() -
            new Date(start.currentDate).getTime()
        )
        .map((item, index) => (
          <div
            key={item.id || index}
            className="p-4 mb-4 border border-gray-200 rounded-2xl dark:border-gray-800 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                  <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                    {new Date(item.currentDate).toLocaleString()}
                  </h4>
                  <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                    {item.roomname}
                  </h4>
                </div>
                <span className={`flex w-full justify-center rounded-lg px-4 py-2 text-sm font-medium text-white sm:w-auto ${item.paymentID ? "bg-green-500" : "bg-blue-500"}`}>
                  {item.paymentID ? "Online" : "Admin book"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:gap-7">
                {/* Check-in */}
                <div className="p-2 rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Check-in
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.checkin}
                  </p>
                </div>
                
                {/* Check-out */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Check-out
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.checkout}
                  </p>
                </div>
                
                {/* First Name */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    First Name
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.fname}
                  </p>
                </div>
                
                {/* Last Name */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Last Name
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.lname}
                  </p>
                </div>
                
                {/* Phone */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Phone
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.phone}
                  </p>
                </div>
                
                {/* Email */}
                <div className="p-2  rounded-lg sm:col-span-2">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Email address
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                    {item.email}
                  </p>
                </div>
                
                {/* Children */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Children
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.children}
                  </p>
                </div>
                
                {/* Guests */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Guests
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.guests}
                  </p>
                </div>
                
                {/* City */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    City
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.city}
                  </p>
                </div>
                
                {/* Code */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Code
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.code}
                  </p>
                </div>
                
                {/* Nights */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Nights
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.night}
                  </p>
                </div>
                
                {/* Price */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Price
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    AED {item.price}
                  </p>
                </div>
                
                {/* Total */}
                <div className="p-2  rounded-lg sm:col-span-2">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Total
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.night}x{item.price} = {item.totalprice}
                  </p>
                </div>
                
                {/* Payment Id */}
                <div className="p-2  rounded-lg sm:col-span-2">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Payment Id
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                    {item.paymentID || "N/A"}
                  </p>
                </div>
                
                {/* Payment Status */}
                <div className="p-2  rounded-lg">
                  <p className="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Payment Status
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.paymentID ? 'Paid/Success' : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}