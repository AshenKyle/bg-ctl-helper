const MongoClient = require('mongodb').MongoClient

const liftToArray = i => Array.isArray(i) ? i : [i]

/**
 * Aysnc. Creates a connection pool and interface to the mongo database
 * Resolves with the standard tryout interface
 * Rejects with a connection error that cannot be recovered
 */
module.exports = async ({ user, password, port, dbName, collectionName }) => {
  const url = `mongodb://${user}:${password}@ds1${port}.mlab.com:${port}/${dbName}`
  const client = new MongoClient(url)

  await client.connect()
  const col = client.db(dbName).collection(collectionName)
  
  return {
    close: async () => client.close(),
    removeAll: async () => col.removeMany(),
    insert: async ({ tryouts }) => col.insertMany(liftToArray(tryouts)),
    remove: async ({ id }) => col.findOneAndDelete({ id }),
    findAll: async () => col.find({}).toArray()
  }
}
