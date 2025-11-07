/*
Listens for requests on 5001
Sends requests starting with /api/admin to the admin code
*/
const express = require('express');
const cors = require('cors');
const app = express();
const adminRoutes = require('./routes/adminRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);

const PORT = 5001;
app.listen(PORT, () => console.log(`Admin service running at http://localhost:${PORT}`));
