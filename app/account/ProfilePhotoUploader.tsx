"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ProfilePhotoUploaderProps {
  avatarUrl?: string; // Mevcut kullanıcı avatarı (varsa)
  userId?: string; // Supabase user.id bilgisi
}

export default function ProfilePhotoUploader({
  avatarUrl,
  userId,
}: ProfilePhotoUploaderProps) {
  const supabase = createClientComponentClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(avatarUrl || "");
  const [uploading, setUploading] = useState(false);

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("Please select an image to upload.");
      }
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1) Supabase Storage’a resmi yükle
      const { error: uploadError } = await supabase.storage
        .from("avatars") // Bucket adı
        .upload(filePath, file, {
          upsert: true, // Aynı isimde dosya varsa üzerine yaz
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2) Public URL’sini al
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      if (!data) {
        throw new Error("Could not get public URL");
      }

      const publicUrl = data.publicUrl;
      setImageUrl(publicUrl);

      // 3) Kullanıcı metadata’sını güncelle (avatar_url)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Profil resmi dairesi */}
      <div className="relative w-48 h-48 rounded-full overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt="Profile" fill className="object-cover" />
        ) : (
          <div className="bg-gray-600 w-full h-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">No Photo</span>
          </div>
        )}
      </div>

      {/* “Choose photo” butonu */}
      <button
        onClick={handleChoosePhoto}
        disabled={uploading}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        {uploading ? "Uploading..." : "Choose photo"}
      </button>

      {/* Gizli file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
