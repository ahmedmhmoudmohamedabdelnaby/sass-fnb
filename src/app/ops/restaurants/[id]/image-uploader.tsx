"use client";

import { uploadRestaurantImage, deleteRestaurantImage } from "@/app/actions/images";
import { useState } from "react";
import { ImagePlus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

export function ImageUploader({ 
  restaurantId, 
  images 
}: { 
  restaurantId: string;
  images: { name: string, url: string }[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("isCover", isCover ? "true" : "false");

    try {
      await uploadRestaurantImage(restaurantId, formData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      e.target.value = ""; // reset input
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    setLoading(true);
    try {
      await deleteRestaurantImage(restaurantId, path);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const coverImage = images.find(img => img.name.startsWith("cover"));
  const galleryImages = images.filter(img => !img.name.startsWith("cover"));

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
      
      {/* Cover Image Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EAEAEA] overflow-hidden">
        <div className="p-5 border-b border-[#EAEAEA] flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-semibold text-gray-900">Cover Image</h3>
            <p className="text-xs text-gray-500">Main hero image for the public page.</p>
          </div>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleUpload(e, true)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={loading}
            />
            <button disabled={loading} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              Upload Cover
            </button>
          </div>
        </div>
        <div className="p-5">
          {coverImage ? (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden group border border-gray-200">
              <img src={coverImage.url} alt="Cover" className="w-full h-full object-cover" />
              <button 
                onClick={() => handleDelete(`${restaurantId}/${coverImage.name}`)}
                disabled={loading}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-md shadow-sm text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={32} className="mb-2 opacity-50" />
              <span className="text-sm">No cover image uploaded</span>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EAEAEA] overflow-hidden">
        <div className="p-5 border-b border-[#EAEAEA] flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-semibold text-gray-900">Gallery</h3>
            <p className="text-xs text-gray-500">Additional photos for the restaurant.</p>
          </div>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleUpload(e, false)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={loading}
            />
            <button disabled={loading} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              Add to Gallery
            </button>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {galleryImages.map((img) => (
            <div key={img.name} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group border border-gray-200">
              <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" />
              <button 
                onClick={() => handleDelete(`${restaurantId}/${img.name}`)}
                disabled={loading}
                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-md shadow-sm text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {galleryImages.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-400 text-sm">
              No gallery images uploaded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
