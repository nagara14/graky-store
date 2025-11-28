import mysql from 'mysql2/promise'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

const poolConfig: any = {
  waitForConnections: true,
  connectionLimit: 10, // Increased for build process
  queueLimit: 0, // Unlimited queue
  enableKeepAlive: true,
}

if (process.env.DATABASE_URL) {
  // TiDB Cloud or remote database - requires SSL
  poolConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  }

  try {
    const urlStr = process.env.DATABASE_URL;
    // Try standard parsing first
    try {
      const url = new URL(urlStr);
      poolConfig.host = url.hostname;
      poolConfig.user = url.username;
      poolConfig.password = url.password;
      poolConfig.database = url.pathname.replace(/^\//, '');
      poolConfig.port = parseInt(url.port) || 4000;
    } catch (parseError) {
      // Fallback: Manual parsing for passwords with special chars
      // Format: mysql://user:pass@host:port/db
      const noProto = urlStr.replace(/^mysql:\/\//, '');
      const lastAt = noProto.lastIndexOf('@');
      if (lastAt === -1) throw parseError;

      const creds = noProto.substring(0, lastAt);
      const address = noProto.substring(lastAt + 1);

      const firstColon = creds.indexOf(':');
      poolConfig.user = firstColon === -1 ? creds : creds.substring(0, firstColon);
      poolConfig.password = firstColon === -1 ? '' : creds.substring(firstColon + 1);

      // Address part: host:port/db
      const slashIdx = address.indexOf('/');
      const hostPort = slashIdx === -1 ? address : address.substring(0, slashIdx);
      poolConfig.database = slashIdx === -1 ? '' : address.substring(slashIdx + 1).split('?')[0];

      const colonIdx = hostPort.lastIndexOf(':');
      if (colonIdx !== -1) {
        poolConfig.host = hostPort.substring(0, colonIdx);
        poolConfig.port = parseInt(hostPort.substring(colonIdx + 1)) || 4000;
      } else {
        poolConfig.host = hostPort;
        poolConfig.port = 4000;
      }
    }

    if (!poolConfig.ssl) {
      poolConfig.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: true }
    }
  } catch (e) {
    console.error('Invalid DATABASE_URL:', e)
  }
} else {
  // Local MySQL - no SSL required
  poolConfig.host = process.env.DB_HOST || 'localhost'
  poolConfig.user = process.env.DB_USER || 'root'
  poolConfig.password = process.env.DB_PASSWORD || ''
  poolConfig.database = process.env.DB_NAME || 'graky_store'
  poolConfig.port = parseInt(process.env.DB_PORT || '3306')
  // Explicitly disable SSL for localhost
  poolConfig.ssl = false
}

const pool = mysql.createPool(poolConfig)

let isInitialized = false
let initPromise: Promise<void> | null = null
let initializationAttempted = false

// Initialize database tables
export async function initializeDatabase() {
  if (isInitialized) return

  // Prevent concurrent initialization calls
  if (initPromise) return initPromise

  initPromise = (async () => {
    const connection = await pool.getConnection()
    try {
      // Check if tables exist, if not create them
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'KARYAWAN', 'USER') DEFAULT 'USER',
        isActive BOOLEAN DEFAULT true,
        failedLoginAttempts INT DEFAULT 0,
        lockoutUntil DATETIME NULL,
        lastLoginAt DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `)

      await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

      await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        categoryId VARCHAR(36) NOT NULL,
        description LONGTEXT NOT NULL,
        sizes VARCHAR(255) NOT NULL,
        \`condition\` VARCHAR(10) NOT NULL,
        price INT NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        photoUrl VARCHAR(500),
        userId VARCHAR(36) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_categoryId (categoryId),
        INDEX idx_userId (userId),
        INDEX idx_createdAt (createdAt)
      )
    `)

      // Add stock column if it doesn't exist (for existing databases)
      try {
        await connection.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 0
      `)
      } catch (error: any) {
        // Column might already exist, ignore error
        if (!error.message?.includes('Duplicate column name')) {
          console.warn('Could not add stock column:', error.message)
        }
      }

      // Add lockout columns if they don't exist (for existing databases)
      try {
        await connection.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS failedLoginAttempts INT DEFAULT 0
      `)
        await connection.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS lockoutUntil DATETIME NULL
      `)
        await connection.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS lastLoginAt DATETIME NULL
      `)
      } catch (error: any) {
        if (!error.message?.includes('Duplicate column name')) {
          console.warn('Could not add lockout columns:', error.message)
        }
      }

      await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_photos (
        id VARCHAR(36) PRIMARY KEY,
        url VARCHAR(500) NOT NULL,
        productId VARCHAR(36) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_productId (productId)
      )
    `)

      await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        entity VARCHAR(50) NOT NULL,
        entityId VARCHAR(36) NOT NULL,
        changes JSON,
        userId VARCHAR(36) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_createdAt (createdAt)
      )
    `)

      await connection.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        productId VARCHAR(36) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_productId (productId)
      )
    `)

      await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        totalAmount INT NOT NULL,
        shippingAddress VARCHAR(255) NOT NULL,
        shippingCity VARCHAR(100) NOT NULL,
        shippingPostal VARCHAR(20) NOT NULL,
        shippingPhone VARCHAR(20) NOT NULL,
        paymentStatus VARCHAR(20) DEFAULT 'PENDING',
        orderStatus VARCHAR(20) DEFAULT 'PENDING',
        paymentId VARCHAR(255) NULL,
        paymentUrl TEXT NULL,
        notes TEXT NULL,
        processedAt DATETIME NULL,
        processedBy VARCHAR(36) NULL,
        rating INT NULL,
        reviewText TEXT NULL,
        reviewedAt DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_createdAt (createdAt)
      )
    `)

      // Ensure payment columns exist (for existing databases)
      try {
        await connection.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS paymentId VARCHAR(255) NULL`)
        await connection.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS paymentUrl TEXT NULL`)
      } catch (e) {
        console.warn('Could not ensure payment columns:', e)
      }

      await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY,
        orderId VARCHAR(36) NOT NULL,
        productId VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        price INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_orderId (orderId),
        INDEX idx_productId (productId)
      )
    `)

      // Ensure all order columns exist (best-effort)
      try {
        await connection.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT NULL`)
        await connection.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS processedAt DATETIME NULL`)
        await connection.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS processedBy VARCHAR(36) NULL`)
        await connection.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS rating INT NULL`)
        await connection.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS reviewText TEXT NULL`)
        await connection.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS reviewedAt DATETIME NULL`)
      } catch (e) {
        try {
          const [rows]: any = await connection.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders'`,
            [poolConfig.database || process.env.DB_NAME || 'graky_store']
          )
          const existing = (rows || []).map((r: any) => r.COLUMN_NAME)
          if (!existing.includes('notes')) {
            await connection.query(`ALTER TABLE orders ADD COLUMN notes TEXT NULL`)
          }
          if (!existing.includes('processedAt')) {
            await connection.query(`ALTER TABLE orders ADD COLUMN processedAt DATETIME NULL`)
          }
          if (!existing.includes('processedBy')) {
            await connection.query(`ALTER TABLE orders ADD COLUMN processedBy VARCHAR(36) NULL`)
          }
          if (!existing.includes('rating')) {
            await connection.query(`ALTER TABLE orders ADD COLUMN rating INT NULL`)
          }
          if (!existing.includes('reviewText')) {
            await connection.query(`ALTER TABLE orders ADD COLUMN reviewText TEXT NULL`)
          }
          if (!existing.includes('reviewedAt')) {
            await connection.query(`ALTER TABLE orders ADD COLUMN reviewedAt DATETIME NULL`)
          }
        } catch (e2) {
          console.warn('Could not ensure order columns (non-fatal):', e2)
        }
      }

      // Insert default categories if not exist
      const [categories]: any = await connection.query('SELECT COUNT(*) as count FROM categories')
      if (categories[0].count === 0) {
        await connection.query(`
        INSERT INTO categories (id, name, icon) VALUES
        ('cat-topi', 'Topi', '🎩'),
        ('cat-kaos', 'Kaos', '👕'),
        ('cat-kemeja', 'Kemeja', '👔'),
        ('cat-jacket', 'Jacket', '🧥'),
        ('cat-hoodie', 'Hoodie', '🎽'),
        ('cat-jeans', 'Celana Jeans', '👖'),
        ('cat-shorts', 'Celana Pendek', '🩳'),
        ('cat-shoes', 'Sepatu', '👟')
      `)
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('✓ Database initialized successfully')
      }

      isInitialized = true
    } catch (error) {
      console.error('✗ Database initialization error:', error)
      throw error
    } finally {
      connection.release()
    }
  })()

  return initPromise
}

// User functions
export async function createUser(name: string, email: string, password: string, role: string = 'USER') {
  // Ensure database is initialized before any operation (critical for Vercel serverless)
  if (!initializationAttempted) {
    initializationAttempted = true
    try {
      await initializeDatabase()
    } catch (error) {
      console.error('[DB Init] Failed to initialize database:', error)
      throw new Error('Database initialization failed')
    }
  }

  const connection = await pool.getConnection()
  try {
    // Hash password jika belum ter-hash (use 12 rounds for better security)
    const hashedPassword = password.startsWith('$2') ? password : await bcrypt.hash(password, 12)

    const id = randomUUID()
    await connection.query(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, role]
    )
    return { id, name, email, role }
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Email sudah terdaftar')
    }
    throw error
  } finally {
    connection.release()
  }
}

export async function getUserByEmail(email: string) {
  const connection = await pool.getConnection()
  try {
    const [rows]: any = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    return rows.length > 0 ? rows[0] : null
  } finally {
    connection.release()
  }
}

export async function getUserById(id: string) {
  const connection = await pool.getConnection()
  try {
    const [rows]: any = await connection.query(
      'SELECT id, name, email, role, isActive FROM users WHERE id = ?',
      [id]
    )
    return rows.length > 0 ? rows[0] : null
  } finally {
    connection.release()
  }
}

export async function getAllUsers() {
  const connection = await pool.getConnection()
  try {
    const [rows]: any = await connection.query(
      'SELECT id, name, email, role, isActive, createdAt FROM users ORDER BY createdAt DESC'
    )
    return rows
  } finally {
    connection.release()
  }
}

export async function updateUser(id: string, data: any) {
  const connection = await pool.getConnection()
  try {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const values = Object.values(data)
    await connection.query(
      `UPDATE users SET ${fields}, updatedAt = NOW() WHERE id = ?`,
      [...values, id]
    )
    return { id, ...data }
  } finally {
    connection.release()
  }
}

export async function deleteUser(id: string) {
  const connection = await pool.getConnection()
  try {
    await connection.query('DELETE FROM users WHERE id = ?', [id])
    return { success: true }
  } finally {
    connection.release()
  }
}

// Product functions
export async function createProduct(productData: any) {
  const connection = await pool.getConnection()
  try {
    const id = randomUUID()

    // Simpan produk
    await connection.query(
      'INSERT INTO products (id, name, categoryId, description, sizes, `condition`, price, stock, photoUrl, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        productData.name,
        productData.categoryId,
        productData.description,
        JSON.stringify(productData.sizes),
        productData.condition,
        productData.price,
        productData.stock || 0,
        productData.photoUrls?.[0] || null, // Simpan foto pertama sebagai photoUrl
        productData.userId,
      ]
    )

    // Simpan foto tambahan ke gallery_photos
    if (productData.photoUrls && productData.photoUrls.length > 1) {
      for (let i = 1; i < productData.photoUrls.length; i++) {
        await connection.query(
          'INSERT INTO gallery_photos (id, url, productId) VALUES (?, ?, ?)',
          [randomUUID(), productData.photoUrls[i], id]
        )
      }
    }

    return { id, ...productData }
  } finally {
    connection.release()
  }
}

// GET all products (public)
export async function getAllProducts() {
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.query(
      `SELECT 
        id, name, categoryId, description, sizes, 
        \`condition\`, price, stock, photoUrl, userId, createdAt
       FROM products 
       ORDER BY createdAt DESC`
    )

    const products = (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      description: row.description,
      condition: row.condition,
      price: row.price,
      stock: row.stock ?? 0,
      sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : (row.sizes || []),
      photoUrl: row.photoUrl,
      userId: row.userId,
      createdAt: row.createdAt,
      rating: 4.5,
      sold: 0,
    }))

    // Fetch gallery photos for all products in one query
    const productIds = products.map(p => p.id)
    if (productIds.length === 0) return []

    // Validate all productIds are UUIDs to prevent SQL injection
    const validProductIds = productIds.filter(id =>
      typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id)
    )

    let photosByProduct: Record<string, string[]> = {}
    if (validProductIds.length > 0) {
      const placeholders = validProductIds.map(() => '?').join(',')
      const [photosRows]: any = await connection.query(
        `SELECT productId, url FROM gallery_photos WHERE productId IN (${placeholders})`,
        validProductIds
      )

      for (const pr of photosRows) {
        photosByProduct[pr.productId] = photosByProduct[pr.productId] || []
        photosByProduct[pr.productId].push(pr.url)
      }
    }

    // Build full photoUrls array: primary photoUrl first if exists, then gallery photos
    return products.map(p => {
      const gallery = photosByProduct[p.id] || []
      const photoUrls = []
      if (p.photoUrl) photoUrls.push(p.photoUrl)
      photoUrls.push(...gallery)
      return {
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        description: p.description,
        condition: p.condition,
        price: p.price,
        stock: p.stock ?? 0,
        sizes: p.sizes,
        photoUrls,
        userId: p.userId,
        createdAt: p.createdAt,
        rating: p.rating,
        sold: p.sold,
      }
    })
  } catch (error) {
    console.error('Error getting all products:', error)
    return []
  } finally {
    connection.release()
  }
}

// GET products by user ID
export async function getProductsByUserId(userId: string) {
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.query(
      `SELECT 
        id, name, categoryId, description, sizes, 
        \`condition\`, price, stock, photoUrl, userId, createdAt
       FROM products 
       WHERE userId = ?
       ORDER BY createdAt DESC`,
      [userId]
    )
    const products = (rows as any[]).map(row => ({
      ...row,
      sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes,
      stock: row.stock ?? 0,
      photoUrl: row.photoUrl,
    }))

    const productIds = products.map(p => p.id)
    if (productIds.length === 0) {
      return products.map(p => ({ ...p, photoUrls: p.photoUrl ? [p.photoUrl] : [] }))
    }

    // Validate all productIds are UUIDs to prevent SQL injection
    const validProductIds = productIds.filter(id =>
      typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id)
    )

    let photosByProduct: Record<string, string[]> = {}
    if (validProductIds.length > 0) {
      const placeholders = validProductIds.map(() => '?').join(',')
      const [photosRows]: any = await connection.query(
        `SELECT productId, url FROM gallery_photos WHERE productId IN (${placeholders})`,
        validProductIds
      )

      for (const pr of photosRows) {
        photosByProduct[pr.productId] = photosByProduct[pr.productId] || []
        photosByProduct[pr.productId].push(pr.url)
      }
    }

    return products.map(p => {
      const gallery = photosByProduct[p.id] || []
      const photoUrls = []
      if (p.photoUrl) photoUrls.push(p.photoUrl)
      photoUrls.push(...gallery)
      return {
        ...p,
        photoUrls,
      }
    })
  } catch (error) {
    console.error('Error getting products by user:', error)
    return []
  } finally {
    connection.release()
  }
}

export async function getProductById(id: string) {
  const connection = await pool.getConnection()
  try {
    const [rows]: any = await connection.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    )
    if (rows.length === 0) return null

    const row = rows[0]
    const sizes = typeof row.sizes === 'string' ? JSON.parse(row.sizes) : (row.sizes || [])
    // Fetch gallery photos for this product
    const [photoRows]: any = await connection.query(
      'SELECT url FROM gallery_photos WHERE productId = ? ORDER BY createdAt ASC',
      [id]
    )
    const galleryUrls = (photoRows || []).map((r: any) => r.url)
    const photoUrls = []
    if (row.photoUrl) photoUrls.push(row.photoUrl)
    photoUrls.push(...galleryUrls)

    return {
      ...row,
      sizes,
      photoUrls,
      stock: row.stock ?? 0,
      rating: 4.5,
      sold: 0,
    }
  } catch (error) {
    console.error('Error getting product by ID:', error)
    return null
  } finally {
    connection.release()
  }
}

export async function updateProduct(id: string, data: any) {
  const connection = await pool.getConnection()
  try {
    // Prepare update fields
    const updateFields: string[] = []
    const values: any[] = []

    // Handle each field
    if (data.name !== undefined) {
      updateFields.push('name = ?')
      values.push(data.name)
    }
    if (data.categoryId !== undefined) {
      updateFields.push('categoryId = ?')
      values.push(data.categoryId)
    }
    if (data.description !== undefined) {
      updateFields.push('description = ?')
      values.push(data.description)
    }
    if (data.condition !== undefined) {
      updateFields.push('`condition` = ?')
      values.push(data.condition)
    }
    if (data.price !== undefined) {
      updateFields.push('price = ?')
      values.push(data.price)
    }
    if (data.stock !== undefined) {
      updateFields.push('stock = ?')
      values.push(data.stock)
    }
    if (data.sizes !== undefined) {
      updateFields.push('sizes = ?')
      values.push(JSON.stringify(data.sizes))
    }
    // If photoUrls provided, set primary photo (first) in products.photoUrl
    if (data.photoUrls !== undefined) {
      const primary = data.photoUrls.length > 0 ? data.photoUrls[0] : null
      updateFields.push('photoUrl = ?')
      values.push(primary)
    }

    // Always update timestamp
    updateFields.push('updatedAt = NOW()')

    // Add product id as last parameter
    values.push(id)

    if (updateFields.length > 1) { // More than just updatedAt
      const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`
      await connection.query(query, values)
    }

    // If photoUrls provided, synchronize gallery_photos:
    if (data.photoUrls !== undefined) {
      // Remove existing gallery photos for this product
      await connection.query('DELETE FROM gallery_photos WHERE productId = ?', [id])
      // Insert remaining photos (from index 1..)
      if (data.photoUrls.length > 1) {
        const inserts: any[] = []
        for (let i = 1; i < data.photoUrls.length; i++) {
          inserts.push([randomUUID(), data.photoUrls[i], id])
        }
        // Bulk insert
        const placeholders = inserts.map(() => '(?, ?, ?)').join(', ')
        const flatValues = inserts.flat()
        await connection.query(
          `INSERT INTO gallery_photos (id, url, productId) VALUES ${placeholders}`,
          flatValues
        )
      }
    }

    return { id, ...data }
  } catch (error) {
    console.error('Update product error:', error)
    throw error
  } finally {
    connection.release()
  }
}

export async function deleteProduct(id: string) {
  const connection = await pool.getConnection()
  try {
    await connection.query('DELETE FROM products WHERE id = ?', [id])
    return { success: true }
  } finally {
    connection.release()
  }
}

export async function getCategories() {
  const connection = await pool.getConnection()
  try {
    const [rows]: any = await connection.query('SELECT * FROM categories')
    return Array.isArray(rows) ? rows : []
  } catch (error) {
    console.error('[DB] getCategories error:', error)
    // Return empty array on error for graceful fallback
    return []
  } finally {
    connection.release()
  }
}

export async function updateUserPasswordByEmail(email: string, hashedPassword: string) {
  const connection = await pool.getConnection()
  try {
    await connection.query(
      'UPDATE users SET password = ?, updatedAt = NOW() WHERE email = ?',
      [hashedPassword, email]
    )
    return { success: true }
  } finally {
    connection.release()
  }
}

// Cart functions
export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  const connection = await pool.getConnection()
  try {
    const id = randomUUID()
    await connection.query(
      'INSERT INTO carts (id, userId, productId, quantity) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
      [id, userId, productId, quantity, quantity]
    )
    return { success: true }
  } finally {
    connection.release()
  }
}

export async function getCart(userId: string) {
  const connection = await pool.getConnection()
  try {
    const [cartItems]: any = await connection.query(
      `SELECT 
        c.id, c.quantity, 
        p.id as productId, p.name, p.price, p.photoUrl, 
        p.categoryId, p.condition
      FROM carts c
      JOIN products p ON c.productId = p.id
      WHERE c.userId = ?
      ORDER BY c.createdAt DESC`,
      [userId]
    )

    return cartItems.map((item: any) => ({
      cartId: item.id,
      quantity: item.quantity,
      product: {
        id: item.productId,
        name: item.name,
        price: item.price,
        photoUrl: item.photoUrl,
        categoryId: item.categoryId,
        condition: item.condition,
      },
    }))
  } finally {
    connection.release()
  }
}

export async function updateCartQuantity(cartId: string, quantity: number) {
  const connection = await pool.getConnection()
  try {
    if (quantity <= 0) {
      await connection.query('DELETE FROM carts WHERE id = ?', [cartId])
    } else {
      await connection.query('UPDATE carts SET quantity = ? WHERE id = ?', [quantity, cartId])
    }
    return { success: true }
  } finally {
    connection.release()
  }
}

export async function removeFromCart(cartId: string) {
  const connection = await pool.getConnection()
  try {
    await connection.query('DELETE FROM carts WHERE id = ?', [cartId])
    return { success: true }
  } finally {
    connection.release()
  }
}

export async function clearCart(userId: string) {
  const connection = await pool.getConnection()
  try {
    await connection.query('DELETE FROM carts WHERE userId = ?', [userId])
    return { success: true }
  } finally {
    connection.release()
  }
}

// Order functions
export async function createOrder(userId: string, cartItems: any[], shippingData: any) {
  const connection = await pool.getConnection()
  try {
    const orderId = randomUUID()
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

    await connection.query(
      `INSERT INTO orders 
        (id, userId, totalAmount, shippingAddress, shippingCity, shippingPostal, 
         shippingPhone, paymentStatus, orderStatus) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        userId,
        totalAmount,
        shippingData.address,
        shippingData.city,
        shippingData.postal,
        shippingData.phone,
        'PENDING',
        'PENDING',
      ]
    )

    // Insert order items
    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (id, orderId, productId, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          orderId,
          item.product.id,
          item.quantity,
          item.product.price,
        ]
      )
    }

    // Clear cart
    await clearCart(userId)

    return { orderId, totalAmount }
  } finally {
    connection.release()
  }
}

export async function getOrders(userId: string) {
  const connection = await pool.getConnection()
  try {
    const [orders]: any = await connection.query(
      `SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC`,
      [userId]
    )

    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const [items]: any = await connection.query(
          `SELECT oi.*, p.name, p.photoUrl 
           FROM order_items oi
           JOIN products p ON oi.productId = p.id
           WHERE oi.orderId = ?`,
          [order.id]
        )
        return { ...order, items }
      })
    )

    return ordersWithItems
  } finally {
    connection.release()
  }
}

export async function getOrderById(orderId: string) {
  const connection = await pool.getConnection()
  try {
    const [orders]: any = await connection.query(
      `SELECT o.*, u.id as userId, u.name as userName, u.email as userEmail
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       WHERE o.id = ?`,
      [orderId]
    )

    if (orders.length === 0) return null

    const order = orders[0]
    const [items]: any = await connection.query(
      `SELECT oi.*, p.id as productId, p.name, p.price, p.photoUrl 
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       WHERE oi.orderId = ?`,
      [orderId]
    )

    return {
      ...order,
      user: {
        id: order.userId,
        name: order.userName,
        email: order.userEmail
      },
      items: items.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.productId,
          name: item.name
        }
      }))
    }
  } finally {
    connection.release()
  }
}

export async function updateOrderPayment(orderId: string, paymentId: string, paymentUrl: string) {
  const connection = await pool.getConnection()
  try {
    await connection.query(
      'UPDATE orders SET paymentId = ?, paymentUrl = ?, updatedAt = NOW() WHERE id = ?',
      [paymentId, paymentUrl, orderId]
    )
    return { success: true }
  } finally {
    connection.release()
  }
}

export async function updateOrderStatus(orderId: string, status: string, paymentStatus?: string) {
  const connection = await pool.getConnection()
  try {
    const updates: string[] = ['orderStatus = ?']
    const values: any[] = [status]

    if (paymentStatus) {
      updates.push('paymentStatus = ?')
      values.push(paymentStatus)
    }

    values.push(orderId)

    await connection.query(
      `UPDATE orders SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`,
      values
    )
    return { success: true }
  } finally {
    connection.release()
  }
}

export async function getAllOrders(page: number = 1, limit: number = 10, status: string = 'ALL') {
  const connection = await pool.getConnection()
  try {
    const offset = (page - 1) * limit
    let whereClause = ''
    const params: any[] = []

    if (status !== 'ALL') {
      whereClause = 'WHERE o.orderStatus = ?'
      params.push(status)
    }

    // Get total count
    const [countResult]: any = await connection.query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    )
    const totalOrders = countResult[0]?.total || 0
    const totalPages = Math.ceil(totalOrders / limit)

    // Get paginated orders with user info
    const [orders]: any = await connection.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.userId = u.id
       ${whereClause}
       ORDER BY o.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    // Format response
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      shippingCity: order.shippingCity,
      user: {
        name: order.user_name,
        email: order.user_email
      },
      createdAt: order.createdAt,
      items: [] // Will be populated if needed
    }))

    return {
      orders: formattedOrders,
      totalPages,
      currentPage: page,
      totalOrders
    }
  } finally {
    connection.release()
  }
}

export async function updateOrderDetails(id: string, data: any) {
  const connection = await pool.getConnection()
  try {
    const updateFields: string[] = []
    const values: any[] = []

    if (data.orderStatus) {
      updateFields.push('orderStatus = ?')
      values.push(data.orderStatus)
    }
    if (data.paymentStatus) {
      updateFields.push('paymentStatus = ?')
      values.push(data.paymentStatus)
    }
    if (data.notes !== undefined) {
      updateFields.push('notes = ?')
      values.push(data.notes)
    }
    if (data.processedBy) {
      updateFields.push('processedBy = ?')
      values.push(data.processedBy)
      updateFields.push('processedAt = NOW()')
    }

    // Always update timestamp
    updateFields.push('updatedAt = NOW()')

    values.push(id)

    if (updateFields.length > 1) {
      const query = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`
      await connection.query(query, values)
    }

    return { success: true }
  } finally {
    connection.release()
  }
}

export async function deleteOrder(id: string) {
  const connection = await pool.getConnection()
  try {
    // Delete order items first (foreign key constraint)
    await connection.query('DELETE FROM order_items WHERE orderId = ?', [id])

    // Delete order
    const [result]: any = await connection.query('DELETE FROM orders WHERE id = ?', [id])

    return { success: result.affectedRows > 0 }
  } finally {
    connection.release()
  }
}
