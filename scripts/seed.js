// scripts/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // putanja do User modela

async function seed() {
    await mongoose.connect('mongodb://localhost:27017/dslack');

    const existingMain = await User.findOne({ main: true });
    if (!existingMain) {
        const hashedPassword = await bcrypt.hash('supersecret', 10); 
        await User.create({
            username: 'Danilo',
            email: 'danilovesovic@example.com',
            password: hashedPassword,
            main: true,
            role:"superadmin"
        });
        console.log('Main superadmin kreiran');
    } else {
        console.log('Main superadmin već postoji');
    }

    await mongoose.disconnect();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
