import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/db';
import nodemailer from 'nodemailer';

function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { firstname, lastname, email, password } = req.body;
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 special character.' });
  }
  try {
    const client = await clientPromise;
    const db = client.db('UserAuth');
    const users = db.collection('Users');
    const existing = await users.findOne({ email });
    if (existing && existing.status === 'active') return res.status(409).json({ message: 'Email already exists' });
    const code = generateCode();
    const expires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your Resume Tailor Verification Code',
      text: `Your verification code is: ${code}`,
      html: `<h2>Your Resume Tailor Verification Code</h2><p style='font-size:1.5rem;'><b>${code}</b></p>`
    });
    // Save user as pending
    await users.updateOne(
      { email },
      {
        $set: {
          firstname,
          lastname,
          email,
          password,
          status: 'pending',
          verificationCode: code,
          verificationExpires: expires,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    return res.status(201).json({ message: 'Verification code sent to email' });
  } catch (err) {
    console.error('Signup Error:', err); // Add this line
  return res.status(500).json({ message: 'Server error' });
  }
} 