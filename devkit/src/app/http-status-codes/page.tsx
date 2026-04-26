'use client';

import { useState, useMemo } from 'react';
import { Copy, Check, Search, Filter } from 'lucide-react';

interface StatusCode {
  code: number;
  name: string;
  category: 'informational' | 'success' | 'redirection' | 'client-error' | 'server-error';
  description: string;
}

const statusCodes: StatusCode[] = [
  { code: 100, name: 'Continue', category: 'informational', description: 'The server has received the request headers and the client should proceed to send the request body.' },
  { code: 101, name: 'Switching Protocols', category: 'informational', description: 'The requester has asked the server to switch protocols and the server has agreed to do so.' },
  { code: 102, name: 'Processing', category: 'informational', description: 'The server is processing the request but no response is available yet.' },
  { code: 103, name: 'Early Hints', category: 'informational', description: 'Used to return some response headers before the final HTTP message.' },
  { code: 200, name: 'OK', category: 'success', description: 'The request succeeded. The result meaning depends on the HTTP method.' },
  { code: 201, name: 'Created', category: 'success', description: 'The request succeeded, and a new resource was created as a result.' },
  { code: 202, name: 'Accepted', category: 'success', description: 'The request has been accepted for processing, but the processing has not been completed.' },
  { code: 203, name: 'Non-Authoritative Information', category: 'success', description: 'The request succeeded but the returned content is from a third party.' },
  { code: 204, name: 'No Content', category: 'success', description: 'The request succeeded but there is no content to send back.' },
  { code: 205, name: 'Reset Content', category: 'success', description: 'The request succeeded and the user agent should reset the document view.' },
  { code: 206, name: 'Partial Content', category: 'success', description: 'The request succeeded and the body contains the requested range of data.' },
  { code: 300, name: 'Multiple Choices', category: 'redirection', description: 'The request has more than one possible response.' },
  { code: 301, name: 'Moved Permanently', category: 'redirection', description: 'The URL of the requested resource has been changed permanently.' },
  { code: 302, name: 'Found', category: 'redirection', description: 'The URL of the requested resource has been changed temporarily.' },
  { code: 303, name: 'See Other', category: 'redirection', description: 'The response can be found under a different URL using GET.' },
  { code: 304, name: 'Not Modified', category: 'redirection', description: 'Indicates that the resource has not been modified since the last request.' },
  { code: 307, name: 'Temporary Redirect', category: 'redirection', description: 'The request should be repeated with another URL.' },
  { code: 308, name: 'Permanent Redirect', category: 'redirection', description: 'The request and all future requests should be repeated using another URL.' },
  { code: 400, name: 'Bad Request', category: 'client-error', description: 'The server cannot or will not process the request due to something that is perceived to be a client error.' },
  { code: 401, name: 'Unauthorized', category: 'client-error', description: 'Although the HTTP standard specifies "unauthorized", semantically this means "unauthenticated".' },
  { code: 403, name: 'Forbidden', category: 'client-error', description: 'The client does not have access rights to the content.' },
  { code: 404, name: 'Not Found', category: 'client-error', description: 'The server can not find the requested resource.' },
  { code: 405, name: 'Method Not Allowed', category: 'client-error', description: 'The request method is known by the server but is not supported by the target resource.' },
  { code: 406, name: 'Not Acceptable', category: 'client-error', description: 'The server cannot produce a response matching the accept headers.' },
  { code: 407, name: 'Proxy Authentication Required', category: 'client-error', description: 'The client must first authenticate itself with the proxy.' },
  { code: 408, name: 'Request Timeout', category: 'client-error', description: 'The server would like to shut down this unused connection.' },
  { code: 409, name: 'Conflict', category: 'client-error', description: 'The request conflicts with the current state of the server.' },
  { code: 410, name: 'Gone', category: 'client-error', description: 'The content has been permanently deleted from the server.' },
  { code: 411, name: 'Length Required', category: 'client-error', description: 'The server refused to accept the request without a defined Content-Length.' },
  { code: 412, name: 'Precondition Failed', category: 'client-error', description: 'One or more conditions in the request header fields evaluated to false.' },
  { code: 413, name: 'Content Too Large', category: 'client-error', description: 'The request entity is larger than limits defined by the server.' },
  { code: 414, name: 'URI Too Long', category: 'client-error', description: 'The URI requested by the client is longer than the server is willing to interpret.' },
  { code: 415, name: 'Unsupported Media Type', category: 'client-error', description: 'The media format of the requested data is not supported by the server.' },
  { code: 416, name: 'Range Not Satisfiable', category: 'client-error', description: 'The range specified in the Range header is not valid for the resource.' },
  { code: 417, name: 'Expectation Failed', category: 'client-error', description: 'The expectation indicated by the Expect header cannot be met by the server.' },
  { code: 418, name: "I'm a teapot", category: 'client-error', description: 'The server refuses to brew coffee because it is a teapot.' },
  { code: 422, name: 'Unprocessable Content', category: 'client-error', description: 'The request was well-formed but contains semantic errors.' },
  { code: 429, name: 'Too Many Requests', category: 'client-error', description: 'The user has sent too many requests in a given amount of time.' },
  { code: 500, name: 'Internal Server Error', category: 'server-error', description: 'The server has encountered a situation it does not know how to handle.' },
  { code: 501, name: 'Not Implemented', category: 'server-error', description: 'The request method is not supported by the server.' },
  { code: 502, name: 'Bad Gateway', category: 'server-error', description: 'The server received an invalid response from the upstream server.' },
  { code: 503, name: 'Service Unavailable', category: 'server-error', description: 'The server is not ready to handle the request.' },
  { code: 504, name: 'Gateway Timeout', category: 'server-error', description: 'The server is acting as a gateway and cannot get a response in time.' },
  { code: 505, name: 'HTTP Version Not Supported', category: 'server-error', description: 'The HTTP version used in the request is not supported by the server.' },
];

const categories = [
  { id: 'all', name: 'All', color: 'bg-gray-500' },
  { id: 'informational', name: '1xx', color: 'bg-blue-500' },
  { id: 'success', name: '2xx', color: 'bg-green-500' },
  { id: 'redirection', name: '3xx', color: 'bg-yellow-500' },
  { id: 'client-error', name: '4xx', color: 'bg-orange-500' },
  { id: 'server-error', name: '5xx', color: 'bg-red-500' },
];

export default function HttpStatusCodes() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const filteredCodes = useMemo(() => {
    return statusCodes.filter((code) => {
      const matchesSearch = 
        code.code.toString().includes(search) ||
        code.name.toLowerCase().includes(search.toLowerCase()) ||
        code.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || code.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const copyCode = (code: number) => {
    navigator.clipboard.writeText(code.toString());
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'informational': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'redirection': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'client-error': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'server-error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'informational': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'redirection': return 'bg-yellow-500';
      case 'client-error': return 'bg-orange-500';
      case 'server-error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          HTTP Status Codes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Reference for all HTTP status codes with descriptions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-400" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedCategory === cat.id
                  ? `${cat.color} text-white`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filteredCodes.length} status codes found</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCodes.map((code) => (
          <div
            key={code.code}
            className={`p-4 rounded-xl border ${getCategoryColor(code.category)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-sm font-bold text-white ${getBadgeColor(code.category)}`}>
                  {code.code}
                </span>
                <button
                  onClick={() => copyCode(code.code)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Copy status code"
                >
                  {copiedCode === code.code ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              <span className="text-xs text-gray-500">{code.category}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{code.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{code.description}</p>
          </div>
        ))}
      </div>

      {filteredCodes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No status codes found matching your search.</p>
        </div>
      )}
    </div>
  );
}
