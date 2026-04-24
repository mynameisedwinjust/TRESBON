import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    console.log("[API] /api/admin/orders - Starting request")

    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const status = searchParams.get('status')

    let where: any = {}
    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        customer: true,
        items: true,
      }
    })

    console.log(`Found ${orders.length} orders`)

    // Add legacy compatibility for 'customer' and 'customers' fields if necessary
    const ordersFormatted = orders.map(order => ({
      ...order,
      customers: order.customer // Some components might expect plural 'customers'
    }))

    return NextResponse.json({ orders: ordersFormatted })
  } catch (error: any) {
    console.error("[API] Error fetching orders:", error)

    const errorMessage = error.message || "Failed to fetch orders"
    const statusCode = error.message.includes("Admin access") ? 403 : 500

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin()
    const body = await request.json()

    const {
      customer_id,
      customer_name,
      customer_phone,
      branch_id,
      delivery_fee = 0,
      discount_amount = 0,
      expected_pickup_at,
      notes,
      items,
    } = body

    const subtotal = items.reduce((sum: number, item: any) => sum + item.total_price, 0)
    const total_amount = subtotal + Number(delivery_fee) - Number(discount_amount)

    // Generate order number based on highest existing number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true }
    })
    
    let nextOrderNumber = "001"
    if (lastOrder && lastOrder.orderNumber) {
      const lastNumber = parseInt(lastOrder.orderNumber, 10)
      if (!isNaN(lastNumber)) {
        nextOrderNumber = (lastNumber + 1).toString().padStart(3, '0')
      } else {
        const count = await prisma.order.count()
        nextOrderNumber = (count + 1).toString().padStart(3, '0')
      }
    }

    let resolvedCustomerId = customer_id || null
    if (!resolvedCustomerId && (customer_name || customer_phone)) {
      let existingCust = null;
      
      const sanitizedPhone = customer_phone ? customer_phone.trim() : null;
      const sanitizedName = customer_name ? customer_name.trim() : null;

      if (sanitizedPhone) {
        existingCust = await prisma.customer.findFirst({
          where: { phone: sanitizedPhone }
        })
      } else if (sanitizedName) {
        // Fallback to name search if no phone provided
        existingCust = await prisma.customer.findFirst({
          where: { 
            name: sanitizedName,
            phone: null 
          }
        })
      }

      if (!existingCust) {
        existingCust = await prisma.customer.create({
          data: {
            name: sanitizedName || "Unknown Customer",
            phone: sanitizedPhone || null,
            type: "walk-in"
          }
        })
      }
      resolvedCustomerId = existingCust.id
    }

    const resolvedItems: any[] = []
    for (const item of items) {
      let resolvedServiceId = item.service_id || null

      if (!resolvedServiceId && item.service_name) {
        let existingSvc = await prisma.service.findFirst({
          where: { name: item.service_name }
        })
        if (!existingSvc) {
          existingSvc = await prisma.service.create({
            data: {
              name: item.service_name,
              type: "washing",
              basePrice: Number(item.unit_price) || 0
            }
          })
        }
        resolvedServiceId = existingSvc.id
      }

      if (resolvedServiceId && item.item_name) {
         let existingItm = await prisma.serviceItem.findFirst({
            where: { serviceId: resolvedServiceId, name: item.item_name }
         })
         if (!existingItm) {
            await prisma.serviceItem.create({
               data: {
                 name: item.item_name,
                 price: Number(item.unit_price) || 0,
                 serviceId: resolvedServiceId
               }
            })
         }
      }

      resolvedItems.push({
        serviceId: resolvedServiceId,
        itemName: item.item_name || "Custom Item",
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unit_price) || 0,
        totalPrice: Number(item.total_price) || 0,
        notes: item.notes || null,
      })
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: nextOrderNumber,
          customerId: resolvedCustomerId, 
          status: "in_process",
          totalAmount: total_amount,
          paidAmount: 0,
          deliveryFee: Number(delivery_fee),
          discountAmount: Number(discount_amount),
          expectedPickupAt: expected_pickup_at ? new Date(expected_pickup_at) : null,
          notes,
          recordedBy: user.fullName || user.phone,
          recordedById: user.id,
          receivedAt: new Date(),
          items: {
            create: resolvedItems.map((item: any) => ({
              serviceId: item.serviceId,
              itemName: item.itemName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              notes: item.notes,
            }))
          }
        },
        include: {
          items: {
            include: {
              service: true
            }
          }
        }
      })
      return newOrder
    })

    const populatedOrder = {
      ...order,
      order_items: order.items.map(item => ({
        ...item,
        services: item.service
      }))
    }

    return NextResponse.json({ order: populatedOrder }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating admin order:", error)
    const status = error.message?.includes('Admin access') ? 403 : 500
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status }
    )
  }
}



