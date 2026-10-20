export interface StatusCode {
  code: number;
  name: string;
  description: string;
}

export const STATUS_CODES: StatusCode[] = [
  { code: 100, name: 'Continue', description: 'The server got the request headers; the client should send the body.' },
  { code: 101, name: 'Switching Protocols', description: 'The server is switching protocols as asked, for example to WebSocket.' },
  { code: 103, name: 'Early Hints', description: 'Lets the browser start preloading resources while the server prepares the response.' },
  { code: 200, name: 'OK', description: 'The request succeeded.' },
  { code: 201, name: 'Created', description: 'A new resource was created. The Location header usually points to it.' },
  { code: 202, name: 'Accepted', description: 'The request was accepted for processing, but is not finished yet.' },
  { code: 203, name: 'Non-Authoritative Information', description: 'The response was changed by a proxy.' },
  { code: 204, name: 'No Content', description: 'Success, with no body to send back.' },
  { code: 205, name: 'Reset Content', description: 'Success; the client should reset the form or view.' },
  { code: 206, name: 'Partial Content', description: 'Only part of the resource is sent, as asked by a Range header.' },
  { code: 207, name: 'Multi-Status', description: 'WebDAV: several status codes for several operations.' },
  { code: 208, name: 'Already Reported', description: 'WebDAV: members already listed earlier in this response.' },
  { code: 226, name: 'IM Used', description: 'The response is the result of instance manipulations (delta encoding).' },
  { code: 300, name: 'Multiple Choices', description: 'There are several possible responses; the client should pick one.' },
  { code: 301, name: 'Moved Permanently', description: 'The resource moved for good. Browsers may change POST to GET when following it.' },
  { code: 302, name: 'Found', description: 'Temporary redirect. Browsers may change POST to GET when following it.' },
  { code: 303, name: 'See Other', description: 'Go to another URL with GET, typically after a form POST.' },
  { code: 304, name: 'Not Modified', description: 'The cached copy is still valid. No body is sent.' },
  { code: 307, name: 'Temporary Redirect', description: 'Temporary redirect that keeps the method and body.' },
  { code: 308, name: 'Permanent Redirect', description: 'Permanent redirect that keeps the method and body.' },
  { code: 400, name: 'Bad Request', description: 'The server cannot process the request because it is malformed.' },
  { code: 401, name: 'Unauthorized', description: 'Authentication is missing or invalid. Really means "unauthenticated".' },
  { code: 402, name: 'Payment Required', description: 'Reserved; some APIs use it for billing or quota problems.' },
  { code: 403, name: 'Forbidden', description: 'The server knows who you are, but you may not access this.' },
  { code: 404, name: 'Not Found', description: 'There is nothing at this URL.' },
  { code: 405, name: 'Method Not Allowed', description: 'The resource exists but does not support this method. See the Allow header.' },
  { code: 406, name: 'Not Acceptable', description: 'No representation matches the Accept headers.' },
  { code: 407, name: 'Proxy Authentication Required', description: 'Authenticate with the proxy first.' },
  { code: 408, name: 'Request Timeout', description: 'The server timed out waiting for the request.' },
  { code: 409, name: 'Conflict', description: 'The request conflicts with the current state, such as an edit conflict.' },
  { code: 410, name: 'Gone', description: 'The resource was here but is gone for good.' },
  { code: 411, name: 'Length Required', description: 'A Content-Length header is required.' },
  { code: 412, name: 'Precondition Failed', description: 'A conditional header such as If-Match did not match.' },
  { code: 413, name: 'Content Too Large', description: 'The request body is larger than the server allows.' },
  { code: 414, name: 'URI Too Long', description: 'The URL is longer than the server will handle.' },
  { code: 415, name: 'Unsupported Media Type', description: 'The body format (Content-Type) is not supported.' },
  { code: 416, name: 'Range Not Satisfiable', description: 'The requested Range is outside the resource.' },
  { code: 417, name: 'Expectation Failed', description: 'The Expect header cannot be met.' },
  { code: 418, name: "I'm a teapot", description: 'An April Fools joke from RFC 2324. Some sites use it to turn away bots.' },
  { code: 421, name: 'Misdirected Request', description: 'The request went to a server that cannot answer for this host.' },
  { code: 422, name: 'Unprocessable Content', description: 'The syntax is fine but the content fails validation.' },
  { code: 423, name: 'Locked', description: 'WebDAV: the resource is locked.' },
  { code: 424, name: 'Failed Dependency', description: 'WebDAV: an earlier request this depends on failed.' },
  { code: 425, name: 'Too Early', description: 'The server will not risk processing a request that might be replayed.' },
  { code: 426, name: 'Upgrade Required', description: 'Switch to another protocol, given in the Upgrade header.' },
  { code: 428, name: 'Precondition Required', description: 'The request must be conditional, to prevent lost updates.' },
  { code: 429, name: 'Too Many Requests', description: 'Rate limited. Check Retry-After before trying again.' },
  { code: 431, name: 'Request Header Fields Too Large', description: 'The headers (often cookies) are too large.' },
  { code: 451, name: 'Unavailable For Legal Reasons', description: 'Blocked for legal reasons, such as a court order.' },
  { code: 500, name: 'Internal Server Error', description: 'Something went wrong on the server.' },
  { code: 501, name: 'Not Implemented', description: 'The server does not support this functionality.' },
  { code: 502, name: 'Bad Gateway', description: 'A proxy or gateway got an invalid response from the upstream server.' },
  { code: 503, name: 'Service Unavailable', description: 'The server is overloaded or down for maintenance. See Retry-After.' },
  { code: 504, name: 'Gateway Timeout', description: 'A proxy or gateway did not get a response from upstream in time.' },
  { code: 505, name: 'HTTP Version Not Supported', description: 'The HTTP version is not supported.' },
  { code: 506, name: 'Variant Also Negotiates', description: 'Content negotiation is misconfigured on the server.' },
  { code: 507, name: 'Insufficient Storage', description: 'WebDAV: the server is out of space.' },
  { code: 508, name: 'Loop Detected', description: 'WebDAV: the server found an infinite loop.' },
  { code: 510, name: 'Not Extended', description: 'More extensions to the request are needed.' },
  { code: 511, name: 'Network Authentication Required', description: 'Log in to the network first, for example a Wi-Fi captive portal.' },
];

export const CLASSES: Record<number, string> = { 1: 'Informational', 2: 'Success', 3: 'Redirection', 4: 'Client error', 5: 'Server error' };

export function searchCodes(q: string): StatusCode[] {
  const s = q.trim().toLowerCase();
  if (!s) return STATUS_CODES;
  // "4xx" or "4" lists a class
  const cls = /^([1-5])(xx)?$/.exec(s);
  if (cls && !STATUS_CODES.some((c) => String(c.code) === s)) return STATUS_CODES.filter((c) => String(c.code)[0] === cls[1]);
  return STATUS_CODES.filter((c) => String(c.code).startsWith(s) || c.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s));
}
