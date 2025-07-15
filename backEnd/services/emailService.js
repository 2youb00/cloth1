const nodemailer = require("nodemailer")
const SiteSettings = require("../models/SiteSettings")

class EmailService {
  constructor() {
    this.transporter = null
  }

  async initializeTransporter() {
    try {
      const settings = await SiteSettings.findOne()
      if (!settings || !settings.emailNotifications.enabled) {
        return false
      }

      this.transporter = nodemailer.createTransport({
        host: settings.emailNotifications.smtpHost,
        port: settings.emailNotifications.smtpPort,
        secure: settings.emailNotifications.smtpPort === 465,
        auth: {
          user: settings.emailNotifications.smtpUser,
          pass: settings.emailNotifications.smtpPassword,
        },
      })

      return true
    } catch (error) {
      console.error("Error initializing email transporter:", error)
      return false
    }
  }

  async sendNewOrderNotification(order) {
    try {
      const initialized = await this.initializeTransporter()
      if (!initialized) {
        console.log("Email notifications not configured or disabled")
        return
      }

      const settings = await SiteSettings.findOne()
      if (!settings.emailNotifications.adminEmail) {
        console.log("Admin email not configured")
        return
      }

      const orderItems = order.products
        .map(
          (item) =>
            `- ${item.product.name} (Qty: ${item.quantity}) - DZD ${(item.product.price * item.quantity).toFixed(2)}`,
        )
        .join("\n")

      const emailContent = `
        New Order Received!
        
        Order ID: ${order._id}
        Customer: ${order.user.email}
        Total Amount: DZD ${order.totalAmount.toFixed(2)}
        
        Delivery Information:
        - Type: ${order.shippingAddress.deliveryType === "office" ? "Office Delivery" : "Home Delivery"}
        - Phone: ${order.shippingAddress.phoneNumber}
        - Location: ${order.shippingAddress.wilaya}, ${order.shippingAddress.daira}
        ${order.shippingAddress.homeAddress ? `- Address: ${order.shippingAddress.homeAddress}` : ""}
        ${order.shippingAddress.notes ? `- Notes: ${order.shippingAddress.notes}` : ""}
        
        Items Ordered:
        ${orderItems}
        
        Please log in to your admin panel to manage this order.
      `

      await this.transporter.sendMail({
        from: settings.emailNotifications.smtpUser,
        to: settings.emailNotifications.adminEmail,
        subject: `New Order #${order._id} - ${settings.siteName}`,
        text: emailContent,
      })

      console.log("Order notification email sent successfully")
    } catch (error) {
      console.error("Error sending order notification email:", error)
    }
  }
}

module.exports = new EmailService()
