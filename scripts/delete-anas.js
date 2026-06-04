import mongoose from 'mongoose';
import Attendance from '../src/models/attendance.js'; 
import connectDB from '../src/lib/mongodb.js';

const deleteAnasAttendance = async () => {
    try {
        await connectDB();
        const teacherId = '6a20310f5d415c5f3da93c73';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = await Attendance.deleteMany({
            teacherId: teacherId,
            date: { $gte: today, $lt: tomorrow }
        });

        console.log(`Deleted ${result.deletedCount} attendance records for Anas Jilani today.`);
    } catch (err) {
        console.error("Deletion error:", err);
    } finally {
        process.exit();
    }
};

deleteAnasAttendance();

// To run this: MONGODB_URI=... node scripts/delete-anas.js
