import { createSignal } from "solid-js";

export function UploadVideo() {
  const [videoUrl, setVideoUrl] = createSignal("");
  const [uploading, setUploading] = createSignal(false);
  const [error, setError] = createSignal("");

  const handleUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    try {
      setUploading(true);
      setError("");
      // Replace with your upload URL
      const response = await fetch("YOUR_UPLOAD_URL", {
        body: formData,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      setVideoUrl(result.url); // Adjust this according to your server's response
    } catch (_err) {
      setError("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div class="align-items:center border-radius:8px border:1px|solid|#ccc display:flex flex-direction:column padding:16px width:300px">
      <input
        accept="video/*"
        class="margin-bottom:16px"
        onChange={handleUpload}
        type="file"
      />
      {uploading() && <p class="color:primary">Uploading...</p>}
      {error() && <p class="color:error">{error()}</p>}
      {videoUrl() && (
        <video class="height:auto width:100%" controls src={videoUrl()} />
      )}
    </div>
  );
}
