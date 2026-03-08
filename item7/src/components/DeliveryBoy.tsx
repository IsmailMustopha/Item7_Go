import React from 'react'
import DeliveryBoyDashboard from './DeliveryBoyDashboad'
import connectDb from '@/lib/db'
import { auth } from '@/auth'
import Order from '@/models/order.model'

// const DeliveryBoy = async () => {
//   await connectDb();
//   const session = await auth();
//   const deliveryBoyId = session?.user?.id;

//   // Fetch orders that were assigned to this user and successfully delivered
//   const orders = await Order.find({
//     assignedDeliveryBoy: deliveryBoyId,
//     deliveryOtpVerification: true,
//   });

//   const todayString = new Date().toDateString();

//   // Filter for orders delivered today and sum their actual deliveryFee
//   const todaysEarning = orders
//     .filter((o) => {
//       // Ensure deliveredAt exists and matches today
//       return (
//         o.updatedAt && new Date(o.updatedAt).toDateString() === todayString
//       );
//     })
//     .reduce((total, order) => {
//       // Add the deliveryFee stored in the database for this specific order
//       // Fallback to 0 if for some reason the field is missing
//       return total + (order.deliveryFee || 0);
//     }, 0);

//   return (
//     <>
//       <DeliveryBoyDashboard earning={todaysEarning} />
//     </>
//   );
// };

const DeliveryBoy = async () => {
  await connectDb()
  const session = await auth()
  const deliveryBoyId = session?.user?.id

  const orders = await Order.find({
    assignedDeliveryBoy: deliveryBoyId,
    deliveryOtpVerification: true
  })

  const today = new Date().toDateString()
  const todayOrders = orders.filter((o) => new Date(o.deliveredAt).toDateString() === today).length
  const todaysEarning = todayOrders * 300

  return (
    <>
      <DeliveryBoyDashboard earning={todaysEarning} />
    </>
  )
}

export default DeliveryBoy