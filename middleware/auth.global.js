export default defineNuxtRouteMiddleware((to, from) => {
  const accessToken = useCookie('accessToken').value;
  const refreshToken = useCookie('refreshToken').value;
  console.log('accessToken : ' + accessToken);
  console.log('to.path : ' + to.path + ', from.path : ' + from.path);
  if (to.path !== '/sample/error') {
    if (!accessToken || !refreshToken) {
      // alert('오메 여기 오면 안되지.');
      if (to.path !== '/auth/login') {
        return navigateTo(
          `/auth/login?returnUrl=${to.path === undefined ? '/' : to.path}`
        );
      }
    }
  }
});
