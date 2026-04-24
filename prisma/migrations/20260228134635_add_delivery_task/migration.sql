-- CreateTable
CREATE TABLE "delivery_tasks" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "type" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_tasks_orderId_key" ON "delivery_tasks"("orderId");

-- AddForeignKey
ALTER TABLE "delivery_tasks" ADD CONSTRAINT "delivery_tasks_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tasks" ADD CONSTRAINT "delivery_tasks_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
