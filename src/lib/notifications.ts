// Notification system structure
// This can be extended with actual SMS/Email integrations

export interface NotificationData {
  type: 'order_received' | 'order_ready' | 'order_delivered' | 'payment_received'
  orderNumber: string
  amount?: number
  customerPhone?: string
  customerEmail?: string
}

export async function sendNotification(data: NotificationData, template: string): Promise<boolean> {
  try {
    // Replace template variables
    let message = template
    message = message.replace(/{order_number}/g, data.orderNumber)
    message = message.replace(/#{order_number}/g, data.orderNumber)
    if (data.amount !== undefined) {
      message = message.replace(/{amount}/g, `RWF ${data.amount.toLocaleString()}`)
    }

    // TODO: Integrate with SMS service (e.g., Twilio, Africa's Talking)
    // TODO: Integrate with Email service (e.g., SendGrid, AWS SES)
    
    console.log(`[Notification] ${data.type}: ${message}`)
    console.log(`[Notification] To: ${data.customerPhone || data.customerEmail || 'N/A'}`)
    
    // For now, just log. In production, this would send actual SMS/Email
    return true
  } catch (error) {
    console.error("Error sending notification:", error)
    return false
  }
}

export async function sendOrderReceivedNotification(orderNumber: string, customerPhone?: string, customerEmail?: string) {
  // Load template from database or use default
  const template = "Your order #{order_number} has been received. We'll notify you when it's ready!"
  return sendNotification({
    type: 'order_received',
    orderNumber,
    customerPhone,
    customerEmail
  }, template)
}

export async function sendOrderReadyNotification(orderNumber: string, customerPhone?: string, customerEmail?: string) {
  const template = "Your order #{order_number} is ready for pickup/delivery!"
  return sendNotification({
    type: 'order_ready',
    orderNumber,
    customerPhone,
    customerEmail
  }, template)
}

export async function sendOrderDeliveredNotification(orderNumber: string, customerPhone?: string, customerEmail?: string) {
  const template = "Your order #{order_number} has been delivered. Thank you!"
  return sendNotification({
    type: 'order_delivered',
    orderNumber,
    customerPhone,
    customerEmail
  }, template)
}

export async function sendPaymentReceivedNotification(orderNumber: string, amount: number, customerPhone?: string, customerEmail?: string) {
  const template = "Payment of RWF {amount} received for order #{order_number}."
  return sendNotification({
    type: 'payment_received',
    orderNumber,
    amount,
    customerPhone,
    customerEmail
  }, template)
}

