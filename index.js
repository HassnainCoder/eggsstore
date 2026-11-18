import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});
const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
const clean = (s, n = 200) => String(s || '').trim().slice(0, n);

export default async function handler(req, res) {
  const a = req.query.a, b = req.body || {};
  const admin = process.env.ADMIN_PASS && req.headers['x-admin'] === process.env.ADMIN_PASS;
  try {
    if (a === 'stock') {
      const [stock, price] = await Promise.all([redis.get('stock'), redis.get('price')]);
      return res.json({ stock: Math.max(0, +stock || 0), price: +price || 0 });
    }
    if (a === 'order' && req.method === 'POST') {
      const name = clean(b.name, 60), phone = clean(b.phone, 20), address = clean(b.address, 250);
      const qty = parseInt(b.qty);
      if (!name || !phone || !address || !(qty > 0) || qty > 500) return res.status(400).json({ error: 'Sari details sahi bharein' });
      const left = await redis.decrby('stock', qty);
      if (left < 0) { await redis.incrby('stock', qty); return res.status(409).json({ error: 'Itna stock available nahi hai' }); }
      const price = +(await redis.get('price')) || 0;
      const id = Date.now().toString(36);
      const o = { id, name, phone, address, qty, total: qty * price, status: 'pending', at: new Date().toISOString(), day: today() };
      await redis.hset('orders', { [id]: o });
      return res.json({ ok: 1, id, total: o.total });
    }
    if (a === 'complaint' && req.method === 'POST') {
      const message = clean(b.message, 500);
      if (!message) return res.status(400).json({ error: 'Shikayat likhein' });
      const id = Date.now().toString(36);
      await redis.hset('complaints', { [id]: { id, name: clean(b.name, 60), phone: clean(b.phone, 20), message, at: new Date().toISOString() } });
      return res.json({ ok: 1 });
    }
    if (!admin) return res.status(401).json({ error: 'Password ghalat hai' });
    if (a === 'admin') {
      const [stock, price, orders, complaints, daily] = await Promise.all([
        redis.get('stock'), redis.get('price'), redis.hgetall('orders'), redis.hgetall('complaints'), redis.hgetall('daily')]);
      return res.json({ stock: +stock || 0, price: +price || 0, today: today(),
        orders: Object.values(orders || {}).sort((x, y) => y.at.localeCompare(x.at)),
        complaints: Object.values(complaints || {}).sort((x, y) => y.at.localeCompare(x.at)), daily: daily || {} });
    }
    if (a === 'addstock') {
      const qty = parseInt(b.qty) || 0, price = parseFloat(b.price) || 0;
      if (qty) { await redis.incrby('stock', qty); await redis.hincrby('daily', today(), qty); }
      if (price > 0) await redis.set('price', price);
      return res.json({ ok: 1 });
    }
    if (a === 'status') {
      const o = await redis.hget('orders', b.id);
      if (!o) return res.status(404).json({ error: 'Order nahi mila' });
      if (b.status === 'cancelled' && o.status !== 'cancelled') await redis.incrby('stock', o.qty);
      if (o.status === 'cancelled' && b.status !== 'cancelled') await redis.decrby('stock', o.qty);
      o.status = b.status;
      await redis.hset('orders', { [o.id]: o });
      return res.json({ ok: 1 });
    }
    if (a === 'delcomplaint') { await redis.hdel('complaints', b.id); return res.json({ ok: 1 }); }
    res.status(404).json({ error: 'not found' });
  } catch (e) { res.status(500).json({ error: 'Server error: ' + e.message }); }
}
