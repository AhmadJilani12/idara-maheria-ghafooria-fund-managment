import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      success: true,
      message: "MongoDB connected successfully 🎉",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "DB connection failed ❌",
        error: error.message,
      },
      { status: 500 }
    );
  }
}