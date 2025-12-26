"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Day6PhotoUploadProps {
  memberId: string;
  currentPhotoUrl: string | null;
  onUploadSuccess: (photoUrl: string) => void;
}

export default function Day6PhotoUpload({
  memberId,
  currentPhotoUrl,
  onUploadSuccess,
}: Day6PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync previewUrl with currentPhotoUrl prop changes
  useEffect(() => {
    setPreviewUrl(currentPhotoUrl);
  }, [currentPhotoUrl]);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          // Max dimensions (resize if larger)
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.85 // 85% quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select an image file (JPEG, PNG, GIF, or WebP)\n请选择图片文件 (JPEG, PNG, GIF 或 WebP)");
      return;
    }

    // Compress image before upload
    setCompressing(true);
    const compressedFile = await compressImage(file);
    setCompressing(false);

    // If user already has a photo, show confirmation
    if (currentPhotoUrl) {
      setPendingFile(compressedFile);
      setShowConfirmDialog(true);
    } else {
      uploadPhoto(compressedFile);
    }
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setShowConfirmDialog(false);

    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("memberId", memberId);

      const response = await fetch("/api/day6-photo/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Update preview
      setPreviewUrl(data.photoUrl);
      onUploadSuccess(data.photoUrl);

      // Show preview of uploaded file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload photo");
    } finally {
      setUploading(false);
      setPendingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmReplace = () => {
    if (pendingFile) {
      uploadPhoto(pendingFile);
    }
  };

  const handleCancelReplace = () => {
    setShowConfirmDialog(false);
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className={`bg-white rounded-lg shadow-md ${previewUrl ? 'p-2' : 'p-4'}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
          disabled={uploading || compressing}
        />

        {previewUrl ? (
          // Minimal state when photo is uploaded
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
              <Image
                src={previewUrl}
                alt="Your uploaded photo"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 mb-1">
                Photo uploaded ✓ / 照片已上传 ✓
              </p>
              <label
                htmlFor="photo-upload"
                className={`
                  inline-block px-4 py-2 rounded-lg font-medium text-white cursor-pointer
                  transition-colors duration-200 text-sm
                  ${
                    uploading || compressing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                `}
              >
                {compressing
                  ? "Compressing... / 压缩中..."
                  : uploading
                  ? "Uploading... / 上传中..."
                  : "Re-upload / 重新上传"}
              </label>
            </div>
          </div>
        ) : (
          // Full state when no photo uploaded
          <div>
            <h3 className="text-lg font-semibold mb-1 text-gray-800">
              📸 Share Your Favorite Bali Moment
            </h3>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              分享你最喜欢的巴厘岛瞬间
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Upload your favorite picture from our 6-day Bali adventure!
            </p>
            <p className="text-sm text-gray-600 mb-4">
              上传你在六天巴厘岛之旅中最喜欢的照片！
            </p>

            <div className="flex flex-col items-center gap-2">
              <label
                htmlFor="photo-upload"
                className={`
                  px-6 py-3 rounded-lg font-medium text-white cursor-pointer
                  transition-colors duration-200
                  ${
                    uploading || compressing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }
                `}
              >
                {compressing
                  ? "Compressing... / 压缩中..."
                  : uploading
                  ? "Uploading... / 上传中..."
                  : "Upload Photo / 上传照片"}
              </label>
              <p className="text-xs text-gray-500">
                Any size • Auto-compressed • JPEG, PNG, GIF, WebP
              </p>
              <p className="text-xs text-gray-500">
                任意大小 • 自动压缩 • JPEG, PNG, GIF, WebP
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h4 className="text-lg font-semibold mb-1 text-gray-800">
              Replace Your Photo?
            </h4>
            <h4 className="text-lg font-semibold mb-3 text-gray-800">
              替换你的照片？
            </h4>
            <p className="text-sm text-gray-600 mb-1">
              You already have a photo uploaded. Do you want to replace it with
              the new one?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              你已经上传了一张照片。要用新的照片替换它吗？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelReplace}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel / 取消
              </button>
              <button
                onClick={handleConfirmReplace}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Replace / 替换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
