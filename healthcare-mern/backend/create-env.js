const fs = require('fs');

const envContent = `MONGODB_URI=mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/healthify_tracker?retryWrites=true&w=majority&appName=Cluster0
PORT=5001
JWT_SECRET=healthcare-secret-key-2025-super-secure
`;

fs.writeFileSync('.env', envContent);
console.log('✅ .env file created successfully!');
console.log('\n📄 Content:');
console.log(envContent);
