# EmailJS Setup Guide for Booking Confirmation Emails

## Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/) and create a free account
2. Verify your email address

## Step 2: Create Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Note down your **Service ID**

## Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template structure:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Booking Confirmation</title>
</head>
<body>
    <h1>Booking Confirmation</h1>
    <p>Dear {{to_name}},</p>
    
    <h2>Booking Details</h2>
    <p><strong>Booking ID:</strong> HT-{{booking_id}}</p>
    <p><strong>Status:</strong> {{status}}</p>
    <p><strong>Payment Method:</strong> {{payment_method}}</p>
    <p><strong>Total Amount:</strong> Rs {{total_amount}}</p>
    
    <h2>Customer Information</h2>
    <p><strong>Name:</strong> {{customer_name}}</p>
    <p><strong>Email:</strong> {{customer_email}}</p>
    <p><strong>Phone:</strong> {{customer_phone}}</p>
    
    <h2>Package Information</h2>
    <p><strong>Package:</strong> {{package_name}}</p>
    <p><strong>Type:</strong> {{booking_type}}</p>
    
    <h2>Booking Summary</h2>
    <pre>{{booking_summary}}</pre>
    
    <h2>Ticket Details</h2>
    <pre>{{tickets}}</pre>
    
    <h2>Bank Transfer Details</h2>
    <pre>{{bank_details}}</pre>
    
    <h2>Important Notes</h2>
    <ul>
        <li>Payment must be made within 3 hours to avoid booking cancellation</li>
        <li>Please include your booking reference when making the payment</li>
        <li>You will receive a confirmation email once payment is received</li>
        <li>For any questions, please contact our support team</li>
    </ul>
    
    <p>Thank you for choosing our service!</p>
</body>
</html>
```

4. Save the template and note down your **Template ID**

## Step 4: Get Your Public Key
1. Go to "Account" → "API Keys" in your dashboard
2. Copy your **Public Key**

## Step 5: Update Email Service Configuration
1. Open `src/app/services/email.service.ts`
2. Replace the placeholder values with your actual credentials:

```typescript
private readonly EMAILJS_PUBLIC_KEY = 'YOUR_ACTUAL_PUBLIC_KEY';
private readonly EMAILJS_SERVICE_ID = 'YOUR_ACTUAL_SERVICE_ID';
private readonly EMAILJS_TEMPLATE_ID = 'YOUR_ACTUAL_TEMPLATE_ID';
```

## Step 6: Test the Email Functionality
1. Run your Angular application
2. Complete a booking process
3. On the confirmation page, click "Send Confirmation Email"
4. Check if the email is received

## EmailJS Free Plan Limits
- 200 emails per month
- 2 email templates
- 1 email service

## Troubleshooting
- Make sure all EmailJS credentials are correct
- Check browser console for any JavaScript errors
- Verify that the EmailJS script is loaded properly
- Ensure your email service is properly configured

## Template Variables Available
The following variables are automatically passed to your EmailJS template:
- `to_email`: Customer's email address
- `to_name`: Customer's name
- `booking_id`: Booking reference ID
- `customer_name`: Customer's full name
- `customer_email`: Customer's email
- `customer_phone`: Customer's phone number
- `payment_method`: Payment method used
- `status`: Booking status
- `total_amount`: Total booking amount
- `package_name`: Package name (if applicable)
- `booking_type`: Type of booking
- `booking_summary`: JSON string of booking details
- `tickets`: JSON string of ticket information
- `bank_details`: JSON string of bank transfer details
- `html_content`: Complete HTML email content 