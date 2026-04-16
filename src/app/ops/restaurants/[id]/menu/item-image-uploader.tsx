"use client";

import { uploadMenuItemImage } from "@/app/actions/images";
import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

export function ItemImageUploader({ 
  restaurantId, 
  itemId,
  currentUrl
}: { 
  restaurantId: string;
  itemId: string;
  currentUrl?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadMenuItemImage(restaurantId, itemId, formData);
      if (res?.error) {
        alert(res.error);
      }
    } catch (err: any) {
      alert("Error uploading image");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="relative group/uploader flex items-center justify-center w-12 h-12 bg-gray-50 border border-gray-200 rounded-md overflow-hidden flex-shrink-0 cursor-pointer hover:bg-gray-100 transition-colors">
      {currentUrl && !loading ? (
        <img src={currentUrl} alt="Item" className="w-full h-full object-cover group-hover/uploader:opacity-50 transition-opacity" />
      ) : (
        <div className="text-gray-300 group-hover/uploader:text-gray-500">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        </div>
      )}
      <input 
        type="file" 
        accept="image/*"
        onChange={handleUpload}
        disabled={loading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        title="Upload Image"
      />
    </div>
  );
}
