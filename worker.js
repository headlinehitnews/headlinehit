const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function isAuthorized(request, env) {
  const authHeader = request.headers.get('Authorization');
  return authHeader === 'Bearer ' + env.BOT_SECRET;
}

// ── RSS Feed list ────────────────────────────────────────────────
const FEEDS = [
  // Conservative & right-leaning
  { name: 'NY Post',              url: 'https://nypost.com/feed/' },
  { name: 'NY Post Politics',     url: 'https://nypost.com/politics/feed/' },
  { name: 'Fox News',             url: 'https://moxie.foxnews.com/google-publisher/latest.xml' },
  { name: 'Fox News Politics',    url: 'https://feeds.foxnews.com/foxnews/politics' },
  { name: 'Washington Examiner',  url: 'https://www.washingtonexaminer.com/feed' },
  { name: 'Washington Times',     url: 'https://www.washingtontimes.com/rss/headlines/news/' },
  { name: 'Breitbart',            url: 'https://feeds.feedburner.com/breitbart' },
  { name: 'Daily Wire',           url: 'https://www.dailywire.com/feeds/rss.xml' },
  { name: 'Just the News',        url: 'https://justthenews.com/feed' },
  { name: 'The Federalist',       url: 'https://thefederalist.com/feed/' },
  { name: 'Daily Caller',         url: 'https://dailycaller.com/feed/' },
  { name: 'Townhall',             url: 'https://townhall.com/rss/news' },
  { name: 'PJ Media',             url: 'https://pjmedia.com/feed/' },
  { name: 'RedState',             url: 'https://redstate.com/feed/' },
  { name: 'American Thinker',     url: 'https://www.americanthinker.com/rss/articles_feed.rss' },
  { name: 'National Review',      url: 'https://www.nationalreview.com/feed/' },
  { name: 'The Blaze',            url: 'https://www.theblaze.com/feeds/feed.rss' },
  { name: 'Western Journal',      url: 'https://www.westernjournal.com/feed/' },
  { name: 'Epoch Times',          url: 'https://www.theepochtimes.com/c-us-politics/feed' },
  { name: 'Newsmax',              url: 'https://www.newsmax.com/rss/Politics/16/' },
  { name: 'One America News',     url: 'https://www.oann.com/feed/' },
  { name: 'Twitchy',              url: 'https://twitchy.com/feed/' },
  { name: 'Hot Air',              url: 'https://hotair.com/feed/' },
  { name: 'Power Line',           url: 'https://www.powerlineblog.com/index.rdf' },
  // Center / mainstream (for broad coverage)
  { name: 'The Hill',             url: 'https://thehill.com/feed/' },
  { name: 'Politico',             url: 'https://rss.politico.com/politics-news.xml' },
  { name: 'RealClearPolitics',    url: 'https://www.realclearpolitics.com/index.xml' },
  { name: 'The Dispatch',         url: 'https://thedispatch.com/feed/' },
  { name: 'Reason',               url: 'https://reason.com/feed/' },
  { name: 'AP News',              url: 'https://feeds.apnews.com/rss/topnews' },
  { name: 'Reuters',              url: 'https://feeds.reuters.com/reuters/topNews' },
  { name: 'NBC News',             url: 'https://feeds.nbcnews.com/nbcnews/public/news' },
  { name: 'CBS News',             url: 'https://www.cbsnews.com/latest/rss/main' },
  { name: 'ABC News',             url: 'https://feeds.abcnews.com/abcnews/topstories' },
  { name: 'USA Today',            url: 'https://rss.usatoday.com/UsatodaycomNation-TopStories' },
  { name: 'New York Post Opinion',url: 'https://nypost.com/opinion/feed/' },
  // World / foreign policy
  { name: 'BBC News',             url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'The Guardian US',      url: 'https://www.theguardian.com/us-news/rss' },
  { name: 'Jerusalem Post',       url: 'https://www.jpost.com/rss/rssfeedsheadlines.aspx' },
  { name: 'Times of Israel',      url: 'https://www.timesofisrael.com/feed/' },
  // Business & economy
  { name: 'MarketWatch',          url: 'https://feeds.marketwatch.com/marketwatch/topstories/' },
  { name: 'Forbes',               url: 'https://www.forbes.com/most-popular/feed/' },
  { name: 'Business Insider',     url: 'https://feeds.businessinsider.com/custom/all' },
  { name: 'Zero Hedge',           url: 'https://feeds.feedburner.com/zerohedge/feed' },
  // Tech
  { name: 'TechCrunch',           url: 'https://techcrunch.com/feed/' },
  { name: 'The Verge',            url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Ars Technica',         url: 'https://feeds.arstechnica.com/arstechnica/index' },
  // Entertainment
  { name: 'Deadline',             url: 'https://deadline.com/feed/' },
  { name: 'The Wrap',             url: 'https://www.thewrap.com/feed/' },
  { name: 'Variety',              url: 'https://variety.com/feed/' },
  { name: 'Hollywood Reporter',   url: 'https://www.hollywoodreporter.com/feed/' },
  // Sports
  { name: 'ESPN',                 url: 'https://www.espn.com/espn/rss/news' },
  { name: 'Outkick',              url: 'https://www.outkick.com/feed/' },
  // Crime & Law
  { name: 'Law & Crime',          url: 'https://lawandcrime.com/feed/' },
  { name: 'Crime Online',         url: 'https://www.crimeonline.com/feed/' },
  // Health & Science
  { name: 'Stat News',            url: 'https://www.statnews.com/feed/' },
  { name: 'MedPage Today',        url: 'https://www.medpagetoday.com/rss/headlines.xml' },
];

// ── HTML entity decoder ──────────────────────────────────────────
function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '…')
    .replace(/&#038;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/<[^>]+>/g, '')
    .trim();
}

// ── RSS parser (runs inside Worker) ─────────────────────────────
function parseRSSXML(xmlText) {
  const results = [];
  // Match <item> blocks
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let itemMatch;
  while ((itemMatch = itemRegex.exec(xmlText)) !== null) {
    const block = itemMatch[1];

    // Title
    let title = '';
    const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    if (titleMatch) title = decodeEntities(titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, ''));

    // Link — try <link> text, then href attr, then <guid>
    let link = '';
    const linkTextMatch = block.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const linkHrefMatch = block.match(/<link[^>]+href=["']([^"']+)["']/i);
    const guidMatch = block.match(/<guid[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/guid>/i);
    if (linkTextMatch && linkTextMatch[1].trim().startsWith('http')) {
      link = linkTextMatch[1].trim();
    } else if (linkHrefMatch) {
      link = linkHrefMatch[1].trim();
    } else if (guidMatch && guidMatch[1].trim().startsWith('http')) {
      link = guidMatch[1].trim();
    }

    // Pub date
    let pubDate = '';
    const dateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
    if (dateMatch) pubDate = dateMatch[1].trim();

    if (!title || !link) continue;
    if (!link.startsWith('http')) continue;
    if (title.length < 10 || title.length > 300) continue;

    results.push({ headline: title, url: link, pubDate });
  }
  return results;
}

// ── Fetch all RSS feeds ──────────────────────────────────────────
async function fetchAllFeeds(existingUrls) {
  const existingSet = new Set(existingUrls);
  const allResults = [];

  await Promise.allSettled(
    FEEDS.map(async feed => {
      try {
        const res = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RSS reader)',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          },
          signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) return;
        const text = await res.text();
        const stories = parseRSSXML(text);
        stories.forEach(s => {
          if (!existingSet.has(s.url)) {
            allResults.push({ ...s, source: feed.name });
          }
        });
      } catch (err) {
        // Silent failure per feed
      }
    })
  );

  // Deduplicate by URL
  const seen = new Set();
  return allResults.filter(s => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

// ── Fetch OG images from a URL ───────────────────────────────────
async function fetchOGImages(articleUrl) {
  const images = [];
  try {
    const res = await fetch(articleUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return images;
    const html = await res.text();

    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

    if (ogMatch && ogMatch[1]) images.push(ogMatch[1]);
    if (twitterMatch && twitterMatch[1] && twitterMatch[1] !== images[0]) images.push(twitterMatch[1]);
  } catch (err) {
    // Silent failure
  }
  return images.slice(0, 3);
}

// ── Groq headline generation ─────────────────────────────────────
async function generateHeadlines(articleUrl, fallbackHeadline, groqApiKey, headlinePrompt) {
  let articleContent = '';
  try {
    const res = await fetch(articleUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const html = await res.text();
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const desc = descMatch ? descMatch[1].trim() : '';
      // Extract paragraph text (rough)
      const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
      const bodyText = pMatches
        .map(m => m[1].replace(/<[^>]+>/g, '').trim())
        .filter(t => t.length > 40)
        .join(' ')
        .slice(0, 4000);
      articleContent = [title, desc, bodyText].filter(Boolean).join('\n\n');
    }
  } catch (err) {
    // Fall through to URL-only mode
  }

  if (!articleContent) {
    articleContent = 'URL: ' + articleUrl + (fallbackHeadline ? '\nOriginal headline: ' + fallbackHeadline : '');
  }

  const systemPrompt = headlinePrompt || 'You are a conservative news headline writer. Propose exactly 3 punchy conservative headlines. Return only a JSON array of 3 strings, nothing else.';

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + groqApiKey
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Article content:\n' + articleContent }
      ],
      temperature: 0.8,
      max_tokens: 500
    }),
    signal: AbortSignal.timeout(20000)
  });

  if (!groqRes.ok) throw new Error('Groq API error: ' + groqRes.status);
  const groqData = await groqRes.json();
  const raw = groqData.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array in Groq response');
  const headlines = JSON.parse(match[0]);
  if (!Array.isArray(headlines) || headlines.length === 0) throw new Error('Invalid Groq response');
  return headlines.slice(0, 3);
}

// ── Main Worker handler ──────────────────────────────────────────
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // ── Existing endpoints (unchanged) ───────────────────────────

    if (request.method === 'GET' && url.pathname === '/links') {
      const data = await env.NEWS_LINKS.get('links');
      if (!data) {
        const empty = JSON.stringify({ lastUpdated: new Date().toISOString(), links: [] });
        return new Response(empty, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      }
      return new Response(data, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    if (request.method === 'POST' && url.pathname === '/links') {
      if (!isAuthorized(request, env)) return new Response('Unauthorized', { status: 401 });
      const body = await request.json();
      await env.NEWS_LINKS.put('links', JSON.stringify(body));
      return new Response('OK', { headers: CORS_HEADERS });
    }

    if (request.method === 'GET' && url.pathname.startsWith('/pending/')) {
      if (!isAuthorized(request, env)) return new Response('Unauthorized', { status: 401 });
      const userId = url.pathname.split('/')[2];
      const data = await env.NEWS_LINKS.get('pending_' + userId);
      if (!data) return new Response('null', { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      return new Response(data, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    if (request.method === 'POST' && url.pathname.startsWith('/pending/')) {
      if (!isAuthorized(request, env)) return new Response('Unauthorized', { status: 401 });
      const userId = url.pathname.split('/')[2];
      const body = await request.json();
      await env.NEWS_LINKS.put('pending_' + userId, JSON.stringify(body));
      return new Response('OK', { headers: CORS_HEADERS });
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/pending/')) {
      if (!isAuthorized(request, env)) return new Response('Unauthorized', { status: 401 });
      const userId = url.pathname.split('/')[2];
      await env.NEWS_LINKS.delete('pending_' + userId);
      return new Response('OK', { headers: CORS_HEADERS });
    }

    if (request.method === 'GET' && url.pathname === '/quotes') {
      try {
        const symbols = ['^GSPC', 'GC=F', 'CL=F', 'EURUSD=X'];
        const cookieRes = await fetch('https://finance.yahoo.com', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Accept': 'text/html' }
        });
        const cookies = cookieRes.headers.get('set-cookie') || '';
        const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Cookie': cookies }
        });
        const crumb = await crumbRes.text();
        const yahooUrl = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=' + symbols.join(',') + '&crumb=' + encodeURIComponent(crumb);
        const response = await fetch(yahooUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Cookie': cookies, 'Accept': 'application/json' }
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      }
    }

    // ── New admin endpoints ───────────────────────────────────────

    // POST /admin/fetch-rss — fetch all RSS feeds, return story list
    if (request.method === 'POST' && url.pathname === '/admin/fetch-rss') {
      if (!isAuthorized(request, env)) return new Response('Unauthorized', { status: 401 });
      const body = await request.json();
      const existingUrls = body.existingUrls || [];
      try {
        const stories = await fetchAllFeeds(existingUrls);
        return new Response(JSON.stringify({ stories }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      }
    }

    // POST /admin/fetch-images — fetch OG images for a URL
    if (request.method === 'POST' && url.pathname === '/admin/fetch-images') {
      if (!isAuthorized(request, env)) return new Response('Unauthorized', { status: 401 });
      const body = await request.json();
      if (!body.url) return new Response('Missing url', { status: 400 });
      try {
        const images = await fetchOGImages(body.url);
        return new Response(JSON.stringify({ images }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      }
    }

    // POST /admin/generate-headlines — generate 3 AI headlines via Groq
    if (request.method === 'POST' && url.pathname === '/admin/generate-headlines') {
      if (!isAuthorized(request, env)) return new Response('Unauthorized', { status: 401 });
      const body = await request.json();
      if (!body.url) return new Response('Missing url', { status: 400 });
      try {
        const headlines = await generateHeadlines(body.url, body.fallbackHeadline || '', env.GROQ_API_KEY, env.HEADLINE_PROMPT);
        return new Response(JSON.stringify({ headlines }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
