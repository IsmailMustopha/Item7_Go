import mongoose from "mongoose";

export interface IOrder {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: [
    {
      food: mongoose.Types.ObjectId;
      name: string;
      price: string;
      image: string;
      quantity: number;
    },
  ];
  totalAmount: number;
  isPaid: boolean;
  paymentMethod: "cod" | "online";
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  assignment?: mongoose.Types.ObjectId;
  assignedDeliveryBoy?: mongoose.Types.ObjectId;
  status: "pending" | "out of delivery" | "delivered";
  createdAt?: Date;
  updatedAt?: Date;
  deliveryOtp: string | null;
  deliveryOtpVerification: boolean;
  deliveredAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        name: String,
        price: String,
        image: String,
        quantity: Number,
      },
    ],
    totalAmount: Number,
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
      required: true,
    },
    address: {
      fullName: String,
      mobile: String,
      city: String,
      state: String,
      pincode: String,
      fullAddress: String,
      latitude: Number,
      longitude: Number,
    },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "out of delivery", "delivered"],
      default: "pending",
    },
    deliveryOtp: {
      type: String,
      default: null,
    },
    deliveryOtpVerification: {
      type: Boolean,
      default: false,
    },
    // deliveryFee: {
    //   type: Number,
    //   required: true,
    //   default: 0,
    // },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
