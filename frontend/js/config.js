// Configuration for the Canteen Attendance System
const IP_ADDRESS = "10.195.5.104";
const PORT = 3000;
const BASE_URL = `http://${IP_ADDRESS}:${PORT}`;

// Meal Timetable Data (Initial)
const MEAL_TIMETABLE = {
    "Monday": { "Lunch": "Dal Makhani, Rice, Roti", "Dinner": "Paneer Butter Masala, Roti" },
    "Tuesday": { "Lunch": "Rajma, Rice, Roti", "Dinner": "Mix Veg, Roti" },
    "Wednesday": { "Lunch": "Chole Bhature", "Dinner": "Aloo Gobhi, Roti" },
    "Thursday": { "Lunch": "Kadhi Pakora, Rice", "Dinner": "Matar Paneer, Roti" },
    "Friday": { "Lunch": "Veg Pulao, Raita", "Dinner": "Dal Tadka, Rice, Roti" },
    "Saturday": { "Lunch": "Aloo Paratha, Curd", "Dinner": "Special Thali" },
    "Sunday": { "Lunch": "Veg Biryani", "Dinner": "Light Khichdi" }
};