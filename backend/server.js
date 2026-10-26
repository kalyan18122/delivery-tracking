const express = require('express');
const cors = require('cors');
const { readAll, writeAll } = require('./store');

const app = express();
app.use(cors());
app.use(express.json());

const STATUSES = ['Order Placed', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered'];

// List all deliveries
app.get('/api/deliveries', (req, res) => res.json(readAll()));

// Track one delivery by ID
app.get('/api/deliveries/:id', (req, res) => {
  const d = readAll().find(x => x.id === req.params.id.toUpperCase());
  d ? res.json(d) : res.status(404).json({ message: 'Delivery not found' });
});

// Create a delivery
app.post('/api/deliveries', (req, res) => {
  const { customer, address } = req.body;
  if (!customer || !address) return res.status(400).json({ message: 'customer and address are required' });
  const data = readAll();
  const next = data.length ? Math.max(...data.map(d => +d.id.replace('DLV', ''))) + 1 : 1001;
  const delivery = {
    id: 'DLV' + next, customer, address, status: STATUSES[0],
    history: [{ status: STATUSES[0], time: new Date().toISOString() }]
  };
  data.push(delivery);
  writeAll(data);
  res.status(201).json(delivery);
});

// Update status
app.put('/api/deliveries/:id/status', (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const data = readAll();
  const d = data.find(x => x.id === req.params.id);
  if (!d) return res.status(404).json({ message: 'Delivery not found' });
  d.status = status;
  d.history.push({ status, time: new Date().toISOString() });
  writeAll(data);
  res.json(d);
});

// Delete a delivery
app.delete('/api/deliveries/:id', (req, res) => {
  const data = readAll();
  const rest = data.filter(x => x.id !== req.params.id);
  if (rest.length === data.length) return res.status(404).json({ message: 'Delivery not found' });
  writeAll(rest);
  res.json({ message: 'Deleted' });
});

app.listen(3000, () => console.log('API running at http://localhost:3000'));
