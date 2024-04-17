import { createSignal } from 'solid-js';

export const [isAdmin, setIsAdmin] = createSignal(
	// window.location.pathname.includes('/admin')
true
);


export const [isLoginPage, setIsLoginPage] = createSignal(
	// window.location.pathname.includes('/admin/login')
	false
);

export const [isSignUpPage, setSignUpPage] = createSignal(
	// window.location.pathname.includes('/admin/signup')
false
);
