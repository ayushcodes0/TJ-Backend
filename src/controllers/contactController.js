const nodemailer = require('nodemailer');

// Set up your Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email provider here (e.g., 'hotmail', 'outlook')
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Handles sending an email from the contact form.
 * This function will be called by the contact route.
 */
exports.sendEmail = async (req, res) => {
  const { fullName, email, message } = req.body;

  // Basic validation to ensure all fields are present
  if (!fullName || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'All fields are required.' });
  }

  // Define the email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // The founder's email address
    subject: `New Contact Form Submission from ${fullName}`,
    html: `
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <br>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    // Attempt to send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${process.env.EMAIL_USER}`);
    res.status(200).json({ status: 'success', message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send message.' });
  }
};