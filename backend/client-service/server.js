// client-service/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const clientRoutes = require('./routes/clientRoutes');
const llmRoutes = require('./routes/llmRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', clientRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/auth', authRoutes);

const PORT = 6001;
app.listen(PORT, () => console.log(`Client service running at http://localhost:${PORT}`));
