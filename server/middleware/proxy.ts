export default defineEventHandler((event) => {
  const config = useRuntimeConfig();

  if (!event.node.req.url?.startsWith('/api')) return;

  const target = new URL(event.node.req.url, config.apiBaseUrl);

  return proxyRequest(event, target.toString(), {
    headers: {
      host: target.host,
      origin: target.origin,
    },
  });
});
