'use client';

import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import axios, { AxiosError } from "axios";
import Button from "../../ui/button/Button";

interface RoomOption {
  value: string;
  label: string;
}

interface PriceData {
  jan?: number;
  feb?: number;
  mar?: number;
  apr?: number;
  may?: number;
  jun?: number;
  jul?: number;
  aug?: number;
  sep?: number;
  oct?: number;
  nov?: number;
  dec?: number;
}

interface ApiResponse {
  prices?: PriceData;
  message?: string;
}

const options: RoomOption[] = [
  { value: "6853d4b14f532831999a179c", label: "Chic-1" },
  { value: "6853d4e3e6ad1fa702b7870a", label: "Dubail-mall" },
  { value: "6853d50e4419a581bb434460", label: "Chic-studio" },

  { value: "6842bcaf440f00f8d71ed023", label: "Merano-1710" },
  { value: "6842bce0440f00f8d71ed025", label: "Majestine-618" },
  { value: "6842bcff440f00f8d71ed027", label: "Reva-1811" },
  { value: "68490c10187d6baa5db2ed55", label: "Merano-2906" },
];

export default function Price() {
  const apiBase = import.meta.env.VITE_API_URL;
  const [roomId, setRoomId] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [prices, setPrices] = useState<Record<string, string>>({
    jan: "", feb: "", mar: "", apr: "",
    may: "", jun: "", jul: "", aug: "",
    sep: "", oct: "", nov: "", dec: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value;
    if (!id) return;

    setRoomId(id);
    setError("");
    setIsLoading(true);

    const selectedRoom = options.find(opt => opt.value === id);
    setRoomName(selectedRoom ? selectedRoom.label : "");

    try {
      const res = await axios.get<ApiResponse>(`${apiBase}api/priceView/${id}`);
      const fetched = res.data;

      if (fetched?.prices) {
        const newPrices: Record<string, string> = {
          jan: "", feb: "", mar: "", apr: "",
          may: "", jun: "", jul: "", aug: "",
          sep: "", oct: "", nov: "", dec: "",
        };

        Object.entries(fetched.prices).forEach(([month, value]) => {
          const monthKey = month.toLowerCase();
          if (monthKey in newPrices && value !== null && value !== undefined) {
            newPrices[monthKey] = value.toString();
          }
        });

        setPrices(newPrices);
      } else {
        console.log("No price data found.");
      }
    } catch (err: unknown) {
      let errorMessage = "Failed to load prices.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (month: string, value: string) => {
    if (value === "" || /^\d*$/.test(value)) {
      setPrices(prev => ({ ...prev, [month]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!roomId) {
      setError("Please select a room before updating prices.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const priceData: PriceData = Object.fromEntries(
        Object.entries(prices).map(([month, value]) => [
          month,
          value === "" ? 0 : parseInt(value)
        ])
      );

     await axios.put(`${apiBase}api/priceUpadte`, {
  roomName,
  prices: priceData
});

      alert("Prices updated successfully!");
    } catch (err: unknown) {
      let errorMessage = "Failed to update prices. Please try again.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ComponentCard title="Monthly Room Prices">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-4">
          <Label htmlFor="room-select">Select Room</Label>
          <select
            id="room-select"
            value={roomId}
            onChange={handleSelectChange}
            disabled={isLoading}
            className="w-full p-2 rounded border bg-white text-black focus:text-black dark:bg-gray-800 dark:text-white dark:focus:text-white"
          >
            <option value="">-- Select a room --</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="text-blue-500">Loading prices...</div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            {Object.keys(prices).map(month => (
              <div key={month}>
                <Label htmlFor={month}>
                  {month.charAt(0).toUpperCase() + month.slice(1)}
                </Label>
                <Input
                  type="text"
                  id={month}
                  value={prices[month]}
                  onChange={e => handleInputChange(month, e.target.value)}
                  disabled={!roomId || isLoading}
                />
              </div>
            ))}
          </div>

          <Button
            size="md"
            variant="primary"
            onClick={handleSubmit}
            disabled={!roomId || isLoading}
          >
            {isLoading ? "Updating..." : "Update Prices"}
          </Button>
        </div>

        {/* Live Preview Section */}
        <div className="bg-gray-100 dark:bg-dark-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
          <p className="mb-2">
            <strong>Room Name:</strong> {roomName || "Not selected"}
          </p>

          {roomName && (
            <ul className="mt-2 space-y-1">
              {Object.entries(prices).map(([month, value]) => (
                <li key={month} className="flex justify-between">
                  <span className="capitalize">{month}:</span>
                  <span className="font-medium">
                    {value ? `${value}` : <span className="text-gray-400">Not set</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ComponentCard>
  );
}
