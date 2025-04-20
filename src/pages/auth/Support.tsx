import type { SetStoreFunction } from "solid-js/store";

import { Icon } from "@iconify-icon/solid";
import { createSignal, For, type JSX, Show } from "solid-js";

import type { Id } from "~/lib/graph/graph";

import { ChipDropDown } from "~/components/styled/Chip";
import { IconButton } from "~/components/styled/IconButton";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import { DialogWithButtons } from "~/components/styled/modal/DeleteDialog";
import { useToast } from "~/components/styled/modal/Toast";
import {
  Table,
  TableBodyCell,
  TableHeadCell,
} from "~/components/styled/SimpleTable";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

interface SupportTicket {
  id: string;
  name: string;
  subject: string;
  message: string;
  status: string;
}

interface SupportTicketSectionProps {
  contactList: SupportTicket[];
  setContactList: SetStoreFunction<SupportTicket[]>;
  setIsMainScreenLoad: SetStoreFunction<boolean>;
}

// export async function sendChatsSupportCall(
//   parentVertexId: any,
//   newMessage: any,
// ) {
//   return await postAPI(API.auth.profileUrl, {
//     action: "chat",
//     newMessage,
//     panel: "supportTicket",
//     parentVertexId,
//     subAction: "send",
//   });
// }

// depricated
export const SupportTicketSection = (
  props: Readonly<SupportTicketSectionProps>,
): JSX.Element => {
  const [messages, setMessages] = createSignal<any[]>([]);
  const [inputMessage, setInputMessage] = createSignal("");
  const { showErrorToast, showLoadingToast, showSuccessToast } = useToast();
  const [deleteRowId, setDeleteRowId] = createSignal<null | string>(null);

  const sendMessage = async (parentVertexId: Id) => {
    if (inputMessage().trim() !== "") {
      const newMessage = {
        personal: true,
        text: inputMessage(),
        timestamp: new Date().toLocaleTimeString(),
      };

      try {
        await postAPI(API.auth.profileUrl, {
          action: "chat",
          newMessage,
          panel: "supportTicket",
          parentVertexId,
          subAction: "send",
        });
        setMessages([...messages(), newMessage]);
        setInputMessage("");
        setTimeout(fakeReply, 1000);
      } catch {
        showErrorToast("Issue in sending message. Please try again later");
      }
    }
  };

  const fakeReply = () => {
    const replies = [
      "Hi there, how can I assist?",
      "Thanks for your message!",
      "We're looking into this for you.",
      "Can you provide more detail?",
      "Thank you for waiting.",
    ];
    const randomIndex = Math.floor(Math.random() * replies.length);
    const reply = {
      personal: false,
      text: replies[randomIndex],
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages(), reply]);
  };

  const Chat = (props: Readonly<{ id: string }>): JSX.Element => {
    let messageContainer: HTMLDivElement;

    const getMessages = async () => {
      const message = await postAPI(API.auth.profileUrl, {
        action: "chat",
        panel: "supportTicket",
        parentVertexId: props.id,
        subAction: "get",
      });
      
      const vertexes = message.vertexes as Array<{ properties: any }> | undefined;
      setMessages(
        vertexes && vertexes.length > 0
          ? vertexes.map((v) => v.properties)
          : [],
      );
      scrollToBottom();
    };

    const scrollToBottom = () => {
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    };

    getMessages();

    return (
      <Show
        fallback={
          <As as="div" css={css`
  text-align: center;
`}>
            <As as="img"
              alt="No messages yet"
              css={css`
  height: 30vh;
`}
              src="https://img.freepik.com/free-vector/messaging-concept-illustration_114360-1008.jpg"
            />
            <As as="div" css={css`
  font-weight: 600;
  text-align: center;
`}>No messages yet</As>
          </As>
        }
        when={messages().length > 0}
      >
        <As as="div" css={css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  left: 50%;
  max-height: 500px;
  overflow: hidden;
  top: 50%;
  z-index: 2;
`}>
          <As as="div" css={css`
  flex-direction: column;
  display: grid;
  overflow-y: auto;
  padding: 10px;
`}
            ref={(el) => {
              messageContainer = el;
            }}
          >
            <For each={messages()}>
              {(msg: any) => (
                <As as="div" css={css`
  position: relative;
  margin-bottom: 10px;
  margin-top: 10px;
`}>
                  <As as="div"
                    css={args => css`
  border-radius: 5px;
  margin-bottom: 5px;
  padding: 5px;
  color: ${args.theme.var.color.base_10};
  ${msg.personal 
    ? `float: right; 
       text-align: right; 
       background: linear-gradient(120deg,#248A52,#257287);` 
    : `float: left; 
       text-align: left; 
       background: rgb(29,92,194,0.76);`}
`}
                  >
                    {msg.text}
                  </As>
                  <As as="div"
                    css={css`
  position: absolute;
  bottom: -10px;
  font-size: 8px;
  ${msg.personal ? "right: 0;" : "left: 0;"}
`}
                  >
                    {msg.timestamp}
                  </As>
                  <As as="div"
                    css={css`
  font-size: 8px;
  transform: skew(298deg,22deg);
  width: 10px;
  position: absolute;
  ${msg.personal 
    ? `right: 0; background: #267e70; height: 7px; bottom: 7px;` 
    : `left: 0; background: #5783d2; height: 7px; bottom: 8px;`}
`}
                  />
                </As>
              )}
            </For>
          </As>
        </As>
      </Show>
    );
  };

  const OpenDialog = (props: Readonly<{ id: string }>): JSX.Element => {
    const [openDialog, setOpenDialog] = createSignal(false);

    return (
      <>
        <IconButton
          css={css`
  color: #37c;
`}
          icon="bi:chat-text"
          onClick={() => setOpenDialog(true)}
          size={22}
        />
        <CustomModal
          dialogCss={css`min-width: 30%; border-radius: 10px; padding: 0;`}
          footer={() => (
            <As as="div" css={css`
  display: flex;
  align-items: center;
  justify-content: center;
`}>
              <As as="div" css={css`
  border: 1.5px solid #3b82f6;
  position: relative;
  border-radius: 5px;
  width: 100%;
`}>
                <As as="input"
                  css={css`
  background: none;
  border: none;
  line-height: 40px;
  outline: none;
  padding: 0 25px 0 10px;
  width: calc(100% - 40px);
`}
                  onInput={(e) => setInputMessage(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage(props.id);
                    }
                  }}
                  placeholder="Type message..."
                  type="text"
                  value={inputMessage()}
                />
                <As as="div"
                  css={css`
  display: flex;
  background: #248A52;
  border-radius: 10px;
  border: none;
  color: #1e293b;
  cursor: pointer;
  font-size: 10px;
  justify-content: center;
  padding: 4px 6px;
  position: absolute;
  right: 10px;
  text-transform: uppercase;
  top: 5px;
`}
                  onClick={() => sendMessage(props.id)}
                >
                  <Icon
                    height={22}
                    icon={"fluent:send-48-filled"}
                    noobserver
                    width={22}
                  />
                </As>
              </As>
            </As>
          )}
          open={openDialog}
          setOpen={setOpenDialog}
          title="Chat With Support"
        >
          <div>
            <Chat id={props.id} />
          </div>
        </CustomModal>
      </>
    );
  };

  const deleteContact = async (id: string) => {
    props.setIsMainScreenLoad(true);
    await showLoadingToast({
      loadMessage: "Deleting Ticket...",
      onSuccess: () => {
        const data = props.contactList().filter((c: any) => c.id !== id);
        props.setContactList(data);
      },
      promise: postAPI(API.auth.profileUrl, {
        action: "delete",
        id,
        panel: "supportTicket",
      }),
      successMessage: "Support ticket deleted successfully",
    });
    props.setIsMainScreenLoad(false);
  };

  const changeStatus = async (id: string, status: string) => {
    props.setIsMainScreenLoad(true);
    const res: any = await postAPI(API.auth.profileUrl, {
      action: "updateStatus",
      id,
      panel: "supportTicket",
      status,
    });
    if (res.error) {
      showErrorToast(res.error.message);
    } else {
      showSuccessToast(res.message);
      const data = props.contactList().map((c: any) => {
        if (c.id === id) {
          c.status = status;
        }
        return c;
      });
      props.setContactList(data);
    }

    props.setIsMainScreenLoad(false);
  };

  return (
    <As as="div" css={css`
  width: 100%;

  @media (min-width: 1024px) {
    width: 80%;
  }
`}>
      <As as="div" css={css`
  margin: 10px 20px;
`}>
        <As as="div" css={css`
  font-weight: 700;
`}>Support Ticket Details</As>
        <As as="span" css={css`
  color: grey;
  font-size: 14px;
  font-weight: 500;
`}>
          List of all your contacts with our platforms
        </As>
      </As>
      <As as="div" css={css`
  margin: 0 15px;
`}>
        <Table headers={6}>
          <For each={["ID", "Name", "Subject", "Message", "Status", "Actions"]}>
            {(header) => <TableHeadCell>{header}</TableHeadCell>}
          </For>

          <For
            each={props.contactList()}
            fallback={
              <As as="div" css={css`
  display: flex;
  grid-column-span: 6;
  justify-content: center;
  padding: 1rem;
`}>
                No Tickets Found
              </As>
            }
          >
            {(row: SupportTicket) => (
              <div>
                <TableBodyCell>{row.id}</TableBodyCell>
                <TableBodyCell>{row.name}</TableBodyCell>
                <TableBodyCell>{row.subject}</TableBodyCell>
                <TableBodyCell>{row.message}</TableBodyCell>
                <TableBodyCell>
                  <ChipDropDown
                    onChanged={(status) => changeStatus(row.id, status)}
                    selectedItem={row.status}
                  />
                </TableBodyCell>
                <TableBodyCell>
                  <As as="div" css={css`
  display: flex;
  align-items: center;
  justify-content: center;
`}>
                    <OpenDialog id={row.id} />
                    <IconButton
                      icon="fluent:delete-48-regular"
                      onClick={() => setDeleteRowId(row.id)}
                      title="Delete"
                    />
                    <DialogWithButtons
                      message={"Are you sure you want to delete this ticket?"}
                      onCancel={() => setDeleteRowId(null)}
                      onConfirm={() => deleteContact(row.id)}
                      open={() => deleteRowId() === row.id}
                      setOpen={setDeleteRowId}
                      title={"Delete Support Ticket"}
                    />
                  </As>
                </TableBodyCell>
              </div>
            )}
          </For>
        </Table>
      </As>
    </As>
  );
};
