import { createMemo, createUniqueId, untrack } from 'solid-js';
import { Record } from '../lib/Record';
import { getChildVertex } from '../lib/Traverse';
import { findVertexByLabelAndUniqueId } from '../lib/Vertex';
import { AttrsAdminTableData } from '../lib/apiAdmin';
import { Vertex } from '../lib/graph';
import { showNav } from '../pages/Dashboard';
import { ServerEventsDispatcher } from '../utils/ws_events_dispatcher';
import SidebarElement from './SidebarElement';

export interface navbarDataI {
	children: navbarDataI[];
	expanded: boolean;
	href: string;
	id: string;
	name: string;
}

function Sidebar(props: { Ws: ServerEventsDispatcher }) {
	const navData = createMemo(() => {
		const nav = findVertexByLabelAndUniqueId('Nav', 'name', 'main');
		if (!nav) {
			console.log('no Nav Found');
			return;
		}
		const record = new Record({ ws: props.Ws });
		record.load(nav.id);
		untrack(() => record.createMeta(AttrsAdminTableData['Nav']));
		return renderNavTreeFromGraph(record);
	});

	return (
		<div>
			<nav class=''>
				<input class='p:7.5 min-w:full' type='text' name='' id='' />
			</nav>
			<ul>
				<SidebarElement navbarData={navData() ?? []} />
				{/* <For each={navData() ?? []} fallback={<div>Loading...</div>}>
					{(item) => (
						<li
							class={`bg:#b2b2b2:hover cursor:pointer ${
								location.pathname.toLowerCase() ===
								item.href.toLowerCase()
									? 'bg:#337ab7'
									: ''
							}`}
						>
							<Accordion.Root multiple>
								{item.expanded === undefined ? (
									<div
										class='flex ai:center p:10'
										onClick={() => {
											navigate(item.href, {
												resolve: false,
											});
										}}
									>
										<span class='font:14'>{item.name}</span>
									</div>
								) : (
									<Accordion.Item
										value={item.id}
										class='p:10'
									>
										<Accordion.Trigger class='w:full px:10'>
											<Accordion.Header class='w:full flex jc:left'>
												<span class='font:14'>
													{item.name}
												</span>
											</Accordion.Header>
										</Accordion.Trigger>
										<Accordion.Content class=''>
											ok
										</Accordion.Content>
									</Accordion.Item>
								)}
							</Accordion.Root>
						</li>
					)}
				</For> */}
			</ul>
		</div>
	);
}

// ! Hover of menu add this to background color
// bg:

export default Sidebar;

const renderNavTreeFromGraph = (record: Record) => {
	// !!!TODO!!!: This code can we written in the code itself
	const getChildren = (meta: Vertex, vertex: Vertex) => {
		const result = [] as any[];

		const metaVertexes = record.getSublistRowsForType('MetaAttr', meta);
		const attrMeta = metaVertexes.find((meta) => meta.P.name === 'Attr');

		if (!attrMeta) return result;

		const children = record.getSublistRows(attrMeta, vertex);

		for (const child of children) {
			const name = child.P.name;
			const func = child.P.func;
			const expanded = child.P.expanded;
			const navItem = {} as any;

			if (func === 'Table') {
				const collVertex = getChildVertex(['$0Coll'], child).vertex;
				// TODO: Check Permission
				if (collVertex) {
					// TODO: Check Permission
					// add to result if its allowed
					navItem.name = name;
					navItem.href =
						(showNav() ? '/nav' : '') +
						`/admin/${collVertex.P.name}`;
				} else {
					const formVertex = getChildVertex(['$0Form'], child).vertex;
					if (formVertex) {
						// TODO: Check Permission
						// add to result if its allowed
						navItem.name = name;
						navItem.href = `${showNav() ? '/nav' : ''}/admin/${
							formVertex.P.name
						}`;
					} else {
						const url = (showNav() ? '/nav' : '') + child.P.url;
						navItem.name = name;
						navItem.href = url;
					}
				}
			} else {
				const url = (showNav() ? '/nav' : '') + child.P.url;
				navItem.name = name;
				navItem.href = url;
			}
			navItem.expanded = expanded;
			navItem.id = createUniqueId();

			navItem.children = getChildren(attrMeta!, child);

			result.push(navItem);
		}
		return result;
	};

	const navigation: navbarDataI[] = getChildren(
		record.metaVertex,
		record.vertex
	);

	return navigation;
};
