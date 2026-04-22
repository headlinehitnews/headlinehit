const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function isAuthorized(request, env) {
  const authHeader = request.headers.get('Authorization');
  return authHeader === 'Bearer ' + env.BOT_SECRET;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/links') {
      const data = await env.NEWS_LINKS.get('links');
      if (!data) {
        const empty = JSON.stringify({ lastUpdated: new Date().toISOString(), links: [] });
        return new Response(empty, {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      return new Response(data, {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST' && url.pathname === '/links') {
      if (!isAuthorized(request, env)) {
        return new Response('Unauthorized', { status: 401 });
      }
      const body = await request.json();
      await env.NEWS_LINKS.put('links', JSON.stringify(body));
      return new Response('OK', { headers: CORS_HEADERS });
    }

    if (request.method === 'GET' && url.pathname.startsWith('/pending/')) {
      if (!isAuthorized(request, env)) {
        return new Response('Unauthorized', { status: 401 });
      }
      const userId = url.pathname.split('/')[2];
      const data = await env.NEWS_LINKS.get('pending_' + userId);
      if (!data) {
        return new Response('null', {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
      return new Response(data, {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST' && url.pathname.startsWith('/pending/')) {
      if (!isAuthorized(request, env)) {
        return new Response('Unauthorized', { status: 401 });
      }
      const userId = url.pathname.split('/')[2];
      const body = await request.json();
      await env.NEWS_LINKS.put('pending_' + userId, JSON.stringify(body));
      return new Response('OK', { headers: CORS_HEADERS });
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/pending/')) {
      if (!isAuthorized(request, env)) {
        return new Response('Unauthorized', { status: 401 });
      }
      const userId = url.pathname.split('/')[2];
      await env.NEWS_LINKS.delete('pending_' + userId);
      return new Response('OK', { headers: CORS_HEADERS });
    }

    if (request.method === 'GET' && url.pathname === '/quotes') {
      try {
        const symbols = ['^GSPC', 'GC=F', 'CL=F', 'EURUSD=X'];
        const cookieRes = await fetch('https://finance.yahoo.com', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html',
          }
        });
        const cookies = cookieRes.headers.get('set-cookie') || '';
        const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Cookie': cookies
          }
        });
        const crumb = await crumbRes.text();
        const yahooUrl = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=' + symbols.join(',') + '&crumb=' + encodeURIComponent(crumb);
        const response = await fetch(yahooUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Cookie': cookies,
            'Accept': 'application/json'
          }
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
