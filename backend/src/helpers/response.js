/**
 * Send a JSON response — replaces res.json() from Express
 */
const sendJSON = (res, statusCode, data) => {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
};

const ok      = (res, data)    => sendJSON(res, 200, data);
const created = (res, data)    => sendJSON(res, 201, data);
const badReq  = (res, message) => sendJSON(res, 400, { success: false, message });
const unauth  = (res, message) => sendJSON(res, 401, { success: false, message });
const forbidden=(res, message) => sendJSON(res, 403, { success: false, message });
const notFound= (res, message) => sendJSON(res, 404, { success: false, message });
const conflict= (res, message) => sendJSON(res, 409, { success: false, message });
const serverErr=(res, message) => sendJSON(res, 500, { success: false, message });

module.exports = { sendJSON, ok, created, badReq, unauth, forbidden, notFound, conflict, serverErr };
