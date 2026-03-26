import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById } from "../services/userId.service";
import { getProfile } from "../services/profile.service";
import { motion } from "framer-motion";
import UserProfileBioSection from "../components/user-profile/UserProfileBioSection";
import UserProfileCard from "../components/user-profile/UserProfileCard";
import UserProfileEditControls from "../components/user-profile/UserProfileEditControls";
import UserProfileFeedbackSection from "../components/user-profile/UserProfileFeedbackSection";
import UserProfileHeader from "../components/user-profile/UserProfileHeader";
import UserProfileSkeleton from "../components/user-profile/UserProfileSkeleton";

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // Fetch user data
        const userData = await getUserById(id);
        if (userData) {
          setUser(userData);

          // Fetch profile data with avatar
          try {
            const profileData = await getProfile(id);
            setProfile(profileData.data);
          } catch (profileError) {
            console.log("Profile fetch failed:", profileError);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <UserProfileSkeleton message="Loading user..." />;
  if (!user) return <UserProfileSkeleton message="User not found" />;

  return (
    <div className="min-h-screen bg-linear-to-r from-orange-100/70 via-orange-50/40 to-orange-200/60 pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          <UserProfileHeader name={user?.name} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-1"
          >
            <UserProfileCard user={user} profile={profile} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            <UserProfileBioSection user={user} profile={profile} />
            <UserProfileEditControls />
            <UserProfileFeedbackSection profile={profile} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
