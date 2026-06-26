export const decodeHtmlEntities = (text: string) => {
  if (!text) return text;
  return String(text)
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
};

export const parseMultiSourceCache = new Map<any, any[]>();

export const parseMultiSource = (val: any) => {
  if (!val) return [];
  if (parseMultiSourceCache.has(val)) {
    const cached = parseMultiSourceCache.get(val);
    return cached ? cached.map((item: any) => ({ ...item })) : [];
  }

  let result: any[];
  try {
    if (typeof val === 'string' && val.trim().startsWith('[')) {
      result = JSON.parse(val);
      if (!Array.isArray(result)) result = [];
      result = result.sort((a: any, b: any) => String(a.source || "").localeCompare(String(b.source || "")));
    } else if (Array.isArray(val)) {
      result = val.sort((a: any, b: any) => String(a.source || "").localeCompare(String(b.source || "")));
    } else {
      throw new Error("Not an array");
    }
  } catch (e) {
    // Fallback for legacy flat numbers
    result = [
      {
        source: "Default",
        qty: parseFloat(String(val)) || 0,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      },
    ];
  }
  
  try {
    if (typeof val === 'string' || typeof val === 'number') {
      if (parseMultiSourceCache.size > 5000) {
        parseMultiSourceCache.clear();
      }
      parseMultiSourceCache.set(val, result.map((item: any) => ({ ...item })));
    }
  } catch (e) {
    // Safety fallback
  }
  
  return result.map((item: any) => ({ ...item }));
};
