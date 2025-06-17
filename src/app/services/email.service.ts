import { Injectable } from '@angular/core';

declare var emailjs: any;

export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  bookingData: any;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // EmailJS configuration - you'll need to replace these with your actual EmailJS credentials
  private readonly EMAILJS_PUBLIC_KEY = '9maDXjCHA68NjWaiQ';
  private readonly EMAILJS_SERVICE_ID = 'service_jtabgaw';
  private readonly EMAILJS_TEMPLATE_ID = '';

  constructor() {
    // Initialize EmailJS with your public key
    if (typeof emailjs !== 'undefined') {
      emailjs.init(this.EMAILJS_PUBLIC_KEY);
    }
  }

  sendBookingConfirmationEmail(emailData: EmailData): Promise<any> {
    const templateParams = {
      to_email: emailData.to,
      to_name: emailData.bookingData.customerName,
      booking_id: emailData.bookingData.bookingId,
      booking_summary: JSON.stringify(emailData.bookingData.bookingSummary, null, 2),
      customer_name: emailData.bookingData.customerName,
      customer_email: emailData.bookingData.customerEmail,
      customer_phone: emailData.bookingData.customerPhone,
      payment_method: emailData.bookingData.paymentMethod,
      status: emailData.bookingData.status,
      total_amount: emailData.bookingData.bookingSummary.total,
      package_name: emailData.bookingData.packageName || 'N/A',
      booking_type: emailData.bookingData.bookingType || 'N/A',
      bank_details: JSON.stringify(emailData.bookingData.bankDetails, null, 2),
      tickets: JSON.stringify(emailData.bookingData.tickets, null, 2),
      html_content: emailData.htmlContent
    };

    return new Promise((resolve, reject) => {
      if (typeof emailjs !== 'undefined') {
        emailjs.send(
          this.EMAILJS_SERVICE_ID,
          this.EMAILJS_TEMPLATE_ID,
          templateParams
        ).then(
          (response: any) => {
            console.log('Email sent successfully:', response);
            resolve(response);
          },
          (error: any) => {
            console.error('Email sending failed:', error);
            reject(error);
          }
        );
      } else {
        reject(new Error('EmailJS is not loaded. Please check if the EmailJS script is included.'));
      }
    });
  }

  generateBookingEmailHTML(bookingData: any): string {
    const {
      bookingId,
      customerName,
      customerEmail,
      customerPhone,
      bookingSummary,
      bankDetails,
      bookingType,
      packageName,
      tickets,
      paymentMethod,
      status,
      verifiedEmail
    } = bookingData;

    const ticketRows = tickets && tickets.length > 0 
      ? tickets.map((ticket: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${ticket.name} Ticket</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${ticket.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">Rs ${ticket.price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">Rs ${ticket.price * ticket.quantity}</td>
          </tr>
        `).join('')
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .section { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .section h2 { color: #007bff; margin-top: 0; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .row:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 1.2em; color: #28a745; }
          .bank-details { background: #e9ecef; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .ticket-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .ticket-table th, .ticket-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .ticket-table th { background: #f8f9fa; font-weight: bold; }
          .status-pending { color: #ffc107; font-weight: bold; }
          .status-confirmed { color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
            <p>Thank you for your booking!</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h2>Booking Reference</h2>
              <div class="row">
                <span>Booking ID:</span>
                <span><strong>HT-${bookingId}</strong></span>
              </div>
              <div class="row">
                <span>Status:</span>
                <span class="status-pending">${status}</span>
              </div>
            </div>

            <div class="section">
              <h2>Customer Details</h2>
              <div class="row">
                <span>Name:</span>
                <span>${customerName}</span>
              </div>
              <div class="row">
                <span>Email:</span>
                <span>${customerEmail}</span>
              </div>
              <div class="row">
                <span>Phone:</span>
                <span>${customerPhone}</span>
              </div>
            </div>

            ${bookingType === 'package' ? `
            <div class="section">
              <h2>Package Details</h2>
              <div class="row">
                <span>Package:</span>
                <span>${packageName}</span>
              </div>
              <div class="row">
                <span>Type:</span>
                <span>${bookingSummary.type}</span>
              </div>
              ${bookingSummary.packageId ? `
              <div class="row">
                <span>Package ID:</span>
                <span>${bookingSummary.packageId}</span>
              </div>
              ` : ''}
            </div>
            ` : `
            <div class="section">
              <h2>Hotel Details</h2>
              <div class="row">
                <span>Hotel:</span>
                <span>${bookingSummary.hotelName || 'N/A'}</span>
              </div>
              <div class="row">
                <span>Check In:</span>
                <span>${bookingSummary.checkIn || 'N/A'}</span>
              </div>
              <div class="row">
                <span>Check Out:</span>
                <span>${bookingSummary.checkOut || 'N/A'}</span>
              </div>
            </div>
            `}

            ${tickets && tickets.length > 0 ? `
            <div class="section">
              <h2>Ticket Details</h2>
              <table class="ticket-table">
                <thead>
                  <tr>
                    <th>Ticket Type</th>
                    <th>Quantity</th>
                    <th>Price per Ticket</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticketRows}
                </tbody>
              </table>
            </div>
            ` : ''}

            <div class="section">
              <h2>Payment Information</h2>
              <div class="row">
                <span>Payment Method:</span>
                <span>${paymentMethod}</span>
              </div>
              <div class="row">
                <span>Total Amount:</span>
                <span class="total">Rs ${bookingSummary.total}</span>
              </div>
              ${bookingSummary.discount ? `
              <div class="row">
                <span>Discount:</span>
                <span>Rs ${bookingSummary.discount}</span>
              </div>
              ` : ''}
            </div>

            ${bankDetails && Object.keys(bankDetails).length > 0 ? `
            <div class="section">
              <h2>Bank Transfer Details</h2>
              <div class="bank-details">
                <div class="row">
                  <span>Bank Name:</span>
                  <span>${bankDetails.bankName}</span>
                </div>
                <div class="row">
                  <span>Account Name:</span>
                  <span>${bankDetails.bankAccountName}</span>
                </div>
                <div class="row">
                  <span>Account Number:</span>
                  <span>${bankDetails.accountNumber}</span>
                </div>
                <div class="row">
                  <span>Branch:</span>
                  <span>${bankDetails.branch}</span>
                </div>
                <p style="margin-top: 15px; font-weight: bold; color: #dc3545;">
                  Please include your booking reference <strong>HT-${bookingId}</strong> when making the payment
                </p>
              </div>
            </div>
            ` : ''}

            <div class="section">
              <h2>Important Notes</h2>
              <ul>
                <li>Payment must be made within 3 hours to avoid booking cancellation</li>
                <li>Please include your booking reference when making the payment</li>
                <li>You will receive a confirmation email once payment is received</li>
                <li>For any questions, please contact our support team</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
