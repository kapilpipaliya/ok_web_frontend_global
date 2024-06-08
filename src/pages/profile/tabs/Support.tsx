import { Icon } from "@iconify-icon/solid";
import { createSignal, Show, For } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { API } from "~/lib/api/endpoints";
import {
  sendChatsSupportCall,
  getChatsSupportCall,
  deleteSupportTicketCall,
} from "~/lib/api/api_functions";
import postAPI from "~/lib/api/postApi";
import { ChipDropDown } from "~/components/custom/Chip";
import CustomModal from "~/components/custom/CommonDialog";
import { DeleteDialog } from "~/components/custom/DeleteDialog";
import { Table, TableHeadCell, TableBodyCell } from "~/components/custom/Table";
import { useToast } from "~/components/custom/Toast";
import { Id } from "~/lib/graph/graph";

export const SupportTicketSection = (props: {
  setIsMainScreenLoad: SetStoreFunction<boolean>;
  contactList: any;
  setContactList: SetStoreFunction<any>;
}) => {
  const [messages, setMessages] = createSignal<any>([]);
  const [inputMessage, setInputMessage] = createSignal("");
  const { showErrorToast, showSuccessToast, showLoadingToast } = useToast();

  const sendMessage = async (parentVertexId: Id) => {
    if (inputMessage().trim() !== "") {
      const newMessage = {
        text: inputMessage(),
        timestamp: new Date().toLocaleTimeString(),
        personal: true,
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
      text: replies[randomIndex],
      timestamp: new Date().toLocaleTimeString(),
      personal: false,
    };
    setMessages([...messages()!, reply]);
  };

  const Chat = (props: { id: number }) => {
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
        when={messages().length > 0}
        fallback={
          <div class="text-align:-webkit-center">
            <img
              class="h:30vh"
              src="https://img.freepik.com/free-vector/messaging-concept-illustration_114360-1008.jpg?t=st=1714712810~exp=1714716410~hmac=7374a2e9362db971e16f802634bd6a0ee53d66e92611274c2d60403b73baf49d&w=826"
            />
            <div style="text-align:center;" class="font-weight:600">
              No messages yet
            </div>
          </div>
        }
      >
        <div style="top: 50%; left: 50%; max-height: 500px; z-index: 2; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
          <div
            class="grid flex-col"
            ref={(el) => {
              messageContainer = el;
            }}
            style="overflow-y: auto; padding: 10px;"
          >
            <For each={messages()}>
              {(msg: any) => (
                <>
                  <div class="rel mb:10 mt:10 @fade|.5s">
                    <div
                      style={`color: #fff; float: ${
                        msg.personal ? "right" : "left"
                      }; text-align: ${
                        msg.personal ? "right" : "left"
                      }; background: ${
                        msg.personal
                          ? "linear-gradient(120deg, #248A52, #257287)"
                          : "rgb(29 92 194 / 76%)"
                      }; border-radius: 5px; padding: 5px; margin-bottom: 5px;`}
                    >
                      {msg.text}
                    </div>
                    <div
                      class={`abs bottom:-10 ${
                        msg.personal ? "right:0" : "left:0"
                      }`}
                      style="font-size: 8px;"
                    >
                      {msg.timestamp}
                    </div>
                    <div
                      class={`abs ${
                        msg.personal
                          ? "right:0 bg:#267e70 h:7px bottom:7px"
                          : "left:0 bg:#5783d2 h:7px bottom:8px"
                      }`}
                      style="font-size:8px;width: 10px;transform: skew(298deg, 22deg);top: ;"
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

  const OpenDialog = (props: { id: number }) => {
    return (
      <CustomModal
        bodyStyle={{ "max-height": "none", overflow: "auto" }}
        openButton={false}
        buttonLabel={
          <Icon class="color:#37c" height={22} width={22} icon="bi:chat-text" />
        }
        title="Chat With Support"
        body={
          <div>
            <Chat id={props.id} />
          </div>
        }
        footer={() => (
          <div class={"flex ai:center jc:center"}>
            <div
              class="b:1.5px|solid|lightseagreen r:5"
              style="width: 100%;position: relative;"
            >
              <input
                type="text"
                value={inputMessage()}
                onInput={(e) => setInputMessage(e.target.value)}
                style="background: none; border: none; outline: none;padding: 0 25px 0px 10px; width: calc(100% - 40px); line-height: 40px;"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(props.id);
                  }
                }}
                placeholder="Type message..."
              />
              <div
                onClick={() => sendMessage(props.id)}
                class="flex jc:center"
                style="position: absolute; top: 5px; right: 10px; color: #fff; border: none; background: #248A52; font-size: 10px; text-transform: uppercase;padding: 4px 6px; border-radius: 10px; cursor: pointer;"
              >
                <Icon icon={"fluent:send-48-filled"} height={22} width={22} />
              </div>
            </div>
          </div>
        )}
        dialogClass="min-w:30% r:10px p:0"
      />
    );
  };

  const deleteContact = async (id: string) => {
    props.setIsMainScreenLoad(true);
    await showLoadingToast({
      promise: deleteSupportTicketCall(id),
      loadMessage: "Deleting Ticket...",
      successMessage: "Support ticket deleted successfully",
      onSuccess: (value) => {
        const data = props.contactList().filter((c: any) => c.id !== id);
        props.setContactList(data);
      },
    });
    props.setIsMainScreenLoad(false);
  };

  const changeStatus = async (id: string, status: string) => {
    props.setIsMainScreenLoad(true);
    const res: any = await postAPI(API.profileUrl, {
      panel: "supportTicket",
      action: "updateStatus",
      id,
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
    <div class={"w:80%@>md w:100%"}>
      <div class={"m:10|20"}>
        <div class={"font-weight:700"}>Support Ticket Details</div>
        <span class={"font-weight:500 color:grey f:14"}>
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
            fallback={
              <div
                class={"grid-column-span:6"}
                style="display: flex; justify-content: center; padding: 1rem; "
              >
                No Tickets Found
              </div>
            }
            each={props.contactList()}
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
                      selectedItem={row.status}
                      onChanged={(e) => {
                        changeStatus(row.id, e);
                      }}
                    />
                  </TableBodyCell>
                  <TableBodyCell>
                    <div class={"flex jc:center ai:center"}>
                      <OpenDialog id={row.id} />
                      <DeleteDialog
                        buttonLabel={
                          <Icon
                            icon="fluent:delete-48-regular"
                            class="color:rgb(255,0,0)"
                            height={22}
                            width={22}
                          />
                        }
                        onConfirm={() => {
                          deleteContact(row.id);
                        }}
                        title={"Delete Support Ticket"}
                        message={"Are you sure you want to delete this ticket?"}
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
