const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 50000, // Wait up to 50 seconds for primary
            socketTimeoutMS: 45000,        // Close sockets after 45 seconds of inactivity
        });
        
        const newEmail = process.env.EMAIL_USER;
        const newPassword = process.env.EMAIL_PASS;
        
        // Potential previous emails to migrate from
        const oldEmails = ['peterngacha85@gmail.com', 'peterndegwangacha@gmail.com', 'admin@lsm.com'];
        
        let admin = await User.findOne({ email: newEmail });
        
        if (!admin) {
            // Try to find by any of the old emails to rename the account
            for (const email of oldEmails) {
                admin = await User.findOne({ email });
                if (admin) break;
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        if (admin) {
            console.log(`Updating existing admin: ${admin.email} -> ${newEmail}`);
            admin.email = newEmail;
            admin.password = hashedPassword;
            admin.name = 'System Admin'; 
            admin.role = 'admin'; 
            if (!admin.whatsapp) admin.whatsapp = '254700000000';
            
            await admin.save();
            console.log('Admin credentials updated successfully.');
        } else {
            console.log('Creating new admin user...');
            admin = new User({
                name: 'System Admin',
                email: newEmail,
                password: hashedPassword,
                role: 'admin',
                whatsapp: '254700000000'
            });
            await admin.save();
            console.log('New admin user created successfully.');
        }
        
        process.exit();
    } catch (error) {
        console.error('Error creating/updating admin:', error);
        process.exit(1);
    }
};

createAdmin();
