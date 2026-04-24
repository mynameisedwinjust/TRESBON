"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { loadImage } from "@/lib/pdf-helpers"

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`)
        const data = await res.json()
        if (data.order) {
          setOrder(data.order)
        }
      } catch (error) {
        console.error("Error fetching order for receipt:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [params.id])

  if (loading) return <div className="p-8 text-center">Loading receipt...</div>
  if (!order) return <div className="p-8 text-center">Order not found</div>

  const formattedDate = new Date(order.createdAt || order.created_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
  const formattedTime = new Date(order.createdAt || order.created_at).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: true
  }).toUpperCase()

  const exportPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5' // A5 is perfect ratio for small physical receipts
    });

    try {
      try {
        const logoData = await loadImage('/tresbon-official-logo.png')
        doc.addImage(logoData, 'PNG', 15, 10, 35, 12)
      } catch (logoError) {
        console.warn("Logo failed to load for receipt:", logoError)
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        doc.text("Très Bon Dry Cleaners", 15, 20);
      }
      
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text("TEL : 0790 002 060 / 0726 230 475", 15, 27);
      
      doc.text(`Date : ${formattedDate}`, 85, 33);
      doc.text(`Time : ${formattedTime}`, 85, 38);
    
    // Client
    doc.text("Client .....................................................................", 15, 45);
    const clientName = `${order.customer?.name || order.customers?.name || "Walk-in"} ${order.customer?.phone || order.customers?.phone ? `(${order.customer?.phone || order.customers?.phone})` : ""}`;
    doc.text(clientName, 30, 44);

    let currentY = 52;
    if (order.expectedPickupAt || order.expected_pickup_at) {
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      const pickupDate = new Date(order.expectedPickupAt || order.expected_pickup_at).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      });
      doc.text(`Exp. Pickup : ${pickupDate}`, 15, 50);
      currentY = 56;
    }
    
    // Order specific
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text(`ORDER #${order.orderNumber || order.order_number}`, 15, currentY);

    // Prepare table body
    const items = order.order_items || order.items || [];
    const tableBody: any[] = [];
    
    items.forEach((item: any, index: number) => {
        const itemName = item.itemName || item.item_name;
        const serviceName = item.service?.name || item.services?.name || "";
        const designation = serviceName ? `${itemName}\n${serviceName}` : itemName;
        
        tableBody.push([
            index + 1,
            designation,
            item.quantity,
            (item.unitPrice || item.unit_price || 0).toLocaleString(),
            (item.totalPrice || item.total_price || 0).toLocaleString()
        ]);
    });
    
    // Pad exactly up to 5 empty rows if there's less than 5 items
    const emptyRowsCount = Math.max(0, 5 - items.length);
    for (let i = 0; i < emptyRowsCount; i++) {
        tableBody.push([
            items.length + i + 1,
            "",
            "",
            "",
            ""
        ]);
    }
    
    // Totals Row
    tableBody.push([
       { content: 'TOTAL AMOUNT', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
       { content: (order.totalAmount || order.total_amount || 0).toLocaleString(), styles: { halign: 'right', fontStyle: 'bold' } }
    ]);

    if (order.paidAmount > 0) {
      tableBody.push([
        { content: 'PREVIOUSLY PAID', colSpan: 4, styles: { halign: 'right', fontStyle: 'normal' } },
        { content: (order.paidAmount || 0).toLocaleString(), styles: { halign: 'right', fontStyle: 'normal' } }
      ]);
      
      const balance = (order.totalAmount || 0) - (order.paidAmount || 0);
      tableBody.push([
        { content: 'REMAINING BALANCE', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', textColor: [200, 0, 0] } },
        { content: balance.toLocaleString(), styles: { halign: 'right', fontStyle: 'bold', textColor: [200, 0, 0] } }
      ]);
    }

    // Draw the Table using the plugin
    // @ts-ignore
    doc.autoTable({
        startY: currentY + 3,
        theme: 'grid',
        headStyles: { 
            fillColor: [230, 230, 230], // Light gray like the picture
            textColor: 0, 
            font: 'times', 
            fontStyle: 'bold', 
            lineWidth: 0.1, 
            lineColor: 0 
        },
        bodyStyles: { 
            font: 'times', 
            lineWidth: 0.1, 
            lineColor: 0,
            textColor: 0
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 'auto', fontStyle: 'normal' },
            2: { cellWidth: 12, halign: 'center' },
            3: { cellWidth: 22, halign: 'right' },
            4: { cellWidth: 26, halign: 'right' }
        },
        head: [['No.', 'Designation', 'Qty', 'Price', 'Total']],
        body: tableBody,
        margin: { top: 55, right: 15, bottom: 20, left: 15 }
    });

    // Automatically trigger browser download of native PDF
    doc.save(`Receipt_Order_${order.orderNumber || order.order_number}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Could not generate PDF receipt. Please check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      {/* Action Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center no-print">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Order
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={exportPDF}>
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* Visual Preview */}
      <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 shadow-md border" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        
        {/* Header content matches the image perfectly */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl sm:text-2xl tracking-wider font-bold mb-1">Très Bon Dry Cleaners</h1>

              <div className="flex items-center gap-2 text-sm sm:text-base leading-snug">
                <span>TEL : 0790002060/0726230475</span>
              </div>
            </div>
            <div className="flex flex-col items-end h-full">
               <div className="flex items-center">
                 <span className="mr-2 text-sm sm:text-base">Date :</span>
                 <span className="border-b border-dotted border-black px-2 inline-block min-w-[120px] text-sm sm:text-base">
                 {formattedDate}
               </span>
               <span className="ml-2 text-sm sm:text-base ml-4">Time :</span>
               <span className="border-b border-dotted border-black px-2 inline-block min-w-[80px] text-sm sm:text-base">
                 {formattedTime}
               </span>
               </div>
               <div className="flex items-center mt-2">
                 <span className="mr-2 text-sm sm:text-base font-bold">Order # :</span>
                 <span className="border-b border-dotted border-black px-2 inline-block min-w-[120px] text-sm sm:text-base font-bold text-blue-600">
                   {order.orderNumber || order.order_number}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* Client Info inline styling similar to receipt block */}
        <div className="flex flex-col gap-4 mb-8 border-b border-dotted border-gray-400 pb-4">
          <div className="flex items-end">
             <span className="mr-2 text-sm sm:text-base">Client</span>
             <span className="border-b border-dotted border-black px-2 inline-block min-w-[300px] text-sm sm:text-base">
               {order.customer?.name || order.customers?.name || "Walk-in"} {order.customer?.phone || order.customers?.phone ? `(${order.customer?.phone || order.customers?.phone})` : ""}
             </span>
          </div>
          {(order.expectedPickupAt || order.expected_pickup_at) && (
            <div className="flex items-end">
               <span className="mr-2 text-sm sm:text-base">Exp. Pickup</span>
               <span className="border-b border-dotted border-black px-2 inline-block min-w-[200px] text-sm sm:text-base font-bold text-gray-700">
                 {new Date(order.expectedPickupAt || order.expected_pickup_at).toLocaleString('en-GB', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                 })}
               </span>
            </div>
          )}
        </div>

        {/* Preview of the Table format */}
        <table className="w-full border-collapse border border-black receipt-table text-sm sm:text-base mb-6">
          <thead>
            <tr>
              <th className="border border-black p-2 bg-gray-100 font-bold w-12 text-center">No.</th>
              <th className="border border-black p-2 bg-gray-100 font-bold text-left">Designation</th>
              <th className="border border-black p-2 bg-gray-100 font-bold w-16 text-center">Qty</th>
              <th className="border border-black p-2 bg-gray-100 font-bold w-24 text-right">Price</th>
              <th className="border border-black p-2 bg-gray-100 font-bold w-32 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items || order.items || []).map((item: any, index: number) => {
              const itemName = item.itemName || item.item_name
              const qty = item.quantity
              const price = item.unitPrice || item.unit_price
              const total = item.totalPrice || item.total_price
              const serviceName = item.service?.name || item.services?.name || ""

              return (
                <tr key={index}>
                  <td className="border border-black p-2 text-center align-top">{index + 1}</td>
                  <td className="border border-black p-2 align-top">
                    <div className="font-semibold">{itemName}</div>
                    {serviceName && <div className="text-sm text-gray-600">{serviceName}</div>}
                  </td>
                  <td className="border border-black p-2 text-center align-top">{qty}</td>
                  <td className="border border-black p-2 text-right align-top">{price?.toLocaleString()}</td>
                  <td className="border border-black p-2 text-right align-top">{total?.toLocaleString()}</td>
                </tr>
              )
            })}
            
            {Array.from({ length: Math.max(0, 5 - (order.order_items || order.items || []).length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                  <td className="border border-black p-2 text-center align-top h-8">{(order.order_items || order.items || []).length + i + 1}</td>
                  <td className="border border-black p-2 align-top h-8"></td>
                  <td className="border border-black p-2 text-center align-top h-8"></td>
                  <td className="border border-black p-2 text-right align-top h-8"></td>
                  <td className="border border-black p-2 text-right align-top h-8"></td>
              </tr>
            ))}
            
            {/* Totals row */}
            <tr>
              <td colSpan={4} className="border border-black p-2 text-right font-bold tracking-wide">TOTAL AMOUNT</td>
              <td className="border border-black p-2 text-right font-bold">{order.totalAmount?.toLocaleString() || order.total_amount?.toLocaleString()}</td>
            </tr>
            {(order.paidAmount || order.paid_amount || 0) > 0 && (
              <>
                <tr>
                  <td colSpan={4} className="border border-black p-2 text-right font-medium tracking-wide text-gray-600 italic">PREVIOUSLY PAID</td>
                  <td className="border border-black p-2 text-right font-medium text-gray-600">{(order.paidAmount || order.paid_amount || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="border border-black p-2 text-right font-black tracking-wide text-red-600 uppercase">Remaining Balance</td>
                  <td className="border border-black p-2 text-right font-black text-red-600">
                    {((order.totalAmount || order.total_amount || 0) - (order.paidAmount || order.paid_amount || 0)).toLocaleString()}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        <div className="text-center text-sm text-gray-400 mt-6">(PDF Preview)</div>
      </div>
    </div>
  )
}
