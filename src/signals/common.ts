import { createSignal } from 'solid-js';

export const [showNav, setShowNav] = createSignal(
	window.location.pathname.includes('/nav/')
);

export const [isAdmin, setIsAdmin] = createSignal(
	window.location.pathname.includes('/admin')
);
