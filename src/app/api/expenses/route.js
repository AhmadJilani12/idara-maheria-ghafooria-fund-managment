import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/expense";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = {};
    if (category) {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (!body.category || !body.amount) {
      return NextResponse.json(
        { error: "Category and Amount are required" },
        { status: 400 }
      );
    }

    const expenseData = {
      date: body.date ? new Date(body.date) : new Date(),
      category: body.category,
      amount: Number(body.amount),
      description: body.description || "",
      paymentMethod: body.paymentMethod || "Cash",
    };

    const newExpense = await Expense.create(expenseData);
    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense", message: error.message },
      { status: 500 }
    );
  }
}
