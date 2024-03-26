import { createSignal } from 'solid-js';

export const [isAdmin, setIsAdmin] = createSignal(
	window.location.pathname.includes('/admin')
);


export const [isLoginPage, setIsLoginPage] = createSignal(
	window.location.pathname.includes('/admin/login')
);

export const [isSignUpPage, setSignUpPage] = createSignal(
	window.location.pathname.includes('/admin/signup')
);