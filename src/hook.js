
// src/hooks.server.ts
export const handle = async ({ event, resolve }) => {
    const response = await resolve(event);
    
    // Hapus atau modifikasi header yang bermasalah
    response.headers.delete('permissions-policy');
    // Atau ganti dengan policy yang valid:
    // response.headers.set('permissions-policy', 'geolocation=(), microphone=()');
    
    return response;
  };