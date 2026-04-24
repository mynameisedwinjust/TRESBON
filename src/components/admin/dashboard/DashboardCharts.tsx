import React, { memo } from "react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface DashboardChartsProps {
    chartData: any[]
    serviceData: any[]
}

export const DashboardCharts = memo(({ chartData, serviceData }: DashboardChartsProps) => {
    return (
        <div className="space-y-8">
            {/* Charts Section */}
            {chartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Revenue Chart */}
                    <Card className="p-8 border-none shadow-sm rounded-2xl bg-white">
                        <h3 className="text-xl font-extrabold text-secondary mb-6 tracking-tight">Revenue Trend (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontWeight: 600
                                    }}
                                    formatter={(value: any) => [`RWF ${Number(value).toLocaleString()}`, 'Revenue']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6785FF"
                                    strokeWidth={3}
                                    dot={{ fill: '#6785FF', r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Orders Chart */}
                    <Card className="p-8 border-none shadow-sm rounded-2xl bg-white">
                        <h3 className="text-xl font-extrabold text-secondary mb-6 tracking-tight">Orders Trend (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontWeight: 600
                                    }}
                                    formatter={(value: any) => [value, 'Orders']}
                                />
                                <Bar
                                    dataKey="orders"
                                    fill="#6785FF"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            )}

            {/* Service Usage Chart */}
            {serviceData.length > 0 && (
                <Card className="p-8 border-none shadow-sm rounded-2xl bg-white mt-8">
                    <h3 className="text-xl font-extrabold text-secondary mb-6 tracking-tight">Most Used Services (Top 5)</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pie Chart */}
                        <div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={serviceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {serviceData.map((entry, index) => {
                                            const colors = ['#6785FF', '#072366', '#10B981', '#F59E0B', '#EF4444']
                                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        })}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontWeight: 600
                                        }}
                                        formatter={(value: any, name: string, props: any) => [
                                            `${value} orders`,
                                            props.payload.name
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Service Stats List */}
                        <div className="space-y-4">
                            {serviceData.map((service, index) => {
                                const colors = ['bg-laundry-primary', 'bg-laundry-secondary', 'bg-green-500', 'bg-amber-500', 'bg-red-500']
                                return (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-laundry-primary/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-4 h-4 rounded-full ${colors[index]}`}></div>
                                            <div>
                                                <p className="font-bold text-secondary">{service.name}</p>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                    {service.count} orders
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-extrabold text-laundry-primary">
                                                {formatCurrency(service.revenue)}
                                            </p>
                                            <p className="text-xs text-gray-400 font-medium mt-1">Revenue</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
})

DashboardCharts.displayName = "DashboardCharts"
