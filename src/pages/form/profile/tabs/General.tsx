import type { SetStoreFunction } from "solid-js/store";

import { equals } from "rambda";
import { Show, createSignal } from "solid-js";

import { useToast } from "~/components/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { postAPI } from "~/lib/api/postApi";
import { useGraph } from "~/lib/graph/graph";
import { validateEmail } from "~/lib/validations";

type GenralProps = {
  originalProfileData: {
    [key: string]: any;
  };
  profileData: {
    [key: string]: any;
  };
  setOriginalProfileData: SetStoreFunction<{
    [key: string]: any;
  }>;
  setProfileData: SetStoreFunction<{
    [key: string]: any;
  }>;
};

export const GeneralSection = (props: Readonly<GenralProps>) => {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showSuccessToast } = useToast();
  const [isEdit, setIsEdit] = createSignal(false);
  const [selectedImage, setSelectedImage] = createSignal(null);
  const handleImageChange = async (e: any) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    props.setProfileData({ ...props.profileData, [name]: value.toLowerCase() });
  };

  const profileCall = async () => {
    const updatedData: { [key: string]: any } = {};
    for (const key in props.profileData) {
      if (props.profileData[key] !== props.originalProfileData[key]) {
        // Compare with original data
        updatedData[key] = props.profileData[key];
      }
    }

    if (selectedImage() !== null) {
      const formData = new FormData();
      //@ts-ignore
      formData.append(selectedImage()?.name, selectedImage()!);
      const res = await fetch(
        `/api/uploadImage?name=profile&username=${props.profileData.username}`,
        {
          body: formData,
          method: "POST",
        },
      );
      const result = await res.json();

      if (result.message) {
        showSuccessToast(result.message);
        updatedData.profileImage = result.newFilename;
      }
    }
    const payload = {
      panel: "profile",
      uId: props.profileData.uId,
      userId: props.profileData.id,
      ...updatedData,
    };
    return await postAPI(API.profileUrl, payload);
  };

  const onClickSave = async () => {
    if (
      equals(props.profileData, props.originalProfileData) &&
      selectedImage() == null
    ) {
      showErrorToast("No changes to save");
      return false;
    }
    if (!props.profileData.username.trim()) {
      showErrorToast("Please enter username");
      return false;
    }
    if (!props.profileData.email.trim()) {
      showErrorToast("Please enter email");
      return false;
    }
    if (validateEmail(props.profileData.email)) {
      showErrorToast("Please enter valid email");
      return false;
    }
    await showLoadingToast({
      loadMessage: "Saving Changes...",
      onError: (error) => {
        setSelectedImage(null);
        console.error("API call failed:", error);
      },
      onSuccess: async (data) => {
        if (data.user) {
          setSelectedImage(null);
          await getAPI(API.getUserUrl).then((data: { [key: string]: any }) => {
            const user = data.user;
            setIsEdit(false);
            props.setProfileData({
              country: "United States",
              email: user.P.email.toLowerCase(),
              id: user.id,
              profileImage:
                user.P.profileImage ??
                "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png",
              uId: user.P.uId,
              username: user.P.username.toLowerCase(),
            });
            // loadContactData();
            props.setOriginalProfileData(props.profileData); // Set original data
            setGraph("member", data);
          });
        }
      },
      promise: profileCall(), // This should return a promise
    });
  };

  const handleAvatarClick = () => {
    if (isEdit()) {
      const fileInput = document.getElementById("fileInput");
      fileInput?.click();
    }
  };
  return (
    <div class="bg:#f5f7fa box-shadow:0|0|12|.1|rgb(237,239,241) m:20 max-w:70%@>lg p:10px|15px r:8 w:80%">
      <div class={"font-weight:700"}>Personal Info</div>
      <div class={"font-weight:400"}>
        Update personal details here
        <div class="flex m:10|0 mt:2rem">
          <input
            accept="image/png, image/jpg, image/jpeg"
            id="fileInput"
            name="profileImage"
            onChange={handleImageChange}
            style={{ display: "none" }}
            type="file"
          />

          <div class="circle-avatar" onClick={handleAvatarClick}>
            <img
              alt="Avatar"
              src={
                props.profileData.profileImage ||
                "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png"
              }
              style={{
                "border-radius": "50%",
                cursor: "pointer",
                height: "60px",
                "object-fit": "cover",
                width: "60px",
              }}
            />
          </div>
          <div class="ml:10">
            <div style={"font-size: 22px; font-weight: 600;"}>
              {props.profileData.username}
            </div>
            <div style={"font-size: 18px;"}>{props.profileData.email}</div>
          </div>
        </div>
        <div class="grid@>lg gap:10 grid-template-columns:repeat(2,50%) justify-self:center p:10">
          <div>
            <span class={"color:dimgrey font-weight:500 font:15"}>User Id</span>
            <input
              disabled={true}
              name={"id"}
              onChange={handleInputChange}
              placeholder={"Id"}
              value={props.profileData.id}
            />
          </div>
          <div>
            <span class={"color:dimgrey font-weight:500 font:15"}>
              UserName
            </span>
            <input
              disabled={!isEdit()}
              name={"username"}
              onChange={handleInputChange}
              placeholder={"Username"}
              value={props.profileData.username}
            />
          </div>
          <div>
            <span class={"color:dimgrey font-weight:500 font:15"}>
              Email Address
            </span>
            <input
              disabled={!isEdit()}
              name={"email"}
              onChange={handleInputChange}
              placeholder={"Email Address"}
              value={props.profileData.email}
            />
          </div>
          <div class="d:grid">
            <span class={"color:dimgrey font-weight:500 font:15"}>Country</span>
            <select
              class="border:1px|solid|#ccc p:5|10 r:4"
              disabled={!isEdit()}
              name={"country"}
              onChange={handleInputChange}
              value={props.profileData.country}
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
            </select>
          </div>
        </div>
        <div class={"flex jc:end"}>
          <Show
            fallback={
              <button
                class="bg:#5b7dff border:none color:white cursor:pointer m:15|10 p:5|10 r:4"
                onClick={() => {
                  setIsEdit(true);
                }}
              >
                Edit Settings
              </button>
            }
            when={isEdit()}
          >
            <button
              class="bg:#5b7dff border:1px|solid|#5b7dff color:white cursor:pointer m:15|0 p:5|10 r:4"
              onClick={() => {
                props.setProfileData(props.originalProfileData);
                setIsEdit(false);
              }}
            >
              Cancel
            </button>
            <button
              class={
                "bg:#5b7dff border:none color:white cursor:pointer m:15|10 p:5|10 r:4"
              }
              onClick={onClickSave}
            >
              Save Changes
            </button>
          </Show>
        </div>
        {/* <div class="p:10 grid-template-columns:repeat(2,50%) justify-self:center grid@>lg">
            <div class="r:20 flex ai:center jc:center text-align:-webkit-center p:15px m:25 bg:#ffffff justify-self:center max-w:400px@>lg" >
              <div class="p:0|20">
                <div style={`display: flex; flex-direction: column; align-items: center; gap: 10px;`}>
                  <input name="profileImage" type="file" accept="image/png, image/jpg, image/jpeg" id="fileInput" onChange={handleImageChange} style={{ display: 'none' }} />
                  <div class="circle-avatar" onClick={handleAvatarClick}>
                    <img src={profileData.profileImage} alt="Avatar" style={{ width: '100px', height: '100px', 'border-radius': '50%', cursor: 'pointer' }} />
                  </div>
                  <div style={`font-size: 24px; font-weight: bold;`}>{profileData.username}</div>
                  <div style={`font-size: 18px; margin-bottom: 10px;`}>Product Design</div>
                </div>
                <div style={`text-align: center; font-size: 14px;`}>
                  I choose the product design track because I love solving visual problems using UI/UX designs.
                </div>
                <div style={`display: flex; justify-content: center; gap: 10px;`} class="mt:10">
                  <img style={`width: 24px; height: 24px;`} src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram" alt="Instagram" />
                  <img style={`width: 24px; height: 24px;`} src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter" alt="Twitter" />
                  <img style={`width: 24px; height: 24px;`} src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook" alt="Facebook" />
                </div>
              </div>
            </div>
            <div>
             
             
              <div
                class={
                  "flex ai:center jc:space-between p:5|20|20|20"
                }
              >
                <span class={"font-weight:600"}>Email Address</span>
                <input
                  name={"email"}
                  disabled={!isEdit()}
                  labelClass={"w:40%"}
                  label={"Email Address"}
                  value={profileData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div
                class={
                  "flex ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|solid|lightgrey"
                }
              >
                <span class={"font-weight:600"}>Country</span>
                <select
                  name={"country"}
                  disabled={!isEdit()}
                  style={inputStyle}
                  value={profileData.country}
                  onChange={handleInputChange}
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
              </div>

            </div> 

          </div> */}
      </div>
    </div>
  );
};
