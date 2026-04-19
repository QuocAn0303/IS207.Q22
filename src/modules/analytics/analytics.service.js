const prisma = require("../../config/prisma");

const topTrending = async (days = 30, limit = 10) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // group order items by productId in the time window
  const items = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: since }, status: "COMPLETED" } },
    select: { productId: true, quantity: true },
  });
  const map = new Map();
  for (const it of items) {
    map.set(it.productId, (map.get(it.productId) || 0) + it.quantity);
  }
  const arr = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const productIds = arr.map((a) => a[0]);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, imageUrl: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  return arr.map(([productId, qty]) => ({
    product: productMap.get(productId) || { id: productId },
    qty,
  }));
};

// compute daily revenue for last N days
const dailyRevenue = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, status: "COMPLETED" },
    select: { total: true, createdAt: true },
  });
  const map = new Map();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    d.setHours(0, 0, 0, 0);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of orders) {
    const k = o.createdAt.toISOString().slice(0, 10);
    map.set(k, (map.get(k) || 0) + Number(o.total));
  }
  const labels = Array.from(map.keys());
  const values = Array.from(map.values());
  return { labels, values };
};

// simple linear regression to predict next week
const linearRegressionPredict = (values) => {
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const ys = values;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const denom = n * sumX2 - sumX * sumX;
  const m = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  // predict next 7 days
  const next = [];
  for (let i = n; i < n + 7; i++) next.push(m * i + b);
  return { slope: m, intercept: b, nextWeek: next };
};

const customerRFM = async () => {
  const customers = await prisma.customer.findMany({
    include: { orders: true },
  });
  const now = new Date();
  const res = [];
  for (const c of customers) {
    const orders = c.orders.filter((o) => o.status === "COMPLETED");
    if (orders.length === 0) continue;
    const lastOrder = orders.reduce((a, b) =>
      a.createdAt > b.createdAt ? a : b,
    ).createdAt;
    const recency = Math.floor((now - lastOrder) / (1000 * 60 * 60 * 24));
    const frequency = orders.length;
    const monetary = orders.reduce((s, o) => s + Number(o.total), 0);
    res.push({
      customer: { id: c.id, name: c.name },
      recency,
      frequency,
      monetary,
    });
  }
  // segmentation
  const vip = res
    .filter((r) => r.monetary > 5000000 && r.frequency >= 3)
    .slice(0, 20);
  const atRisk = res
    .filter((r) => r.recency > 60 && r.frequency >= 2)
    .slice(0, 20);
  const newCustomers = res
    .filter((r) => r.recency <= 30 && r.frequency <= 1)
    .slice(0, 20);
  return { vip, atRisk, newCustomers };
};

const salesInsights = async () => {
  const trending = await topTrending(30, 10);
  const dr = await dailyRevenue(30);
  const lr = linearRegressionPredict(dr.values);
  const customer = await customerRFM();
  const last7 = dr.values.slice(-7).reduce((a, b) => a + b, 0);
  const next7 = lr.nextWeek.reduce((a, b) => a + b, 0);
  const trend = next7 > last7 ? "increasing" : "decreasing";
  return {
    trending,
    daily: dr,
    regression: lr,
    customerSegments: customer,
    prediction: { trend, last7, next7 },
  };
};

module.exports = { salesInsights };
