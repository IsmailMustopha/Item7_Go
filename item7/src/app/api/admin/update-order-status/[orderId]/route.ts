import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }, 
) {
  try {
    await connectDb();
    const { orderId } = await params;
    const { status } = await req.json();
    const order = await Order.findById(orderId).populate("user");

console.log("Full Order Address:", order.address);
    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 400 });
    }

    order.status = status;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let deliveryBoyspayload: any = [];

    if (status === "out of delivery" && !order.assignment) {
      const { latitude, longitude } = order.address || {};
      
      // 2. Convert and validate
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      
      // 3. Check if they are valid numbers
      if (isNaN(lng) || isNaN(lat)) {
        console.error("Invalid coordinates for order:", orderId, {
          longitude,
          latitude,
        });
        // Decide how to handle this: update status anyway or return error?
        await order.save();
        return NextResponse.json(
          {
            message:
            "Order address has invalid coordinates. Cannot find nearby delivery boys.",
          },
          { status: 400 },
        );
      }
      
      // 4. Proceed with the query only if valid
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat], // GeoJSON uses [longitude, latitude]
            },
            $maxDistance: 10000,
          },
        },
      });
      
      const nearByIds = nearByDeliveryBoys.map((b) => b._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $in: ["assigned"] },
        // status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((b) => String(b)));

      const availableDeliveryBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );

      const candidates = availableDeliveryBoys.map((b) => b._id);

      if (candidates.length == 0) {
        await order.save();
        await emitEventHandler("order-status-update", {
          orderId: order._id,
          status: order.status,
        });
        return NextResponse.json(
          { message: "there is no available Delivery boys" },
          { status: 200 },
        );
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        brodcastedTo: candidates,
        status: "broadcasted",
      });

      await deliveryAssignment.populate("order");
      for (const boyId of candidates) {
        const boy = await User.findById(boyId);
        if (boy.socketId) {
          await emitEventHandler(
            "new-assignment",
            deliveryAssignment,
            boy.socketId,
          );
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      ((order.assignment = deliveryAssignment._id),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (deliveryBoyspayload = availableDeliveryBoys.map((b) => ({
          id: b._id,
          name: b.name,
          mobile: b.mobile,
          latitude: b.location.coordinates[1],
          longitude: b.location.coordinates[0],
        }))));

      await deliveryAssignment.populate("order");
    }

    await order.save();
    await order.populate("user");
    await emitEventHandler("order-status-update", {
      orderId: order._id,
      status: order.status,
    });

    return NextResponse.json(
      {
        assignment: order.assignment?._id,
        availableBoys: deliveryBoyspayload,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: `update status error ${error}`,
      },
      { status: 500 },
    );
  }
}
