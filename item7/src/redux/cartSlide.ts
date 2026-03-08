import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";

interface IFood {
  _id: string;
  name: string;
  category: string;
  price: string;
  quantity: number;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ICartSlice {
  cartData: IFood[];
  subTotal: number;
  deliveryFee: number;
  finalTotal: number;
}

const initialState: ICartSlice = {
  cartData: [],
  subTotal: 0,
  deliveryFee: 300,
  finalTotal: 300,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<IFood>) => {
      state.cartData.push(action.payload);
      cartSlice.caseReducers.calculateTotals(state);
    },
    increaseQuantity: (
      state,
      action: PayloadAction<string>,
    ) => {
      const item = state.cartData.find(
        (i) => i._id.toString() == action.payload,
      );
      if (item) {
        item.quantity = item.quantity + 1;
      }
      cartSlice.caseReducers.calculateTotals(state);
    },
    decreaseQuantity: (
      state,
      action: PayloadAction<string>,
    ) => {
      const item = state.cartData.find((i) => i._id == action.payload);
      if (item?.quantity && item.quantity > 1) {
        item.quantity = item.quantity - 1;
      } else {
        state.cartData = state.cartData.filter((i) => i._id !== action.payload);
      }
      cartSlice.caseReducers.calculateTotals(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartData = state.cartData.filter((i) => i._id !== action.payload);
      cartSlice.caseReducers.calculateTotals(state);
    },
    calculateTotals: (state) => {
      state.subTotal = state.cartData.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );
      state.deliveryFee =
        state.subTotal < 100
          ? 0
          : state.subTotal <= 7000
            ? 300
            : state.subTotal < 15000
              ? 500
              : 1000;

      state.finalTotal = state.subTotal + state.deliveryFee;
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  calculateTotals,
} = cartSlice.actions;
export default cartSlice.reducer;
