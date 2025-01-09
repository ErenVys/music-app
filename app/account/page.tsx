import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ProfilePhotoUploader from "./ProfilePhotoUploader";

const ProfilePage = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Eğer kullanıcı yoksa (oturum açılmadıysa)
  if (!user || !user.email) {
    return (
      <div className="bg-neutral-900 rounded-lg h-full w-full flex items-center justify-center text-white">
        <h1 className="text-2xl font-bold">User not logged in!</h1>
      </div>
    );
  }

  // Supabase User Metadata’dan avatar_url okuyabiliriz (upload ettiğimizde oraya yazıyoruz)
  const avatarUrl = user.user_metadata?.avatar_url || "";

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full flex flex-col items-center justify-center text-white p-4">
      {/* Profil Fotoğrafı Bileşeni */}
      <ProfilePhotoUploader
        userId={user.id} // Supabase user.id
        avatarUrl={avatarUrl} // Mevcut avatar linki (varsa)
      />

      {/* Kullanıcı mesajı */}
      <h1 className="text-3xl font-semibold mt-4">
        Welcome, <span className="text-blue-400">{user.email}</span>
      </h1>
    </div>
  );
};

export default ProfilePage;
