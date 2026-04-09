const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
    if (!process.env.SENDGRID_API_KEY) {
        console.warn("SENDGRID_API_KEY is not defined. Skipping email send.");
        return;
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: options.email,
        from: "alert@smartpostai.online",
        replyTo: "alert@smartpostai.online",
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error("Error sending email via SendGrid:", error);
    }
};

exports.sendVerificationEmail = async (name, email, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const message = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F9FAFB; padding: 40px 20px; color: #1F2937;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #4F46E5; padding: 40px; text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 20px;">🏆</div>
                    <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Welcome Abroad!</h1>
                </div>
                
                <div style="padding: 40px;">
                    <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin-top: 0;">Hi ${name},</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 30px;">
                        Thanks for joining <strong>Contest Tracker</strong>! You're just one step away from receiving personalized, automated contest reminders that keep you ahead of the competition.
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${verifyUrl}" style="background-color: #4F46E5; color: #FFFFFF; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);">
                            Verify Your Email
                        </a>
                    </div>
                    
                    <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin-top: 30px;">
                        <p style="font-size: 14px; color: #6B7280; font-style: italic; margin: 0; word-break: break-all;">
                            <strong>If the button doesn't work:</strong><br>
                            <a href="${verifyUrl}" style="color: #4F46E5; text-decoration: none;">${verifyUrl}</a>
                        </p>
                    </div>
                </div>
                
                <div style="padding: 30px; text-align: center; background-color: #F9FAFB; border-top: 1px solid #F3F4F6;">
                    <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                        © ${new Date().getFullYear()} Contest Tracker. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    `;

    await sendEmail({ email: email, subject: '🏆 Welcome to Contest Tracker - Verify Your Email', html: message });
};

exports.sendPasswordResetEmail = async (name, email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const message = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F9FAFB; padding: 40px 20px; color: #1F2937;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #EF4444; padding: 40px; text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 20px;">🔐</div>
                    <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Password Security</h1>
                </div>
                
                <div style="padding: 40px;">
                    <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin-top: 0;">Hi ${name},</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 30px;">
                        Somebody (hopefully you) requested a password reset for your <strong>Contest Tracker</strong> account. Click the button below to choose a new password.
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetUrl}" style="background-color: #EF4444; color: #FFFFFF; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #6B7280; font-style: italic; margin-top: 30px;">
                        If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                </div>
                
                <div style="padding: 30px; text-align: center; background-color: #F9FAFB; border-top: 1px solid #F3F4F6;">
                    <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                        © ${new Date().getFullYear()} Contest Tracker. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    `;

    await sendEmail({ email: email, subject: '🔐 Password Reset Request - Contest Tracker', html: message });
};

exports.sendContestReminderEmail = async (users, contest) => {
    const getPlatformAccent = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('codeforces')) return '#EF4444'; // Red
        if (p.includes('codechef')) return '#F97316';   // Orange
        if (p.includes('atcoder')) return '#1F2937';     // Dark
        if (p.includes('leetcode')) return '#FBBF24';   // Yellow
        if (p.includes('geeksforgeeks')) return '#16A34A'; // Green
        return '#4F46E5'; // Default Indigo
    };

    const accentColor = getPlatformAccent(contest.platform);

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const message = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F9FAFB; padding: 40px 20px; color: #1F2937;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #F3F4F6;">
                    <div style="background-color: ${accentColor}; padding: 30px; text-align: center;">
                        <span style="background-color: rgba(255,255,255,0.2); color: #FFFFFF; padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">
                            Upcoming Contest
                        </span>
                        <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 15px 0 0; letter-spacing: -0.025em;">
                            ${contest.platform}
                        </h1>
                    </div>
                    
                    <div style="padding: 40px;">
                        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-top: 0;">Hi ${user.name || 'Contestant'},</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 30px;">
                            A new challenge is waiting for you! A contest is starting in less than an hour. Review the details below and get ready!
                        </p>
                        
                        <div style="background-color: #F9FAFB; border-left: 4px solid ${accentColor}; border-radius: 12px; padding: 25px; margin: 30px 0;">
                            <h3 style="margin: 0 0 15px; font-size: 18px; font-weight: 800; color: #111827;">${contest.name}</h3>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 5px 0; font-size: 14px; color: #6B7280; width: 100px;">Starts At</td>
                                    <td style="padding: 5px 0; font-size: 14px; color: #111827; font-weight: 700;">
                                        ${new Date(contest.startTime).toLocaleString(undefined, { timeZone: user.timezone || 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; font-size: 14px; color: #6B7280;">Duration</td>
                                    <td style="padding: 5px 0; font-size: 14px; color: #111827; font-weight: 700;">
                                        ${Math.floor(contest.duration / 3600)}h ${Math.floor((contest.duration % 3600) / 60)}m
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0 20px;">
                            <a href="${contest.url}" style="background-color: #111827; color: #FFFFFF; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                                Go To Contest
                            </a>
                        </div>
                    </div>
                    
                    <div style="padding: 30px; text-align: center; background-color: #F9FAFB; border-top: 1px solid #F3F4F6;">
                        <p style="font-size: 11px; color: #9CA3AF; margin: 0; line-height: 1.5;">
                            You are receiving this because you're a verified user on Contest Tracker.<br>
                            © ${new Date().getFullYear()} Contest Tracker. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;

        await sendEmail({ email: user.email, subject: `🚀 Starts Soon: ${contest.name} on ${contest.platform}`, html: message });
    }
};

exports.sendEmail = sendEmail;
