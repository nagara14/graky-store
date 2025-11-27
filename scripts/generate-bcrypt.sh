# Usage: bash generate-bcrypt.sh "yourPassword"
node -e "const bcrypt=require('bcryptjs'); const p=process.argv[1]||'admin123456'; console.log(bcrypt.hashSync(p,10));" "$1"
