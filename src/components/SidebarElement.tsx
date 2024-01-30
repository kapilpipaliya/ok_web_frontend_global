import { Icon } from '@iconify-icon/solid';
import { Accordion } from '@kobalte/core';
import { useLocation, useNavigate } from '@solidjs/router';
import { For } from 'solid-js';
import { navbarDataI } from './Sidebar';

export default function SidebarElement(props: {
	navbarData: navbarDataI[];
	resetSearch: () => void;
}) {
	const location = useLocation();
	const navigate = useNavigate();

	// console.log(location.pathname.toLowerCase() === item.href.toLowerCase());

	return (
		<Accordion.Root
			multiple
			class='overflow-x:hidden overflow-y:auto user-select:none'
		>
			<For each={props.navbarData ?? []} fallback={<div>Loading...</div>}>
				{(item) => {
					return (
						<li
							class={`cursor:pointer ${
								location.pathname.toLowerCase() ===
								item.href.toLowerCase()
									? 'bg:#337ab7 fg:white'
									: ''
							}`}
						>
							{item.expanded === undefined ? (
								<div
									class='flex ai:center p:8 bg:#b2b2b2:hover fg:black:hover'
									onClick={() => {
										navigate(item.href, {
											resolve: false,
										});
										props.resetSearch();
									}}
								>
									<span class='font:14'>{item.name}</span>
								</div>
							) : (
								<Accordion.Item value={item.id}>
									<Accordion.Trigger class='w:full'>
										<Accordion.Header class='w:full flex ai:center jc:left px:10 bg:#b2b2b2:hover'>
											<div class='pr-4 font:15'>
												<Icon
													icon='mingcute:down-fill'
													aria-hidden
												/>
											</div>
											<div class='ml:8 font:14 py:8'>
												<span>{item.name}</span>
											</div>
										</Accordion.Header>
									</Accordion.Trigger>
									<Accordion.Content class='pl:20'>
										<SidebarElement
											resetSearch={props.resetSearch}
											navbarData={item.children}
										/>
									</Accordion.Content>
								</Accordion.Item>
							)}
						</li>
					);
				}}
			</For>
		</Accordion.Root>
	);
}
