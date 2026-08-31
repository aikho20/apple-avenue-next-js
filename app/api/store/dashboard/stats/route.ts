import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Order from '@/lib/model/order.model'
import Product from '@/lib/model/product.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import { toProductInventory, computeStats } from '@/lib/inventory'

export async function GET(req: NextRequest) {
  return handle(req)
}
export async function POST(req: NextRequest) {
  return handle(req)
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}
function startOfWeek(d: Date) {
  const x = new Date(d)
  const day = x.getDay() // 0 Sun
  const diff = x.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  x.setDate(diff)
  x.setHours(0, 0, 0, 0)
  return x
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1)
}

async function handle(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user: any = await User.findById(session.user._id)
    if (!user || (user.role !== 'admin' && user.role !== 'branch')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let body: any = {}
    try {
      body = await req.json()
    } catch {}
    const url = new URL(req.url)
    const branchIdParam = (url.searchParams.get('branchId') || body.branchId || '').toString()
    const rangeParam = (url.searchParams.get('range') || body.range || 'all').toString() // today|week|month|year|all

    // Resolve order filter branch-aware
    let orderFilter: any = {}
    let productFilter: any = {}

    if (user.role === 'branch') {
      const branchId = user.branch ? user.branch.toString() : ''
      if (!branchId) {
        return NextResponse.json({
          revenue: { total: 0, today: 0, week: 0, month: 0, year: 0, previous: {}, deltas: {} },
          orders: { total: 0, pending: 0, processing: 0, delivered: 0, cancelled: 0, refunded: 0, aov: 0 },
          customers: { total: 0, new: 0, returning: 0 },
          inventory: { totalProducts: 0, totalStock: 0, lowStock: 0, outOfStock: 0, inventoryValue: 0 },
          charts: { revenueTrend: [], ordersTrend: [], salesByCategory: [], orderStatus: [] },
          topProducts: [],
          recentOrders: [],
          needsAttention: { lowStock: 0, outOfStock: 0, pendingOrders: 0, processing: 0 },
          period: rangeParam,
        })
      }
      orderFilter.$or = [{ branch: branchId }, { merchant: user._id.toString() }]
      productFilter.$or = [{ branch: branchId }, { merchant: user._id.toString() }]
    } else if (branchIdParam && branchIdParam !== 'all') {
      const Branch = (await import('@/lib/model/branch.model')).default
      const br: any = await Branch.findById(branchIdParam).lean().catch(() => null)
      if (br) {
        const managerId = br.manager?.toString()
        orderFilter.$or = managerId ? [{ branch: branchIdParam }, { merchant: managerId }] : { branch: branchIdParam } as any
        // product filter same
        productFilter.$or = managerId ? [{ branch: branchIdParam }, { merchant: managerId }] : [{ branch: branchIdParam }]
        // if using $or with single obj, normalize
        if (!managerId) {
          orderFilter = { branch: branchIdParam }
          productFilter = { branch: branchIdParam }
        }
      } else {
        orderFilter = { branch: branchIdParam }
        productFilter = { branch: branchIdParam }
      }
    } else if (branchIdParam === 'all') {
      // no filter → all orders/products
      orderFilter = {}
      productFilter = {}
    } else {
      // admin without branch filter → all
      orderFilter = {}
      productFilter = {}
    }

    const now = new Date()
    const orders: any[] = await Order.find(orderFilter).sort({ createdAt: -1 }).lean()
    const productsRaw: any[] = await Product.find(productFilter).sort({ updatedAt: -1 }).lean()
    const products = productsRaw.map((p: any) => toProductInventory(p))
    const inventory = computeStats(products)

    // Revenue buckets
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0)

    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = new Date(todayEnd); yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)

    const weekStart = startOfWeek(now)
    const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(prevWeekStart.getDate() - 7)
    const prevWeekEnd = new Date(weekStart); prevWeekEnd.setMilliseconds(-1)

    const monthStart = startOfMonth(now)
    const prevMonthStart = new Date(monthStart); prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
    const prevMonthEnd = new Date(monthStart); prevMonthEnd.setMilliseconds(-1)

    const yearStart = startOfYear(now)
    const prevYearStart = new Date(yearStart); prevYearStart.setFullYear(prevYearStart.getFullYear() - 1)
    const prevYearEnd = new Date(yearStart); prevYearEnd.setMilliseconds(-1)

    const inRange = (d: Date, start: Date, end: Date) => d >= start && d <= end

    const todayOrders = orders.filter(o => inRange(new Date(o.createdAt), todayStart, todayEnd))
    const yesterdayOrders = orders.filter(o => inRange(new Date(o.createdAt), yesterdayStart, yesterdayEnd))
    const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekStart)
    const prevWeekOrders = orders.filter(o => inRange(new Date(o.createdAt), prevWeekStart, prevWeekEnd))
    const monthOrders = orders.filter(o => new Date(o.createdAt) >= monthStart)
    const prevMonthOrders = orders.filter(o => inRange(new Date(o.createdAt), prevMonthStart, prevMonthEnd))
    const yearOrders = orders.filter(o => new Date(o.createdAt) >= yearStart)
    const prevYearOrders = orders.filter(o => inRange(new Date(o.createdAt), prevYearStart, prevYearEnd))

    const sum = (arr: any[]) => arr.reduce((s, o) => s + Number(o.total || 0), 0)

    const revToday = sum(todayOrders)
    const revYesterday = sum(yesterdayOrders)
    const revWeek = sum(weekOrders)
    const revPrevWeek = sum(prevWeekOrders)
    const revMonth = sum(monthOrders)
    const revPrevMonth = sum(prevMonthOrders)
    const revYear = sum(yearOrders)
    const revPrevYear = sum(prevYearOrders)

    const pct = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return Number((((curr - prev) / prev) * 100).toFixed(1))
    }

    // Orders by status (normalize)
    const byStatus = (status: string) => orders.filter(o => (o.status || '').toLowerCase() === status.toLowerCase()).length
    const pending = byStatus('Pending')
    const processing = orders.filter(o => ['Out For Delivery', 'Processing', 'Shipped'].includes(o.status)).length
    const delivered = orders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length
    const cancelled = byStatus('Cancelled')
    const refunded = orders.filter(o => ['Refunded', 'Returned'].includes(o.status)).length
    const totalOrders = orders.length
    const aov = totalOrders ? Math.round(totalRevenue / totalOrders) : 0

    // Profit estimation
    // Build cost lookup from productsRaw by _id
    const costMap = new Map<string, number>()
    productsRaw.forEach((p: any) => {
      const id = p._id.toString()
      costMap.set(id, Number(p.cost || 0))
      // also by productName fallback
      costMap.set(p.productName, Number(p.cost || 0))
    })
    let totalCost = 0
    let grossProfit = 0
    orders.forEach((o: any) => {
      const items: any[] = Array.isArray(o.products) ? o.products : []
      items.forEach((it: any) => {
        const pid = (it._id || it.id || '').toString()
        const cost = costMap.get(pid) ?? costMap.get(it.productName) ?? 0
        totalCost += cost * Number(it.value || 1)
      })
    })
    grossProfit = totalRevenue - totalCost

    // Customers
    const uniqueUsers = new Set(orders.map((o: any) => (o.user || o.fullName || '').toString()).filter(Boolean))
    const totalCustomers = uniqueUsers.size
    // Fallback to User collection count if orders empty (admin view)
    let userCount = totalCustomers
    try {
      if (totalCustomers === 0) {
        const uCount = await User.countDocuments({ role: 'user' })
        userCount = uCount
      }
    } catch {}
    // New customers: users created this month (or ordered first time this month)
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30)
    let newCustomers = 0
    let returningCustomers = 0
    try {
      // Count users created in last 30 days
      newCustomers = await User.countDocuments({ role: 'user', createdAt: { $gte: monthAgo } })
      // Returning: users with >1 order
      const orderCounts: Record<string, number> = {}
      orders.forEach((o: any) => {
        const k = (o.user || o.fullName || '').toString()
        if (!k) return
        orderCounts[k] = (orderCounts[k] || 0) + 1
      })
      returningCustomers = Object.values(orderCounts).filter(c => c > 1).length
    } catch {}

    // Revenue trend: last 6 months
    const revenueTrend = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      const key = d.toLocaleString('default', { month: 'short' })
      const revenue = orders
        .filter((o: any) => {
          const od = new Date(o.createdAt)
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
        })
        .reduce((s: number, o: any) => s + Number(o.total || 0), 0)
      const count = orders.filter((o: any) => {
        const od = new Date(o.createdAt)
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
      }).length
      return { month: key, revenue, orders: count }
    })

    // Orders trend: last 14 days
    const ordersTrend = Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      const label = `${d.getMonth() + 1}/${d.getDate()}`
      const dayRevenue = orders
        .filter((o: any) => new Date(o.createdAt).toDateString() === d.toDateString())
        .reduce((s: number, o: any) => s + Number(o.total || 0), 0)
      const dayCount = orders.filter((o: any) => new Date(o.createdAt).toDateString() === d.toDateString()).length
      return { date: label, revenue: dayRevenue, orders: dayCount }
    })

    // Sales by category
    const categoryMap: Record<string, { revenue: number; units: number; count: number }> = {}
    orders.forEach((o: any) => {
      const items: any[] = Array.isArray(o.products) ? o.products : []
      items.forEach((it: any) => {
        // Try to find product category
        const prod = productsRaw.find((p: any) => p._id.toString() === (it._id || '').toString() || p.productName === it.productName)
        const cat = prod?.category || 'Other'
        if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, units: 0, count: 0 }
        categoryMap[cat].revenue += Number(it.price || 0) * Number(it.value || 1)
        categoryMap[cat].units += Number(it.value || 1)
        categoryMap[cat].count += 1
      })
    })
    // fallback to product categories if no orders
    if (Object.keys(categoryMap).length === 0) {
      productsRaw.forEach((p: any) => {
        const cat = p.category || 'Other'
        if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, units: 0, count: 0 }
        categoryMap[cat].count += 1
      })
    }
    const salesByCategory = Object.entries(categoryMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)

    // Top products by units sold / revenue
    const productSales: Record<string, { productName: string; units: number; revenue: number; price: number; _id: string; category: string }> = {}
    orders.forEach((o: any) => {
      const items: any[] = Array.isArray(o.products) ? o.products : []
      items.forEach((it: any) => {
        const key = (it._id || it.productName || '').toString()
        if (!productSales[key]) {
          productSales[key] = {
            productName: it.productName || key,
            units: 0,
            revenue: 0,
            price: Number(it.price || 0),
            _id: key,
            category: '',
          }
        }
        productSales[key].units += Number(it.value || 1)
        productSales[key].revenue += Number(it.price || 0) * Number(it.value || 1)
        const prod = productsRaw.find((p: any) => p._id.toString() === key || p.productName === it.productName)
        if (prod) {
          productSales[key].category = prod.category || ''
          productSales[key]._id = prod._id.toString()
        }
      })
    })
    let topProducts = Object.values(productSales)
      .sort((a, b) => b.units - a.units)
      .slice(0, 6)
      .map(p => {
        const prod = productsRaw.find((x: any) => x._id.toString() === p._id || x.productName === p.productName)
        const inv = prod ? toProductInventory(prod) : null
        return {
          ...p,
          stock: inv ? inv.quantity : 0,
          availableStock: inv ? inv.availableStock : 0,
          inventoryStatus: inv ? inv.inventoryStatus : 'Unknown',
        }
      })

    // If no sales yet, fallback to products list
    if (topProducts.length === 0) {
      topProducts = products.slice(0, 6).map((p: any, i: number) => ({
        _id: p._id,
        productName: p.productName,
        units: 0,
        revenue: 0,
        price: p.price,
        category: p.category,
        stock: p.quantity,
        availableStock: p.availableStock,
        inventoryStatus: p.inventoryStatus,
      }))
    }

    // Inventory insights: best sellers vs slow movers, recently restocked could be via transaction but use updatedAt
    const lowStockProducts = products.filter((p: any) => p.inventoryStatus === 'Low Stock').slice(0, 5)
    const outOfStockProducts = products.filter((p: any) => p.inventoryStatus === 'Out of Stock').slice(0, 5)
    const recentlyUpdated = [...products].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4)

    // Payment breakdown
    const paymentMap: Record<string, number> = {}
    orders.forEach((o: any) => {
      const pm = o.paymentMethod || 'Unknown'
      paymentMap[pm] = (paymentMap[pm] || 0) + 1
    })

    // Conversion estimate (not tracking visitors, estimate)
    const visitorsEst = Math.max(totalOrders * 8, 1000)
    const conversionRate = visitorsEst ? Number(((totalOrders / visitorsEst) * 100).toFixed(2)) : 0

    return NextResponse.json(
      {
        revenue: {
          total: totalRevenue,
          today: revToday,
          week: revWeek,
          month: revMonth,
          year: revYear,
          previous: {
            yesterday: revYesterday,
            prevWeek: revPrevWeek,
            prevMonth: revPrevMonth,
            prevYear: revPrevYear,
          },
          deltas: {
            today: pct(revToday, revYesterday),
            week: pct(revWeek, revPrevWeek),
            month: pct(revMonth, revPrevMonth),
            year: pct(revYear, revPrevYear),
          },
        },
        orders: {
          total: totalOrders,
          pending,
          processing,
          delivered,
          cancelled,
          refunded,
          aov,
          today: todayOrders.length,
          week: weekOrders.length,
          month: monthOrders.length,
        },
        profit: {
          gross: grossProfit,
          cost: totalCost,
        },
        customers: {
          total: totalCustomers || userCount,
          new: newCustomers,
          returning: returningCustomers,
        },
        conversionRate,
        inventory: {
          ...inventory,
          lowStockProducts,
          outOfStockProducts,
          recentlyUpdated,
        },
        charts: {
          revenueTrend,
          ordersTrend,
          salesByCategory,
          orderStatus: [
            { name: 'Delivered', value: delivered, color: '#111111' },
            { name: 'Pending', value: pending, color: '#F59E0B' },
            { name: 'Processing', value: processing, color: '#3B82F6' },
            { name: 'Cancelled', value: cancelled, color: '#EF4444' },
            ...(refunded ? [{ name: 'Refunded', value: refunded, color: '#8B5CF6' }] : []),
          ].filter(d => d.value > 0),
        },
        topProducts,
        salesByCategory,
        recentOrders: orders.slice(0, 6),
        paymentBreakdown: paymentMap,
        needsAttention: {
          lowStock: inventory.lowStock,
          outOfStock: inventory.outOfStock,
          pendingOrders: pending,
          processing,
          cancelled,
          lowStockProducts: lowStockProducts.slice(0, 3),
          outOfStockProducts: outOfStockProducts.slice(0, 3),
        },
        period: rangeParam,
      },
      { status: 200 }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
