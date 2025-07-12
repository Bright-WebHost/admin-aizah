import { useState, useEffect } from "react";
import axios from "axios";

// Custom Components
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

export default function Razorpay() {
  const [apiKey, setApiKey] = useState("");
  const [keyId, setKeyId] = useState("");
const apiBase = import.meta.env.VITE_API_URL;
  // Fetch existing API key on mount
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await axios.get(`${apiBase}api/keyview`);
        const keyData = response.data?.data?.[0];
        if (keyData) {
          setApiKey(keyData.key);
          setKeyId(keyData._id);
        }
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    };

    fetchApiKey();
  }, []);

  // Handle Save or Update
  const handleUpdate = async () => {
    try {
      if (keyId) {
        // Update
        const response = await axios.put(
          `${apiBase}keyupdate/${keyId}`,
          { key: apiKey }
        );
        console.log("Updated:", response.data);
        alert("API key updated successfully!");
      } else {
        // Create new
        const response = await axios.post(`${apiBase}api/key`, {
          key: apiKey,
        });
        console.log("Created:", response.data);
        alert("API key saved successfully!");
        setKeyId(response.data?.data?._id || "");
      }
    } catch (error) {
      console.error("Error saving/updating API key:", error);
      alert("Failed to save/update API key.");
    }
  };

  return (
    <>
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin"
        description="This is React.js Form Elements Dashboard"
      />
      <PageBreadcrumb pageTitle="Razorpay" />

      <ComponentCard title="API Key Setup">
        <div className="space-y-6">
          <div>
            <Label htmlFor="api-key-input">API KEY</Label>
            <Input
              type="text"
              id="api-key-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div className="flex items-center gap-5 mt-2.5">
              <Button size="sm" variant="primary" onClick={handleUpdate}>
                {keyId ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
