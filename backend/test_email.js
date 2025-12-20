const dotenv = require('dotenv');
const sendEmail = require('./src/utils/sendEmail');

// Load env vars
dotenv.config();

const testEmail = async () => {
    const targetEmail = process.argv[2];
    
    if (!targetEmail) {
        console.error('Please provide an email address as an argument.');
        console.error('Usage: node test_email.js <email>');
        process.exit(1);
    }

    console.log('Testing email sending...');
    console.log('Target:', targetEmail);
    console.log('Env Check:', {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER ? '(Set)' : '(Not Set)',
        pass: process.env.EMAIL_PASS ? '(Set)' : '(Not Set)'
    });

    try {
        const info = await sendEmail({
            email: targetEmail,
            subject: 'Test Email from PataJob Debugger',
            message: '<h1>This is a test email</h1><p>If you see this, email sending is working.</p>'
        });
        console.log('SUCCESS: Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('FAILURE: Email sending failed.');
        console.error(error);
    }
};

testEmail();
