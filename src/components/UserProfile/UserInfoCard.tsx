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
  currentDate:string;
  children:string;
  guests:string;
  night:string;
  totalprice:string;
  price:string;
  paymentID:string;
  roomname:string;

}
export default function UserInfoCard() {
   const apiBase = import.meta.env.VITE_API_URL;
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };



   const [checkoutData, setCheckoutData] = useState<CheckoutData[]>([]);
  useEffect(()=>{
    const fetchData = async()=>{
      try{
        const response =await axios.get(`${apiBase}api/chekoutview`);
        setCheckoutData(response.data.data);
        console.log(response.data);
        
      }catch(error){
         console.error("Error fetching checkout data", error);
        
      }
    }
     fetchData();
  },[])
 return (
  <>
    {checkoutData
      .sort(
        (start, end) =>
          new Date(end.currentDate).getTime() -
          new Date(start.currentDate).getTime()
      )
      .map((item, index) => (
        <div
          key={item.id || index} // add a unique key here, preferably a stable id
          className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex  gap-36"> 
                   <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              {/* {item.currentDate} */}
              {new Date(item.currentDate).toLocaleString()}
              {/* {new Date(item.currentDate).toLocaleDateString()} */}
              </h4>
                 <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6  ">
              {/* {item.currentDate} */}
              {item.roomname}
              {/* {new Date(item.currentDate).toLocaleDateString()} */}
              </h4></div>
          
           

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-7 2xl:gap-x-32">
                {/* Check-in */}
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    Check-in
                  </p>
                  <p className="text-xs font-medium  text-gray-800 dark:text-white/90">
                    {item.checkin}
                  </p>
                </div>
                {/* Check-out */}
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    Check-out
                  </p>
                  <p className="text-xs font-medium  text-gray-800 dark:text-white/90">
                    {item.checkout}
                  </p>
                </div>
                {/* First Name */}
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    First Name
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.fname}
                  </p>
                </div>
                {/* Last Name */}
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    Last Name
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.lname}
                  </p>
                </div>
                
                {/* Phone */}
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    Phone
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.phone}
                  </p>
                </div>
                {/* Email */}
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    Email address
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.email}
                  </p>
                </div>
   {/* City */}
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    children
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.children}
                  </p>
                </div>
                 <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    guests
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.guests}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    city
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.city}
                  </p>
                </div>
                 {/* Code */}
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    code
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.code}
                  </p>
                </div>
               
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    Nights
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.night}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    Price
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    AED {item.price}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    Total
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {item.night}x{item.price} ={item.totalprice}
                  </p>
                </div>
             
               
                {/* Payment Id */}
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    Payment Id
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                   {item.paymentID}
                  </p>
                </div>
                {/* Payment Status */}
                <div>
                  <p className="mb-2 text-sm leading-normal text-gray-800 dark:text-white/90">
                    Payment Status
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Pay/Success
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
  </>
);

}
