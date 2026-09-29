export default defineNuxtRouteMiddleware(() => {
	if (import.meta.server) return;

	const hasSession =
		localStorage.getItem("google_user") !== null ||
		sessionStorage.getItem("google_user") !== null;

	if (!hasSession) {
		return navigateTo("/login");
	}
});
