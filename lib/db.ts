import dns from 'node:dns/promises'
dns.setServers(['1.1.1.1', '1.0.0.1'])

import mongoose from 'mongoose'

type ConnectionState = {
  isConnected?: number
  lastFailure?: number
}

const connection: ConnectionState = {}

const FAILURE_COOLDOWN_MS = 10_000

const connectDB = async (): Promise<boolean> => {
  if (connection.isConnected === 1 && mongoose.connection.readyState === 1) {
    return true
  }

  if (connection.lastFailure && Date.now() - connection.lastFailure < FAILURE_COOLDOWN_MS) {
    return false
  }

  if (mongoose.connection.readyState === 1) {
    connection.isConnected = 1
    return true
  }

  if (!process.env.MONGODB_URI) {
    console.log('🔴 MONGODB_URI missing - set it in .env')
    return false
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
      maxPoolSize: 5,
      retryWrites: true,
    })

    connection.isConnected = db.connections[0].readyState
    connection.lastFailure = undefined

    if (connection.isConnected === 1) {
      console.log('🚀 Successfully connected to database')
      return true
    } else {
      console.log('🔴 Failed to connect to database - readyState:', connection.isConnected)
      connection.lastFailure = Date.now()
      return false
    }
  } catch (error) {
    connection.lastFailure = Date.now()
    connection.isConnected = 0
    const message = (error as Error).message

    if (message.includes('querySrv ECONNREFUSED') || message.includes('querySrv ETIMEOUT')) {
      console.log(
        `🔴 Failed to connect to MongoDB: ${message}\n` +
          `   → DNS SRV lookup failed. Forced DNS to 1.1.1.1/1.0.0.1 via dns.setServers().\n` +
          `   → If still failing, check that the Atlas cluster ${process.env.MONGODB_URI?.match(/@([^/]+)/)?.[1] ?? '...'} exists and IP allowlist allows your IP.`
      )
    } else if (message.includes('authentication failed') || message.includes('bad auth')) {
      console.log(`🔴 MongoDB auth failed: ${message} → check username/password in MONGODB_URI`)
    } else {
      console.log('🔴 Failed to connect to MongoDB:', message)
    }
    return false
  }
}

export default connectDB
