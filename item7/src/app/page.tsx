import { auth } from '@/auth';
import AdminDashboard from '@/components/AdminDashboard';
import DeliveryBoy from '@/components/DeliveryBoy';
import EditRoleMobile from '@/components/EditRoleMobile';
import Footer from '@/components/Footer';
import GeoUpdater from '@/components/GeoUpdater';
import Nav from '@/components/Nav';
import UserDashboard from '@/components/UserDashboard';
import connectDb from '@/lib/db';
import Food, { IFood } from '@/models/food.model';
import User from '@/models/user.model';
import { redirect } from 'next/navigation';
import React from 'react'

const Home = async (props: {
  searchParams: Promise<{
    q: string;
  }>;
}) => {
  await connectDb();
  const session = await auth();
  const user = await User.findById(session?.user?.id);

  const searchParams = await props.searchParams;

  if (!user) {
    redirect("/login");
  }

  const inComplete =
    !user.mobile || !user.role || (!user.mobile && user.role == "user");

  if (inComplete) {
    return <EditRoleMobile />;
  }

  const plainUser = JSON.parse(JSON.stringify(user));

  let foodList: IFood[] = [];

  if (user.role === "user") {
    if (searchParams.q) {
      foodList = await Food.find({
        $or: [
          { name: { $regex: searchParams?.q || "", $options: "i" } },
          { category: { $regex: searchParams?.q || "", $options: "i" } },
        ],
      });
    } else {
      foodList= await Food.find({})
    }
  }
  return (
    <div>
      <Nav user={plainUser} />
      <GeoUpdater userId={plainUser._id} />
      {user.role == "user" ? (
        <UserDashboard foodList={foodList} />
      ) : user.role == "admin" ? (
        <AdminDashboard />
      ) : (
        <DeliveryBoy />
      )}
      <Footer />
    </div>
  );
};

export default Home