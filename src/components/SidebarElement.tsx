import { Accordion } from '@kobalte/core';
import { useLocation, useNavigate } from '@solidjs/router';
import { For } from 'solid-js';
import { AiFillCaretDown } from 'solidjs-icons/ai';
import { navbarDataI } from './Sidebar';

export default function SidebarElement(props: { navbarData: navbarDataI[] }) {
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<Accordion.Root multiple class='overflow-x:hidden'>
			<For each={props.navbarData ?? []} fallback={<div>Loading...</div>}>
				{(item) => (
					<li
						class={`cursor:pointer ${
							location.pathname.toLowerCase() ===
							item.href.toLowerCase()
								? 'bg:#337ab7'
								: ''
						}`}
					>
						{item.expanded === undefined ? (
							<div
								class='flex ai:center p:8 bg:#b2b2b2:hover'
								onClick={() => {
									navigate(item.href, {
										resolve: false,
									});
								}}
							>
								<span class='font:14'>{item.name}</span>
							</div>
						) : (
							<Accordion.Item value={item.id}>
								<Accordion.Trigger class='w:full'>
									<Accordion.Header class='w:full flex ai:center jc:left px:10 bg:#b2b2b2:hover'>
										<div class='pr-4 font:15'>
											<AiFillCaretDown aria-hidden />
										</div>
										<div class='ml:8 font:14 py:8'>
											<span>{item.name}</span>
										</div>
									</Accordion.Header>
								</Accordion.Trigger>
								<Accordion.Content class='pl:20'>
									<SidebarElement
										navbarData={item.children}
									/>
								</Accordion.Content>
							</Accordion.Item>
						)}
					</li>
				)}
			</For>
		</Accordion.Root>
	);
}
