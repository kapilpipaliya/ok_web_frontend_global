import type { SetStoreFunction } from "solid-js/store";

import { Icon } from "@iconify-icon/solid";
import { For, Show, createSignal } from "solid-js";

import type { Id } from "~/lib/graph/graph";

import { ChipDropDown } from "~/components/Chip";
import {CustomModal} from "~/components/CommonDialog";
import { DeleteDialog } from "~/components/DeleteDialog";
import { Table, TableBodyCell, TableHeadCell } from "~/components/Table";
import { useToast } from "~/components/Toast";
import {
  deleteSupportTicketCall,
  getChatsSupportCall,
  sendChatsSupportCall,
} from "~/lib/api/api_functions";
import { API } from "~/lib/api/endpoints";
import {postAPI} from "~/lib/api/postApi";

export const SupportTicketSection = (props: Readonly<{
  contactList: any;
  setContactList: SetStoreFunction<any>;
  setIsMainScreenLoad: SetStoreFunction<boolean>;
}>) => {
  const [messages, setMessages] = createSignal<any>([]);
  const [inputMessage, setInputMessage] = createSignal("");
  const { showErrorToast, showLoadingToast, showSuccessToast } = useToast();

  const sendMessage = async (parentVertexId: Id) => {
    if (inputMessage().trim() !== "") {
      const newMessage = {
        personal: true,
        text: inputMessage(),
        timestamp: new Date().toLocaleTimeString(),
      };

      await sendChatsSupportCall(parentVertexId, newMessage)
        .then((e) => {
          setMessages([...messages()!, newMessage]);
          setInputMessage("");
          setTimeout(fakeReply, 1000);
        })
        .catch((e) => {
          showErrorToast("Issue in sending message. Please try again later");
        });
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
    setMessages([...messages()!, reply]);
  };

  const Chat = (props: Readonly<{ id: number }>) => {
    let messageContainer: HTMLDivElement;

    const getMessages = async () => {
      const message = await getChatsSupportCall(props.id);
      setMessages(
        message.vertexes.length > 0
          ? message.vertexes.map((v: any) => v.properties)
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
          <div class="text-align:center">
            <img
              class="h:30vh"
              src="https://img.freepik.com/free-vector/messaging-concept-illustration_114360-1008.jpg?t=st=1714712810~exp=1714716410~hmac=7374a2e9362db971e16f802634bd6a0ee53d66e92611274c2d60403b73baf49d&w=826"
            />
            <div class="font-weight:600 text-align:center">
              No messages yet
            </div>
          </div>
        }
        when={messages().length > 0}
      >
        <div class="display:flex flex-direction:column justify-content:space-between left:50% max-height:500px overflow:hidden top:50% z-index:2">
          <div
            class="flex-col grid overflow-y:auto padding:10px"
            ref={(el) => {
              messageContainer = el;
            }}
          >
            <For each={messages()}>
              {(msg: any) => (
                <>
                  <div class="rel @fade|.5s mb:10 mt:10">
                    <div
                      class="border-radius:5px margin-bottom:5px padding:5px"
                      classList={{
                        "color:#fff": true,
                        "float:left text-align:left background:rgb(29|92|194|/|76%)": !msg.personal,
                        "float:right text-align:right background:linear-gradient(120deg,#248A52,#257287)": msg.personal,
                      }}
                    >
                      {msg.text}
                    </div>
                    <div
                      classList={{
                        "abs bottom:-10 font-size:8px": true,
                        "left:0": !msg.personal,
                        "right:0": msg.personal,
                      }}
                    >
                      {msg.timestamp}
                    </div>
                    <div
                      class="font-size:8px transform:skew(298deg,22deg) width:10px"
                      classList={{
                        abs: true,
                        "left:0 bg:#5783d2 h:7px bottom:8px": !msg.personal,
                        "right:0 bg:#267e70 h:7px bottom:7px": msg.personal
                      }}
                    />
                  </div>
                </>
              )}
            </For>
          </div>
        </div>
      </Show>
    );
  };

  const OpenDialog = (props: Readonly<{ id: number }>) => {
    return (
      <CustomModal
        body={
          <div>
            <Chat id={props.id} />
          </div>
        }
        buttonLabel={
          <Icon class="color:#37c" height={22} icon="bi:chat-text" width={22} />
        }
        dialogClass="min-w:30% r:10px p:0"
        footer={() => (
          <div class="flex ai:center jc:center">
            <div
              class="b:1.5px|solid|lightseagreen position:relative r:5 width:100%"
            >
              <input
                class="background:none border:none line-height:40px outline:none padding:0|25px|0px|10px width:calc(100%|-|40px)"
                onInput={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(props.id);
                  }
                }}
                placeholder="Type message..."
                type="text"
                value={inputMessage()}
              />
              <div
                class="flex background:#248A52 border-radius:10px border:none color:#fff cursor:pointer font-size:10px jc:center padding:4px|6px position:absolute right:10px text-transform:uppercase top:5px"
                onClick={() => sendMessage(props.id)}
              >
                <Icon height={22} icon={"fluent:send-48-filled"} width={22} />
              </div>
            </div>
          </div>
        )}
        openButton={false}
        title="Chat With Support"
      />
    );
  };

  const deleteContact = async (id: string) => {
    props.setIsMainScreenLoad(true);
    await showLoadingToast({
      loadMessage: "Deleting Ticket...",
      onSuccess: (value) => {
        const data = props.contactList().filter((c: any) => c.id !== id);
        props.setContactList(data);
      },
      promise: deleteSupportTicketCall(id),
      successMessage: "Support ticket deleted successfully",
    });
    props.setIsMainScreenLoad(false);
  };

  const changeStatus = async (id: string, status: string) => {
    props.setIsMainScreenLoad(true);
    const res: any = await postAPI(API.profileUrl, {
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
    <div class="w:100% w:80%@>md">
      <div class="m:10|20">
        <div class="font-weight:700">Support Ticket Details</div>
        <span class="color:grey f:14 font-weight:500">
          List of all your contacts with our platforms
        </span>
      </div>
      <div class="m:0|15">
        <Table headers={6}>
          <For each={["id", "Name", "Subject", "Message", "Status", "Actions"]}>
            {(header) => {
              return <TableHeadCell>{header}</TableHeadCell>;
            }}
          </For>

          <For
            each={props.contactList()}
            fallback={
              <div
                class="display:flex grid-column-span:6 justify-content:center padding:1rem"
              >
                No Tickets Found
              </div>
            }
          >
            {(row: any, index) => {
              return (
                <div>
                  <TableBodyCell>{row.id}</TableBodyCell>
                  <TableBodyCell>{row.name}</TableBodyCell>
                  <TableBodyCell>{row.subject}</TableBodyCell>
                  <TableBodyCell>{row.message}</TableBodyCell>
                  <TableBodyCell>
                    <ChipDropDown
                      onChanged={(e) => {
                        changeStatus(row.id, e);
                      }}
                      selectedItem={row.status}
                    />
                  </TableBodyCell>
                  <TableBodyCell>
                    <div class="flex ai:center jc:center">
                      <OpenDialog id={row.id} />
                      <DeleteDialog
                        buttonLabel={
                          <Icon
                            class="color:rgb(255,0,0)"
                            height={22}
                            icon="fluent:delete-48-regular"
                            width={22}
                          />
                        }
                        message={"Are you sure you want to delete this ticket?"}
                        onConfirm={() => {
                          deleteContact(row.id);
                        }}
                        title={"Delete Support Ticket"}
                      />
                    </div>
                  </TableBodyCell>
                </div>
              );
            }}
          </For>
        </Table>
      </div>
    </div>
  );
};
