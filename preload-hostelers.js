require('dotenv').config({ path: './api/.env' });
const mongoose = require('mongoose');

// Define the Schema (matches your api/index.js)
const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, sparse: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hosteler', 'day-scholar'], required: true },
  room_no: { type: String },
  hostel: { type: String, enum: ['Boys', 'Girls', 'N/A'], default: 'N/A' },
  couponCount: { type: Number, default: 0 },
  isActivated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// --- STUDENT LIST ---
const hostelers = [
  // --- GIRLS HOSTEL ---
  { name: "PASWAN", room_no: "001", hostel: "Girls" },
  { name: "VAISHYA KASHID", room_no: "002", hostel: "Girls" },
  { name: "KHUSHI G", room_no: "003", hostel: "Girls" },
  { name: "HEMANI PATIL", room_no: "004", hostel: "Girls" },
  { name: "GARGI CHOUDHARI", room_no: "005", hostel: "Girls" },
  { name: "GARIMA G", room_no: "006", hostel: "Girls" },
  { name: "SHARAYU", room_no: "007", hostel: "Girls" },
  { name: "KRANTI N", room_no: "008", hostel: "Girls" },
  { name: "VAISHNAVI", room_no: "009", hostel: "Girls" },
  { name: "ANUSHKA SAWANT", room_no: "101", hostel: "Girls" },
  { name: "ADITYA KEDAR", room_no: "102", hostel: "Girls" },
  { name: "APURVA NAIK", room_no: "103", hostel: "Girls" },
  { name: "PRADNYA KOKALE", room_no: "104", hostel: "Girls" },
  { name: "JIDANIT GANDHI", room_no: "105", hostel: "Girls" },
  { name: "RADHIKA GHODKE", room_no: "106", hostel: "Girls" },
  { name: "AKANKSHA DESHMUKH", room_no: "107", hostel: "Girls" },
  { name: "SAKSHI BADLLE", room_no: "108", hostel: "Girls" },
  { name: "SANGITA SHENDE", room_no: "109", hostel: "Girls" },
  { name: "PRIYA SATPUTE", room_no: "110", hostel: "Girls" },
  { name: "KOMAL TAWAR", room_no: "111", hostel: "Girls" },
  { name: "TANVI SHAH", room_no: "112", hostel: "Girls" },
  { name: "RUTVIKA TATAR", room_no: "113", hostel: "Girls" },
  { name: "SHRAVANI DESHMUKH", room_no: "114", hostel: "Girls" },
  { name: "KINJAL KARTE", room_no: "115", hostel: "Girls" },
  { name: "VAISHNAVI B", room_no: "116", hostel: "Girls" },
  { name: "NIHALI PAWAR", room_no: "117", hostel: "Girls" },
  { name: "ISHWARI KAMADKAR", room_no: "201", hostel: "Girls" },
  { name: "SWARA TAMBOLI", room_no: "202", hostel: "Girls" },
  { name: "ARYA PATIL", room_no: "203", hostel: "Girls" },
  { name: "ARTI PAWAR", room_no: "204", hostel: "Girls" },
  { name: "AMRUTA SOMWANSHI", room_no: "205", hostel: "Girls" },
  { name: "YADNYA BOBTHE", room_no: "206", hostel: "Girls" },
  { name: "SNEHA MAHALAN", room_no: "207", hostel: "Girls" },
  { name: "SANSKRUTI JOSHI", room_no: "208", hostel: "Girls" },
  { name: "RENUKA", room_no: "209", hostel: "Girls" },
  { name: "DRISHTI", room_no: "210", hostel: "Girls" },
  { name: "PURVA PATIL", room_no: "211", hostel: "Girls" },
  { name: "NICOLE PHILIP", room_no: "212", hostel: "Girls" },
  { name: "MUDEAR K", room_no: "213", hostel: "Girls" },
  { name: "SHUBHANGI P", room_no: "214", hostel: "Girls" },
  { name: "SANIKA P", room_no: "215", hostel: "Girls" },
  { name: "ISHITA PARATE", room_no: "216", hostel: "Girls" },
  { name: "WAFAS", room_no: "217", hostel: "Girls" },
  { name: "SHREYA KAUL", room_no: "218", hostel: "Girls" },
  { name: "SIDDHI SHINDE", room_no: "301", hostel: "Girls" },
  { name: "BENETTA MATHEW", room_no: "302", hostel: "Girls" },
  { name: "APURVA VEKALE", room_no: "303", hostel: "Girls" },
  { name: "RENIKA BAIS", room_no: "304", hostel: "Girls" },
  { name: "VEDASHRI DESHMUKH", room_no: "305", hostel: "Girls" },
  { name: "GAYATRI GAIKWAD", room_no: "306", hostel: "Girls" },
  { name: "SAKSHI SHELKE", room_no: "307", hostel: "Girls" },

  // --- BOYS HOSTEL ---
  { name: "KEDAR DEVNANKAR", room_no: "101", hostel: "Boys" },
  { name: "UDAY UKANDE", room_no: "102", hostel: "Boys" },
  { name: "YASH PALWAL", room_no: "103", hostel: "Boys" },
  { name: "KESHAV RATHI", room_no: "104", hostel: "Boys" },
  { name: "PRERNA PANHALE", room_no: "105", hostel: "Boys" },
  { name: "NIKUNJ DESAI", room_no: "106", hostel: "Boys" },
  { name: "PARTH JAGDALE", room_no: "107", hostel: "Boys" },
  { name: "BHAVESH KADAM", room_no: "108", hostel: "Boys" },
  { name: "TANMAY NAVLAKHE", room_no: "109", hostel: "Boys" },
  { name: "HARSHAL BELGAMWAR", room_no: "111", hostel: "Boys" },
  { name: "HRISHIKESH MIRASHE", room_no: "112", hostel: "Boys" },
  { name: "ADITYA KATEPALLEWAR", room_no: "113", hostel: "Boys" },
  { name: "VAISHNAV MANKAR", room_no: "114", hostel: "Boys" },
  { name: "OMKAR MUTYALWAR", room_no: "115", hostel: "Boys" },
  { name: "OM JADHAV", room_no: "116", hostel: "Boys" },
  { name: "VEDANT CHAVAN", room_no: "117", hostel: "Boys" },
  { name: "SWAPNIL WAGHMODE", room_no: "201", hostel: "Boys" },
  { name: "TANMAY PATIL", room_no: "202", hostel: "Boys" },
  { name: "ARIHANT BARDIA", room_no: "203", hostel: "Boys" },
  { name: "SAI NAGARDDY", room_no: "204", hostel: "Boys" },
  { name: "ADITYA JAGDALE", room_no: "205", hostel: "Boys" },
  { name: "PUSHKAR CHOUDHARI", room_no: "206", hostel: "Boys" },
  { name: "HARDIK GUJARATHI", room_no: "207", hostel: "Boys" },
  { name: "AKSHAY GADHAVE", room_no: "208", hostel: "Boys" },
  { name: "VEDANT N", room_no: "209", hostel: "Boys" },
  { name: "SIDDHESH BARAF", room_no: "210", hostel: "Boys" },
  { name: "PRANAV MALI", room_no: "211", hostel: "Boys" },
  { name: "PRANAV MANE", room_no: "212", hostel: "Boys" },
  { name: "YARAD PAWAR", room_no: "213", hostel: "Boys" },
  { name: "JEEVESH WAGH", room_no: "214", hostel: "Boys" },
  { name: "OMKAR SANKPAL", room_no: "215", hostel: "Boys" },
  { name: "VAIBHAV KADAM", room_no: "216", hostel: "Boys" },
  { name: "MAYUR PIMPLE", room_no: "217", hostel: "Boys" },
  { name: "PRANAY KALE", room_no: "301", hostel: "Boys" },
  { name: "ROLL FERNANDIS", room_no: "302", hostel: "Boys" },
  { name: "ABHIRAJ K", room_no: "303", hostel: "Boys" },
  { name: "HARSHIT CHANDE", room_no: "304", hostel: "Boys" },
  { name: "SAGAR M", room_no: "305", hostel: "Boys" },
  { name: "VAIBHAV DAFAR", room_no: "306", hostel: "Boys" },
  { name: "OM LAVANDE", room_no: "307", hostel: "Boys" },
  { name: "VEDANT VERAWAR", room_no: "308", hostel: "Boys" },
  { name: "NAMAN J", room_no: "309", hostel: "Boys" },
  { name: "PARTH PAWAR", room_no: "310", hostel: "Boys" },
  { name: "TANIKSHA PATE", room_no: "311", hostel: "Boys" },
  { name: "HIMANSHU C", room_no: "312", hostel: "Boys" },
  { name: "VAIBHAV PILLAI", room_no: "313", hostel: "Boys" },
  { name: "HARSH SHINDE", room_no: "314", hostel: "Boys" },
  { name: "VEDANT DESAI", room_no: "315", hostel: "Boys" },
  { name: "BALAJI BORDE", room_no: "316", hostel: "Boys" },
  { name: "RAFAY HUSAIN", room_no: "317", hostel: "Boys" },
  { name: "ESHAN SINGH", room_no: "401", hostel: "Boys" },
  { name: "ROHIT GAIKWAD", room_no: "402", hostel: "Boys" },
  { name: "ADITYA PATIL", room_no: "403", hostel: "Boys" },
  { name: "RONIT S", room_no: "404", hostel: "Boys" },
  { name: "ATHARV THORAT", room_no: "405", hostel: "Boys" },
  { name: "SOMIK DESAI", room_no: "406", hostel: "Boys" },
  { name: "SHAHI DANDE", room_no: "407", hostel: "Boys" },
  { name: "HARISHANKAR S", room_no: "408", hostel: "Boys" },
  { name: "ROBIN KAUL", room_no: "409", hostel: "Boys" },
  { name: "KEYOOR", room_no: "410", hostel: "Boys" },
  { name: "PRATHMESH BAGAD", room_no: "411", hostel: "Boys" },
  { name: "SAMBHAJI JADHAV", room_no: "412", hostel: "Boys" },
  { name: "KARTIK TERORE", room_no: "413", hostel: "Boys" },
  { name: "ANISH", room_no: "414", hostel: "Boys" },
  { name: "PRANAV", room_no: "415", hostel: "Boys" },
  { name: "OMKAR MUNDLIK", room_no: "416", hostel: "Boys" },
  { name: "PAWANKUMAR PARAD", room_no: "417", hostel: "Boys" },
  { name: "SAGAR CHAVAN", room_no: "501", hostel: "Boys" },
  { name: "SOHAM PARDKAR", room_no: "502", hostel: "Boys" },
  { name: "YASH PISAR", room_no: "503", hostel: "Boys" },
  { name: "ARNAV NAYAR", room_no: "504", hostel: "Boys" },
  { name: "KRIYAL KARAR", room_no: "505", hostel: "Boys" },
  { name: "TANMAY PATI", room_no: "506", hostel: "Boys" },
  { name: "TEJAS GAWALI", room_no: "507", hostel: "Boys" },
  { name: "PRAJWAL N", room_no: "508", hostel: "Boys" },
  { name: "AMARTYA KANADE", room_no: "509", hostel: "Boys" }
];

async function preload() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected.");

    for (const s of hostelers) {
      // Check if this specific person in this specific hostel already exists
      const exists = await User.findOne({ 
        name: s.name, 
        room_no: s.room_no.toUpperCase(),
        hostel: s.hostel
      });
      
      if (!exists) {
        const newUser = new User({
          userId: `HOSTEL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          name: s.name,
          room_no: s.room_no.toUpperCase(),
          hostel: s.hostel,
          password: s.room_no.toUpperCase(), // Initial password is Room No
          role: 'hosteler',
          isActivated: false
        });
        await newUser.save();
        console.log(`+ Added: ${s.name} (${s.hostel} Hostel - Room ${s.room_no})`);
      } else {
        console.log(`~ Skipped (Already exists): ${s.name} (${s.hostel})`);
      }
    }

    console.log("\n✅ Preloading complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error preloading data:", err);
    process.exit(1);
  }
}

preload();
