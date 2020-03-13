/**
 * Takes a handler and returns a new handler.
 * The new handler acts as normal, but if it throws an exception, it will
 * use the given maintainer to log a message, and the given client
 * to close the connection.
 */
export default (handler, { handlerName = "Unknown Handler", client, maintainer }) => args => {
  try {
    return handler(args)
  } catch (e) {
    if (maintainer) maintainer.send(`Uncaught error in handler '${handlerName}'\n${e.toString()}`)
    if (client) client.close()
  }
}